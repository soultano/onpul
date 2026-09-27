import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface StreakUpdateResult {
  currentStreak: number;
  bestStreak: number;
  streakBonusXp: number;
  isConsecutive: boolean;
}

export class StreakService {
  /**
   * Получение текущей даты в формате YYYY-MM-DD для указанного часового пояса
   */
  static getTodayString(timezone: string = 'Asia/Tashkent'): string {
    try {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date());
    } catch (e) {
      return new Date().toISOString().split('T')[0];
    }
  }

  /**
   * Получение вчерашней даты в формате YYYY-MM-DD для указанного часового пояса
   */
  static getYesterdayString(timezone: string = 'Asia/Tashkent'): string {
    const now = new Date();
    now.setDate(now.getDate() - 1);
    try {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(now);
    } catch (e) {
      return now.toISOString().split('T')[0];
    }
  }

  /**
   * Расчет разницы в днях между двумя датами YYYY-MM-DD
   */
  static getDaysDifference(dateStr1: string, dateStr2: string): number {
    const d1 = new Date(dateStr1 + 'T00:00:00Z');
    const d2 = new Date(dateStr2 + 'T00:00:00Z');
    const diffMs = Math.abs(d2.getTime() - d1.getTime());
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Обновление винстрика пользователя после прохождения квиза
   */
  static async updateStreak(
    userId: number,
    correctCount: number,
    timezone: string = 'Asia/Tashkent'
  ): Promise<StreakUpdateResult> {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const today = this.getTodayString(timezone);
    const yesterday = this.getYesterdayString(timezone);

    let currentStreak = user.currentStreak;
    let bestStreak = user.bestStreak;
    let isConsecutive = false;

    if (correctCount === 3) {
      // Идеальный результат 3/3
      if (user.lastQuizDate === yesterday) {
        // Вчера тоже играл — увеличиваем стрик
        currentStreak += 1;
        isConsecutive = true;
      } else if (user.lastQuizDate === today) {
        // Уже сегодня играл (не должно происходить в норме)
        // Сохраняем текущий
      } else {
        // Пропустил день или начинает впервые
        currentStreak = 1;
      }
    } else {
      // Результат ниже 3/3 обнуляет стрик по правилам ТЗ
      currentStreak = 0;
    }

    if (currentStreak > bestStreak) {
      bestStreak = currentStreak;
    }

    // Бонус: +10 XP за каждый день текущего стрика, максимум +50 (с 5-го дня подряд)
    let streakBonusXp = 0;
    if (correctCount === 3) {
      streakBonusXp = Math.min(50, currentStreak * 10);
    }

    // Сохраняем в БД
    await prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak,
        bestStreak,
        lastQuizDate: today,
      },
    });

    // Проверяем ачивки стриков
    if (currentStreak >= 7) {
      await this.unlockAchievement(userId, 'streak_7');
    }
    if (currentStreak >= 30) {
      await this.unlockAchievement(userId, 'streak_30');
    }

    return {
      currentStreak,
      bestStreak,
      streakBonusXp,
      isConsecutive,
    };
  }

  private static async unlockAchievement(userId: number, code: string) {
    try {
      await prisma.achievement.upsert({
        where: { userId_code: { userId, code } },
        update: {},
        create: { userId, code },
      });
    } catch (e) {
      // Игнорируем дубликаты
    }
  }
}
