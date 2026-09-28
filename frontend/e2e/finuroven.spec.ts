import { test, expect, Page } from '@playwright/test';

/**
 * Хелпер: быстрое прохождение выбора персонажа и 5 шагов обучения со стрелками,
 * чтобы подготовить чистый главный экран с 25 XP (Уровень 1).
 */
async function completeOnboardingAndTutorial(
  page: Page,
  gender: 'male' | 'female' = 'male',
  name = 'Тимур'
) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await expect(page.getByTestId('character-select-screen')).toBeVisible();
  await page.getByTestId(`select-${gender}-btn`).click();
  await page.getByTestId('player-name-input').fill(name);
  await page.getByTestId('start-game-btn').click();

  await expect(page.getByTestId('tutorial-overlay')).toBeVisible();
  for (let step = 1; step <= 4; step++) {
    await expect(page.getByTestId('tutorial-step-counter')).toHaveText(
      `Шаг ${step} из 5`
    );
    await page.getByTestId('tutorial-next-btn').click();
  }
  await expect(page.getByTestId('tutorial-step-counter')).toHaveText(
    'Шаг 5 из 5'
  );
  await page.getByTestId('tutorial-finish-btn').click();
  await expect(page.getByTestId('tutorial-overlay')).toBeHidden();
}

test.describe('OnPul «ФинУровень» (Limitless Edition) — Комплексное E2E тестирование (Mobile 390x844)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/**', async (route) => {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });
  });

  test('Тест 1: Выбор персонажа (Мужской Эдди Морра / Женский Алия Морра) и Интерактивное обучение со стрелками (5 шагов)', async ({
    page,
  }) => {
    const viewport = page.viewportSize();
    expect(viewport).toEqual({ width: 390, height: 844 });

    // Очистка localStorage перед стартом
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Проверка отображения светлого экрана выбора героя
    const selectScreen = page.getByTestId('character-select-screen');
    await expect(selectScreen).toBeVisible();
    await expect(
      page.getByRole('heading', { name: /Выбери своего героя ясности/i })
    ).toBeVisible();

    // Проверяем обе карточки и их иллюстрации
    const maleCard = page.getByTestId('char-card-male');
    const femaleCard = page.getByTestId('char-card-female');
    await expect(maleCard.locator('img')).toHaveAttribute(
      'src',
      '/characters/eddie_limitless.jpg'
    );
    await expect(femaleCard.locator('img')).toHaveAttribute(
      'src',
      '/characters/leyla_limitless.jpg'
    );

    // Переключаемся на женский образ (Алия Морра), затем обратно на мужской (Тимур / Эдди Морра)
    await page.getByTestId('select-female-btn').click();
    await expect(page.getByTestId('player-name-input')).toHaveValue('Алия');
    await expect(page.getByTestId('select-female-btn')).toHaveText('Выбран ✓');

    await page.getByTestId('select-male-btn').click();
    await expect(page.getByTestId('player-name-input')).toHaveValue('Тимур');
    await expect(page.getByTestId('select-male-btn')).toHaveText('Выбран ✓');

    // Вводим имя игрока и нажимаем старт
    await page.getByTestId('player-name-input').fill('Тимур Морра');
    await page.getByTestId('start-game-btn').click();

    // Проверка появления оверлея обучения со стрелками (5 шагов)
    const tutorialOverlay = page.getByTestId('tutorial-overlay');
    await expect(tutorialOverlay).toBeVisible();

    // Шаг 1 из 5
    await expect(page.getByTestId('tutorial-step-counter')).toHaveText(
      'Шаг 1 из 5'
    );
    await expect(page.getByTestId('tutorial-step-title')).toContainText(
      'Твоё отражение в мире денег'
    );
    await page.getByTestId('tutorial-next-btn').click();

    // Шаг 2 из 5
    await expect(page.getByTestId('tutorial-step-counter')).toHaveText(
      'Шаг 2 из 5'
    );
    await expect(page.getByTestId('tutorial-step-title')).toContainText(
      'Пульт управления деньгами'
    );
    await page.getByTestId('tutorial-next-btn').click();

    // Шаг 3 из 5
    await expect(page.getByTestId('tutorial-step-counter')).toHaveText(
      'Шаг 3 из 5'
    );
    await expect(page.getByTestId('tutorial-step-title')).toContainText(
      'Быстрые точки фокуса'
    );
    await page.getByTestId('tutorial-next-btn').click();

    // Шаг 4 из 5
    await expect(page.getByTestId('tutorial-step-counter')).toHaveText(
      'Шаг 4 из 5'
    );
    await expect(page.getByTestId('tutorial-step-title')).toContainText(
      'Топ самых осознанных'
    );
    await page.getByTestId('tutorial-next-btn').click();

    // Шаг 5 из 5 и завершение с начислением +25 XP
    await expect(page.getByTestId('tutorial-step-counter')).toHaveText(
      'Шаг 5 из 5'
    );
    await expect(page.getByTestId('tutorial-step-title')).toContainText(
      'Профиль и быстрый XP'
    );
    await page.getByTestId('tutorial-finish-btn').click();

    await expect(tutorialOverlay).toBeHidden();

    // Проверяем начисление первых +25 XP на главном экране
    await expect(page.getByTestId('hud-level')).toHaveText('Уровень 1');
    await expect(page.getByTestId('hud-xp-text')).toContainText(
      '25 / 65 XP до Ур. 2'
    );
  });

  test('Тест 2: Главный экран вокруг Персонажа, Кругляшки слева/справа и Лидерборд (1, 2, 3 место)', async ({
    page,
  }) => {
    await completeOnboardingAndTutorial(page, 'male', 'Тимур');

    // Проверка главного героя в центре
    await expect(page.getByTestId('main-character-card')).toBeVisible();
    await expect(page.getByTestId('main-character-image')).toHaveAttribute(
      'src',
      '/characters/eddie_limitless.jpg'
    );

    // Проверка плашки «Сколько реально доступно до зарплаты»
    await expect(page.getByTestId('safe-limit-banner')).toBeVisible();
    await expect(page.getByTestId('safe-daily-limit-value')).toContainText(
      '270 000 сум / день'
    );

    // Проверка всех 6 кругляшков слева и справа от персонажа
    await expect(page.getByTestId('orb-leaderboard')).toBeVisible();
    await expect(page.getByTestId('orb-goals')).toBeVisible();
    await expect(page.getByTestId('orb-payday')).toBeVisible();
    await expect(page.getByTestId('orb-friends')).toBeVisible();
    await expect(page.getByTestId('orb-kyc')).toBeVisible();
    await expect(page.getByTestId('orb-tutorial')).toBeVisible();

    // Клик по Лидерборду и проверка пьедестала 1, 2 и 3 места + строки игрока
    await page.getByTestId('orb-leaderboard').click();
    const leaderboardModal = page.getByTestId('leaderboard-modal');
    await expect(leaderboardModal).toBeVisible();
    await expect(page.getByTestId('podium-place-1')).toContainText('1 место');
    await expect(page.getByTestId('podium-place-2')).toContainText('2 место');
    await expect(page.getByTestId('podium-place-3')).toContainText('3 место');
    await expect(page.getByTestId('leaderboard-player-row')).toBeVisible();
    await expect(page.getByTestId('leaderboard-player-row')).toContainText(
      'Тимур'
    );
    await page.getByTestId('close-leaderboard-btn').click();
    await expect(leaderboardModal).toBeHidden();

    // Проверка кругляшков «Цели/Долги» и «Лимит до ЗП»
    await page.getByTestId('orb-goals').click();
    await expect(page.getByTestId('goals-modal')).toBeVisible();
    await page.getByTestId('close-goals-modal-btn').click();
    await expect(page.getByTestId('goals-modal')).toBeHidden();

    await page.getByTestId('orb-payday').click();
    await expect(page.getByTestId('payday-modal')).toBeVisible();
    await page.getByTestId('close-payday-modal-btn').click();
    await expect(page.getByTestId('payday-modal')).toBeHidden();

    // Проверка кругляшка «Друзья +XP» и получения +50 XP за приглашение друга -> Level Up до Уровня 2!
    await page.getByTestId('orb-friends').click();
    await expect(page.getByTestId('friends-modal')).toBeVisible();
    await page.getByTestId('invite-friend-btn').click();
    await page.getByTestId('close-friends-modal-btn').click();

    // 25 XP (туториал) + 50 XP (друг) = 75 XP >= 65 XP -> Уровень 2!
    await expect(page.getByTestId('hud-level')).toHaveText('Уровень 2');
    await expect(page.getByTestId('hud-xp-text')).toContainText(
      '10 / 80 XP до Ур. 3'
    );
  });

  test('Тест 3: Нижнее меню (3 кнопки), Быстрые Приходы-Расходы и Ежедневные задания финансовой грамотности', async ({
    page,
  }) => {
    await completeOnboardingAndTutorial(page, 'male', 'Тимур');

    // Переход по левой нижней кнопке «Учёт и Задания»
    await page.getByTestId('nav-finance-tasks').click();
    await expect(page.getByTestId('finance-tasks-screen')).toBeVisible();

    // Исходный свободный остаток: 4 500 000 - 450 000 (долг ЖКХ) = 4 050 000 сум (270 000 сум/день)
    await expect(page.getByTestId('finance-free-balance')).toContainText(
      '4 050 000 сум'
    );

    // 1. Запись быстрого Расхода (150 000 сум -> +10 XP)
    await page.getByTestId('tx-type-expense').click();
    await page.getByTestId('tx-amount-input').fill('150000');
    await page.getByTestId('submit-tx-btn').click();

    // Свободный остаток уменьшился до 3 900 000 сум (260 000 сум/день)
    await expect(page.getByTestId('finance-free-balance')).toContainText(
      '3 900 000 сум'
    );
    await expect(page.getByTestId('finance-daily-limit')).toContainText(
      '260 000 сум / день'
    );

    // 2. Запись быстрого Прихода (600 000 сум -> +15 XP)
    await page.getByTestId('tx-type-income').click();
    await page.getByTestId('tx-amount-input').fill('600000');
    await page.getByTestId('submit-tx-btn').click();

    // Свободный остаток увеличился до 4 500 000 сум (300 000 сум/день)
    await expect(page.getByTestId('finance-free-balance')).toContainText(
      '4 500 000 сум'
    );
    await expect(page.getByTestId('finance-daily-limit')).toContainText(
      '300 000 сум / день'
    );

    // 3. Прохождение ежедневного задания по финансовой грамотности (+100 XP)
    await expect(page.getByTestId('daily-tasks-section')).toBeVisible();
    await page.getByTestId('quiz-option-1').click();
    await page.getByTestId('complete-daily-task-btn').click();

    // Итого XP: 25 (туториал) + 10 (расход) + 15 (приход) + 100 (задание дня) = 150 XP -> Уровень 3!
    await page.getByTestId('nav-character-main').click();
    await expect(page.getByTestId('hud-level')).toHaveText('Уровень 3');
    await expect(page.getByTestId('hud-xp-text')).toContainText(
      '5 / 95 XP до Ур. 4'
    );
  });

  test('Тест 4: Прокачка XP в «Настройках и KYC» (Email, @username, KYC, Лимит до ЗП) и переключение пола героя', async ({
    page,
  }) => {
    await completeOnboardingAndTutorial(page, 'male', 'Тимур');

    // Переход по правой нижней кнопке «Настройки и KYC»
    await page.getByTestId('nav-settings-kyc').click();
    await expect(page.getByTestId('settings-kyc-screen')).toBeVisible();
    await expect(page.getByTestId('profile-level-badge')).toHaveText(
      'Уровень 1'
    );

    // 1. Ввод @username и получение +25 XP (Всего: 25 + 25 = 50 XP)
    await page.getByTestId('input-username').fill('@timur_superhuman');
    await page.getByTestId('claim-username-xp-btn').click();
    await expect(page.getByTestId('claim-username-xp-btn')).toContainText(
      'Сохранено (+25 XP ✓)'
    );

    // 2. Ввод Email и получение +30 XP (Всего: 50 + 30 = 80 XP -> Уровень 2)
    await page.getByTestId('input-email').fill('timur.morra@onpul.uz');
    await page.getByTestId('claim-email-xp-btn').click();
    await expect(page.getByTestId('claim-email-xp-btn')).toContainText(
      'Подтверждено (+30 XP ✓)'
    );
    await expect(page.getByTestId('profile-level-badge')).toHaveText(
      'Уровень 2'
    );

    // 3. Заполнение формы KYC и получение +80 XP (Всего: 80 + 80 = 160 XP -> Уровень 3)
    await page.getByTestId('input-kyc-name').fill('Тимур Каримов');
    await page.getByTestId('select-kyc-city').selectOption('Самарканд');
    await page.getByTestId('input-kyc-occupation').fill('FinTech Архитектор');
    await page.getByTestId('claim-kyc-xp-btn').click();
    await expect(page.getByTestId('claim-kyc-xp-btn')).toContainText(
      'KYC Верификация подтверждена (+80 XP)'
    );
    await expect(page.getByTestId('profile-level-badge')).toHaveText(
      'Уровень 3'
    );

    // 4. Настройка «Доступно до зарплаты» (+50 XP -> Всего: 210 XP)
    await page.getByTestId('input-payday-balance').fill('6450000');
    await page.getByTestId('input-payday-days').fill('10');
    await page.getByTestId('claim-payday-xp-btn').click();

    // 5. Переключение пола персонажа с мужского (Эдди/Тимур) на женский (Алия Морра)
    await expect(page.getByTestId('current-gender-label')).toContainText(
      'Мужской'
    );
    await page.getByTestId('switch-gender-btn').click();
    await expect(page.getByTestId('current-gender-label')).toContainText(
      'Женский (Алия Морра)'
    );

    // Возврат на главный экран через большую центральную кнопку «Персонаж»
    await page.getByTestId('nav-character-main').click();
    await expect(page.getByTestId('main-character-screen')).toBeVisible();

    // Проверяем смену иллюстрации героя на главном экране на женский образ Алии Морра
    await expect(page.getByTestId('main-character-image')).toHaveAttribute(
      'src',
      '/characters/leyla_limitless.jpg'
    );
    await expect(page.getByTestId('character-superpower-badge')).toHaveText(
      'Шахматное зрение Алии'
    );

    // Проверяем, что обновлённый дневной лимит (6 450 000 - 450 000 = 6 000 000 / 10 дней = 600 000 сум/день) отображается на главной плашке
    await expect(page.getByTestId('safe-daily-limit-value')).toContainText(
      '600 000 сум / день'
    );
  });
});
