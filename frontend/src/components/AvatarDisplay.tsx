import React from 'react';

interface AvatarDisplayProps {
  gender: 'male' | 'female' | 'none';
  stage: number; // 1 to 8
  size?: number;
  className?: string;
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  gender = 'male',
  stage = 1,
  size = 96,
  className = '',
}) => {
  const isFemale = gender === 'female';

  // Аксессуары и цвета одежды по стадиям (1..8)
  const stageMeta = [
    { name: 'Новичок', bg: '#f1f5f9', badge: '🌱', border: '#cbd5e1', suitColor: '#64748b' },
    { name: 'Считающий', bg: '#ecfdf5', badge: '🧮', border: '#a7f3d0', suitColor: '#059669' },
    { name: 'Планировщик', bg: '#eff6ff', badge: '📊', border: '#bfdbfe', suitColor: '#2563eb' },
    { name: 'Сберегатель', bg: '#fef3c7', badge: '🏦', border: '#fde68a', suitColor: '#d97706' },
    { name: 'Инвестор-стажёр', bg: '#f5f3ff', badge: '📈', border: '#ddd6fe', suitColor: '#7c3aed' },
    { name: 'Стратег', bg: '#fae8ff', badge: '🛡️', border: '#f5d0fe', suitColor: '#c026d3' },
    { name: 'Финансист', bg: '#fff1f2', badge: '💎', border: '#fecdd3', suitColor: '#e11d48' },
    { name: 'Мастер финансов', bg: 'linear-gradient(135deg, #fef3c7, #fde68a)', badge: '👑', border: '#f59e0b', suitColor: '#b45309' },
  ];

  const currentMeta = stageMeta[Math.min(7, Math.max(0, stage - 1))];

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full shadow-md transition-transform duration-300 hover:scale-105 ${className}`}
      style={{
        width: size,
        height: size,
        background: currentMeta.bg,
        border: `3px solid ${currentMeta.border}`,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        width={size * 0.82}
        height={size * 0.82}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id={`skin-${gender}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fdba74" />
          </linearGradient>
          <linearGradient id={`suit-${stage}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={currentMeta.suitColor} />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>

        {/* Тело и одежда */}
        <path
          d="M 20 95 C 20 70, 80 70, 80 95 Z"
          fill={`url(#suit-${stage})`}
        />

        {/* Воротник рубашки */}
        <polygon points="44,70 50,80 56,70 50,73" fill="#ffffff" />
        {stage >= 4 && <polygon points="48,74 52,74 51,84 49,84" fill="#ef4444" />} {/* Галстук со стадии 4 */}

        {/* Шея */}
        <rect x="44" y="60" width="12" height="14" fill={`url(#skin-${gender})`} rx="4" />

        {/* Лицо */}
        <circle cx="50" cy="46" r="22" fill={`url(#skin-${gender})`} />

        {/* Прическа */}
        {isFemale ? (
          // Женская прическа
          <path
            d="M 26 48 C 26 22, 74 22, 74 48 C 74 60, 70 66, 70 66 C 68 50, 66 36, 50 36 C 34 36, 32 50, 30 66 C 30 66, 26 60, 26 48 Z"
            fill="#854d0e"
          />
        ) : (
          // Мужская прическа
          <path
            d="M 28 42 C 28 24, 72 24, 72 42 C 72 32, 64 28, 50 28 C 36 28, 28 32, 28 42 Z"
            fill="#334155"
          />
        )}

        {/* Глаза */}
        <circle cx="42" cy="46" r="2.5" fill="#1e293b" />
        <circle cx="58" cy="46" r="2.5" fill="#1e293b" />
        {/* Блики */}
        <circle cx="43" cy="45" r="0.8" fill="#ffffff" />
        <circle cx="59" cy="45" r="0.8" fill="#ffffff" />

        {/* Улыбка */}
        <path d="M 44 54 Q 50 59 56 54" stroke="#78350f" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Очки для стадий 5..8 */}
        {stage >= 5 && (
          <g stroke="#0f172a" strokeWidth="1.5" fill="rgba(255,255,255,0.25)">
            <rect x="36" y="41" width="12" height="10" rx="3" />
            <rect x="52" y="41" width="12" height="10" rx="3" />
            <line x1="48" y1="46" x2="52" y2="46" />
          </g>
        )}

        {/* Корона для стадии 8 */}
        {stage === 8 && (
          <path
            d="M 36 24 L 42 30 L 50 20 L 58 30 L 64 24 L 62 33 L 38 33 Z"
            fill="#f59e0b"
            stroke="#b45309"
            strokeWidth="1"
          />
        )}
      </svg>

      {/* Бейдж звания на аватаре */}
      <span
        className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full bg-white shadow-md border text-xs"
        style={{ width: size * 0.32, height: size * 0.32, borderColor: currentMeta.border }}
        title={currentMeta.name}
      >
        {currentMeta.badge}
      </span>
    </div>
  );
};
