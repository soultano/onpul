import { PrismaClient } from '@prisma/client';
import { XpService, XpAwardResult } from './xpService.js';
import { DATA_XP_REWARDS, MAX_ADDITIONAL_DEPOSITS_FOR_XP, MAX_ADDITIONAL_LOANS_FOR_XP } from '../config/xp.js';

const prisma = new PrismaClient();

export interface AddFinanceItemDto {
  category: 'income' | 'fixed_expense' | 'daily_expense' | 'deposit' | 'loan';
  subtype: string;
  title: string;
  amount: number;
  rate?: number;
  term?: number;
  monthlyPayment?: number;
  extra?: any;
}

export class FinanceService {
  /**
   * Получение всех финансовых элементов пользователя и финансовой сводки
   */
  static async getUserFinances(userId: number) {
    const items = await prisma.financeItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const xpEvents = await prisma.xpEvent.findMany({ where: { userId } });
    const claimedKeys = new Set(xpEvents.map((e) => e.key));

    // Расчет финансовой сводки
    let totalMonthlyIncome = 0;
    let totalMonthlyFixedExpenses = 0;
    let totalDailyExpensesMonthly = 0;
    let totalSavings = 0;
    let totalLoansMonthlyPayment = 0;
    let totalLoanBalance = 0;

    const expenseBreakdown: Record<string, number> = {};

    for (const item of items) {
      if (item.category === 'income') {
        if (item.subtype === 'salary' || item.subtype === 'additional') {
          totalMonthlyIncome += item.amount;
        }
      } else if (item.category === 'fixed_expense') {
        totalMonthlyFixedExpenses += item.amount;
        expenseBreakdown[item.title || item.subtype] = (expenseBreakdown[item.title || item.subtype] || 0) + item.amount;
      } else if (item.category === 'daily_expense') {
        // Ежедневные расходы переводим в месячные (* 30)
        const monthly = item.amount * 30;
        totalDailyExpensesMonthly += monthly;
        expenseBreakdown[item.title || item.subtype] = (expenseBreakdown[item.title || item.subtype] || 0) + monthly;
      } else if (item.category === 'deposit') {
        if (item.subtype !== 'none_deposit') {
          totalSavings += item.amount;
        }
      } else if (item.category === 'loan') {
        if (item.subtype !== 'none_loan') {
          totalLoanBalance += item.amount;
          totalLoansMonthlyPayment += item.monthlyPayment || 0;
        }
      }
    }

    const totalMonthlyExpenses = totalMonthlyFixedExpenses + totalDailyExpensesMonthly + totalLoansMonthlyPayment;
    const netCashflow = totalMonthlyIncome - totalMonthlyExpenses;

    const savingsRatePercent = totalMonthlyIncome > 0 ? Math.round((Math.max(0, netCashflow) / totalMonthlyIncome) * 100) : 0;
    const debtToIncomePercent = totalMonthlyIncome > 0 ? Math.round((totalLoansMonthlyPayment / totalMonthlyIncome) * 100) : 0;

    // Подсчет заполненности секций
    const hasSalary = items.some((i) => i.category === 'income' && i.subtype === 'salary');
    const hasAdditionalIncome = items.some((i) => i.category === 'income' && i.subtype === 'additional');
    const fixedExpenseCount = items.filter((i) => i.category === 'fixed_expense').length;
    const dailyExpenseCount = items.filter((i) => i.category === 'daily_expense').length;
    const hasDepositInfo = items.some((i) => i.category === 'deposit');
    const hasLoanInfo = items.some((i) => i.category === 'loan');

    const profileFullyFilled =
      hasSalary &&
      hasAdditionalIncome &&
      fixedExpenseCount >= 3 &&
      dailyExpenseCount >= 2 &&
      hasDepositInfo &&
      hasLoanInfo &&
      Boolean(user.age && user.city && user.occupation);

    return {
      items,
      claimedKeys: Array.from(claimedKeys),
      summary: {
        totalMonthlyIncome,
        totalMonthlyFixedExpenses,
        totalDailyExpensesMonthly,
        totalMonthlyExpenses,
        netCashflow,
        totalSavings,
        totalLoanBalance,
        totalLoansMonthlyPayment,
        savingsRatePercent,
        debtToIncomePercent,
        expenseBreakdown,
        profileFullyFilled,
      },
    };
  }

