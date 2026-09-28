import React, { useState } from 'react';
import { NEURO_BLITZ_CARDS } from '../../data/limitlessContent';
import { LimitlessGameState, formatUzs } from '../../types/game';
import { useTelegram } from '../../hooks/useTelegram';

interface NeuroBlitzModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: LimitlessGameState;
  onPlayBlitzCard: (isSuperhumanMove: boolean) => void;
}

export const NeuroBlitzModal: React.FC<NeuroBlitzModalProps> = ({
  isOpen,
  onClose,
  state,
  onPlayBlitzCard,
}) => {
  const { haptics } = useTelegram();
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [selectedChoice, setSelectedChoice] = useState<'A' | 'B' | null>(null);
  const [comboStreak, setComboStreak] = useState<number>(1);

  if (!isOpen) return null;

  const currentCard =
    NEURO_BLITZ_CARDS[cardIndex % NEURO_BLITZ_CARDS.length];
  const isDuelWon = state.arenaTrophies >= state.rivalTrophies;
  const duelProgressPercent = Math.min(
    100,
    Math.round((state.arenaTrophies / Math.max(1, state.rivalTrophies)) * 100)
  );

  const handleChooseOption = (choice: 'A' | 'B') => {
    if (selectedChoice !== null) return;
    setSelectedChoice(choice);

    if (choice === 'A') {
      haptics.notification('success');
      setComboStreak((prev) => Math.min(3, prev + 1));
      onPlayBlitzCard(true);
    } else {
      haptics.notification('warning');
      setComboStreak(1);
      onPlayBlitzCard(false);
    }
  };

  const handleNextCard = () => {
    haptics.selection();
    setSelectedChoice(null);
    setCardIndex((prev) => (prev + 1) % NEURO_BLITZ_CARDS.length);
  };

  return (
    <div
      data-testid="neuro-blitz-modal"
      onClick={onClose}
      className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3.5 animate-float-up"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-3xl border-2 border-amber-400 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Шапка Нейро-Блица */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-4 py-3.5 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="bg-white/20 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                ⚡ Ежедневная PvP-Арена
              </span>
              <span className="bg-slate-950/30 text-amber-200 text-[10px] font-black px-2 py-0.5 rounded-full">
                🔥 Комбо ×{comboStreak}
              </span>
            </div>
            <h3 className="text-base font-black mt-0.5">
              ⚡ Нейро-Блиц: Сделка или Ловушка?
            </h3>
          </div>
          <button
            type="button"
            data-testid="close-blitz-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white font-black flex items-center justify-center shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Контент */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1">
          {/* Шкала дуэли с Соперником Дня (Сардор) */}
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200">
            <div className="flex items-center justify-between text-xs font-black mb-1.5">
              <span className="text-emerald-700">
                ⚔️ Ты ({state.arenaTrophies} 🏆)
              </span>
              <span className="text-slate-400 text-[10px]">VS</span>
              <span className="text-rose-700">
                Соперник дня: Сардор ({state.rivalTrophies} 🏆)
              </span>
            </div>

            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden mb-1.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isDuelWon
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500'
                }`}
                style={{ width: `${duelProgressPercent}%` }}
              />
            </div>

            {isDuelWon ? (
              <div
                data-testid="blitz-duel-won-badge"
                className="bg-emerald-100 border border-emerald-400 text-emerald-900 rounded-xl px-3 py-1.5 text-[11px] font-black flex items-center justify-between"
              >
                <span>🏆 Соперник дня Сардор повержен! Ты впереди!</span>
                <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[10px]">
                  +1 💎 NZT
                </span>
              </div>
            ) : (
              <div className="text-[10px] font-bold text-slate-600 flex items-center justify-between">
                <span>
                  До победы над Сардором:{' '}
                  <strong className="text-amber-700">
                    {Math.max(0, state.rivalTrophies - state.arenaTrophies)} 🏆
                  </strong>
                </span>
                <span className="text-indigo-700 font-black">
                  При победе: +1 💎 NZT!
                </span>
              </div>
            )}
          </div>

          {/* Карта Жизненной Финансовой Дилеммы */}
          <div className="bg-gradient-to-b from-white to-slate-50 rounded-2xl p-4 border-2 border-slate-200 shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full">
                {currentCard.categoryTag}
              </span>
              <span className="text-[10px] font-extrabold text-slate-400">
                Дилемма #{(cardIndex % NEURO_BLITZ_CARDS.length) + 1} из{' '}
                {NEURO_BLITZ_CARDS.length}
              </span>
            </div>

            <h4 className="text-sm font-black text-slate-900 mb-2 leading-snug">
              {currentCard.title}
            </h4>

            <p className="text-xs text-slate-700 leading-relaxed font-medium bg-white p-3 rounded-xl border border-slate-200/80">
              {currentCard.situation}
            </p>
          </div>

          {/* Две крупные кнопки выбора в 1 клик */}
          <div className="space-y-2.5">
            <button
              type="button"
              data-testid="blitz-option-a"
              onClick={() => handleChooseOption('A')}
              className={`w-full p-3.5 rounded-2xl border-2 text-left transition-all ${
                selectedChoice === 'A'
                  ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20'
                  : 'bg-white hover:bg-emerald-50/50 border-emerald-400/80 active:scale-[0.99]'
              }`}
            >
              <div className="text-xs font-black text-slate-900 leading-snug">
                {currentCard.optionA.label}
              </div>
            </button>

            <button
              type="button"
              data-testid="blitz-option-b"
              onClick={() => handleChooseOption('B')}
              className={`w-full p-3.5 rounded-2xl border-2 text-left transition-all ${
                selectedChoice === 'B'
                  ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/20'
                  : 'bg-white hover:bg-rose-50/50 border-slate-200 active:scale-[0.99]'
              }`}
            >
              <div className="text-xs font-black text-slate-800 leading-snug">
                {currentCard.optionB.label}
              </div>
            </button>
          </div>

          {/* Мгновенный вердикт и награда после клика */}
          {selectedChoice !== null && (
            <div
              data-testid="blitz-result-box"
              className={`rounded-2xl p-4 border-2 animate-float-up ${
                selectedChoice === 'A'
                  ? 'bg-emerald-50/90 border-emerald-500'
                  : 'bg-amber-50/90 border-amber-400'
              }`}
            >
              <div className="text-xs font-black text-slate-900 mb-1">
                {selectedChoice === 'A'
                  ? currentCard.optionA.verdictTitle
                  : currentCard.optionB.verdictTitle}
              </div>
              <p className="text-[11px] text-slate-700 leading-relaxed mb-3">
                {selectedChoice === 'A'
                  ? currentCard.optionA.explanation
                  : currentCard.optionB.explanation}
              </p>

              {selectedChoice === 'A' ? (
                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                    +30 XP ⚡
                  </span>
                  <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full">
                    +30 🏆 Кубков Лиги
                  </span>
                  <span className="bg-sky-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                    +200 💰 OnPul Coins
                  </span>
                  <span className="bg-white border border-emerald-300 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full">
                    Спасено в жизни: {formatUzs(currentCard.optionA.savedAmountUzs)} сум
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full">
                    +10 XP за важный урок 💡
                  </span>
                </div>
              )}

              <button
                type="button"
                data-testid="blitz-next-card-btn"
                onClick={handleNextCard}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md transition-all"
              >
                Следующая дилемма →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
