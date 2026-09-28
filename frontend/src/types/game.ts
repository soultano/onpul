import {
  SupportedLanguage,
  detectDefaultLanguage,
} from '../i18n/translations';

export type CharacterGender = 'male' | 'female';

export interface TransactionItem {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  categoryLabel: string;
  categoryIcon: string;
  createdAt: string;
  xpEarned: number;
}

export interface GoalOrDebtItem {
  id: string;
  kind: 'goal' | 'debt';
  category?: string;
  title: string;
  amount: number;
  dueDateOrTarget: string;
  completed: boolean;
}

export interface ProfileQuestsState {
  username: string;
  usernameClaimed: boolean;
  email: string;
  emailClaimed: boolean;
  kycFullName: string;
  kycCity: string;
  kycOccupation: string;
  kycClaimed: boolean;
  paydayClaimed: boolean;
}

export interface LimitlessGameState {
  hasSelectedCharacter: boolean;
  language: SupportedLanguage;
  gender: CharacterGender;
  playerName: string;
  xp: number;
  streak: number;
  nztGems: number; // 💎 NZT — Редкие Кристаллы Ясности
  xpMultiplier: number; // 1 по умолчанию, 2 при активации Нейро-Импульса
  streakShieldActive: boolean; // Крио-Щит Стрика
  vipAuraUnlocked: boolean; // Золотая VIP-Аура
  referralWelcomeClaimed: boolean; // Получен ли бонус приглашённого друга (+100 XP + 1 NZT)
  onpulCoins: number; // 💰 OnPul Coins — Капитал Сейфа и наград
  vaultLevel: number; // Уровень Нейро-Сейфа (1..10)
  vaultPendingCoins: number; // Накопленные за сутки дивиденды в Сейфе, готовые к сбору
  arenaTrophies: number; // 🏆 Кубки Лиги / Арены игрока
  rivalTrophies: number; // 🏆 Кубки Соперника Дня (Сардор)
  blitzCardsPlayedToday: number; // Сыграно карт Нейро-Блица сегодня
  proPassActive: boolean; // 👑 Активен ли статус NZT Pass (Сверхчеловек PRO)
  raffleTickets: number; // 🎟️ Билеты еженедельного призового розыгрыша
  niyatBoostRedeemed: boolean; // Получен ли Золотой Промо-Код OnPul (ONPUL-VIP-2026)
  pvpEnergy: number; // ⚡ Энергия PvP-боёв (максимум 3)
  pvpCooldownUntil: number | null; // ⏳ Таймстемп отката КД (1 час за 1 бой, 3 часа полностью)
  pvpBattlesPlayed: number; // ⚔️ Всего сыграно PvP-боёв
  pvpChestProgress: number; // 🎁 Прогресс Мега-Сундука за 10 боёв (0..10)
  unlockedSkins: string[]; // 🧥 Выбитые в PvP скины персонажа
  equippedSkin: string; // 🧥 Текущий надетый скин
  unlockedTips: string[]; // 💡 Выбитые в PvP редкие финансовые советы
  tutorialCompleted: boolean;
  tutorialRewardClaimed: boolean;
  balance: number; // Текущий баланс на картах/наличными (сум)
  daysUntilPayday: number; // Дней до следующей зарплаты
  transactions: TransactionItem[];
  goalsAndDebts: GoalOrDebtItem[];
  completedDailyTasks: number[]; // Номера выполненных дней 1..7
  profileQuests: ProfileQuestsState;
  invitedFriendsCount: number;
}

export const STORAGE_KEY = 'onpul_limitless_state_v1';

export function createInitialGameState(
  defaultName = 'Тимур',
  defaultUsername = 'timur_limitless'
): LimitlessGameState {
  return {
    hasSelectedCharacter: false,
    language: detectDefaultLanguage(),
    gender: 'male',
    playerName: defaultName,
    xp: 0,
    streak: 3,
    nztGems: 0,
    xpMultiplier: 1,
    streakShieldActive: false,
    vipAuraUnlocked: false,
    referralWelcomeClaimed: false,
    onpulCoins: 400,
    vaultLevel: 1,
    vaultPendingCoins: 250,
    arenaTrophies: 120,
    rivalTrophies: 145,
    blitzCardsPlayedToday: 0,
    proPassActive: false,
    raffleTickets: 0,
    niyatBoostRedeemed: false,
    pvpEnergy: 3,
    pvpCooldownUntil: null,
    pvpBattlesPlayed: 9,
    pvpChestProgress: 9,
    unlockedSkins: ['default'],
    equippedSkin: 'default',
    unlockedTips: [],
    tutorialCompleted: false,
    tutorialRewardClaimed: false,
    balance: 4500000,
    daysUntilPayday: 15,
    transactions: [
      {
        id: 'seed-tx-1',
        type: 'income',
        amount: 6000000,
        category: 'salary',
        categoryLabel: 'Зарплата',
        categoryIcon: '💼',
        createdAt: 'Вчера, 10:00',
        xpEarned: 15,
      },
      {
        id: 'seed-tx-2',
        type: 'expense',
        amount: 85000,
        category: 'food',
        categoryLabel: 'Еда и кафе',
        categoryIcon: '🍔',
        createdAt: 'Сегодня, 13:20',
        xpEarned: 10,
      },
    ],
    goalsAndDebts: [
      {
        id: 'seed-debt-1',
        kind: 'debt',
        category: 'debt',
        title: 'Интернет и Коммуналка (ЖКХ)',
        amount: 450000,
        dueDateOrTarget: 'До 10 числа',
        completed: false,
      },
      {
        id: 'seed-goal-1',
        kind: 'goal',
        category: 'cushion',
        title: 'Подушка безопасности (Резерв)',
        amount: 5000000,
        dueDateOrTarget: 'Цель: 3 месяца',
        completed: false,
      },
    ],
    completedDailyTasks: [],
    profileQuests: {
      username: defaultUsername
        ? `@${defaultUsername.replace(/^@/, '')}`
        : '@timur_limitless',
      usernameClaimed: false,
      email: 'player@onpul.uz',
      emailClaimed: false,
      kycFullName: 'Тимур Каримов',
      kycCity: 'Ташкент',
      kycOccupation: 'IT / Предприниматель',
      kycClaimed: false,
      paydayClaimed: false,
    },
    invitedFriendsCount: 0,
  };
}

export function calculateSafePaydayMetrics(state: LimitlessGameState) {
  const mandatoryDebtsTotal = state.goalsAndDebts
    .filter((item) => item.kind === 'debt' && !item.completed)
    .reduce((sum, item) => sum + item.amount, 0);

  const freeBalance = Math.max(0, state.balance - mandatoryDebtsTotal);
  const safeDays = Math.max(1, state.daysUntilPayday);
  const safeDailyLimit = Math.round(freeBalance / safeDays);

  return {
    balance: state.balance,
    mandatoryDebtsTotal,
    freeBalance,
    daysUntilPayday: safeDays,
    safeDailyLimit,
  };
}

export function formatUzs(amount: number): string {
  return Math.round(amount).toLocaleString('ru-RU');
}
