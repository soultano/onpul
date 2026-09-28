import React, { useState } from 'react';
import { CHARACTER_PROFILES } from '../../data/limitlessContent';
import {
  LimitlessGameState,
  calculateSafePaydayMetrics,
  formatUzs,
} from '../../types/game';
import { LevelInfo } from '../../config/xp';
import { SupportedLanguage, TRANSLATIONS } from '../../i18n/translations';
import { LanguageSelector } from '../Common/LanguageSelector';
import { buildRankedLeaderboard } from '../Modals/LeaderboardModal';
import { useTelegram } from '../../hooks/useTelegram';

interface MainCharacterScreenProps {
  state: LimitlessGameState;
  levelInfo: LevelInfo;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  onOpenLeaderboard: () => void;
  onOpenGoalsModal: () => void;
  onOpenPaydayModal: () => void;
  onOpenFriendsModal: () => void;
  onOpenNztLab: () => void;
  onNavigateKyc: () => void;
  onNavigateFinance: () => void;
  onRestartTutorial: () => void;
}

export const MainCharacterScreen: React.FC<MainCharacterScreenProps> = ({
  state,
  levelInfo,
  onSelectLanguage,
  onOpenLeaderboard,
  onOpenGoalsModal,
  onOpenPaydayModal,
  onOpenFriendsModal,
  onOpenNztLab,
  onNavigateKyc,
  onNavigateFinance,
  onRestartTutorial,
}) => {
  const { haptics } = useTelegram();
  const [quoteIndex, setQuoteIndex] = useState(0);

  const lang = state.language || 'ru';
  const t = TRANSLATIONS[lang];
  const profile = CHARACTER_PROFILES[state.gender];
  const paydayMetrics = calculateSafePaydayMetrics(state);

  const { list: leaderboardList, playerEntry } = buildRankedLeaderboard(
    state.playerName,
    state.gender,
    state.profileQuests.kycCity,
    state.xp,
    state.streak
  );

  const top1 = leaderboardList[0];
  const top2 = leaderboardList[1];
  const top3 = leaderboardList[2];

  const handleCharacterTap = () => {
    haptics.impact('light');
    setQuoteIndex((prev) => (prev + 1) % profile.quotes.length);
  };

  return (
    <div
      data-testid="main-character-screen"
      className="space-y-2.5 pb-24 animate-float-up"
    >
      {/* ПЕРЕКЛЮЧАТЕЛЬ 6 ЯЗЫКОВ (UZ, RU, EN, DE, KO, ES) */}
      <LanguageSelector
        currentLanguage={lang}
        onSelectLanguage={onSelectLanguage}
        compact
      />

      {/* 1. ВЕРХНЯЯ ПАНЕЛЬ (HUD): Уровень, Стадия ясности, 💎 NZT, Стрик и Прогресс XP */}
      <div className="bg-white rounded-3xl p-3.5 border border-slate-200/90 shadow-soft">
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              data-testid="hud-level"
              className="inline-flex items-center justify-center bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-xs shrink-0"
            >
              {t.levelWord} {levelInfo.level}
            </span>
            <div className="min-w-0">
              <div
                data-testid="hud-stage-title"
                className="text-xs font-extrabold text-slate-900 truncate"
              >
                {levelInfo.stageTitle}
              </div>
              <div className="text-[10px] font-semibold text-slate-500 truncate">
                {state.playerName} • {state.xp} XP
                {state.xpMultiplier > 1 && (
                  <span className="ml-1 text-indigo-600 font-black">
                    (×{state.xpMultiplier} XP)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Редкая игровая валюта: 💎 NZT (Клик открывает Лабораторию NZT) */}
            <button
              type="button"
              data-testid="hud-nzt-btn"
              onClick={() => {
                haptics.selection();
                onOpenNztLab();
              }}
              className="inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-300 text-indigo-800 text-xs font-black px-2.5 py-1 rounded-full shadow-2xs transition-all active:scale-95"
              title={t.nztLabTitle}
            >
              <span>💎</span>
              <span data-testid="hud-nzt-currency">{state.nztGems} NZT</span>
            </button>

            {/* Стрик ударных дней */}
            <div
              data-testid="hud-streak"
              className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-black px-2.5 py-1 rounded-full"
            >
              <span>{state.streakShieldActive ? '🧊🔥' : '🔥'}</span>
              <span>{state.streak} дн.</span>
            </div>
          </div>
        </div>

        {/* Шкала XP до следующего уровня */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-bold mb-1">
            <span className="text-emerald-700">{t.clarityProgress}</span>
            <span
              data-testid="hud-xp-text"
              className="text-slate-700 font-extrabold"
            >
              {levelInfo.xpInCurrentLevel} / {levelInfo.xpNeededForLevel} XP до Ур.{' '}
              {Math.min(80, levelInfo.level + 1)}
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(6, levelInfo.progressPercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. ВИДЖЕТ-КНОПКА ЛИДЕРБОРДА (ТОП 1-2-3 МЕСТО + РАНГ ИГРОКА) */}
      <button
        type="button"
        data-testid="main-leaderboard-btn"
        onClick={() => {
          haptics.selection();
          onOpenLeaderboard();
        }}
        className="w-full bg-gradient-to-r from-amber-50/90 via-white to-sky-50/90 hover:from-amber-100/70 hover:to-sky-100/70 rounded-2xl p-2.5 border border-amber-300/80 shadow-xs flex items-center justify-between transition-all active:scale-[0.99] text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-300 flex items-center justify-center text-lg shrink-0">
            🏆
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-900">
                {t.leaderboardTop}
              </span>
              <span
                data-testid="main-leaderboard-rank"
                className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full"
              >
                {t.yourRank}: #{playerEntry.rank}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 truncate mt-0.5">
              <span>🥇 1. {top1?.name.split(' ')[0]}</span>
              <span>🥈 2. {top2?.name.split(' ')[0]}</span>
              <span>🥉 3. {top3?.name.split(' ')[0]}</span>
            </div>
          </div>
        </div>
        <span className="text-xs font-black text-amber-700 shrink-0 ml-1">
          {t.openBtn}
        </span>
      </button>

      {/* 3. ЦЕНТРАЛЬНАЯ СЦЕНА: КРУГЛЯШКИ СЛЕВА + ПЕРСОНАЖ ПО ЦЕНТРУ + КРУГЛЯШКИ СПРАВА */}
      <div className="grid grid-cols-[66px_1fr_66px] gap-2 items-center my-1">
        {/* КОЛОНКА КРУГЛЯШКОВ СЛЕВА */}
        <div className="flex flex-col items-center gap-3 z-10">
          {/* Кругляшок 1 Слева: Топ 1-2-3 */}
          <button
            type="button"
            data-testid="orb-leaderboard"
            onClick={() => {
              haptics.selection();
              onOpenLeaderboard();
            }}
            className="group flex flex-col items-center focus:outline-none"
          >
            <div className="w-[52px] h-[52px] rounded-full bg-white border-2 border-amber-400 shadow-md flex flex-col items-center justify-center group-active:scale-90 transition-transform">
              <span className="text-lg leading-none">🏆</span>
              <span className="text-[8px] font-black text-amber-700 mt-0.5">
                1-2-3
              </span>
            </div>
            <span className="text-[10px] font-extrabold text-slate-700 mt-1 leading-tight text-center">
              {t.orbTop}
            </span>
          </button>

          {/* Кругляшок 2 Слева: Цели / Долги */}
          <button
            type="button"
            data-testid="orb-goals"
            onClick={() => {
              haptics.selection();
              onOpenGoalsModal();
            }}
            className="group flex flex-col items-center focus:outline-none"
          >
            <div className="w-[52px] h-[52px] rounded-full bg-white border-2 border-sky-400 shadow-md flex flex-col items-center justify-center group-active:scale-90 transition-transform">
              <span className="text-lg leading-none">🎯</span>
              <span className="text-[8px] font-black text-sky-700 mt-0.5">
                +40 XP
              </span>
            </div>
            <span className="text-[10px] font-extrabold text-slate-700 mt-1 leading-tight text-center">
              {t.orbGoals}
            </span>
          </button>

          {/* Кругляшок 3 Слева: Лимит до ЗП */}
          <button
            type="button"
            data-testid="orb-payday"
            onClick={() => {
              haptics.selection();
              onOpenPaydayModal();
            }}
            className="group flex flex-col items-center focus:outline-none"
          >
            <div className="w-[52px] h-[52px] rounded-full bg-white border-2 border-emerald-400 shadow-md flex flex-col items-center justify-center group-active:scale-90 transition-transform">
              <span className="text-lg leading-none">📊</span>
              <span className="text-[8px] font-black text-emerald-700 mt-0.5">
                +50 XP
              </span>
            </div>
            <span className="text-[10px] font-extrabold text-slate-700 mt-1 leading-tight text-center">
              {t.orbPayday}
            </span>
          </button>
        </div>

        {/* ЦЕНТРАЛЬНАЯ КАРТОЧКА ПЕРСОНАЖА (LIMITLESS) */}
        <div
          data-testid="main-character-card"
          onClick={handleCharacterTap}
          className={`cursor-pointer bg-white rounded-3xl p-2.5 border-2 animate-limitless-aura flex flex-col items-center text-center relative overflow-hidden ${
            state.vipAuraUnlocked
              ? 'border-amber-400 shadow-glow-amber'
              : 'border-emerald-500/70'
          }`}
        >
          {/* Бейдж суперсилы сверху */}
          <div className="inline-flex items-center gap-1 bg-gradient-to-r from-emerald-50 to-sky-50 border border-emerald-200 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full mb-2">
            <span>{state.vipAuraUnlocked ? '👑' : '⚡'}</span>
            <span data-testid="character-superpower-badge">
              {profile.superpowerBadge}
            </span>
          </div>

          {/* Иллюстрация персонажа */}
          <div className="relative w-full aspect-[4/5] max-h-[235px] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 mb-2">
            <img
              data-testid="main-character-image"
              src={profile.imageUrl}
              alt={profile.name}
              className="w-full h-full object-cover object-top transition-transform duration-300 hover:scale-105"
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent p-2.5 pt-6 text-left">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white">
                  {profile.name}
                </span>
                <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full">
                  Ур. {levelInfo.level}
                </span>
              </div>
              <div className="text-[10px] font-bold text-emerald-300 truncate">
                {levelInfo.stageShortTitle}
              </div>
            </div>
          </div>

          {/* Интерактивная мысль героя в стиле «Области тьмы» */}
          <div
            data-testid="character-quote-box"
            className="w-full bg-slate-50 border border-slate-200/90 rounded-2xl p-2 text-[10px] font-semibold text-slate-700 leading-snug"
          >
            {profile.quotes[quoteIndex]}
            <div className="text-[9px] font-bold text-emerald-600 mt-1">
              👆 Нажми на героя для новой мысли ясности
            </div>
          </div>
        </div>

        {/* КОЛОНКА КРУГЛЯШКОВ СПРАВА */}
        <div className="flex flex-col items-center gap-3 z-10">
          {/* Кругляшок 1 Справа: Друзья +XP (Win-Win) */}
          <button
            type="button"
            data-testid="orb-friends"
            onClick={() => {
              haptics.selection();
              onOpenFriendsModal();
            }}
            className="group flex flex-col items-center focus:outline-none"
          >
            <div className="w-[52px] h-[52px] rounded-full bg-white border-2 border-emerald-400 shadow-md flex flex-col items-center justify-center group-active:scale-90 transition-transform">
              <span className="text-lg leading-none">🤝</span>
              <span className="text-[8px] font-black text-emerald-700 mt-0.5">
                +1 💎
              </span>
            </div>
            <span className="text-[10px] font-extrabold text-slate-700 mt-1 leading-tight text-center">
              {t.orbFriends}
            </span>
          </button>

          {/* Кругляшок 2 Справа: KYC +80 XP */}
          <button
            type="button"
            data-testid="orb-kyc"
            onClick={() => {
              haptics.selection();
              onNavigateKyc();
            }}
            className="group flex flex-col items-center focus:outline-none"
          >
            <div className="w-[52px] h-[52px] rounded-full bg-white border-2 border-indigo-400 shadow-md flex flex-col items-center justify-center group-active:scale-90 transition-transform">
              <span className="text-lg leading-none">🛡️</span>
              <span className="text-[8px] font-black text-indigo-700 mt-0.5">
                +80 XP
              </span>
            </div>
            <span className="text-[10px] font-extrabold text-slate-700 mt-1 leading-tight text-center">
              {t.orbKyc}
            </span>
          </button>

          {/* Кругляшок 3 Справа: Гид (Обучение) */}
          <button
            type="button"
            data-testid="orb-tutorial"
            onClick={() => {
              haptics.selection();
              onRestartTutorial();
            }}
            className="group flex flex-col items-center focus:outline-none"
          >
            <div className="w-[52px] h-[52px] rounded-full bg-white border-2 border-amber-400 shadow-md flex flex-col items-center justify-center group-active:scale-90 transition-transform">
              <span className="text-lg leading-none">🧭</span>
              <span className="text-[8px] font-black text-amber-700 mt-0.5">
                5 шагов
              </span>
            </div>
            <span className="text-[10px] font-extrabold text-slate-700 mt-1 leading-tight text-center">
              {t.orbGuide}
            </span>
          </button>
        </div>
      </div>

      {/* 4. ПЛАШКА ГЛАВНОЙ ПОЛЕЗНОСТИ: «СКОЛЬКО ДОСТУПНО ДО ЗАРПЛАТЫ» */}
      <div
        data-testid="safe-limit-banner"
        onClick={() => {
          haptics.selection();
          onOpenPaydayModal();
        }}
        className="cursor-pointer bg-white rounded-3xl p-4 border-2 border-emerald-500/60 shadow-soft hover:border-emerald-600 transition-all"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-base">💡</span>
            <span className="text-xs font-black text-slate-900">
              {t.safeLimitTitle}
            </span>
          </div>
          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            Настроить {!state.profileQuests.paydayClaimed ? '+50 XP' : '⚙️'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-2xl p-2.5 border border-slate-200/80 mb-2.5">
          <div>
            <div className="text-[10px] font-bold text-slate-500">
              {t.freeUntilPayday}
            </div>
            <div
              data-testid="free-balance-value"
              className="text-xs font-black text-slate-900"
            >
              {formatUzs(paydayMetrics.freeBalance)} сум
            </div>
          </div>

          <div className="border-x border-slate-200 px-2">
            <div className="text-[10px] font-bold text-slate-500">
              {t.daysUntilPayday}
            </div>
            <div
              data-testid="days-until-payday-value"
              className="text-xs font-black text-slate-900"
            >
              {paydayMetrics.daysUntilPayday} дн.
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold text-emerald-700">
              {t.dailyLimitLabel}
            </div>
            <div
              data-testid="safe-daily-limit-value"
              className="text-xs font-black text-emerald-600"
            >
              {formatUzs(paydayMetrics.safeDailyLimit)} сум / день
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 font-medium">
            {t.mandatoryPaymentsLabel}: {formatUzs(paydayMetrics.mandatoryDebtsTotal)} сум
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              haptics.selection();
              onNavigateFinance();
            }}
            className="text-emerald-700 font-black hover:underline"
          >
            {t.recordTxLink}
          </button>
        </div>
      </div>
    </div>
  );
};
