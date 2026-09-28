import React from 'react';
import {
  CHARACTER_PROFILES,
  INITIAL_LEADERBOARD_RIVALS,
  LeaderboardCompetitor,
} from '../../data/limitlessContent';
import {
  calculateLevelAndProgress,
  calculateReputationPoints,
} from '../../config/xp';
import { CharacterGender } from '../../types/game';
import { useTelegram } from '../../hooks/useTelegram';

export interface RankedPlayer extends LeaderboardCompetitor {
  rank: number;
  level: number;
  stageShortTitle: string;
  rp: number;
}

export function buildRankedLeaderboard(
  playerName: string,
  playerGender: CharacterGender,
  playerCity: string,
  playerXp: number,
  playerStreak: number,
  playerArenaTrophies = 0
): { list: RankedPlayer[]; playerEntry: RankedPlayer } {
  const currentUserEntry: LeaderboardCompetitor = {
    id: 'current-player',
    name: playerName || 'Тимур',
    city: playerCity || 'Ташкент',
    gender: playerGender,
    xp: playerXp,
    streak: playerStreak,
    arenaTrophies: playerArenaTrophies,
    isCurrentUser: true,
  };

  const all = [...INITIAL_LEADERBOARD_RIVALS, currentUserEntry].map((entry) => {
    const lvlInfo = calculateLevelAndProgress(entry.xp);
    const rp = calculateReputationPoints(
      entry.xp,
      entry.streak,
      entry.arenaTrophies || 0
    );
    return {
      ...entry,
      level: lvlInfo.level,
      stageShortTitle: lvlInfo.stageShortTitle,
      rp,
      rank: 0,
    };
  });

  all.sort((a, b) => {
    if (b.rp !== a.rp) return b.rp - a.rp;
    return a.isCurrentUser ? -1 : 1;
  });

  all.forEach((item, idx) => {
    item.rank = idx + 1;
  });

  const playerEntry = all.find((x) => x.isCurrentUser) || all[all.length - 1];
  return { list: all, playerEntry };
}

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  playerGender: CharacterGender;
  playerCity: string;
  playerXp: number;
  playerStreak: number;
  playerArenaTrophies?: number;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  playerName,
  playerGender,
  playerCity,
  playerXp,
  playerStreak,
  playerArenaTrophies = 0,
}) => {
  const { haptics } = useTelegram();

  if (!isOpen) return null;

  const { list, playerEntry } = buildRankedLeaderboard(
    playerName,
    playerGender,
    playerCity,
    playerXp,
    playerStreak,
    playerArenaTrophies
  );

  const first = list[0];
  const second = list[1];
  const third = list[2];

  return (
    <div
      data-testid="leaderboard-modal"
      onClick={onClose}
      className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-float-up"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-h-[88vh] flex flex-col"
      >
        {/* Шапка */}
        <div className="bg-gradient-to-r from-amber-50 via-emerald-50 to-sky-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full mb-1">
              <span>🏆 Лидерборд Узбекистана • Призовая Лига</span>
            </div>
            <h2 className="text-lg font-black text-slate-900">
              Топ самых осознанных
            </h2>
            <p className="text-[11px] text-slate-600">
              Формула: RP = XP + (Ударные дни × 15) + 🏆 Кубки Блица
            </p>
          </div>
          <button
            type="button"
            data-testid="close-leaderboard-btn"
            onClick={() => {
              haptics.selection();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-slate-900 font-black flex items-center justify-center shadow-xs"
          >
            ✕
          </button>
        </div>

        {/* БЛОК ПРИЗОВОГО ПУЛА НЕДЕЛИ (ТОП-1, ТОП-2, ТОП-3) */}
        <div
          data-testid="leaderboard-prize-pool"
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-sky-500/10 border-b border-amber-200/80"
        >
          <div className="text-[11px] font-black text-slate-900 mb-1 flex items-center justify-between">
            <span>🎁 Призовой Пул Недели (Топ-1, Топ-2, Топ-3):</span>
            <span className="text-[10px] font-extrabold text-amber-700">
              Финал в ВС 21:00
            </span>
          </div>
          <div className="space-y-0.5 text-[10px] font-bold text-slate-700">
            <div>
              🥇 <strong className="text-slate-900">1 место:</strong> 50 💎 NZT + 10 000 💰 + Статус PRO и Золотой Билет OnPul
            </div>
            <div>
              🥈 <strong className="text-slate-900">2 место:</strong> 30 💎 NZT + 5 000 💰 + VIP-Аура
            </div>
            <div>
              🥉 <strong className="text-slate-900">3 место:</strong> 15 💎 NZT + 2 500 💰 + Крио-Щит
            </div>
          </div>
        </div>

        {/* Пьедестал Почёта: 1, 2, 3 место */}
        <div className="px-4 pt-5 pb-4 bg-slate-50/70 border-b border-slate-200">
          <div className="grid grid-cols-3 gap-2 items-end">
            {/* 2 МЕСТО (Серебро) */}
            {second && (
              <div
                data-testid="podium-place-2"
                className={`rounded-2xl p-2.5 text-center border flex flex-col items-center ${
                  second.isCurrentUser
                    ? 'bg-emerald-50 border-emerald-400 shadow-md'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                <span className="text-xl mb-1">🥈</span>
                <div className="text-[10px] font-black text-slate-500 uppercase">
                  2 место
                </div>
                <img
                  src={CHARACTER_PROFILES[second.gender].imageUrl}
                  alt={second.name}
                  className="w-12 h-12 rounded-full object-cover object-top border-2 border-slate-300 my-1.5"
                />
                <div className="text-xs font-black text-slate-900 truncate w-full">
                  {second.name}
                </div>
                <div className="text-[10px] font-bold text-slate-500">
                  Ур. {second.level} • {second.city}
                </div>
                <div className="mt-1 inline-block bg-slate-100 text-slate-800 text-[11px] font-black px-2 py-0.5 rounded-full">
                  {second.rp} RP
                </div>
              </div>
            )}

            {/* 1 МЕСТО (Золото — выше остальных) */}
            {first && (
              <div
                data-testid="podium-place-1"
                className={`rounded-2xl p-3 text-center border-2 flex flex-col items-center -mt-3 ${
                  first.isCurrentUser
                    ? 'bg-amber-50 border-amber-500 shadow-lg'
                    : 'bg-gradient-to-b from-amber-50/90 to-white border-amber-400 shadow-md'
                }`}
              >
                <span className="text-2xl mb-0.5">🥇</span>
                <div className="text-[10px] font-black text-amber-700 uppercase">
                  1 место
                </div>
                <img
                  src={CHARACTER_PROFILES[first.gender].imageUrl}
                  alt={first.name}
                  className="w-14 h-14 rounded-full object-cover object-top border-2 border-amber-400 my-1.5 shadow-sm"
                />
                <div className="text-xs font-black text-slate-900 truncate w-full">
                  {first.name}
                </div>
                <div className="text-[10px] font-bold text-amber-700">
                  Ур. {first.level} • {first.city}
                </div>
                <div className="mt-1 inline-block bg-amber-400 text-slate-950 text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                  {first.rp} RP
                </div>
              </div>
            )}

            {/* 3 МЕСТО (Бронза) */}
            {third && (
              <div
                data-testid="podium-place-3"
                className={`rounded-2xl p-2.5 text-center border flex flex-col items-center ${
                  third.isCurrentUser
                    ? 'bg-emerald-50 border-emerald-400 shadow-md'
                    : 'bg-white border-amber-200/80 shadow-xs'
                }`}
              >
                <span className="text-xl mb-1">🥉</span>
                <div className="text-[10px] font-black text-amber-800 uppercase">
                  3 место
                </div>
                <img
                  src={CHARACTER_PROFILES[third.gender].imageUrl}
                  alt={third.name}
                  className="w-12 h-12 rounded-full object-cover object-top border-2 border-amber-300 my-1.5"
                />
                <div className="text-xs font-black text-slate-900 truncate w-full">
                  {third.name}
                </div>
                <div className="text-[10px] font-bold text-slate-500">
                  Ур. {third.level} • {third.city}
                </div>
                <div className="mt-1 inline-block bg-amber-50 text-amber-900 text-[11px] font-black px-2 py-0.5 rounded-full">
                  {third.rp} RP
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Список всех участников */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {list.map((item) => {
            const medal =
              item.rank === 1
                ? '🥇'
                : item.rank === 2
                ? '🥈'
                : item.rank === 3
                ? '🥉'
                : `#${item.rank}`;

            return (
              <div
                key={item.id}
                data-testid={
                  item.isCurrentUser
                    ? 'leaderboard-player-row'
                    : `leaderboard-row-${item.rank}`
                }
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  item.isCurrentUser
                    ? 'bg-emerald-50/90 border-emerald-500 shadow-sm'
                    : 'bg-white border-slate-200/80'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 text-center font-black text-xs text-slate-700">
                    {medal}
                  </div>
                  <img
                    src={CHARACTER_PROFILES[item.gender].imageUrl}
                    alt={item.name}
                    className="w-10 h-10 rounded-full object-cover object-top border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-900 truncate">
                        {item.name}
                      </span>
                      {item.isCurrentUser && (
                        <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                          ТЫ
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      Ур. {item.level} ({item.stageShortTitle}) • {item.city}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-2">
                  <div className="text-xs font-black text-emerald-700">
                    {item.rp} RP
                  </div>
                  <div className="text-[10px] font-semibold text-slate-500">
                    {item.xp} XP • 🔥{item.streak} • 🏆{item.arenaTrophies || 0}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Нижняя плашка текущего игрока */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-700">
            Твоя позиция:{' '}
            <span
              data-testid="leaderboard-player-rank"
              className="font-black text-emerald-700"
            >
              #{playerEntry.rank} из {list.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-colors"
          >
            Отлично
          </button>
        </div>
      </div>
    </div>
  );
};
