/**
 * 🎮 OnPul: ФинУровень — Единая конфигурация опыта (XP), уровней и званий
 * Frontend Config
 */

export interface LevelInfo {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
  xpToNext: number;
  avatarStage: number; // 1 to 8 (эволюционирует каждые 10 уровней)
}

export const MAX_LEVEL = 80;

export function xpRequiredForNextLevel(level: number): number {
  if (level >= MAX_LEVEL) return 0;
  return 50 + 15 * level;
}

export const LEVEL_THRESHOLDS: number[] = (() => {
  const thresholds: number[] = [0];
  let cumulative = 0;
  for (let lvl = 1; lvl < MAX_LEVEL; lvl++) {
    cumulative += xpRequiredForNextLevel(lvl);
    thresholds.push(cumulative);
  }
  return thresholds;
})();

export function getTitleForLevel(level: number): string {
  if (level < 1) return 'Новичок';
  if (level <= 9) return 'Новичок';
  if (level <= 19) return 'Считающий';
  if (level <= 29) return 'Планировщик';
  if (level <= 39) return 'Сберегатель';
  if (level <= 49) return 'Инвестор-стажёр';
  if (level <= 59) return 'Стратег';
  if (level <= 69) return 'Финансист';
  if (level <= 79) return 'Эксперт';
  return 'Мастер финансов';
}

export function getAvatarStage(level: number): number {
  if (level < 10) return 1;
  if (level < 20) return 2;
  if (level < 30) return 3;
  if (level < 40) return 4;
  if (level < 50) return 5;
  if (level < 60) return 6;
  if (level < 70) return 7;
  return 8;
}

export function calculateLevelAndProgress(totalXp: number): LevelInfo {
  let level = 1;
  while (level < MAX_LEVEL && totalXp >= LEVEL_THRESHOLDS[level]) {
    level++;
  }

  const currentLevelMinXp = LEVEL_THRESHOLDS[level - 1];
  const nextLevelXp = level < MAX_LEVEL ? LEVEL_THRESHOLDS[level] : currentLevelMinXp;
  const xpToNext = level < MAX_LEVEL ? nextLevelXp - totalXp : 0;

  return {
    level,
    title: getTitleForLevel(level),
    minXp: currentLevelMinXp,
    maxXp: nextLevelXp,
    xpToNext,
    avatarStage: getAvatarStage(level),
  };
}

export const DATA_XP_REWARDS = {
  CHOOSE_CHARACTER: 20,
  PERSONAL_FIELD: 15,
  SALARY: 50,
  ADDITIONAL_INCOME: 20,
  FIXED_EXPENSE_ITEM: 20,
  DAILY_EXPENSE_ITEM: 20,
  FIRST_DEPOSIT_OR_NONE: 50,
  FIRST_LOAN_OR_NONE: 50,
  ADDITIONAL_DEPOSIT: 20,
  ADDITIONAL_LOAN: 20,
  PROFILE_100_BONUS: 150,
  MONTHLY_UPDATE: 50,
} as const;
