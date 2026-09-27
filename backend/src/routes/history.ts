import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /history
 * История пройденных квизов
 */
router.get('/history', async (req, res) => {
  try {
    const userId = req.user!.id;

    const attempts = await prisma.quizAttempt.findMany({
      where: { userId },
      include: {
        quiz: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = attempts.map((a) => {
      const questions = JSON.parse(a.quiz.questions);
      const userAnswers = JSON.parse(a.answers);
      return {
        id: a.id,
        quizId: a.quizId,
        date: a.createdAt,
        newsTitle: a.quiz.newsTitle,
        newsText: a.quiz.newsText,
        correctCount: a.correctCount,
        totalQuestions: questions.length,
        xpEarned: a.xpEarned,
        userAnswers,
        questions,
      };
    });

    res.json({ history: formatted });
  } catch (error: any) {
    console.error('Get /history error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

/**
 * GET /achievements
 * Достижения (бейджи)
 */
router.get('/achievements', async (req, res) => {
  try {
    const userId = req.user!.id;

    const allBadges = [
      { code: 'first_quiz', title: 'Первый шаг', desc: 'Пройти первое задание дня', icon: '🎯' },
      { code: 'streak_7', title: 'Недельный стрик', desc: 'Удерживать стрик 7 дней подряд', icon: '🔥' },
      { code: 'streak_30', title: 'Железная воля', desc: 'Удерживать стрик 30 дней подряд', icon: '⚡' },
      { code: 'profile_100', title: 'Зеркало финансов', desc: 'Заполнить профиль и финансы на 100%', icon: '💎' },
      { code: 'level_10', title: 'Считающий', desc: 'Достичь 10-го уровня', icon: '🏅' },
      { code: 'level_25', title: 'Планировщик', desc: 'Достичь 25-го уровня', icon: '🏆' },
      { code: 'level_50', title: 'Стратег', desc: 'Достичь 50-го уровня', icon: '👑' },
      { code: 'level_80', title: 'Мастер финансов', desc: 'Достичь максимального 80-го уровня', icon: '🌟' },
    ];

    const unlocked = await prisma.achievement.findMany({
      where: { userId },
    });

    const unlockedMap = new Map(unlocked.map((a) => [a.code, a.unlockedAt]));

    const result = allBadges.map((b) => ({
      ...b,
      isUnlocked: unlockedMap.has(b.code),
      unlockedAt: unlockedMap.get(b.code) || null,
    }));

    res.json({ achievements: result });
  } catch (error: any) {
    console.error('Get /achievements error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

/**
 * POST /settings/reset
 * Удаление всех данных пользователя (с подтверждением)
 */
router.post('/settings/reset', async (req, res) => {
  try {
    const userId = req.user!.id;
    const { confirm } = req.body;

    if (confirm !== true) {
      return res.status(400).json({ error: 'Confirmation required to reset data' });
    }

    // Удаляем финансовые элементы, попытки квизов, xp-события, ачивки
    await prisma.$transaction([
      prisma.financeItem.deleteMany({ where: { userId } }),
      prisma.quizAttempt.deleteMany({ where: { userId } }),
      prisma.xpEvent.deleteMany({ where: { userId } }),
      prisma.achievement.deleteMany({ where: { userId } }),
      prisma.user.update({
        where: { id: userId },
        data: {
          xp: 0,
          level: 1,
          currentStreak: 0,
          bestStreak: 0,
          gender: 'none',
          age: null,
          city: null,
          occupation: null,
          lastQuizDate: null,
        },
      }),
    ]);

    res.json({ success: true, message: 'Все данные успешно сброшены' });
  } catch (error: any) {
    console.error('Post /settings/reset error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
