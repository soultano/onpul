import React, { useState } from 'react';
import { TUTORIAL_STEPS } from '../../data/limitlessContent';
import { useTelegram } from '../../hooks/useTelegram';

interface ArrowTutorialOverlayProps {
  isOpen: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export const ArrowTutorialOverlay: React.FC<ArrowTutorialOverlayProps> = ({
  isOpen,
  onComplete,
  onSkip,
}) => {
  const { haptics } = useTelegram();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen) return null;

  const currentStep = TUTORIAL_STEPS[currentIndex];
  const isLastStep = currentIndex === TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    haptics.selection();
    if (isLastStep) {
      haptics.notification('success');
      setCurrentIndex(0);
      onComplete();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    haptics.selection();
    setCurrentIndex(0);
    onSkip();
  };

  return (
    <div
      data-testid="tutorial-overlay"
      className="fixed inset-0 z-50 bg-slate-900/55 backdrop-blur-[2px] flex flex-col justify-between p-4 max-w-md mx-auto select-none animate-float-up"
    >
      {/* Верхняя строка прогресса обучения */}
      <div className="flex items-center justify-between bg-white/95 backdrop-blur rounded-2xl px-4 py-2.5 shadow-md border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-black">
            {currentStep.step}
          </span>
          <span
            data-testid="tutorial-step-counter"
            className="text-xs font-extrabold text-slate-800"
          >
            Шаг {currentStep.step} из {TUTORIAL_STEPS.length}
          </span>
        </div>

        {/* Индикатор точек */}
        <div className="flex items-center gap-1.5">
          {TUTORIAL_STEPS.map((s, idx) => (
            <span
              key={s.step}
              className={`h-2 rounded-full transition-all ${
                idx === currentIndex
                  ? 'w-6 bg-emerald-600'
                  : idx < currentIndex
                  ? 'w-2 bg-emerald-400'
                  : 'w-2 bg-slate-200'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          data-testid="tutorial-skip-btn"
          onClick={handleSkip}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg transition-colors"
        >
          Пропустить
        </button>
      </div>

      {/* Анимированные SVG-стрелки по целевым зонам */}
      <div className="relative flex-1 flex flex-col items-center justify-center my-2">
        {/* ШАГ 1: Стрелка в центр на Персонажа и шкалу Уровня/XP */}
        {currentStep.targetZone === 'character' && (
          <div className="flex flex-col items-center mb-3 animate-bounce-arrow">
            <div className="bg-amber-400 text-slate-950 text-[11px] font-black px-3 py-1 rounded-full shadow-lg mb-1">
              👇 Твой Герой Ясности и Уровень XP
            </div>
            <svg width="54" height="54" viewBox="0 0 54 54" fill="none">
              <path
                d="M27 6V44M27 44L13 30M27 44L41 30"
                stroke="#10b981"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}

        {/* ШАГ 4: Стрелка вверх на виджет Лидерборда Топ 1-2-3 */}
        {currentStep.targetZone === 'leaderboard' && (
          <div className="flex flex-col items-center mb-3 animate-bounce-arrow">
            <svg width="54" height="54" viewBox="0 0 54 54" fill="none">
              <path
                d="M27 48V10M27 10L13 24M27 10L41 24"
                stroke="#f59e0b"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="bg-amber-400 text-slate-950 text-[11px] font-black px-3 py-1 rounded-full shadow-lg mt-1">
              🏆 Пьедестал 1–2–3 места и твой ранг
            </div>
          </div>
        )}

        {/* ШАГ 3: Стрелки влево и вправо на Кругляшки вокруг персонажа */}
        {currentStep.targetZone === 'orbs' && (
          <div className="w-full flex items-center justify-between px-2 mb-3 animate-bounce-arrow">
            <div className="flex items-center gap-1 bg-sky-500 text-white text-[11px] font-black px-3 py-1.5 rounded-full shadow-lg">
              <span>⬅️ Топ / Цели / Лимит</span>
            </div>
            <div className="flex items-center gap-1 bg-emerald-600 text-white text-[11px] font-black px-3 py-1.5 rounded-full shadow-lg">
              <span>Друзья / KYC / Гид ➡️</span>
            </div>
          </div>
        )}

        {/* Карточка подсказки */}
        <div className="w-full bg-white rounded-3xl p-5 shadow-2xl border-2 border-emerald-500/80 text-left relative">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold mb-2">
            <span>🧭 Интерактивный гид</span>
            <span>•</span>
            <span>+25 XP за прохождение</span>
          </div>

          <h2
            data-testid="tutorial-step-title"
            className="text-lg font-black text-slate-900 mb-2 leading-snug"
          >
            {currentStep.title}
          </h2>

          <p
            data-testid="tutorial-step-text"
            className="text-xs font-medium text-slate-600 leading-relaxed mb-5"
          >
            {currentStep.text}
          </p>

          <div className="flex items-center gap-2">
            {currentIndex > 0 && (
              <button
                type="button"
                onClick={() => {
                  haptics.selection();
                  setCurrentIndex((prev) => prev - 1);
                }}
                className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                ← Назад
              </button>
            )}

            {!isLastStep ? (
              <button
                type="button"
                data-testid="tutorial-next-btn"
                onClick={handleNext}
                className="flex-1 py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/25 transition-all active:scale-95"
              >
                {currentStep.buttonText}
              </button>
            ) : (
              <button
                type="button"
                data-testid="tutorial-finish-btn"
                onClick={handleNext}
                className="flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
              >
                {currentStep.buttonText}
              </button>
            )}
          </div>
        </div>

        {/* ШАГ 2: Стрелка вниз-влево на 1-ю кнопку нижнего меню */}
        {currentStep.targetZone === 'nav-left' && (
          <div className="w-full flex flex-col items-start pl-4 mt-3 animate-bounce-arrow">
            <div className="bg-emerald-500 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-lg mb-1">
              ⚡ Приходы-Расходы и Задания дня
            </div>
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <path
                d="M38 10L14 44M14 44H34M14 44V24"
                stroke="#10b981"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}

        {/* ШАГ 5: Стрелка вниз-вправо на 3-ю кнопку нижнего меню */}
        {currentStep.targetZone === 'nav-right' && (
          <div className="w-full flex flex-col items-end pr-4 mt-3 animate-bounce-arrow">
            <div className="bg-sky-500 text-white text-[11px] font-black px-3 py-1 rounded-full shadow-lg mb-1">
              🛡️ Настройки, Email, @username и KYC (+XP)
            </div>
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <path
                d="M18 10L42 44M42 44H22M42 44V24"
                stroke="#0ea5e9"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Нижний отступ под панель навигации */}
      <div className="h-16" />
    </div>
  );
};
