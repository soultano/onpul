import { PrismaClient } from '@prisma/client';
import { StreakService } from './streakService.js';
import { XpService, XpAwardResult } from './xpService.js';
import { calculateQuizXp } from '../config/xp.js';

const prisma = new PrismaClient();

export interface ClientQuestion {
  id: number;
  text: string;
  options: string[];
}

export interface StoredQuestion extends ClientQuestion {
  correctIndex: number;
  explanation: string;
}

export class QuizService {
  /**
   * Определение dayIndex для текущей даты по часовому поясу
   * (по порядку от фиксированной даты старта, по кругу от 1 до 60)
   */
  static getTodayDayIndex(timezone: string = 'Asia/Tashkent'): number {
    const todayStr = StreakService.getTodayString(timezone);
    const anchorDate = new Date('2026-01-01T00:00:00Z');
    const todayDate = new Date(todayStr + 'T00:00:00Z');
    const diffDays = Math.floor((todayDate.getTime() - anchorDate.getTime()) / (1000 * 60 * 60 * 24));
    return (Math.abs(diffDays) % 60) + 1;
  }

  /**
   * Получение секунд до следующей полуночи в часовом поясе пользователя
   */
  static getSecondsUntilMidnight(timezone: string = 'Asia/Tashkent'): number {
    try {
      const now = new Date();
      // Формируем следующую полночь
      const todayStr = StreakService.getTodayString(timezone);
      const tomorrow = new Date(todayStr + 'T00:00:00Z');
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const diffMs = tomorrow.getTime() - Date.now();
      return Math.max(0, Math.floor(diffMs / 1000));
    } catch (e) {
      return 3600;
    }
  }

  /**
   * Получение задания дня для пользователя
   * ВАЖНО: клиенту правильные ответы НЕ отдаются, если квиз еще не пройден!
   */
  static async getTodayQuiz(userId: number, timezone: string = 'Asia/Tashkent') {
    const dayIndex = this.getTodayDayIndex(timezone);

    let quiz = await prisma.quiz.findUnique({
      where: { dayIndex },
    });

    if (!quiz) {
      // Фолбэк на первый квиз, если базы пусты
      quiz = await prisma.quiz.findFirst() || null;
      if (!quiz) {
        throw new Error('Квизы не найдены в базе данных. Запустите seed.');
      }
    }

    const storedQuestions: StoredQuestion[] = JSON.parse(quiz.questions);

    // Проверяем, прошел ли пользователь этот квиз сегодня
    const attempt = await prisma.quizAttempt.findUnique({
      where: {
        userId_quizId: {
          userId,
          quizId: quiz.id,
        },
      },
    });

    const secondsUntilNext = this.getSecondsUntilMidnight(timezone);

    if (attempt) {
      // Квиз уже пройден! Можно отдать с пояснениями для просмотра истории
      const userAnswers = JSON.parse(attempt.answers);
      return {
        completed: true,
        quizId: quiz.id,
        newsTitle: quiz.newsTitle,
        newsText: quiz.newsText,
        questions: storedQuestions, // со всеми пояснениями и правильными ответами
        attempt: {
          answers: userAnswers,
          correctCount: attempt.correctCount,
          xpEarned: attempt.xpEarned,
          createdAt: attempt.createdAt,
        },
        secondsUntilNext,
      };
    }

    // Квиз еще НЕ пройден: вырезаем правильные ответы и пояснения
    const sanitizedQuestions: ClientQuestion[] = storedQuestions.map((q) => ({
      id: q.id,
      text: q.text,
      options: q.options,
    }));

    return {
      completed: false,
      quizId: quiz.id,
      newsTitle: quiz.newsTitle,
      newsText: quiz.newsText,
      questions: sanitizedQuestions,
      secondsUntilNext,
    };
  }

  /**
   * Ответ на один вопрос: проверка правильности и возвращение пояснения
   */
  static async checkSingleQuestionAnswer(quizId: number, questionId: number, selectedIndex: number) {
    const quiz = await prisma.quiz.findUniqueOrThrow({ where: { id: quizId } });
    const questions: StoredQuestion[] = JSON.parse(quiz.questions);

    const question = questions.find((q) => q.id === questionId);
    if (!question) {
      throw new Error(`Вопрос с ID ${questionId} не найден`);
    }

    const isCorrect = selectedIndex === question.correctIndex;

    return {
      questionId,
      isCorrect,
      correctIndex: question.correctIndex,
      explanation: question.explanation,
    };
  }

  /**
   * Завершение квиза: подсчет очков, обновление стрика, начисление XP
   */
  static async finishQuiz(userId: number, quizId: number, answers: number[], timezone: string = 'Asia/Tashkent') {
    const quiz = await prisma.quiz.findUniqueOrThrow({ where: { id: quizId } });
    const questions: StoredQuestion[] = JSON.parse(quiz.questions);

    // Проверяем, не был ли квиз уже пройден
    const existingAttempt = await prisma.quizAttempt.findUnique({
      where: {
        userId_quizId: {
          userId,
          quizId,
        },
      },
    });

    if (existingAttempt) {
      throw new Error('Вы уже прошли сегодняшнее задание!');
    }

    // Подсчитываем правильные ответы
    let correctCount = 0;
    for (let i = 0; i < questions.length; i++) {
      if (answers[i] === questions[i].correctIndex) {
        correctCount++;
      }
    }

    // 1. Обновляем винстрик
    const streakResult = await StreakService.updateStreak(userId, correctCount, timezone);

    // 2. Считаем XP
    const xpCalc = calculateQuizXp(correctCount, streakResult.currentStreak);

    // 3. Начисляем XP пользователю
    const todayStr = StreakService.getTodayString(timezone);
    const xpAwardResult: XpAwardResult = await XpService.awardXp(
      userId,
      xpCalc.total,
      `quiz:${quizId}:${todayStr}`
    );

    // 4. Сохраняем попытку в БД
    await prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        answers: JSON.stringify(answers),
        correctCount,
        xpEarned: xpCalc.total,
      },
    });

    // 5. Ачивка "first_quiz"
    try {
      await prisma.achievement.upsert({
        where: { userId_code: { userId, code: 'first_quiz' } },
        update: {},
        create: { userId, code: 'first_quiz' },
      });
    } catch (e) {}

    return {
      correctCount,
      totalQuestions: questions.length,
      xpGained: xpAwardResult.xpGained,
      totalXp: xpAwardResult.totalXp,
      level: xpAwardResult.level,
      levelUp: xpAwardResult.levelUp,
      title: xpAwardResult.title,
      currentStreak: streakResult.currentStreak,
      bestStreak: streakResult.bestStreak,
      streakBonus: streakResult.streakBonusXp,
    };
  }
}
