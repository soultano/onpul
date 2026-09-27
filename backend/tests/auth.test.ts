import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { verifyTelegramInitData } from '../src/middleware/telegramAuth.js';

describe('Валидация подписи Telegram initData (HMAC-SHA256)', () => {
  const mockBotToken = '1234567890:ABCdefGHIjklMNOpqrsTUVwxyz_TEST_TOKEN';

  // Вспомогательная функция генерации валидного initData
  function createValidInitData(userData: any, botToken: string): string {
    const userStr = JSON.stringify(userData);
    const authDate = Math.floor(Date.now() / 1000).toString();

    const params: Record<string, string> = {
      auth_date: authDate,
      query_id: 'AAHdF6IQAAAAAN0XohDhrP1B',
      user: userStr,
    };

    const dataCheckArr: string[] = [];
    Object.keys(params)
      .sort()
      .forEach((key) => {
        dataCheckArr.push(`${key}=${params[key]}`);
      });
    const dataCheckString = dataCheckArr.join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const hash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    const urlParams = new URLSearchParams(params);
    urlParams.set('hash', hash);

    return urlParams.toString();
  }

  it('должна успешно валидировать подлинный Telegram initData', () => {
    const user = { id: 77712345, first_name: 'Нодирбек', username: 'nodir_invest' };
    const initData = createValidInitData(user, mockBotToken);

    const result = verifyTelegramInitData(initData, mockBotToken);
    expect(result.valid).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user.id).toBe(77712345);
    expect(result.user.first_name).toBe('Нодирбек');
  });

  it('должна отклонять поддельный или искаженный initData (измененные данные)', () => {
    const user = { id: 77712345, first_name: 'Нодирбек' };
    const initData = createValidInitData(user, mockBotToken);

    // Подделываем параметр user
    const tampered = initData.replace('77712345', '99999999');

    const result = verifyTelegramInitData(tampered, mockBotToken);
    expect(result.valid).toBe(false);
  });

  it('должна отклонять initData, подписанный другим токеном бота', () => {
    const user = { id: 77712345, first_name: 'Нодирбек' };
    const initData = createValidInitData(user, 'ANOTHER_BOT_TOKEN_999999');

    const result = verifyTelegramInitData(initData, mockBotToken);
    expect(result.valid).toBe(false);
  });

  it('должна поддерживать тестовый mock: режим в dev-среде', () => {
    const mockString = 'mock:888123:Алиса:alice_tg';
    const result = verifyTelegramInitData(mockString, mockBotToken);
    expect(result.valid).toBe(true);
    expect(result.user.id).toBe(888123);
    expect(result.user.first_name).toBe('Алиса');
  });
});
