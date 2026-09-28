/**
 * 🧠 OnPul: ФинУровень (Limitless Edition) — Конфигурация уровней, XP и стадий ясности
 */

export interface LevelInfo {
  level: number;
  title: string;
  stageNumber: 1 | 2 | 3 | 4;
  stageTitle: string;
  stageShortTitle: string;
  stageDescription: string;
  minXp: number;
  maxXp: number;
  xpInCurrentLevel: number;
  xpNeededForLevel: number;
  xpToNext: number;
  progressPercent: number;
  avatarStage: number; // 1 to 8 for legacy compatibility
}

export const MAX_LEVEL = 80;

/**
 * Формула прогрессии уровней: ΔXP(L) = 50 + 15 * L
 * Ур. 1 → 2: 65 XP
 * Ур. 2 → 3: 80 XP (всего 145 XP)
 * Ур. 3 → 4: 95 XP (всего 240 XP)
 */
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

export function getEvolutionStage(level: number): {
  stageNumber: 1 | 2 | 3 | 4;
  stageTitle: string;
  stageShortTitle: string;
  stageDescription: string;
} {
  if (level <= 10) {
    return {
      stageNumber: 1,
      stageTitle: 'Стадия 1: Туман в голове',
      stageShortTitle: 'Туман в голове',
      stageDescription: 'Первые вспышки ясности: начинаем видеть реальные цифры доходов и трат.',
    };
  }
  if (level <= 30) {
    return {
      stageNumber: 2,
      stageTitle: 'Стадия 2: Фокус внимания',
      stageShortTitle: 'Фокус внимания',
      stageDescription: 'Утечки закрыты, приходы и расходы под контролем, есть безопасный дневной лимит.',
    };
  }
  if (level <= 60) {
    return {
      stageNumber: 3,
      stageTitle: 'Стадия 3: Архитектор капитала',
      stageShortTitle: 'Архитектор капитала',
      stageDescription: 'Календарь платежей работает как часы, подушка безопасности растёт, покупки без долгов.',
    };
  }
  return {
    stageNumber: 4,
    stageTitle: 'Стадия 4: Сверхчеловек (100% ясности)',
    stageShortTitle: 'Сверхчеловек (100% ясности)',
    stageDescription: 'Полная финансовая осознанность. Капитал и система работают на тебя.',
  };
}

export function getTitleForLevel(level: number): string {
  return getEvolutionStage(level).stageShortTitle;
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
  const safeXp = Math.max(0, Math.floor(totalXp));
  let level = 1;
  while (level < MAX_LEVEL && safeXp >= LEVEL_THRESHOLDS[level]) {
    level++;
  }

  const currentLevelMinXp = LEVEL_THRESHOLDS[level - 1];
  const nextLevelXp = level < MAX_LEVEL ? LEVEL_THRESHOLDS[level] : currentLevelMinXp;
  const xpNeededForLevel = level < MAX_LEVEL ? nextLevelXp - currentLevelMinXp : 100;
  const xpInCurrentLevel = level < MAX_LEVEL ? safeXp - currentLevelMinXp : xpNeededForLevel;
  const xpToNext = level < MAX_LEVEL ? nextLevelXp - safeXp : 0;
  const progressPercent =
    level >= MAX_LEVEL
      ? 100
      : Math.min(100, Math.max(0, Math.round((xpInCurrentLevel / xpNeededForLevel) * 100)));

  const stage = getEvolutionStage(level);

  return {
    level,
    title: stage.stageShortTitle,
    stageNumber: stage.stageNumber,
    stageTitle: stage.stageTitle,
    stageShortTitle: stage.stageShortTitle,
    stageDescription: stage.stageDescription,
    minXp: currentLevelMinXp,
    maxXp: nextLevelXp,
    xpInCurrentLevel,
    xpNeededForLevel,
    xpToNext,
    progressPercent,
    avatarStage: getAvatarStage(level),
  };
}

/**
 * Формула очков репутации для Лидерборда: RP = XP_total + (Streak * 15) + arenaTrophies
 */
export function calculateReputationPoints(
  totalXp: number,
  streak: number,
  arenaTrophies = 0
): number {
  return (
    Math.max(0, Math.floor(totalXp)) +
    Math.max(0, Math.floor(streak)) * 15 +
    Math.max(0, Math.floor(arenaTrophies))
  );
}

export const LIMITLESS_XP_REWARDS = {
  TUTORIAL_COMPLETE: 25,
  CLAIM_USERNAME: 25,
  CLAIM_EMAIL: 30,
  CLAIM_KYC: 80,
  SETUP_PAYDAY: 50,
  ADD_INCOME: 15,
  ADD_EXPENSE: 10,
  COMPLETE_DAILY_TASK: 100,
  ADD_GOAL_OR_DEBT: 40,
  INVITE_FRIEND: 50,
} as const;

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
