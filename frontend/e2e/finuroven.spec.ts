import { test, expect } from '@playwright/test';

test.describe('Telegram Mini App «ФинУровень» — E2E тестирование (Mobile 390x844)', () => {
  test('1. Загрузка Mini App в мобильном разрешении (390x844), прохождение онбординга и отображение главного дашборда (уровень, XP, финансовое зеркало, квиз)', async ({
    page,
  }) => {
    // Проверяем мобильное разрешение 390x844
    const viewport = page.viewportSize();
    expect(viewport).toEqual({ width: 390, height: 844 });

    // Эмулируем бэкенд-состояние игрока для детерминированного прохождения полного пути от онбординга до дашборда
    let currentUser: any = {
      id: 1,
      telegramId: '77712345',
      firstName: 'Нодирбек',
      username: 'nodir_finance',
      gender: 'none',
      age: null,
      city: null,
      occupation: null,
      currency: 'UZS',
      xp: 0,
      level: 1,
      currentStreak: 1,
    };

    let currentLevelInfo: any = {
      level: 1,
      title: 'Финансовый искатель',
      minXp: 0,
      maxXp: 65,
      xpToNext: 65,
      avatarStage: 1,
    };

    const financeItems: any[] = [];

    await page.route('**/api/**', async (route) => {
      const req = route.request();
      const url = new URL(req.url());
      const path = url.pathname;
      const method = req.method();

      if (path === '/api/auth' && method === 'POST') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: currentUser,
            levelInfo: currentLevelInfo,
            isNewUser: currentUser.gender === 'none',
          }),
        });
      }

      if (path === '/api/me' && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: currentUser,
            levelInfo: currentLevelInfo,
            stats: { totalQuizzes: 1, achievementsUnlocked: 1 },
          }),
        });
      }

      if (path === '/api/me' && method === 'PATCH') {
        const body = req.postDataJSON();
        currentUser = {
          ...currentUser,
          ...body,
          xp: 65,
          level: 2,
        };
        currentLevelInfo = {
          level: 2,
          title: 'Хранитель бюджета',
          minXp: 65,
          maxXp: 150,
          xpToNext: 85,
          avatarStage: 1,
        };
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: currentUser,
            levelInfo: currentLevelInfo,
            xpGained: 65,
            levelUp: true,
          }),
        });
      }

      if (path === '/api/quiz/today' && method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 101,
            newsTitle: 'ЦБ Узбекистана сохранил основную ставку: как защитить сбережения',
            newsText: 'Разбираем влияние инфляции и ставок по сумовым вкладам на личный бюджет.',
            completed: false,
            secondsUntilNext: 14400,
            questions: [
              {
                id: 1,
                question: 'Что помогает защитить сбережения от инфляции?',
                options: ['Хранение под подушкой', 'Банковский вклад выше инфляции', 'Импульсивные траты'],
              },
            ],
          }),
        });
      }

      if (path === '/api/finance' && method === 'GET') {
        const salary = financeItems
          .filter((i) => i.category === 'income')
          .reduce((acc, i) => acc + i.amount, 0);
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            items: financeItems,
            claimedKeys: [],
            summary: {
              totalMonthlyIncome: salary,
              totalMonthlyFixedExpenses: 0,
              totalDailyExpensesMonthly: 0,
              totalSavings: 0,
              totalLoanBalance: 0,
              totalLoansMonthlyPayment: 0,
              totalMonthlyExpenses: 0,
              netCashflow: salary,
              debtToIncomePercent: 0,
            },
          }),
        });
      }

      if (path === '/api/finance' && method === 'POST') {
        const body = req.postDataJSON();
        const newItem = { id: Date.now(), ...body };
        financeItems.push(newItem);
        currentUser.xp += 50;
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            item: newItem,
            xpGained: 50,
            levelUp: false,
            level: currentUser.level,
            title: currentLevelInfo.title,
          }),
        });
      }

      if (path === '/api/achievements' || path === '/api/history') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ achievements: [], history: [] }),
        });
      }

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto('/');

    // Шаг 1 онбординга: Приветствие и ПРАВИЛО ЗЕРКАЛА ФИНАНСОВ
    await expect(page.getByText(/Добро пожаловать в игру/i)).toBeVisible();
    await expect(page.getByText(/«ФинУровень»/i)).toBeVisible();
    await expect(page.getByText(/ПРАВИЛО ЗЕРКАЛА ФИНАНСОВ/i)).toBeVisible();

    await page.getByRole('button', { name: /Начать путешествие/i }).click();

    // Шаг 2 онбординга: Выбор персонажа
    await expect(page.getByText('Выберите персонажа')).toBeVisible();
    await page.getByText('Парень').click();
    await page.getByRole('button', { name: /Далее \(\+20 XP\)/i }).click();

    // Шаг 3 онбординга: Ввод личных данных
    await expect(page.getByText('Личные данные')).toBeVisible();
    await page.getByPlaceholder('Ваше имя').fill('Сардор');
    await page.getByPlaceholder('Напр. 28').fill('29');
    await page.getByPlaceholder('Ташкент').fill('Ташкент');
    await page.getByRole('button', { name: /Завершить онбординг/i }).click();

    // Шаг 4 онбординга: Праздничный экран начисления XP и автоматический переход на Главный дашборд
    await expect(page.getByText('Отличное начало!')).toBeVisible();

    // Ожидаем появления Главного дашборда игрока
    await expect(page.getByText('Сардор')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Уровень 2 • Хранитель бюджета/i)).toBeVisible();
    await expect(page.getByText('65 XP', { exact: true })).toBeVisible();

    // Проверяем карточку ежедневного квиза («ЗАДАНИЕ ДНЯ»)
    await expect(page.getByText('ЗАДАНИЕ ДНЯ')).toBeVisible();
    await expect(
      page.getByText('ЦБ Узбекистана сохранил основную ставку: как защитить сбережения')
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /Пройти задание \(\+100 XP\)/i })).toBeVisible();

    // Переходим во вкладку «Мои финансы» (Финансовое зеркало)
    await page.getByRole('button', { name: /Мои финансы/i }).click();
    await expect(page.getByRole('heading', { name: 'Мои финансы' })).toBeVisible();
    await expect(page.getByText('Месячная зарплата')).toBeVisible();
    await expect(page.getByText('Постоянные расходы (в месяц)')).toBeVisible();
    await expect(page.getByText('Ежедневные расходы (в день)')).toBeVisible();
    await expect(page.getByText('Вклады и сбережения')).toBeVisible();
    await expect(page.getByText('Кредиты и рассрочки')).toBeVisible();
    await expect(page.getByText('Финансовая сводка (самоанализ)')).toBeVisible();
  });
});
