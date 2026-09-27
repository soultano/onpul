import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { XpService } from '../src/services/xpService.js';
import { FinanceService } from '../src/services/financeService.js';
import { DATA_XP_REWARDS } from '../src/config/xp.js';

const prisma = new PrismaClient();

describe('Одноразовость начисления XP за поля и защита от накруток', () => {
  let testUserId: number;

  beforeEach(async () => {
    const user = await prisma.user.create({
      data: {
        telegramId: 'xp_test_' + Date.now() + '_' + Math.random(),
        firstName: 'Тест XP',
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { telegramId: { startsWith: 'xp_test_' } },
    });
    await prisma.$disconnect();
  });

  it('при первом заполнении зарплаты должно начислиться ровно 50 XP', async () => {
    const result = await FinanceService.addFinanceItem(testUserId, {
      category: 'income',
      subtype: 'salary',
      title: 'Основная зарплата',
      amount: 15000000,
    });

    expect(result.xpResult.xpGained).toBe(DATA_XP_REWARDS.SALARY);
    expect(result.xpResult.totalXp).toBe(50);
  });

  it('при повторном изменении зарплаты XP начисляться НЕ должен (0 XP)', async () => {
    // Первое добавление
    await FinanceService.addFinanceItem(testUserId, {
      category: 'income',
      subtype: 'salary',
      title: 'Зарплата 1',
      amount: 10000000,
    });

    // Изменение суммы зарплаты на другое значение
    const secondResult = await FinanceService.addFinanceItem(testUserId, {
      category: 'income',
      subtype: 'salary',
      title: 'Зарплата обновленная',
      amount: 25000000,
    });

    expect(secondResult.xpResult.xpGained).toBe(0);
    expect(secondResult.xpResult.totalXp).toBe(50); // сумма XP не изменилась!
  });

  it('при удалении и повторном добавлении статьи XP повторно НЕ начисляется', async () => {
    const add1 = await FinanceService.addFinanceItem(testUserId, {
      category: 'fixed_expense',
      subtype: 'internet',
      title: 'Интернет Wi-Fi',
      amount: 200000,
    });

    expect(add1.xpResult.xpGained).toBe(DATA_XP_REWARDS.FIXED_EXPENSE_ITEM);
    expect(add1.xpResult.totalXp).toBe(20);

    // Удаляем статью
    await FinanceService.deleteFinanceItem(testUserId, add1.item.id);

    // Добавляем снова
    const add2 = await FinanceService.addFinanceItem(testUserId, {
      category: 'fixed_expense',
      subtype: 'internet',
      title: 'Интернет Wi-Fi снова',
      amount: 250000,
    });

    expect(add2.xpResult.xpGained).toBe(0); // 0 XP за повторное добавление
    expect(add2.xpResult.totalXp).toBe(20);
  });

  it('размер суммы зарплаты или долга никак не влияет на начисление XP', async () => {
    const userA = await prisma.user.create({
      data: { telegramId: 'xp_test_a_' + Date.now(), firstName: 'А' },
    });
    const userB = await prisma.user.create({
      data: { telegramId: 'xp_test_b_' + Date.now(), firstName: 'Б' },
    });

    // User A вводит зарплату 1,000,000 UZS
    const resA = await FinanceService.addFinanceItem(userA.id, {
      category: 'income',
      subtype: 'salary',
      title: 'Зарплата',
      amount: 1000000,
    });

    // User B вводит зарплату 100,000,000 UZS
    const resB = await FinanceService.addFinanceItem(userB.id, {
      category: 'income',
      subtype: 'salary',
      title: 'Зарплата',
      amount: 100000000,
    });

    expect(resA.xpResult.xpGained).toBe(50);
    expect(resB.xpResult.xpGained).toBe(50);
    expect(resA.xpResult.totalXp).toBe(resB.xpResult.totalXp);
  });
});
