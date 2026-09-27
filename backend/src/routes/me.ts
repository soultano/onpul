import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { calculateLevelAndProgress, DATA_XP_REWARDS } from '../config/xp.js';
import { XpService } from '../services/xpService.js';
import { FinanceService } from '../services/financeService.js';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /me
 * Профиль текущего пользователя со всеми статами и уровнем
 */
router.get('/me', async (req, res) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        achievements: true,
      },
    });

    const levelInfo = calculateLevelAndProgress(user.xp);

    // Статистика по квизам
    const attempts = await prisma.quizAttempt.findMany({
      where: { userId },
    });

    const totalAttempts = attempts.length;
    let totalCorrectQuestions = 0;
    attempts.forEach((a) => {
      totalCorrectQuestions += a.correctCount;
    });

    const accuracyPercent = totalAttempts > 0 ? Math.round((totalCorrectQuestions / (totalAttempts * 3)) * 100) : 0;

    res.json({
      user,
      levelInfo,
      stats: {
        totalXp: user.xp,
        completedDays: totalAttempts,
        accuracyPercent,
        currentStreak: user.currentStreak,
        bestStreak: user.bestStreak,
      },
      achievements: user.achievements,
    });
  } catch (error: any) {
    console.error('Get /me error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

/**
 * PATCH /me
 * Обновление личных данных и персонажа с начислением XP
 */
router.patch('/me', async (req, res) => {
  try {
    const userId = req.user!.id;
    const { firstName, gender, age, city, occupation, currency, timezone } = req.body;

    const currentUser = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

    let totalXpGained = 0;
    let lastXpResult = null;

    // Начисление за выбор персонажа (20 XP)
    if (gender && gender !== 'none' && currentUser.gender === 'none') {
      const resAward = await XpService.awardXp(userId, DATA_XP_REWARDS.CHOOSE_CHARACTER, 'field:profile.gender');
      if (resAward.xpGained > 0) {
        totalXpGained += resAward.xpGained;
        lastXpResult = resAward;
      }
    }

    // Начисление за возраст (15 XP)
    if (age && !currentUser.age) {
      const resAward = await XpService.awardXp(userId, DATA_XP_REWARDS.PERSONAL_FIELD, 'field:profile.age');
      if (resAward.xpGained > 0) {
        totalXpGained += resAward.xpGained;
        lastXpResult = resAward;
      }
    }

    // Начисление за город (15 XP)
    if (city && !currentUser.city) {
      const resAward = await XpService.awardXp(userId, DATA_XP_REWARDS.PERSONAL_FIELD, 'field:profile.city');
      if (resAward.xpGained > 0) {
        totalXpGained += resAward.xpGained;
        lastXpResult = resAward;
      }
    }

    // Начисление за род занятий (15 XP)
    if (occupation && !currentUser.occupation) {
      const resAward = await XpService.awardXp(userId, DATA_XP_REWARDS.PERSONAL_FIELD, 'field:profile.occupation');
      if (resAward.xpGained > 0) {
        totalXpGained += resAward.xpGained;
        lastXpResult = resAward;
      }
    }

    // Обновляем данные пользователя
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(gender !== undefined && { gender }),
        ...(age !== undefined && { age: age ? parseInt(age, 10) : null }),
        ...(city !== undefined && { city }),
        ...(occupation !== undefined && { occupation }),
        ...(currency !== undefined && { currency }),
        ...(timezone !== undefined && { timezone }),
      },
    });

    // Проверяем 100% заполнение профиля
    await FinanceService.checkAndAwardProfile100Bonus(userId);

    const freshUser = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { achievements: true },
    });
    const levelInfo = calculateLevelAndProgress(freshUser.xp);

    res.json({
      user: freshUser,
      levelInfo,
      xpGained: totalXpGained,
      totalXp: freshUser.xp,
      level: levelInfo.level,
      levelUp: lastXpResult ? lastXpResult.levelUp : false,
      title: levelInfo.title,
    });
  } catch (error: any) {
    console.error('Patch /me error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

/**
 * GET /achievements
 */
router.get('/achievements', async (req, res) => {
  try {
    const userId = req.user!.id;
    const achievements = await prisma.achievement.findMany({
      where: { userId },
    });
    res.json({ achievements });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

/**
 * POST /settings/reset
 * Сброс игрового прогресса для тестирования
 */
router.post('/settings/reset', async (req, res) => {
  try {
    const userId = req.user!.id;
    await prisma.xpEvent.deleteMany({ where: { userId } });
    await prisma.financeItem.deleteMany({ where: { userId } });
    await prisma.quizAttempt.deleteMany({ where: { userId } });
    await prisma.achievement.deleteMany({ where: { userId } });
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        xp: 0,
        level: 1,
        gender: 'none',
        currentStreak: 0,
        bestStreak: 0,
        lastQuizDate: null,
        age: null,
        city: null,
        occupation: null,
      },
    });
    const levelInfo = calculateLevelAndProgress(0);
    res.json({ success: true, user, levelInfo });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
