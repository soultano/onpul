import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { AvatarDisplay } from './AvatarDisplay';
import { useTelegram } from '../hooks/useTelegram';
import { getAvatarStage } from '../config/xp';

interface LevelUpModalProps {
  isOpen: boolean;
  level: number;
  title: string;
  gender: 'male' | 'female' | 'none';
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

      // Запуск салюта конфетти
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#059669', '#f59e0b', '#3b82f6'],
        });
      } catch (e) {}
    }
  }, [isOpen, haptics]);

  if (!isOpen) return null;

  const stage = getAvatarStage(level);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-float-up">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-tg-bg border border-primary-500/30 p-6 text-center shadow-2xl">
        <div className="text-4xl mb-2 animate-bounce">🎉</div>
        <h2 className="text-2xl font-black text-tg-text mb-1">НОВЫЙ УРОВЕНЬ!</h2>
        <p className="text-xs text-tg-hint mb-6">Ваша финансовая грамотность растет каждый день</p>

        {/* Аватар */}
        <div className="flex justify-center mb-4">
          <AvatarDisplay gender={gender} stage={stage} size={110} />
        </div>

        {/* Плашка уровня */}
        <div className="inline-block bg-primary-50 border border-primary-500/30 text-primary-700 px-4 py-1.5 rounded-full font-black text-sm mb-2">
          Уровень {level}
        </div>

        <div className="text-lg font-extrabold text-tg-text mb-6">
          Звание: <span className="text-primary-600">{title}</span>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm shadow-lg shadow-primary-600/30 transition-transform active:scale-95"
        >
          Продолжить
        </button>
      </div>
    </div>
  );
};
