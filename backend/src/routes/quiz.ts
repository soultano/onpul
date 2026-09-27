import { Router } from 'express';
import { QuizService } from '../services/quizService.js';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /quiz/today
 * Получение сегодняшнего квиза дня (без правильных ответов для непройденного!)
 */
router.get('/quiz/today', async (req, res) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

    const quizData = await QuizService.getTodayQuiz(userId, user.timezone);
    res.json(quizData);
  } catch (error: any) {
    console.error('Get /quiz/today error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

/**
 * POST /quiz/today/answer
 * Проверка одного вопроса: возвращает правильность и пояснение
 */
router.post('/quiz/today/answer', async (req, res) => {
  try {
    const { quizId, questionId, selectedIndex } = req.body;

    if (quizId === undefined || questionId === undefined || selectedIndex === undefined) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const result = await QuizService.checkSingleQuestionAnswer(
      parseInt(quizId, 10),
      parseInt(questionId, 10),
      parseInt(selectedIndex, 10)
    );

    res.json(result);
  } catch (error: any) {
    console.error('Post /quiz/today/answer error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

/**
 * POST /quiz/today/finish
 * Завершение квиза: подсчет очков, обновление стрика, начисление XP
 */
router.post('/quiz/today/finish', async (req, res) => {
  try {
    const userId = req.user!.id;
    const { quizId, answers } = req.body;

    if (quizId === undefined || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'quizId and answers array required' });
    }

    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

    const result = await QuizService.finishQuiz(
      userId,
      parseInt(quizId, 10),
      answers.map((a: any) => parseInt(a, 10)),
      user.timezone
    );

    res.json(result);
  } catch (error: any) {
    console.error('Post /quiz/today/finish error:', error);
    res.status(400).json({ error: error.message || 'Could not finish quiz' });
  }
});

export default router;
