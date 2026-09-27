import { PrismaClient } from '@prisma/client';
import { calculateLevelAndProgress, MAX_LEVEL } from '../config/xp.js';

const prisma = new PrismaClient();

export interface XpAwardResult {
  xpGained: number;
  totalXp: number;
  level: number;
  levelUp: boolean;
  title: string;
}

export class XpService {
  /**
   * Начисление XP за действие.
   * Если eventKey уже существует для данного пользователя, XP НЕ начисляется повторно (защита от накрутки).
   * Если eventKey === null, начисление безусловное (например, за ежедневный квиз, где уникальность гарантируется попыткой квиза).
   */
  static async awardXp(userId: number, amount: number, eventKey: string | null = null): Promise<XpAwardResult> {
    if (amount <= 0) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const currentLevelInfo = calculateLevelAndProgress(user?.xp || 0);
      return {
        xpGained: 0,
        totalXp: user?.xp || 0,
        level: currentLevelInfo.level,
        levelUp: false,
        title: currentLevelInfo.title,
      };
    }

    return await prisma.$transaction(async (tx) => {
      // 1. Проверяем однократность по ключу, если ключ передан
      if (eventKey) {
        const existingEvent = await tx.xpEvent.findUnique({
          where: {
            userId_key: {
              userId,
              key: eventKey,
            },
          },
        });

        if (existingEvent) {
          // Уже было начислено ранее! Возвращаем 0 начисленных XP
          const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
          const currentLevelInfo = calculateLevelAndProgress(user.xp);
          return {
            xpGained: 0,
            totalXp: user.xp,
            level: currentLevelInfo.level,
            levelUp: false,
            title: currentLevelInfo.title,
          };
        }

        // Фиксируем событие начисления
        await tx.xpEvent.create({
          data: {
            userId,
            key: eventKey,
            amount,
          },
        });
      }

      // 2. Получаем пользователя и текущий уровень
      const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
      const oldXp = user.xp;
      const oldLevelInfo = calculateLevelAndProgress(oldXp);

      const newTotalXp = oldXp + amount;
      const newLevelInfo = calculateLevelAndProgress(newTotalXp);
      const levelUp = newLevelInfo.level > oldLevelInfo.level;

      // 3. Обновляем пользователя
      await tx.user.update({
        where: { id: userId },
        data: {
          xp: newTotalXp,
          level: newLevelInfo.level,
        },
      });

      // 4. Проверяем ачивки за уровни
      if (newLevelInfo.level >= 10) await this.unlockAchievement(tx, userId, 'level_10');
      if (newLevelInfo.level >= 25) await this.unlockAchievement(tx, userId, 'level_25');
      if (newLevelInfo.level >= 50) await this.unlockAchievement(tx, userId, 'level_50');
      if (newLevelInfo.level >= 80) await this.unlockAchievement(tx, userId, 'level_80');

      return {
        xpGained: amount,
        totalXp: newTotalXp,
        level: newLevelInfo.level,
        levelUp,
        title: newLevelInfo.title,
      };
    });
  }

  private static async unlockAchievement(tx: any, userId: number, code: string) {
    try {
      await tx.achievement.upsert({
        where: { userId_code: { userId, code } },
        update: {},
        create: { userId, code },
      });
    } catch (e) {
      // Игнорируем дубликаты
    }
  }
}
