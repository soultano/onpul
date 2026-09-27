import React, { useState, useEffect } from 'react';
import { AvatarDisplay } from '../AvatarDisplay';
import { useTelegram } from '../../hooks/useTelegram';

interface HomeTabProps {
  user: any;
  levelInfo: any;
  todayQuizData: any;
  financeSummary: any;
  onOpenQuiz: () => void;
  onNavigateTab: (tab: 'finance' | 'home' | 'profile') => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  user,
  levelInfo,
  todayQuizData,
  financeSummary,
  onOpenQuiz,
  onNavigateTab,
}) => {
  const { haptics } = useTelegram();

  // Таймер обратного отсчета до полуночи
  const [timeLeft, setTimeLeft] = useState(todayQuizData?.secondsUntilNext || 3600);

  useEffect(() => {
    if (todayQuizData?.secondsUntilNext) {
      setTimeLeft(todayQuizData.secondsUntilNext);
    }
  }, [todayQuizData]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev: number) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (secs: number) => {
    const h = Math.floor(secs / 3600).toString().padStart(2, '0');
    const m = Math.floor((secs % 3600) / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // Расчет процента прогресса до следующего уровня
  const currentLvlXp = user?.xp - (levelInfo?.minXp || 0);
  const spanLvlXp = (levelInfo?.maxXp || 65) - (levelInfo?.minXp || 0);
  const progressPercent = levelInfo?.level >= 80 ? 100 : Math.min(100, Math.round((currentLvlXp / Math.max(1, spanLvlXp)) * 100));

  // Подсказки "Что еще можно прокачать"
  const getNextFinanceHint = () => {
    if (!financeSummary) return null;
    if (financeSummary.totalMonthlyIncome === 0) {
      return { title: 'Добавь ежемесячную зарплату', reward: '+50 XP', target: 'finance' };
    }
    if (financeSummary.totalMonthlyFixedExpenses === 0) {
      return { title: 'Заполни постоянные расходы (аренда, связь)', reward: '+20 XP', target: 'finance' };
    }
    if (financeSummary.totalDailyExpensesMonthly === 0) {
      return { title: 'Добавь ежедневные расходы (питание, такси)', reward: '+20 XP', target: 'finance' };
    }
    if (financeSummary.totalSavings === 0) {
      return { title: 'Укажи вклады или отметь «Нет вкладов»', reward: '+50 XP', target: 'finance' };
    }
    if (financeSummary.totalLoanBalance === 0) {
      return { title: 'Проверь кредиты или отметь «Нет кредитов»', reward: '+50 XP', target: 'finance' };
    }
    return null;
  };

  const hint = getNextFinanceHint();

  return (
    <div className="space-y-4 pb-24 animate-float-up">
      {/* КАРТОЧКА ПЕРСОНАЖА И УРОВНЯ */}
      <div className="bg-tg-secondaryBg rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <AvatarDisplay
            gender={user?.gender || 'male'}
            stage={levelInfo?.avatarStage || 1}
            size={72}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-tg-text truncate">
                {user?.firstName || 'Игрок'}
              </h2>
              {user?.currentStreak > 0 && (
                <span className="inline-flex items-center gap-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[11px] font-black px-2 py-0.5 rounded-full shrink-0">
                  🔥 {user.currentStreak} дн.
                </span>
              )}
            </div>

            <div className="text-xs font-extrabold text-primary-600 mt-0.5">
              Уровень {levelInfo?.level} • {levelInfo?.title}
            </div>

            <div className="text-[11px] text-tg-hint mt-0.5">
              {levelInfo?.level >= 80 ? (
                <span className="font-bold text-amber-500">МАКСИМАЛЬНЫЙ УРОВЕНЬ 🌟</span>
              ) : (
                <span>Осталось {levelInfo?.xpToNext} XP до след. уровня</span>
              )}
            </div>
          </div>
        </div>

        {/* Прогресс-бар опыта */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold text-tg-hint">
            <span>{user?.xp} XP</span>
            <span>{levelInfo?.level >= 80 ? 'MAX' : `${levelInfo?.maxXp} XP`}</span>
          </div>
          <div className="w-full h-3 bg-slate-200 dark:bg-slate-700/60 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* ГЛАВНАЯ КАРТОЧКА: ЗАДАНИЕ ДНЯ */}
      <div className="rounded-3xl p-5 border shadow-sm bg-gradient-to-br from-emerald-500/10 via-primary-500/5 to-transparent border-primary-500/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-primary-700 dark:text-primary-400 flex items-center gap-1.5">
            <span>⚡</span>
            <span>ЗАДАНИЕ ДНЯ</span>
          </span>
          <span className="text-xs font-black text-amber-600 dark:text-amber-400">
            до +100 XP
          </span>
        </div>

        <h3 className="text-base font-extrabold text-tg-text mb-1.5">
          {todayQuizData?.newsTitle || 'Финансовый квиз по новостям'}
        </h3>

        <p className="text-xs text-tg-hint line-clamp-2 mb-4">
          {todayQuizData?.newsText || 'Пройдите короткий опрос из 3 вопросов для прокачки грамотности и удержания винстрика.'}
        </p>

        {todayQuizData?.completed ? (
          /* Уже пройдено сегодня */
          <div className="bg-tg-bg/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-tg-text flex items-center gap-1">
                <span>✅ Задание выполнено:</span>
                <span className="text-primary-600 font-black">
                  {todayQuizData.attempt?.correctCount || 0}/3
                </span>
              </div>
              <div className="text-[11px] text-tg-hint">
                Следующее через: <span className="font-mono font-bold">{formatCountdown(timeLeft)}</span>
              </div>
            </div>

            <button
              onClick={onOpenQuiz}
              className="px-3.5 py-2 rounded-xl bg-tg-secondaryBg border border-slate-200 dark:border-slate-700 text-xs font-bold text-tg-text hover:bg-slate-100"
            >
              Перечитать ↗
            </button>
          </div>
        ) : (
          /* Кнопка пройти */
          <button
            onClick={() => {
              haptics.impact('medium');
              onOpenQuiz();
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-extrabold text-sm shadow-lg shadow-primary-600/30 transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Пройти задание (+100 XP)</span>
            <span>→</span>
          </button>
        )}
      </div>

      {/* БЛОК: ЧТО ЕЩЁ МОЖНО ПРОКАЧАТЬ */}
      {hint && (
        <div
          onClick={() => {
            haptics.selection();
            onNavigateTab('finance');
          }}
          className="bg-tg-secondaryBg border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-primary-500/40 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center text-lg">
              💡
            </div>
            <div>
              <div className="text-xs font-extrabold text-tg-text">{hint.title}</div>
              <div className="text-[11px] text-primary-600 font-bold">{hint.reward} в копилку уровня</div>
            </div>
          </div>
          <span className="text-tg-hint font-bold text-sm">→</span>
        </div>
      )}
    </div>
  );
};
