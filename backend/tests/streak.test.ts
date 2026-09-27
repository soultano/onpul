import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { StreakService } from '../src/services/streakService.js';

const prisma = new PrismaClient();

describe('Логика винстрика и часового пояса', () => {
  let testUserId: number;

  beforeEach(async () => {
    // Создаем тестового пользователя
    const user = await prisma.user.create({
      data: {
        telegramId: 'streak_test_' + Date.now() + '_' + Math.random(),
        firstName: 'Стрик Тест',
        timezone: 'Asia/Tashkent',
      },
    });
    testUserId = user.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { telegramId: { startsWith: 'streak_test_' } },
    });
    await prisma.$disconnect();
  });

  it('должна корректно форматировать дату YYYY-MM-DD для таймзоны Asia/Tashkent', () => {
    const today = StreakService.getTodayString('Asia/Tashkent');
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const yesterday = StreakService.getYesterdayString('Asia/Tashkent');
    expect(yesterday).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(today).not.toBe(yesterday);
  });

  it('при первом прохождении 3/3 стрик должен становиться равен 1', async () => {
    const res = await StreakService.updateStreak(testUserId, 3, 'Asia/Tashkent');
    expect(res.currentStreak).toBe(1);
    expect(res.bestStreak).toBe(1);
    expect(res.streakBonusXp).toBe(10);
  });

  it('при результате ниже 3/3 стрик должен сбрасываться в 0', async () => {
    // Устанавливаем пользователю стрик 5
    await prisma.user.update({
      where: { id: testUserId },
      data: { currentStreak: 5, bestStreak: 5, lastQuizDate: StreakService.getYesterdayString('Asia/Tashkent') },
    });

    const res = await StreakService.updateStreak(testUserId, 2, 'Asia/Tashkent');
    expect(res.currentStreak).toBe(0);
    expect(res.bestStreak).toBe(5); // рекорд сохраняется!
    expect(res.streakBonusXp).toBe(0);
  });

  it('при последовательных днях (вчера и сегодня) стрик должен увеличиваться на +1', async () => {
    const yesterday = StreakService.getYesterdayString('Asia/Tashkent');
    await prisma.user.update({
      where: { id: testUserId },
      data: { currentStreak: 3, bestStreak: 3, lastQuizDate: yesterday },
    });

    const res = await StreakService.updateStreak(testUserId, 3, 'Asia/Tashkent');
    expect(res.currentStreak).toBe(4);
    expect(res.bestStreak).toBe(4);
    expect(res.isConsecutive).toBe(true);
    expect(res.streakBonusXp).toBe(40);
  });

  it('при пропуске хотя бы одного дня стрик должен сбрасываться и начинаться заново с 1', async () => {
    // Дата 5 дней назад
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    const oldDateStr = fiveDaysAgo.toISOString().split('T')[0];

    await prisma.user.update({
      where: { id: testUserId },
      data: { currentStreak: 12, bestStreak: 12, lastQuizDate: oldDateStr },
    });

    const res = await StreakService.updateStreak(testUserId, 3, 'Asia/Tashkent');
    expect(res.currentStreak).toBe(1); // сброс до 1
    expect(res.bestStreak).toBe(12); // рекорд сохранился
    expect(res.streakBonusXp).toBe(10);
  });
});
