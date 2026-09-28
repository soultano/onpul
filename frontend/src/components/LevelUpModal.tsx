import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CHARACTER_PROFILES } from '../data/limitlessContent';
import { CharacterGender } from '../types/game';
import { useTelegram } from '../hooks/useTelegram';

interface LevelUpModalProps {
  isOpen: boolean;
  level: number;
  title: string;
  gender: CharacterGender | 'none';
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  isOpen,
  level,
  title,
  gender,
  onClose,
}) => {
  const { haptics } = useTelegram();

  useEffect(() => {
    if (isOpen) {
      haptics.notification('success');
      try {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.4 },
          colors: ['#10b981', '#0ea5e9', '#f59e0b', '#6366f1'],
        });
      } catch (e) {}

      const timer = setTimeout(() => {
        onClose();
      }, 4200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, haptics, onClose]);

  if (!isOpen) return null;

  const charKey: CharacterGender = gender === 'female' ? 'female' : 'male';
  const profile = CHARACTER_PROFILES[charKey];

  return (
    <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm pointer-events-none animate-float-up">
      <div
        data-testid="level-up-modal"
        className="w-full rounded-3xl bg-white/95 backdrop-blur-md border-2 border-amber-400 p-4 shadow-2xl flex items-center gap-3.5"
      >
        <img
          src={profile.imageUrl}
          alt={profile.name}
          className="w-14 h-14 rounded-2xl object-cover object-top border-2 border-amber-400 shrink-0 shadow-sm"
        />

        <div className="flex-1 min-w-0 text-left">
          <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full mb-0.5">
            <span>🎉 LEVEL UP!</span>
          </div>
          <h3 className="text-sm font-black text-slate-900 leading-tight">
            Новое прозрение! Уровень {level} достигнут!
          </h3>
          <p className="text-[11px] font-bold text-emerald-700 truncate">
            Стадия: {title}
          </p>
        </div>

        <button
          type="button"
          data-testid="close-level-up-btn"
          onClick={onClose}
          className="pointer-events-auto px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shrink-0 shadow-xs"
        >
          Ок ✓
        </button>
      </div>
    </div>
  );
};