  /**
   * Добавление финансовой записи с начислением XP
   */
  static async addFinanceItem(userId: number, dto: AddFinanceItemDto) {
    let eventKey: string | null = null;
    let xpToAward = 0;

    // 1. Определение ключа события и суммы XP
    if (dto.category === 'income') {
      if (dto.subtype === 'salary') {
        eventKey = 'field:income.salary';
        xpToAward = DATA_XP_REWARDS.SALARY; // 50 XP
      } else if (dto.subtype === 'additional') {
        eventKey = 'field:income.additional';
        xpToAward = DATA_XP_REWARDS.ADDITIONAL_INCOME; // 20 XP
      }
    } else if (dto.category === 'fixed_expense') {
      eventKey = `field:fixed_expense.${dto.subtype}`;
      xpToAward = DATA_XP_REWARDS.FIXED_EXPENSE_ITEM; // 20 XP
    } else if (dto.category === 'daily_expense') {
      eventKey = `field:daily_expense.${dto.subtype}`;
      xpToAward = DATA_XP_REWARDS.DAILY_EXPENSE_ITEM; // 20 XP
    } else if (dto.category === 'deposit') {
      const existingDeposits = await prisma.financeItem.findMany({
        where: { userId, category: 'deposit' },
      });

      if (existingDeposits.length === 0) {
        eventKey = 'field:deposit.first';
        xpToAward = DATA_XP_REWARDS.FIRST_DEPOSIT_OR_NONE; // 50 XP
      } else if (existingDeposits.length <= MAX_ADDITIONAL_DEPOSITS_FOR_XP) {
        eventKey = `field:deposit.extra.${existingDeposits.length}`;
        xpToAward = DATA_XP_REWARDS.ADDITIONAL_DEPOSIT; // 20 XP
      }
    } else if (dto.category === 'loan') {
      const existingLoans = await prisma.financeItem.findMany({
        where: { userId, category: 'loan' },
      });

      if (existingLoans.length === 0) {
        eventKey = 'field:loan.first';
        xpToAward = DATA_XP_REWARDS.FIRST_LOAN_OR_NONE; // 50 XP
      } else if (existingLoans.length <= MAX_ADDITIONAL_LOANS_FOR_XP) {
        eventKey = `field:loan.extra.${existingLoans.length}`;
        xpToAward = DATA_XP_REWARDS.ADDITIONAL_LOAN; // 20 XP
      }
    }

    // 2. Создаем или обновляем запись
    // Если это salary, additional, none_deposit, none_loan — обновляем существующую
    let item;
    if (
      dto.subtype === 'salary' ||
      dto.subtype === 'additional' ||
      dto.subtype === 'none_deposit' ||
      dto.subtype === 'none_loan'
    ) {
      const existing = await prisma.financeItem.findFirst({
        where: { userId, category: dto.category, subtype: dto.subtype },
      });

      if (existing) {
        item = await prisma.financeItem.update({
          where: { id: existing.id },
          data: {
            title: dto.title,
            amount: dto.amount,
            rate: dto.rate,
            term: dto.term,
            monthlyPayment: dto.monthlyPayment,
            extra: dto.extra ? JSON.stringify(dto.extra) : null,
          },
        });
      } else {
        item = await prisma.financeItem.create({
          data: {
            userId,
            category: dto.category,
            subtype: dto.subtype,
            title: dto.title,
            amount: dto.amount,
            rate: dto.rate,
            term: dto.term,
            monthlyPayment: dto.monthlyPayment,
            extra: dto.extra ? JSON.stringify(dto.extra) : null,
          },
        });
      }
    } else {
      item = await prisma.financeItem.create({
        data: {
          userId,
          category: dto.category,
          subtype: dto.subtype,
          title: dto.title,
          amount: dto.amount,
          rate: dto.rate,
          term: dto.term,
          monthlyPayment: dto.monthlyPayment,
          extra: dto.extra ? JSON.stringify(dto.extra) : null,
        },
      });
    }

    // 3. Начисляем XP (если ключ новый)
    let xpResult: XpAwardResult = {
      xpGained: 0,
      totalXp: 0,
      level: 1,
      levelUp: false,
      title: 'Новичок',
    };

    if (eventKey && xpToAward > 0) {
      xpResult = await XpService.awardXp(userId, xpToAward, eventKey);
    } else {
      const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
      const currentLevelInfo = await XpService.awardXp(userId, 0, null);
      xpResult = currentLevelInfo;
    }

    // 4. Проверяем 100% заполненность профиля для начисления бонуса 150 XP
    await this.checkAndAwardProfile100Bonus(userId);

    return {
      item,
      xpResult,
    };
  }

  /**
   * Удаление финансового элемента.
   * Удаление и повторное добавление XP не дает, так как ключ остается в xp_events!
   */
  static async deleteFinanceItem(userId: number, itemId: number) {
    const item = await prisma.financeItem.findUnique({
      where: { id: itemId },
    });

    if (!item || item.userId !== userId) {
      throw new Error('Элемент не найден или доступ запрещен');
    }

    await prisma.financeItem.delete({
      where: { id: itemId },
    });

    return { success: true };
  }

  /**
   * Проверка и начисление бонуса 150 XP за 100% заполненный профиль
   */
  static async checkAndAwardProfile100Bonus(userId: number) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const items = await prisma.financeItem.findMany({ where: { userId } });

    const hasSalary = items.some((i) => i.category === 'income' && i.subtype === 'salary');
    const hasFixed = items.some((i) => i.category === 'fixed_expense');
    const hasDaily = items.some((i) => i.category === 'daily_expense');
    const hasDeposit = items.some((i) => i.category === 'deposit');
    const hasLoan = items.some((i) => i.category === 'loan');
    const hasPersonalData = Boolean(user.age && user.city && user.occupation);

    if (hasSalary && hasFixed && hasDaily && hasDeposit && hasLoan && hasPersonalData) {
      await XpService.awardXp(userId, DATA_XP_REWARDS.PROFILE_100_BONUS, 'bonus:profile_100');
      try {
        await prisma.achievement.upsert({
          where: { userId_code: { userId, code: 'profile_100' } },
          update: {},
          create: { userId, code: 'profile_100' },
        });
      } catch (e) {}
    }
  }
}
