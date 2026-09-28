import React, { useState, useEffect, useRef } from 'react';
import {
  PVP_CHARACTER_SKINS,
  PVP_QUESTIONS,
  PVP_RARE_TIPS,
} from '../../data/pvpQuestions';
import { LimitlessGameState } from '../../types/game';
import {
  PvpAnswerBroadcast,
  PvpMatchSession,
  PvpMultiplayerService,
} from '../../services/pvpMultiplayer';
import { calculateLevelAndProgress } from '../../config/xp';
import { useTelegram } from '../../hooks/useTelegram';

interface NeuroBlitzModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: LimitlessGameState;
  onPlayBlitzCard: (isSuperhumanMove: boolean, droppedSkinId?: string, droppedTip?: string) => void;
  onRefillEnergyWithCoins: () => void;
  onRefillEnergyWithNzt: () => void;
  onEquipSkin: (skinId: string) => void;
  onOpenChestReward: () => void;
}

export const NeuroBlitzModal: React.FC<NeuroBlitzModalProps> = ({
  isOpen,
  onClose,
  state,
  onPlayBlitzCard,
  onRefillEnergyWithCoins,
  onRefillEnergyWithNzt,
  onEquipSkin,
  onOpenChestReward,
}) => {
  const { haptics } = useTelegram();

  // Индекс текущего вопроса в серии из 5 вопросов (0..4)
  const [roundIndex, setRoundIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);

  // Состояние сетевого матчмейкинга
  const [matchStatus, setMatchStatus] = useState<
    'ready' | 'searching' | 'live_match'
  >('ready');
  const [matchSession, setMatchSession] = useState<PvpMatchSession | null>(null);
  const [opponentFirstOnRound, setOpponentFirstOnRound] =
    useState<boolean>(false);
  const [chestModalVisible, setChestModalVisible] = useState<boolean>(false);

  const mpRef = useRef<PvpMultiplayerService | null>(null);
  const playerIdRef = useRef<string>(
    `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
  );
  const roundStartRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!isOpen) {
      mpRef.current?.cleanup();
      mpRef.current = null;
      setMatchStatus('ready');
      return;
    }
    roundStartRef.current = Date.now();
    return () => {
      mpRef.current?.cleanup();
      mpRef.current = null;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const lang = state.language || 'ru';
  const activeQuestionIds =
    matchSession?.questionIds && matchSession.questionIds.length === 5
      ? matchSession.questionIds
      : PVP_QUESTIONS.slice(0, 5).map((q) => q.id);

  const currentQuestionId =
    activeQuestionIds[roundIndex % activeQuestionIds.length];
  const currentQuestion =
    PVP_QUESTIONS.find((q) => q.id === currentQuestionId) ||
    PVP_QUESTIONS[roundIndex % PVP_QUESTIONS.length];

  const localized =
    currentQuestion.translations[lang] || currentQuestion.translations.ru;

  const isDuelWon = state.arenaTrophies >= state.rivalTrophies;
  const droppedSkin =
    PVP_CHARACTER_SKINS[
      (state.pvpBattlesPlayed + roundIndex) % PVP_CHARACTER_SKINS.length
    ];
  const droppedTip =
    PVP_RARE_TIPS[(state.pvpBattlesPlayed + roundIndex) % PVP_RARE_TIPS.length];

  // Запуск живого онлайн-поиска соперника через WebSocket MQTT + BroadcastChannel
  const handleFindLiveOpponent = () => {
    haptics.selection();
    setMatchStatus('searching');
    setRoundIndex(0);
    setSelectedOption(null);
    setPlayerScore(0);
    setOpponentScore(0);
    setOpponentFirstOnRound(false);

    if (!mpRef.current) {
      mpRef.current = new PvpMultiplayerService();
    }

    const lvl = calculateLevelAndProgress(state.xp).level;
    mpRef.current.startMatchmaking(
      {
        playerId: playerIdRef.current,
        name: state.playerName || 'Тимур',
        level: lvl,
        gender: state.gender,
        skinId: state.equippedSkin || 'default',
      },
      (session) => {
        haptics.notification('success');
        setMatchSession(session);
        setMatchStatus('live_match');
        setRoundIndex(0);
        setSelectedOption(null);
        roundStartRef.current = Date.now();
      },
      (ansEvent: PvpAnswerBroadcast) => {
        if (ansEvent.questionIndex === roundIndex) {
          setOpponentFirstOnRound(true);
          if (ansEvent.isCorrect) {
            setOpponentScore((prev) => prev + 150);
          }
        }
      }
    );
  };

  // Быстрый запуск боя со спарринг-претендентом без ожидания
  const handleStartInstantMatch = () => {
    haptics.notification('success');
    mpRef.current?.cleanup();
    setMatchSession({
      roomId: `instant-${Date.now()}`,
      isLiveHumanMatch: false,
      opponent: {
        playerId: 'rival-sardor',
        name: 'Сардор Азимов',
        level: 5,
        gender: 'male',
        skinId: 'cyber-strategist',
      },
      questionIds: PVP_QUESTIONS.slice(0, 5).map((q) => q.id),
    });
    setMatchStatus('live_match');
    setRoundIndex(0);
    setSelectedOption(null);
    setPlayerScore(0);
    setOpponentScore(0);
    setOpponentFirstOnRound(false);
    roundStartRef.current = Date.now();
  };

  const handleSelectAnswer = (optionIdx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(optionIdx);

    const isCorrect = optionIdx === currentQuestion.correctIndex;
    const elapsedMs = Math.max(200, Date.now() - roundStartRef.current);

    if (matchSession) {
      mpRef.current?.publishAnswer({
        type: 'PLAYER_ANSWERED',
        roomId: matchSession.roomId,
        playerId: playerIdRef.current,
        playerName: state.playerName,
        questionIndex: roundIndex,
        isCorrect,
        timeMs: elapsedMs,
      });
    }

    if (isCorrect) {
      haptics.notification('success');
      const earnedPoints = opponentFirstOnRound ? 90 : 150;
      setPlayerScore((prev) => prev + earnedPoints);
      if (!opponentFirstOnRound && !matchSession?.isLiveHumanMatch) {
        setOpponentScore((prev) => prev + 90);
      }
      onPlayBlitzCard(true, droppedSkin.id, droppedTip);
    } else {
      haptics.notification('warning');
      if (!matchSession?.isLiveHumanMatch) {
        setOpponentScore((prev) => prev + 120);
      }
      onPlayBlitzCard(false);
    }
  };

  const handleNextQuestion = () => {
    haptics.selection();
    setSelectedOption(null);
    setOpponentFirstOnRound(false);
    setRoundIndex((prev) => (prev + 1) % 5);
    roundStartRef.current = Date.now();
  };

  const handleOpenChest = () => {
    haptics.notification('success');
    setChestModalVisible(true);
    onOpenChestReward();
  };

  const opponentDisplayName = matchSession?.opponent?.name || 'Сардор Азимов';

  return (
    <div
      data-testid="neuro-blitz-modal"
      onClick={onClose}
      className="fixed inset-0 z-40 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 animate-float-up"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-3xl border-2 border-amber-400 shadow-2xl overflow-hidden max-h-[93vh] flex flex-col"
      >
        {/* Шапка Сетевой PvP-Арены */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-amber-900 px-4 py-3 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                ⚔️ PvP-Арена Онлайн (5 вопросов)
              </span>
              <span
                data-testid="pvp-energy-badge"
                className="bg-emerald-500/25 border border-emerald-400/60 text-emerald-200 text-[10px] font-black px-2 py-0.5 rounded-full"
              >
                ⚡ Энергия: {state.pvpEnergy} / 3 (КД 3ч)
              </span>
            </div>
            <h3 className="text-sm font-black mt-1">
              ⚡ Нейро-Блиц PvP: Кто ответит первым?
            </h3>
          </div>
          <button
            type="button"
            data-testid="close-blitz-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white font-black flex items-center justify-center shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Основной скролл-контейнер */}
        <div className="p-3.5 overflow-y-auto space-y-3 flex-1">
          {/* 1. БЛОК ЭНЕРГИИ (3 БОЯ, ОТКАТ 3 ЧАСА) + СБРОС КД + СУНДУК 10 БОЁВ */}
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-black text-slate-800">
                ⚡ Запас боёв: {state.pvpEnergy}/3 • ⏳ Откат: 1ч за бой (3ч полностью)
              </span>
              <span className="font-black text-indigo-700">
                Фарм: +1 💎 NZT за победу
              </span>
            </div>

            {/* Кнопки мгновенного восстановления энергии (Сброс КД) */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                data-testid="refill-energy-coins-btn"
                onClick={() => {
                  haptics.notification('success');
                  onRefillEnergyWithCoins();
                }}
                className="py-1.5 px-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 text-[10px] font-black transition-all"
              >
                ⚡ Сбросить КД (+3 боя) за 250 💰
              </button>
              <button
                type="button"
                data-testid="refill-energy-nzt-btn"
                onClick={() => {
                  haptics.notification('success');
                  onRefillEnergyWithNzt();
                }}
                className="py-1.5 px-2.5 rounded-xl bg-indigo-100 hover:bg-indigo-200 border border-indigo-300 text-indigo-950 text-[10px] font-black transition-all"
              >
                💎 Сбросить КД (+3 боя) за 1 💎 NZT
              </button>
            </div>

            {/* Шкала Мега-Сундука за 10 сыгранных боёв */}
            <div
              data-testid="pvp-chest-widget"
              className="bg-gradient-to-r from-amber-50 via-yellow-50 to-emerald-50 rounded-xl p-2.5 border border-amber-300 flex items-center justify-between gap-2"
            >
              <div className="min-w-0">
                <div
                  data-testid="pvp-chest-counter"
                  className="text-[11px] font-black text-slate-900"
                >
                  🎁 Мега-Сундук PvP: {state.pvpChestProgress} / 10 боёв
                </div>
                <div className="text-[10px] text-slate-600 truncate">
                  Призы: 🧸 Telegram-Подарки, 📱 Розыгрыш Смартфона, +3 💎 NZT
                </div>
              </div>
              <button
                type="button"
                data-testid="open-pvp-chest-btn"
                onClick={handleOpenChest}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-[10px] font-black shrink-0 shadow-xs"
              >
                🎁 Открыть Сундук
              </button>
            </div>

            {chestModalVisible && (
              <div
                data-testid="pvp-chest-reward-box"
                className="bg-gradient-to-r from-indigo-950 via-slate-900 to-emerald-950 text-white rounded-2xl p-3 border-2 border-amber-400 animate-float-up space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-300">
                    🎁 Трофейный Мега-Сундук 10 Боёв открыт!
                  </span>
                  <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                    +3 💎 NZT • +500 💰
                  </span>
                </div>
                <ul className="text-[11px] text-slate-200 space-y-0.5">
                  <li>• 💎 <strong>+3 редких кристалла NZT</strong> и <strong>+500 💰 OnPul Coins</strong> начислены!</li>
                  <li>• 📱 <strong>+1 Золотой Билет</strong> на розыгрыш смартфона и призов OnPul!</li>
                  <li>• 🧸 <strong>Шанс на Telegram-Подарок (Telegram Gift ⭐)</strong> активирован!</li>
                </ul>
              </div>
            )}
          </div>

          {/* 2. СЕТЕВОЙ МАТЧМЕЙКИНГ: ПОИСК ЖИВОГО СОПЕРНИКА ОНЛАЙН ИЛИ БЫСТРЫЙ БОЙ */}
          <div className="bg-indigo-50/70 rounded-2xl p-3 border border-indigo-200 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-black text-slate-900">
                {matchStatus === 'searching' ? (
                  <span className="text-indigo-700 animate-pulse">
                    📡 Поиск живого игрока в сети OnPul (MQTT Live)...
                  </span>
                ) : matchSession?.isLiveHumanMatch ? (
                  <span className="text-emerald-700">
                    🟢 ЖИВОЙ СОПЕРНИК ПОДКЛЮЧЁН: {opponentDisplayName}!
                  </span>
                ) : (
                  <span>
                    ⚔️ Ты ({state.arenaTrophies} 🏆) vs {opponentDisplayName} ({state.rivalTrophies} 🏆)
                  </span>
                )}
              </div>
              <span className="bg-white border border-indigo-200 text-indigo-800 text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
                Счёт: {playerScore} : {opponentScore}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                data-testid="find-pvp-match-btn"
                onClick={handleFindLiveOpponent}
                className="py-2 px-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black shadow-xs transition-all"
              >
                ⚔️ Искать соперника онлайн (PvP)
              </button>
              <button
                type="button"
                data-testid="start-instant-pvp-btn"
                onClick={handleStartInstantMatch}
                className="py-2 px-2.5 rounded-xl bg-white hover:bg-slate-100 border border-indigo-300 text-indigo-900 text-[11px] font-black transition-all"
              >
                ⚡ Быстрый бой (Сразу)
              </button>
            </div>

            {isDuelWon && (
              <div
                data-testid="blitz-duel-won-badge"
                className="bg-emerald-100 border border-emerald-400 text-emerald-900 rounded-xl px-3 py-1.5 text-[11px] font-black flex items-center justify-between"
              >
                <span>🏆 Соперник дня Сардор повержен! Выбит +1 💎 NZT!</span>
                <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[10px]">
                  +1 💎 NZT
                </span>
              </div>
            )}
          </div>

          {/* 3. ТЕКУЩИЙ ВОПРОС БОЯ (1..5 НА ВЫБРАННОМ ЯЗЫКЕ ИГРОКА) */}
          <div className="bg-white rounded-2xl p-3.5 border-2 border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                {currentQuestion.categoryEmoji} Вопрос {(roundIndex % 5) + 1} из 5 • Язык: {lang.toUpperCase()}
              </span>
              <span className="text-[10px] font-black text-emerald-700">
                ⚡ Первый ответ = +150 очков!
              </span>
            </div>

            <h4
              data-testid="pvp-question-text"
              className="text-xs sm:text-sm font-black text-slate-900 leading-snug"
            >
              {localized.question}
            </h4>
          </div>

          {/* 4 ВАРИАНТА ОТВЕТА (С ПОДДЕРЖКОЙ blitz-option-a / blitz-option-b И pvp-option-0..3) */}
          <div className="space-y-2">
            {localized.options.map((optText, idx) => {
              const legacyTestId =
                idx === 0
                  ? 'blitz-option-a'
                  : idx === 1
                  ? 'blitz-option-b'
                  : `blitz-option-${idx}`;

              const isChosen = selectedOption === idx;
              const isCorrectOption = idx === currentQuestion.correctIndex;

              return (
                <button
                  key={idx}
                  type="button"
                  data-testid={legacyTestId}
                  onClick={() => handleSelectAnswer(idx)}
                  className={`w-full p-3 rounded-2xl border-2 text-left transition-all ${
                    selectedOption === null
                      ? 'bg-white hover:bg-emerald-50/50 border-slate-200 active:scale-[0.99]'
                      : isChosen && isCorrectOption
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                      : isChosen && !isCorrectOption
                      ? 'bg-rose-50 border-rose-500'
                      : isCorrectOption
                      ? 'bg-emerald-50/60 border-emerald-300'
                      : 'bg-slate-50 border-slate-200 opacity-75'
                  }`}
                >
                  <div
                    data-testid={`pvp-option-${idx}`}
                    className="flex items-center justify-between gap-2 text-xs font-black text-slate-900"
                  >
                    <span>
                      {idx === 0 ? 'A. ' : idx === 1 ? 'B. ' : idx === 2 ? 'C. ' : 'D. '}
                      {optText}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 5. БЛОК РЕЗУЛЬТАТА РАУНДА, ЭКСКЛЮЗИВНЫЙ ДРОП 💎 NZT, СКИНА И СОВЕТА */}
          {selectedOption !== null && (
            <div
              data-testid="blitz-result-box"
              className={`rounded-2xl p-3.5 border-2 animate-float-up space-y-2.5 ${
                selectedOption === currentQuestion.correctIndex
                  ? 'bg-emerald-50/95 border-emerald-500'
                  : 'bg-amber-50/95 border-amber-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">
                  {selectedOption === currentQuestion.correctIndex
                    ? opponentFirstOnRound
                      ? '✓ Верно! (+90 очков • Соперник ответил чуть раньше)'
                      : '⚡ ПЕРВЫЙ И ВЕРНЫЙ ОТВЕТ! (+150 очков скорости!)'
                    : '⚠️ Ошибка! Но ты получил ценный финансовый урок'}
                </span>
              </div>

              <p className="text-[11px] text-slate-700 leading-relaxed">
                {localized.insight}
              </p>

              {selectedOption === currentQuestion.correctIndex ? (
                <>
                  {/* Награды за победный раунд PvP */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="bg-indigo-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                      +1 💎 NZT (Эксклюзив PvP!)
                    </span>
                    <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                      +40 XP ⚡
                    </span>
                    <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full">
                      +30 🏆 Кубков Лиги
                    </span>
                    <span className="bg-sky-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                      +200 💰 OnPul Coins
                    </span>
                  </div>

                  {/* Дроп редкого Скина Персонажа */}
                  <div
                    data-testid="pvp-skin-drop-badge"
                    className="bg-white rounded-xl p-2.5 border border-indigo-200 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-[10px] font-black text-indigo-700 uppercase">
                        🧥 Выпал PvP-Скин Персонажа:
                      </div>
                      <div className="text-xs font-black text-slate-900 truncate">
                        {droppedSkin.icon} {droppedSkin.title}
                      </div>
                    </div>
                    <button
                      type="button"
                      data-testid="equip-skin-btn"
                      onClick={() => {
                        haptics.notification('success');
                        onEquipSkin(droppedSkin.id);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black shrink-0 transition-all ${
                        state.equippedSkin === droppedSkin.id
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {state.equippedSkin === droppedSkin.id
                        ? '✓ Скин надет'
                        : '🧥 Надеть скин'}
                    </button>
                  </div>

                  {/* Дроп редкого Финансового Совета */}
                  <div
                    data-testid="pvp-tip-drop-badge"
                    className="bg-amber-50 border border-amber-300 rounded-xl p-2.5 text-[11px] font-semibold text-slate-800"
                  >
                    {droppedTip}
                  </div>
                </>
              ) : (
                <div className="inline-block bg-amber-400 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full">
                  +15 XP за разбор финансовой ловушки 💡
                </div>
              )}

              <button
                type="button"
                data-testid="blitz-next-card-btn"
                onClick={handleNextQuestion}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md transition-all"
              >
                Следующий вопрос ({((roundIndex + 1) % 5) + 1} / 5) →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
