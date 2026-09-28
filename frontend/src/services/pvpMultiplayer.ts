import mqtt, { MqttClient } from 'mqtt';
import { CharacterGender } from '../types/game';
import { PVP_QUESTIONS } from '../data/pvpQuestions';

export interface PvpPlayerProfile {
  playerId: string;
  name: string;
  level: number;
  gender: CharacterGender;
  skinId: string;
}

export interface PvpMatchSession {
  roomId: string;
  isLiveHumanMatch: boolean;
  opponent: PvpPlayerProfile;
  questionIds: string[];
}

export interface PvpAnswerBroadcast {
  type: 'PLAYER_ANSWERED';
  roomId: string;
  playerId: string;
  playerName: string;
  questionIndex: number;
  isCorrect: boolean;
  timeMs: number;
}

type LobbyMessage =
  | {
      type: 'SEEK_MATCH';
      player: PvpPlayerProfile;
      timestamp: number;
    }
  | {
      type: 'MATCH_LOCKED';
      roomId: string;
      host: PvpPlayerProfile;
      guest: PvpPlayerProfile;
      questionIds: string[];
      timestamp: number;
    };

const LOBBY_TOPIC = 'onpul/pvp/arena/lobby_v2';
const ROOM_TOPIC_PREFIX = 'onpul/pvp/arena/room/';
const BROKER_URLS = [
  'wss://broker.emqx.io:8084/mqtt',
  'wss://broker.hivemq.com:8884/mqtt',
];

export function pickFiveQuestionIds(): string[] {
  return PVP_QUESTIONS.slice(0, 5).map((q) => q.id);
}

export class PvpMultiplayerService {
  private clients: MqttClient[] = [];
  private bc: BroadcastChannel | null = null;
  private seekInterval: ReturnType<typeof setInterval> | null = null;
  private currentRoomTopic: string | null = null;
  private isLocked = false;

  public startMatchmaking(
    me: PvpPlayerProfile,
    onMatchFound: (session: PvpMatchSession) => void,
    onOpponentAnswered: (event: PvpAnswerBroadcast) => void
  ) {
    this.cleanup();
    this.isLocked = false;

    const handleIncomingLobbyOrRoom = (raw: string) => {
      try {
        const msg = JSON.parse(raw);
        if (!msg || typeof msg !== 'object') return;

        if (msg.type === 'SEEK_MATCH' && !this.isLocked) {
          const incoming = msg as Extract<LobbyMessage, { type: 'SEEK_MATCH' }>;
          if (incoming.player.playerId === me.playerId) return;

          // Детерминированно создаём комнату из 5 одинаковых вопросов
          this.isLocked = true;
          const roomId = `room-${[me.playerId, incoming.player.playerId].sort().join('-')}-${Date.now().toString(36)}`;
          const questionIds = pickFiveQuestionIds();

          const lockPacket: LobbyMessage = {
            type: 'MATCH_LOCKED',
            roomId,
            host: me,
            guest: incoming.player,
            questionIds,
            timestamp: Date.now(),
          };

          this.publish(LOBBY_TOPIC, JSON.stringify(lockPacket));
          this.subscribeRoom(roomId);
          this.stopSeeking();

          onMatchFound({
            roomId,
            isLiveHumanMatch: true,
            opponent: incoming.player,
            questionIds,
          });
        } else if (msg.type === 'MATCH_LOCKED' && !this.isLocked) {
          const locked = msg as Extract<LobbyMessage, { type: 'MATCH_LOCKED' }>;
          const isHost = locked.host.playerId === me.playerId;
          const isGuest = locked.guest.playerId === me.playerId;
          if (!isHost && !isGuest) return;

          this.isLocked = true;
          const opponent = isHost ? locked.guest : locked.host;
          this.subscribeRoom(locked.roomId);
          this.stopSeeking();

          onMatchFound({
            roomId: locked.roomId,
            isLiveHumanMatch: true,
            opponent,
            questionIds: locked.questionIds,
          });
        } else if (msg.type === 'PLAYER_ANSWERED') {
          const ans = msg as PvpAnswerBroadcast;
          if (ans.playerId !== me.playerId) {
            onOpponentAnswered(ans);
          }
        }
      } catch (e) {}
    };

    // 1. Локальный BroadcastChannel (мгновенно соединяет 2 вкладки одного браузера)
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.bc = new BroadcastChannel('onpul_pvp_v1');
        this.bc.onmessage = (ev) => {
          if (typeof ev.data === 'string') {
            handleIncomingLobbyOrRoom(ev.data);
          }
        };
      }
    } catch (e) {}

    // 2. Публичные облачные WebSocket MQTT брокеры (соединяют 2 разных телефона/ПК по ссылке GitHub Pages)
    for (const url of BROKER_URLS) {
      try {
        const client = mqtt.connect(url, {
          connectTimeout: 5000,
          reconnectPeriod: 2000,
          clean: true,
        });

        client.on('connect', () => {
          client.subscribe(LOBBY_TOPIC);
          if (this.currentRoomTopic) {
            client.subscribe(this.currentRoomTopic);
          }
          const seekPacket: LobbyMessage = {
            type: 'SEEK_MATCH',
            player: me,
            timestamp: Date.now(),
          };
          client.publish(LOBBY_TOPIC, JSON.stringify(seekPacket));
        });

        client.on('message', (_topic, payload) => {
          handleIncomingLobbyOrRoom(payload.toString());
        });

        this.clients.push(client);
      } catch (e) {}
    }

    // Публикуем SEEK_MATCH каждые 850 мс, пока соперник не найден
    const broadcastSeek = () => {
      if (this.isLocked) return;
      const seekPacket: LobbyMessage = {
        type: 'SEEK_MATCH',
        player: me,
        timestamp: Date.now(),
      };
      this.publish(LOBBY_TOPIC, JSON.stringify(seekPacket));
    };

    broadcastSeek();
    this.seekInterval = setInterval(broadcastSeek, 850);
  }

  public publishAnswer(event: PvpAnswerBroadcast) {
    const raw = JSON.stringify(event);
    try {
      this.bc?.postMessage(raw);
    } catch (e) {}
    const topic = this.currentRoomTopic || `${ROOM_TOPIC_PREFIX}${event.roomId}`;
    for (const client of this.clients) {
      try {
        if (client.connected) {
          client.publish(topic, raw);
        }
      } catch (e) {}
    }
  }

  private subscribeRoom(roomId: string) {
    this.currentRoomTopic = `${ROOM_TOPIC_PREFIX}${roomId}`;
    for (const client of this.clients) {
      try {
        if (client.connected) {
          client.subscribe(this.currentRoomTopic);
        }
      } catch (e) {}
    }
  }

  private publish(topic: string, message: string) {
    try {
      this.bc?.postMessage(message);
    } catch (e) {}
    for (const client of this.clients) {
      try {
        if (client.connected) {
          client.publish(topic, message);
        }
      } catch (e) {}
    }
  }

  private stopSeeking() {
    if (this.seekInterval) {
      clearInterval(this.seekInterval);
      this.seekInterval = null;
    }
  }

  public cleanup() {
    this.stopSeeking();
    this.currentRoomTopic = null;
    try {
      this.bc?.close();
    } catch (e) {}
    this.bc = null;
    for (const client of this.clients) {
      try {
        client.end(true);
      } catch (e) {}
    }
    this.clients = [];
  }
}
