/**
 * 🎮 OnPul: ФинУровень — Единая конфигурация опыта (XP), уровней и званий
 * Общий конфиг для клиента и сервера (Single Source of Truth)
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

/**
 * Опыт, необходимый для перехода с уровня L на уровень L+1:
 * Формула: 50 + 15 * L
 */
export function xpRequiredForNextLevel(level: number): number {
  if (level >= MAX_LEVEL) return 0;
  return 50 + 15 * level;
}

/**
 * Таблица суммарного опыта, необходимого для достижения каждого уровня
 */
export const LEVEL_THRESHOLDS: number[] = (() => {
  const thresholds: number[] = [0]; // Level 1 starts at 0 XP
  let cumulative = 0;
  for (let lvl = 1; lvl < MAX_LEVEL; lvl++) {
    cumulative += xpRequiredForNextLevel(lvl);
    thresholds.push(cumulative);
  }
  return thresholds;
})();

/**
 * Звания пользователей по диапазонам уровней:
 * 1–9 «Новичок»
 * 10–19 «Считающий»
 * 20–29 «Планировщик»
 * 30–39 «Сберегатель»
 * 40–49 «Инвестор-стажёр»
 * 50–59 «Стратег»
 * 60–69 «Финансист»
 * 70–79 «Эксперт»
 * 80 «Мастер финансов»
 */
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

/**
 * Стадия внешнего вида персонажа (меняется каждые 10 уровней, от 1 до 8)
 */
export function getAvatarStage(level: number): number {
  if (level < 10) return 1;
  if (level < 20) return 2;
  if (level < 30) return 3;
  if (level < 40) return 4;
  if (level < 50) return 5;
  if (level < 60) return 6;
  if (level < 70) return 7;
  return 8; // Уровень 70-80
}

/**
 * Расчет текущего уровня и прогресса по общему количеству XP
 */
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

/**
 * Начисление XP за Задание дня:
 * 3 из 3: 100 + бонус винстрика
 * 2 из 3: 60
 * 1 из 3: 30
 * 0 из 3: 10
 */
export const QUIZ_XP_REWARDS = {
  PERFECT_3: 100,
  GOOD_2: 60,
  OK_1: 30,
  PARTICIPATION_0: 10,
} as const;

export function calculateQuizXp(correctCount: number, currentStreak: number): { base: number; streakBonus: number; total: number } {
  let base = QUIZ_XP_REWARDS.PARTICIPATION_0;
  if (correctCount === 3) base = QUIZ_XP_REWARDS.PERFECT_3;
  else if (correctCount === 2) base = QUIZ_XP_REWARDS.GOOD_2;
  else if (correctCount === 1) base = QUIZ_XP_REWARDS.OK_1;

  // Винстрик бонус засчитывается только за 3/3
  let streakBonus = 0;
  if (correctCount === 3) {
    // Бонус: +10 XP за каждый день текущего стрика, максимум +50 (с 5-го дня подряд)
    streakBonus = Math.min(50, currentStreak * 10);
  }

  return {
    base,
    streakBonus,
    total: base + streakBonus,
  };
}

/**
 * Начисление XP за заполнение полей (начисляется РОВНО ОДИН РАЗ за уникальный ключ)
 */
export const DATA_XP_REWARDS = {
  CHOOSE_CHARACTER: 20,
  PERSONAL_FIELD: 15,          // возраст, город, занятость
  SALARY: 50,
  ADDITIONAL_INCOME: 20,      // заполнение или отметка "нет"
  FIXED_EXPENSE_ITEM: 20,     // за каждую категорию
  DAILY_EXPENSE_ITEM: 20,     // за каждую категорию
  FIRST_DEPOSIT_OR_NONE: 50,  // первый вклад или отметка "нет вкладов"
  FIRST_LOAN_OR_NONE: 50,     // первый кредит или отметка "нет кредитов"
  ADDITIONAL_DEPOSIT: 20,     // максимум 5 шт.
  ADDITIONAL_LOAN: 20,        // максимум 5 шт.
  PROFILE_100_BONUS: 150,     // профиль заполнен на 100%
  MONTHLY_UPDATE: 50,         // проверка актуальности раз в 30 дней
} as const;

export const MAX_ADDITIONAL_DEPOSITS_FOR_XP = 5;
export const MAX_ADDITIONAL_LOANS_FOR_XP = 5;
