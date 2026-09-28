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

  test('Тест 5: Мультиязычность (6 языков), отдельный F.A.Q. в Настройках, Двусторонняя рефералка Win-Win, Выпадающее меню целей и Лаборатория валюты 💎 NZT', async ({
    page,
  }) => {
    await completeOnboardingAndTutorial(page, 'male', 'Тимур');

    // 1. Проверка перевода интерфейса на все 6 языков (UZ, EN, DE, KO, ES, RU) и лаконичной кнопки «Настройки» снизу
    await page.getByTestId('lang-btn-uz').click();
    await expect(page.getByTestId('nav-settings-kyc')).toContainText(
      'Sozlamalar'
    );

    await page.getByTestId('lang-btn-en').click();
    await expect(page.getByTestId('nav-settings-kyc')).toContainText(
      'Settings'
    );

    await page.getByTestId('lang-btn-de').click();
    await expect(page.getByTestId('nav-settings-kyc')).toContainText(
      'Einstellungen'
    );

    await page.getByTestId('lang-btn-ko').click();
    await expect(page.getByTestId('nav-settings-kyc')).toContainText('설정');

    await page.getByTestId('lang-btn-es').click();
    await expect(page.getByTestId('nav-settings-kyc')).toContainText('Ajustes');

    await page.getByTestId('lang-btn-ru').click();
    await expect(page.getByTestId('nav-settings-kyc')).toContainText(
      'Настройки'
    );

    // 2. Проверка отдельного раздела F.A.Q. внутри экрана «Настройки»
    await page.getByTestId('nav-settings-kyc').click();
    await expect(page.getByTestId('settings-kyc-screen')).toBeVisible();
    await page.getByTestId('settings-faq-tab').click();

    await expect(page.getByTestId('faq-section')).toBeVisible();
    await expect(page.getByTestId('faq-item-1')).toBeVisible();
    await expect(page.getByTestId('faq-item-2')).toBeVisible();
    await expect(page.getByTestId('faq-item-3')).toBeVisible();
    await expect(page.getByTestId('faq-item-4')).toBeVisible();

    // 3. Возврат на главный экран и проверка Двусторонней реферальной программы (Win-Win)
    await page.getByTestId('nav-character-main').click();
    await page.getByTestId('orb-friends').click();
    await expect(page.getByTestId('friends-modal')).toBeVisible();

    // Проверяем карточки наград Приглашающего и Приглашённого друга
    await expect(page.getByTestId('referral-inviter-rewards')).toBeVisible();
    await expect(page.getByTestId('referral-friend-rewards')).toBeVisible();

    // Приглашаем друга (+50 XP и +1 💎 NZT)
    await page.getByTestId('invite-friend-btn').click();
    // Активируем инвайт-код друга (+100 XP и +1 💎 NZT)
    await page.getByTestId('friend-code-input').fill('LIMITLESS-VIP');
    await page.getByTestId('claim-friend-invite-btn').click();
    await expect(page.getByTestId('claim-friend-invite-btn')).toContainText(
      'Бонус получен (+100 XP ✓)'
    );
    await page.getByTestId('close-friends-modal-btn').click();

    // Проверяем, что начислено 2 💎 NZT и 25 + 50 + 100 = 175 XP (Уровень 3)
    await expect(page.getByTestId('hud-nzt-currency')).toHaveText('2 NZT');
    await expect(page.getByTestId('hud-level')).toHaveText('Уровень 3');

    // 4. Проверка выпадающего меню целей (Автомобиль, Квартира, Путешествие)
    await page.getByTestId('nav-finance-tasks').click();
    await expect(page.getByTestId('finance-tasks-screen')).toBeVisible();

    const goalSelect = page.getByTestId('goal-category-select');
    await expect(goalSelect).toBeVisible();

    // Выбор «Квартира / Недвижимость» -> проверка автоподстановки
    await goalSelect.selectOption('apartment');
    await expect(page.getByTestId('goal-title-input')).toHaveValue(
      'Первоначальный взнос на квартиру'
    );
    await expect(page.getByTestId('goal-amount-input')).toHaveValue(
      '250000000'
    );

    // Выбор «Путешествие / Отпуск» -> проверка автоподстановки
    await goalSelect.selectOption('travel');
    await expect(page.getByTestId('goal-title-input')).toHaveValue(
      'Путешествие / Отпуск'
    );
    await expect(page.getByTestId('goal-amount-input')).toHaveValue('15000000');

    // Выбор «Автомобиль» и добавление цели (+40 XP)
    await goalSelect.selectOption('car');
    await expect(page.getByTestId('goal-title-input')).toHaveValue(
      'Автомобиль мечты'
    );
    await expect(page.getByTestId('goal-amount-input')).toHaveValue(
      '150000000'
    );
    await page.getByTestId('add-goal-btn').click();
    await expect(page.getByTestId('goal-debt-item').first()).toContainText(
      'Автомобиль мечты'
    );

    // 5. Проверка редкой валюты 💎 NZT и «Лаборатории NZT»
    await page.getByTestId('nav-character-main').click();
    await page.getByTestId('hud-nzt-btn').click();

    const nztModal = page.getByTestId('nzt-lab-modal');
    await expect(nztModal).toBeVisible();
    await expect(page.getByTestId('nzt-lab-balance')).toContainText('💎 2 NZT');

    // Покупка «🧠 Нейро-Импульс ×2 XP» за 1 💎 NZT
    await page.getByTestId('buy-nzt-neuroboost-btn').click();
    await expect(page.getByTestId('nzt-ai-audit-result')).toBeVisible();
    await expect(page.getByTestId('nzt-ai-audit-result')).toContainText(
      'Автомобиль мечты'
    );
    await expect(page.getByTestId('nzt-lab-balance')).toContainText('💎 1 NZT');

    await page.getByTestId('close-nzt-lab-btn').click();
    await expect(nztModal).toBeHidden();
    await expect(page.getByTestId('hud-nzt-currency')).toHaveText('1 NZT');
  });

  test('Тест 6: Ежедневная соревновательная мини-игра «⚡ Нейро-Блиц: Дуэль Дня», «💰 Нейро-Сейф Дивидендов (Ур. 1–10)», Обменник Выгод и PRO-Монетизация', async ({
    page,
  }) => {
    await completeOnboardingAndTutorial(page, 'male', 'Тимур');

    // 1. Проверка отображения на главном экране карточек Нейро-Блица и Нейро-Сейфа (400 Coins на старте)
    await expect(page.getByTestId('daily-blitz-banner')).toBeVisible();
    await expect(page.getByTestId('neuro-vault-widget')).toBeVisible();
    await expect(page.getByTestId('hud-onpul-coins')).toContainText(
      '400 💰 Coins'
    );

    // 2. Сбор ежедневных дивидендов из Сейфа в 1 клик (400 + 250 = 650 💰, +20 XP)
    await page.getByTestId('claim-vault-btn').click();
    await expect(page.getByTestId('hud-onpul-coins')).toContainText(
      '650 💰 Coins'
    );

    // 3. Запуск мини-игры «⚡ Нейро-Блиц: Сделка или Ловушка?»
    await page.getByTestId('open-blitz-btn').click();
    const blitzModal = page.getByTestId('neuro-blitz-modal');
    await expect(blitzModal).toBeVisible();

    // Выбираем правильный ход Сверхчеловека (Вариант А)
    await page.getByTestId('blitz-option-a').click();
    await expect(page.getByTestId('blitz-result-box')).toBeVisible();
    await expect(page.getByTestId('blitz-result-box')).toContainText(
      '+30 🏆 Кубков Лиги'
    );

    // Проверяем победу над Соперником Дня Сардором (120 + 30 = 150 🏆 >= 145 🏆) и получение +1 💎 NZT
    await expect(page.getByTestId('blitz-duel-won-badge')).toBeVisible();
    await expect(page.getByTestId('blitz-duel-won-badge')).toContainText(
      'Соперник дня Сардор повержен!'
    );

    // Переход к следующей дилемме и закрытие окна Блица
    await page.getByTestId('blitz-next-card-btn').click();
    await expect(page.getByTestId('blitz-result-box')).toBeHidden();
    await page.getByTestId('close-blitz-modal-btn').click();
    await expect(blitzModal).toBeHidden();

    // На главном экране: 1 💎 NZT и 650 + 200 = 850 💰 Coins
    await expect(page.getByTestId('hud-nzt-currency')).toHaveText('1 NZT');
    await expect(page.getByTestId('hud-onpul-coins')).toContainText(
      '850 💰 Coins'
    );

    // 4. Открытие окна «💰 Нейро-Сейф, Выгоды и PRO-Монетизация»
    await page.getByTestId('open-vault-shop-btn').click();
    const vaultModal = page.getByTestId('vault-monetization-modal');
    await expect(vaultModal).toBeVisible();
    await expect(page.getByTestId('vault-current-level')).toHaveText(
      'Ур. 1/10'
    );

    // Прокачка уровня Сейфа: Ур. 1/10 -> Ур. 2/10 (+40 XP)
    await page.getByTestId('upgrade-vault-btn').click();
    await expect(page.getByTestId('vault-current-level')).toHaveText(
      'Ур. 2/10'
    );

    // Обмен монет на реальный промо-буст +2% к сбережениям Niyat Application (промокод ONPUL-NIYAT-38)
    await page.getByTestId('redeem-niyat-boost-btn').click();
    await expect(page.getByTestId('niyat-promo-code')).toBeVisible();
    await expect(page.getByTestId('niyat-promo-code')).toContainText(
      'ONPUL-NIYAT-38'
    );

    // Покупка билета еженедельного розыгрыша (🎟️ Билетов: 1)
    await page.getByTestId('redeem-raffle-ticket-btn').click();
    await expect(page.getByTestId('raffle-tickets-count')).toContainText(
      '🎟️ Билетов: 1'
    );

    // Активация PRO-Подписки «👑 NZT Pass» (+100 XP, +2 💎 NZT, +500 💰 Coins)
    await page.getByTestId('activate-pro-pass-btn').click();
    await expect(page.getByTestId('pro-pass-active-badge')).toBeVisible();
    await expect(page.getByTestId('pro-pass-active-badge')).toContainText(
      'Статус NZT Pass PRO Активен!'
    );

    await page.getByTestId('close-vault-modal-btn').click();
    await expect(vaultModal).toBeHidden();

    // Проверяем, что кристаллы выросли до 3 💎 NZT (1 за дуэль + 2 за PRO Pass)
    await expect(page.getByTestId('hud-nzt-currency')).toHaveText('3 NZT');

    // 5. Проверка блока «🎁 Призовой Пул Недели (Топ-1, Топ-2, Топ-3)» в модалке Лидерборда
    await page.getByTestId('orb-leaderboard').click();
    await expect(page.getByTestId('leaderboard-modal')).toBeVisible();
    await expect(page.getByTestId('leaderboard-prize-pool')).toBeVisible();
    await expect(page.getByTestId('leaderboard-prize-pool')).toContainText(
      'Призовой Пул Недели (Топ-1, Топ-2, Топ-3)'
    );
    await page.getByTestId('close-leaderboard-btn').click();
  });
});
