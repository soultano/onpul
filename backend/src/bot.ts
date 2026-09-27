/**
 * 🤖 ФинУровень — Telegram Bot Gateway (Node.js)
 * Управляет кнопкой Menu Button, приветствием и напоминаниями о Задании Дня.
 */

import dotenv from 'dotenv';
dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const WEBAPP_URL = process.env.WEBAPP_URL || 'http://localhost:3000';

async function tgApi(method: string, body: Record<string, any>) {
  if (!BOT_TOKEN || BOT_TOKEN === 'YOUR_TELEGRAM_BOT_TOKEN') {
    console.log(`[Bot Offline] Токен бота не установлен. Укажите BOT_TOKEN в .env`);
    return null;
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/${method}`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (e) {
    console.error(`Ошибка вызова Telegram API (${method}):`, e);
    return null;
  }
}

export async function setupBotMenuButton() {
  if (!BOT_TOKEN || BOT_TOKEN.includes('mock')) return;

  console.log(`🤖 Настройка кнопки Menu Button на URL: ${WEBAPP_URL}`);
  const result = await tgApi('setChatMenuButton', {
    menu_button: {
      type: 'web_app',
      text: '📱 ФинУровень',
      web_app: { url: WEBAPP_URL },
    },
  });

  if (result?.ok) {
    console.log('✅ Кнопка Menu Button «📱 ФинУровень» успешно установлена в Telegram!');
  } else {
    console.log('ℹ️ Ответ Telegram API:', result);
  }
}

if (process.argv[1]?.includes('bot.ts')) {
  setupBotMenuButton();
}
