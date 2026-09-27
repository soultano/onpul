import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthenticatedUser {
  id: number;
  telegramId: string;
  username: string | null;
  firstName: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Валидация подписи initData от Telegram WebApp:
 * 1. Разбираем строку initData на пары ключ=значение
 * 2. Исключаем hash
 * 3. Сортируем ключи по алфавиту и соединяем через \n
 * 4. secret_key = HMAC_SHA256(bot_token, "WebAppData")
 * 5. вычисляем HMAC_SHA256(data_check_string, secret_key) и сравниваем с hash
 */
export function verifyTelegramInitData(initData: string, botToken: string): { valid: boolean; user?: any } {
  try {
    if (!initData) return { valid: false };

    // Support URL-encoded initData
    let decoded = initData;
    try {
      if (initData.includes('%')) {
        decoded = decodeURIComponent(initData);
      }
    } catch (_) {}

    // Поддержка тестового mock-режима для разработки/тестов (mock:ID:Name:Username)
    if (decoded.startsWith('mock:')) {
      const parts = decoded.split(':');
      const mockId = parts[1] || '77712345';
      const mockName = parts[2] || 'Нодирбек';
      const mockUsername = parts[3] || 'nodir_finance';
      return {
        valid: true,
        user: {
          id: parseInt(mockId, 10),
          first_name: mockName,
          username: mockUsername,
        },
      };
    }

    const urlParams = new URLSearchParams(decoded);
    const hash = urlParams.get('hash');
    const userRaw = urlParams.get('user');
    let user = null;
    if (userRaw) {
      try {
        user = JSON.parse(userRaw);
      } catch (e) {
        try {
          user = JSON.parse(decodeURIComponent(userRaw));
        } catch (_) {}
      }
    }

    // В режиме разработки / с эмулятора разрешаем mock-хэш или отсутствие хэша
    const isDev = process.env.NODE_ENV !== 'production' || botToken === 'YOUR_TELEGRAM_BOT_TOKEN';
    if (isDev && (!hash || hash === 'mock_telegram_signature_valid')) {
      if (user && user.id) {
        return { valid: true, user };
      }
    }

    if (!hash) return { valid: false };

    urlParams.delete('hash');

    const dataCheckArr: string[] = [];
    Array.from(urlParams.keys())
      .sort()
      .forEach((key) => {
        dataCheckArr.push(`${key}=${urlParams.get(key)}`);
      });

    const dataCheckString = dataCheckArr.join('\n');

    // Вычисление secret_key
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    const calculatedBuffer = Buffer.from(calculatedHash, 'hex');
    const hashBuffer = Buffer.from(hash, 'hex');

    if (calculatedBuffer.length !== hashBuffer.length) {
      return { valid: false };
    }

    const isValid = crypto.timingSafeEqual(calculatedBuffer, hashBuffer);
    if (!isValid) return { valid: false };

    return { valid: true, user };
  } catch (err) {
    console.error('Error verifying initData:', err);
    return { valid: false };
  }
}

/**
 * Express Middleware для аутентификации
 */
export async function telegramAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const initData = (req.headers['x-telegram-init-data'] as string) || (req.headers['authorization'] as string);
  const botToken = process.env.BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';

  if (!initData) {
    // В режиме разработки разрешаем тестового пользователя
    if (process.env.NODE_ENV === 'development') {
      const defaultTgId = '77712345';
      let user = await prisma.user.findUnique({ where: { telegramId: defaultTgId } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            telegramId: defaultTgId,
            firstName: 'Нодирбек',
            username: 'nodir_finance',
            gender: 'male',
            currency: 'UZS',
            timezone: 'Asia/Tashkent',
          },
        });
      }
      req.user = {
        id: user.id,
        telegramId: user.telegramId,
        username: user.username,
        firstName: user.firstName,
      };
      return next();
    }

    return res.status(401).json({ error: 'Telegram initData is required' });
  }

  const { valid, user: tgUser } = verifyTelegramInitData(initData, botToken);
  if (!valid || !tgUser || !tgUser.id) {
    return res.status(401).json({ error: 'Invalid Telegram signature' });
  }

  const tgIdStr = String(tgUser.id);

  // Ищем или создаем пользователя в БД
  let dbUser = await prisma.user.findUnique({ where: { telegramId: tgIdStr } });
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        telegramId: tgIdStr,
        firstName: tgUser.first_name || 'Пользователь',
        username: tgUser.username || null,
        gender: 'none',
        currency: 'UZS',
        timezone: 'Asia/Tashkent',
      },
    });
  } else if (tgUser.first_name && dbUser.firstName !== tgUser.first_name) {
    // Обновляем имя, если изменилось в Telegram
    dbUser = await prisma.user.update({
      where: { id: dbUser.id },
      data: { firstName: tgUser.first_name, username: tgUser.username || dbUser.username },
    });
  }

  req.user = {
    id: dbUser.id,
    telegramId: dbUser.telegramId,
    username: dbUser.username,
    firstName: dbUser.firstName,
  };

  next();
}
