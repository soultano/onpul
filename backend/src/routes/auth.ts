import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { verifyTelegramInitData } from '../middleware/telegramAuth.js';
import { calculateLevelAndProgress } from '../config/xp.js';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /auth
 * Вход и валидация через Telegram initData
 */
router.post('/auth', async (req, res) => {
  try {
    const { initData } = req.body;
    const botToken = process.env.BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';

    if (!initData) {
      return res.status(400).json({ error: 'initData is required' });
    }

    const { valid, user: tgUser } = verifyTelegramInitData(initData, botToken);
    if (!valid || !tgUser || !tgUser.id) {
      return res.status(401).json({ error: 'Invalid Telegram signature' });
    }

    const tgIdStr = String(tgUser.id);

    let user = await prisma.user.findUnique({
      where: { telegramId: tgIdStr },
    });

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await prisma.user.create({
        data: {
          telegramId: tgIdStr,
          firstName: tgUser.first_name || 'Пользователь',
          username: tgUser.username || null,
          gender: 'none',
          currency: 'UZS',
          timezone: 'Asia/Tashkent',
        },
      });
    }

    const levelInfo = calculateLevelAndProgress(user.xp);

    res.json({
      user,
      levelInfo,
      isNewUser,
    });
  } catch (error: any) {
    console.error('Auth error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
