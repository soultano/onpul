export type SupportedLanguage = 'ru' | 'uz' | 'en' | 'de' | 'ko' | 'es';

export interface LanguageOption {
  code: SupportedLanguage;
  flag: string;
  label: string;
  shortLabel: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'ru', flag: '🇷🇺', label: 'Русский', shortLabel: 'RU' },
  { code: 'uz', flag: '🇺🇿', label: 'O‘zbekcha', shortLabel: 'UZ' },
  { code: 'en', flag: '🇬🇧', label: 'English', shortLabel: 'EN' },
  { code: 'de', flag: '🇩🇪', label: 'Deutsch', shortLabel: 'DE' },
  { code: 'ko', flag: '🇰🇷', label: '한국어', shortLabel: 'KO' },
  { code: 'es', flag: '🇪🇸', label: 'Español', shortLabel: 'ES' },
];

export interface GoalCategoryPreset {
  id: string;
  icon: string;
  recommendedAmount: number;
  labels: Record<SupportedLanguage, string>;
  defaultTitles: Record<SupportedLanguage, string>;
}

export const GOAL_CATEGORY_PRESETS: GoalCategoryPreset[] = [
  {
    id: 'car',
    icon: '🚗',
    recommendedAmount: 150000000,
    labels: {
      ru: '🚗 Автомобиль',
      uz: '🚗 Avtomobil',
      en: '🚗 Car / Vehicle',
      de: '🚗 Auto / Fahrzeug',
      ko: '🚗 자동차 구매',
      es: '🚗 Automóvil',
    },
    defaultTitles: {
      ru: 'Автомобиль мечты',
      uz: 'Orzudagi avtomobil',
      en: 'Dream Car',
      de: 'Traumauto',
      ko: '드림카 구매',
      es: 'Auto de mis sueños',
    },
  },
  {
    id: 'apartment',
    icon: '🏠',
    recommendedAmount: 250000000,
    labels: {
      ru: '🏠 Квартира / Недвижимость',
      uz: '🏠 Kvartira / Uy-joy',
      en: '🏠 Apartment / Real Estate',
      de: '🏠 Wohnung / Immobilie',
      ko: '🏠 아파트 / 내 집 마련',
      es: '🏠 Apartamento / Vivienda',
    },
    defaultTitles: {
      ru: 'Первоначальный взнос на квартиру',
      uz: 'Kvartira uchun boshlang‘ich to‘lov',
      en: 'Apartment Down Payment',
      de: 'Anzahlung für Wohnung',
      ko: '아파트 계약금 마련',
      es: 'Inicial para apartamento',
    },
  },
  {
    id: 'travel',
    icon: '✈️',
    recommendedAmount: 15000000,
    labels: {
      ru: '✈️ Путешествие / Отпуск',
      uz: '✈️ Sayohat / Ta’til',
      en: '✈️ Travel / Vacation',
      de: '✈️ Reise / Urlaub',
      ko: '✈️ 해외여행 / 휴가',
      es: '✈️ Viaje / Vacaciones',
    },
    defaultTitles: {
      ru: 'Путешествие / Отпуск',
      uz: 'Oilaviy sayohat',
      en: 'Dream Vacation',
      de: 'Traumreise',
      ko: '해외여행 자금',
      es: 'Viaje de vacaciones',
    },
  },
  {
    id: 'cushion',
    icon: '🛡️',
    recommendedAmount: 10000000,
    labels: {
      ru: '🛡️ Подушка безопасности',
      uz: '🛡️ Xavfsizlik yostig‘i',
      en: '🛡️ Safety Cushion',
      de: '🛡️ Notgroschen / Reserve',
      ko: '🛡️ 비상금 안전망',
      es: '🛡️ Fondo de emergencia',
    },
    defaultTitles: {
      ru: 'Подушка безопасности',
      uz: 'Xavfsizlik zaxirasi',
      en: 'Emergency Fund',
      de: 'Finanzielle Reserve',
      ko: '비상금 안전자산',
      es: 'Fondo de seguridad',
    },
  },
  {
    id: 'gadget',
    icon: '📱',
    recommendedAmount: 12000000,
    labels: {
      ru: '📱 Смартфон / Техника',
      uz: '📱 Smartfon / Texnika',
      en: '📱 Smartphone / Tech',
      de: '📱 Smartphone / Technik',
      ko: '📱 스마트폰 / 노트북',
      es: '📱 Smartphone / Tecnología',
    },
    defaultTitles: {
      ru: 'Новый смартфон / Ноутбук',
      uz: 'Yangi smartfon / Noutbuk',
      en: 'New Smartphone / Laptop',
      de: 'Neues Smartphone / Laptop',
      ko: '새 스마트폰 / 노트북',
      es: 'Nuevo Smartphone / Laptop',
    },
  },
  {
    id: 'education',
    icon: '🎓',
    recommendedAmount: 8000000,
    labels: {
      ru: '🎓 Образование / Курсы',
      uz: '🎓 Ta’lim / Kurslar',
      en: '🎓 Education / Courses',
      de: '🎓 Bildung / Kurse',
      ko: '🎓 교육 / 자기계발',
      es: '🎓 Educación / Cursos',
    },
    defaultTitles: {
      ru: 'Обучение и навыки',
      uz: 'Ta’lim va kasbiy o‘sish',
      en: 'Education & Skills',
      de: 'Weiterbildung & Kurse',
      ko: '직무 교육 및 강의',
      es: 'Educación y habilidades',
    },
  },
  {
    id: 'wedding',
    icon: '💍',
    recommendedAmount: 50000000,
    labels: {
      ru: '💍 Свадьба / Семейное торжество',
      uz: '💍 To‘y / Oilaviy marosim',
      en: '💍 Wedding / Family Event',
      de: '💍 Hochzeit / Familienfeier',
      ko: '💍 결혼식 / 가족 행사',
      es: '💍 Boda / Evento familiar',
    },
    defaultTitles: {
      ru: 'Фонд семейных событий',
      uz: 'To‘y va oilaviy tadbirlar fondi',
      en: 'Family & Wedding Fund',
      de: 'Hochzeits- & Familienfonds',
      ko: '결혼 및 가족 행사 기금',
      es: 'Fondo para boda y familia',
    },
  },
  {
    id: 'business',
    icon: '💼',
    recommendedAmount: 100000000,
    labels: {
      ru: '💼 Свой бизнес / Инвестиции',
      uz: '💼 Shaxsiy biznes / Investitsiya',
      en: '💼 Business / Investments',
      de: '💼 Eigenes Business / Investitionen',
      ko: '💼 창업 / 투자 자본',
      es: '💼 Negocio propio / Inversión',
    },
    defaultTitles: {
      ru: 'Капитал для бизнеса и вкладов',
      uz: 'Biznes va investitsiya kapitali',
      en: 'Business & Investment Capital',
      de: 'Geschäfts- & Investitionskapital',
      ko: '창업 및 투자 시드머니',
      es: 'Capital de negocio e inversión',
    },
  },
  {
    id: 'custom',
    icon: '✨',
    recommendedAmount: 5000000,
    labels: {
      ru: '✨ Своя цель',
      uz: '✨ Boshqa maqsad',
      en: '✨ Custom Goal',
      de: '✨ Eigenes Ziel',
      ko: '✨ 직접 입력 목표',
      es: '✨ Meta personalizada',
    },
    defaultTitles: {
      ru: 'Личная финансовая цель',
      uz: 'Shaxsiy moliyaviy maqsad',
      en: 'Personal Financial Goal',
      de: 'Persönliches Finanzziel',
      ko: '나만의 재무 목표',
      es: 'Meta financiera personal',
    },
  },
];

export interface TranslationDictionary {
  navFinance: string;
  navCharacter: string;
  navSettings: string;
  levelWord: string;
  clarityProgress: string;
  leaderboardTop: string;
  yourRank: string;
  openBtn: string;
  orbTop: string;
  orbGoals: string;
  orbPayday: string;
  orbFriends: string;
  orbKyc: string;
  orbGuide: string;
  safeLimitTitle: string;
  freeUntilPayday: string;
  daysUntilPayday: string;
  dailyLimitLabel: string;
  mandatoryPaymentsLabel: string;
  recordTxLink: string;
  financeHeaderTitle: string;
  quickTrackerTitle: string;
  quickTrackerSub: string;
  dailyTasksHeader: string;
  goalsSectionTitle: string;
  selectGoalCategoryLabel: string;
  settingsTitle: string;
  faqTabButton: string;
  faqSectionTitle: string;
  faqItems: { q: string; a: string }[];
  nztLabTitle: string;
  nztLabSub: string;
  friendsWinWinTitle: string;
  inviterRewardsTitle: string;
  friendRewardsTitle: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationDictionary> = {
  ru: {
    navFinance: 'Учёт и Задания',
    navCharacter: 'Персонаж',
    navSettings: 'Настройки',
    levelWord: 'Уровень',
    clarityProgress: 'Прогресс ясности ума',
    leaderboardTop: 'Лидерборд Топ 1–2–3',
    yourRank: 'Твоё место',
    openBtn: 'Открыть →',
    orbTop: 'Топ 1-2-3',
    orbGoals: 'Цели/Долги',
    orbPayday: 'Лимит до ЗП',
    orbFriends: 'Друзья +XP',
    orbKyc: 'KYC +80 XP',
    orbGuide: 'Гид',
    safeLimitTitle: 'Сколько реально доступно до зарплаты',
    freeUntilPayday: 'Свободно до ЗП',
    daysUntilPayday: 'Дней до ЗП',
    dailyLimitLabel: 'Лимит на сегодня',
    mandatoryPaymentsLabel: 'Обязательные платежи',
    recordTxLink: '+ Записать трату / приход →',
    financeHeaderTitle: 'Пульт управления деньгами',
    quickTrackerTitle: 'Приходы и Расходы за 5 секунд',
    quickTrackerSub: 'Каждая запись обновляет дневной лимит и качает героя',
    dailyTasksHeader: '7 шагов к полной финансовой ясности',
    goalsSectionTitle: 'Цели и Обязательные платежи (Долги)',
    selectGoalCategoryLabel: 'Выбери категорию цели (Автомобиль, Квартира, Путешествие и др.):',
    settingsTitle: 'Настройки профиля и F.A.Q.',
    faqTabButton: '❓ F.A.Q. — Частые вопросы и правила',
    faqSectionTitle: '❓ F.A.Q. — Как устроена игра «ФинУровень» (Limitless)',
    faqItems: [
      {
        q: '1. Как работает «ФинУровень» и расчёт Безопасного дневного лимита до зарплаты?',
        a: 'Главная цель игры — за 2 минуты в день разгонять финансовый туман. Мы берём твой текущий баланс, автоматически вычитаем забронированные обязательные платежи/долги и делим свободный остаток на количество дней до следующей зарплаты. Ты всегда знаешь точную сумму, которую можно спокойно потратить сегодня без кассового разрыва.',
      },
      {
        q: '2. Как прокачивать персонажа (XP, уровни 1–80 и 4 стадии ясности)?',
        a: 'Каждое полезное действие приносит опыт (XP): приход (+15 XP), расход (+10 XP), ежедневное задание (+100 XP), добавление цели (+40 XP), KYC и профиль (до +185 XP). По формуле ΔXP(L) = 50 + 15×L твой герой проходит 4 стадии эволюции: от «Тумана в голове» (Ур. 1–10) и «Фокуса внимания» (Ур. 11–30) до «Архитектора капитала» (Ур. 31–60) и «Сверхчеловека 100% ясности» (Ур. 61–80).',
      },
      {
        q: '3. Как работает двусторонняя реферальная партнёрская программа (Win-Win)?',
        a: 'В «ФинУровне» выигрывают оба! Пригласивший партнёр получает +50 XP сразу, +150 XP и +1 💎 NZT после верификации друга, а также +10% пассивного XP от успехов друзей. Приглашённый друг сразу получает стартовый буст «Быстрый старт»: +100 XP (мгновенный 2-й уровень!), +1 редкий 💎 NZT-Кристалл и Крио-Щит Стрика на 3 дня.',
      },
      {
        q: '4. Что такое редкая валюта 💎 NZT-Кристаллы и зачем нужна Лаборатория NZT?',
        a: '💎 NZT — это редкие Кристаллы Ясности, которые сложно нафармить: они выдаются только за серьёзные рубежи (прохождение KYC, приглашение друзей по Win-Win и закрытие серии ежедневных заданий). В «Лаборатории NZT» кристаллы можно обменять на Нейро-Импульс (×2 XP Бустер + ИИ-Аудит ускорения целей), Крио-Щит Стрика или Золотую VIP-Ауру в Лидерборде.',
      },
    ],
    nztLabTitle: '💎 Лаборатория NZT: Нейро-Ускорители',
    nztLabSub: 'Редкая валюта сверхлюдей за реальные рубежи финансовой дисциплины',
    friendsWinWinTitle: 'Партнёрская программа Win-Win (Выгода обоим!)',
    inviterRewardsTitle: '🎁 Что получаешь ТЫ (Приглашающий партнёр):',
    friendRewardsTitle: '🚀 Что получает ТВОЙ ДРУГ (Приглашённый):',
  },
  uz: {
    navFinance: 'Hisob va Vazifalar',
    navCharacter: 'Qahramon',
    navSettings: 'Sozlamalar',
    levelWord: 'Daraja',
    clarityProgress: 'Aniqlik va fokus darajasi',
    leaderboardTop: 'Liderbord Top 1–2–3',
    yourRank: 'O‘rningiz',
    openBtn: 'Ochish →',
    orbTop: 'Top 1-2-3',
    orbGoals: 'Maqsadlar',
    orbPayday: 'Oylikkacha',
    orbFriends: 'Do‘stlar +XP',
    orbKyc: 'KYC +80 XP',
    orbGuide: 'Qo‘llanma',
    safeLimitTitle: 'Oylikkacha qancha pul бемалол yetadi',
    freeUntilPayday: 'Bo‘sh qoldiq',
    daysUntilPayday: 'Oylikkacha kun',
    dailyLimitLabel: 'Bugungi xavfsiz limit',
    mandatoryPaymentsLabel: 'Majburiy to‘lovlar',
    recordTxLink: '+ Kirim / chiqim yozish →',
    financeHeaderTitle: 'Pullarni boshqarish pulti',
    quickTrackerTitle: '5 soniyada Kirim va Chiqimlar',
    quickTrackerSub: 'Har bir yozuv kunlik limitni yangilaydi va XP beradi',
    dailyTasksHeader: 'Moliyaviy aniqlikka 7 qadam',
    goalsSectionTitle: 'Maqsadlar va Majburiy to‘lovlar (Qarzlar)',
    selectGoalCategoryLabel: 'Maqsad turini tanlang (Avtomobil, Kvartira, Sayohat va b.):',
    settingsTitle: 'Profil sozlamalari va F.A.Q.',
    faqTabButton: '❓ F.A.Q. — Ko‘p beriladigan savollar va qoidalar',
    faqSectionTitle: '❓ F.A.Q. — «FinUroven» o‘yini qanday ishlaydi',
    faqItems: [
      {
        q: '1. Oylikkacha xavfsiz kunlik limit qanday hisoblanadi?',
        a: 'Joriy balansingizdan majburiy to‘lovlar ayiriladi va qolgan summa keyingi oylikkacha qolgan kunlarga bo‘linadi.',
      },
      {
        q: '2. Qahramon darajasi (1–80) va XP qanday oshiriladi?',
        a: 'Kirim (+15 XP), chiqim (+10 XP), kunlik vazifa (+100 XP), maqsad (+40 XP) va KYC (+80 XP) orqali qahramoningiz 4 bosqichda rivojlanadi.',
      },
      {
        q: '3. Ikki tomonlama Win-Win referal dasturi qanday ishlaydi?',
        a: 'Sizga: har bir do‘st uchun +50 XP va +1 💎 NZT. Do‘stingizga: kirishi bilan +100 XP («Tezkor start») va +1 💎 NZT beriladi!',
      },
      {
        q: '4. 💎 NZT kristallari nima va NZT Laboratoriyasi nima uchun kerak?',
        a: '💎 NZT — qiyin topiladigan noyob valyuta (KYC, do‘stlar va vazifalar uchun). Uni ×2 XP Neyro-Buster, Strim qalqoni va VIP-Auraga almashtirish mumkin.',
      },
    ],
    nztLabTitle: '💎 NZT Laboratoriyasi: Neyro-Tezlatgichlar',
    nztLabSub: 'Haqiqiy moliyaviy intizom uchun beriladigan noyob kristallar',
    friendsWinWinTitle: 'Win-Win Hamkorlik Dasturi (Ikkala tomonga foyda!)',
    inviterRewardsTitle: '🎁 SIZ nima olasiz (Taklif qiluvchi):',
    friendRewardsTitle: '🚀 DO‘STINGIZ nima oladi (Taklif qilingan):',
  },
  en: {
    navFinance: 'Finance & Tasks',
    navCharacter: 'Character',
    navSettings: 'Settings',
    levelWord: 'Level',
    clarityProgress: 'Mind Clarity Progress',
    leaderboardTop: 'Leaderboard Top 1–2–3',
    yourRank: 'Your Rank',
    openBtn: 'Open →',
    orbTop: 'Top 1-2-3',
    orbGoals: 'Goals/Debts',
    orbPayday: 'Payday Limit',
    orbFriends: 'Friends +XP',
    orbKyc: 'KYC +80 XP',
    orbGuide: 'Guide',
    safeLimitTitle: 'Safe Available Money Until Payday',
    freeUntilPayday: 'Free Until Payday',
    daysUntilPayday: 'Days to Payday',
    dailyLimitLabel: 'Safe Daily Limit',
    mandatoryPaymentsLabel: 'Mandatory Bills',
    recordTxLink: '+ Log Income / Expense →',
    financeHeaderTitle: 'Money Control Cockpit',
    quickTrackerTitle: '5-Second Income & Expense Tracker',
    quickTrackerSub: 'Every entry updates your daily limit and levels up your hero',
    dailyTasksHeader: '7 Steps to 100% Financial Clarity',
    goalsSectionTitle: 'Goals & Mandatory Payments (Debts)',
    selectGoalCategoryLabel: 'Choose Goal Category (Car, Apartment, Travel, etc.):',
    settingsTitle: 'Profile Settings & F.A.Q.',
    faqTabButton: '❓ F.A.Q. — Frequently Asked Questions & Rules',
    faqSectionTitle: '❓ F.A.Q. — How OnPul Limitless Edition Works',
    faqItems: [
      {
        q: '1. How does the Safe Daily Limit until payday work?',
        a: 'We subtract your upcoming mandatory bills from your current balance and divide the free amount by the days left until your next payday.',
      },
      {
        q: '2. How do XP, Levels 1–80, and the 4 Clarity Stages work?',
        a: 'Log incomes (+15 XP), expenses (+10 XP), daily tasks (+100 XP), goals (+40 XP), and KYC (+80 XP) to evolve through 4 Limitless stages.',
      },
      {
        q: '3. How does the Two-Sided Win-Win Referral Program work?',
        a: 'Both sides win! You get +50 XP & +1 💎 NZT per friend plus +10% passive XP. Your invited friend gets a +100 XP Fast-Start boost & +1 💎 NZT immediately!',
      },
      {
        q: '4. What are scarce 💎 NZT Gems and the NZT Lab?',
        a: '💎 NZT Gems are hard-to-farm crystals earned via KYC, referrals, and task milestones. Spend them in the NZT Lab for a ×2 XP Neuro-Booster, Streak Shield, or VIP Aura.',
      },
    ],
    nztLabTitle: '💎 NZT Lab: Superhuman Neuro-Boosters',
    nztLabSub: 'Scarce currency earned through real financial discipline milestones',
    friendsWinWinTitle: 'Win-Win Referral Partner Program',
    inviterRewardsTitle: '🎁 What YOU Receive (Inviting Partner):',
    friendRewardsTitle: '🚀 What YOUR FRIEND Receives (Invited):',
  },
  de: {
    navFinance: 'Finanzen & Aufgaben',
    navCharacter: 'Charakter',
    navSettings: 'Einstellungen',
    levelWord: 'Stufe',
    clarityProgress: 'Fortschritt der geistigen Klarheit',
    leaderboardTop: 'Rangliste Top 1–2–3',
    yourRank: 'Dein Rang',
    openBtn: 'Öffnen →',
    orbTop: 'Top 1-2-3',
    orbGoals: 'Ziele/Schulden',
    orbPayday: 'Tageslimit',
    orbFriends: 'Freunde +XP',
    orbKyc: 'KYC +80 XP',
    orbGuide: 'Guide',
    safeLimitTitle: 'Verfügbares Budget bis zum Zahltag',
    freeUntilPayday: 'Frei bis Zahltag',
    daysUntilPayday: 'Tage bis Gehalt',
    dailyLimitLabel: 'Tageslimit heute',
    mandatoryPaymentsLabel: 'Fixkosten',
    recordTxLink: '+ Einnahme / Ausgabe buchen →',
    financeHeaderTitle: 'Finanz-Cockpit',
    quickTrackerTitle: 'Einnahmen & Ausgaben in 5 Sekunden',
    quickTrackerSub: 'Jeder Eintrag aktualisiert dein Tageslimit und bringt XP',
    dailyTasksHeader: '7 Schritte zu 100% Finanzklarheit',
    goalsSectionTitle: 'Ziele & Verbindlichkeiten',
    selectGoalCategoryLabel: 'Zielkategorie wählen (Auto, Wohnung, Reise usw.):',
    settingsTitle: 'Profileinstellungen & F.A.Q.',
    faqTabButton: '❓ F.A.Q. — Häufige Fragen & Spielregeln',
    faqSectionTitle: '❓ F.A.Q. — Wie OnPul Limitless funktioniert',
    faqItems: [
      {
        q: '1. Wie wird das sichere Tageslimit bis zum Gehalt berechnet?',
        a: 'Wir ziehen deine Fixkosten vom Kontostand ab und teilen den freien Betrag durch die verbleibenden Tage bis zum nächsten Gehalt.',
      },
      {
        q: '2. Wie funktionieren XP und die 4 Evolutionsstufen (Stufe 1–80)?',
        a: 'Sammle XP durch Buchungen, Tagesaufgaben und KYC, um vom „Nebel im Kopf“ bis zum „Übermenschen (100% Klarheit)“ aufzusteigen.',
      },
      {
        q: '3. Wie funktioniert das zweiseitige Win-Win Empfehlungsprogramm?',
        a: 'Du erhältst +50 XP & +1 💎 NZT pro Freund. Dein eingeladener Freund erhält sofort +100 XP Start-Boost und +1 💎 NZT!',
      },
      {
        q: '4. Was sind seltene 💎 NZT-Kristalle und das NZT-Labor?',
        a: '💎 NZT-Kristalle sind schwer zu verdienen (nur über KYC, Freunde & Meilensteine) und schalten im NZT-Labor den ×2 XP Neuro-Booster, Streak-Schild und VIP-Aura frei.',
      },
    ],
    nztLabTitle: '💎 NZT-Labor: Neuro-Booster',
    nztLabSub: 'Seltene Kristalle für echte finanzielle Disziplin',
    friendsWinWinTitle: 'Win-Win Partnerprogramm (Vorteil für beide!)',
    inviterRewardsTitle: '🎁 Was DU erhältst (Einladender Partner):',
    friendRewardsTitle: '🚀 Was DEIN FREUND erhält (Eingeladener):',
  },
  ko: {
    navFinance: '가계부 및 미션',
    navCharacter: '캐릭터',
    navSettings: '설정',
    levelWord: '레벨',
    clarityProgress: '두뇌 명료성 진행도',
    leaderboardTop: '리더보드 Top 1–2–3',
    yourRank: '내 순위',
    openBtn: '열기 →',
    orbTop: 'Top 1-2-3',
    orbGoals: '목표/고정비',
    orbPayday: '일일 한도',
    orbFriends: '친구초대 +XP',
    orbKyc: 'KYC +80 XP',
    orbGuide: '가이드',
    safeLimitTitle: '월급날까지 사용 가능한 안전 예산',
    freeUntilPayday: '자유 잔액',
    daysUntilPayday: '월급까지 남은 일',
    dailyLimitLabel: '오늘의 안전 한도',
    mandatoryPaymentsLabel: '필수 고정 지출',
    recordTxLink: '+ 수입 / 지출 기록하기 →',
    financeHeaderTitle: '자금 컨트롤 센터',
    quickTrackerTitle: '5초 수입 및 지출 기록',
    quickTrackerSub: '기록할 때마다 일일 한도가 갱신되고 경험치(XP)를 획득합니다',
    dailyTasksHeader: '100% 금융 명료성을 위한 7단계 미션',
    goalsSectionTitle: '재무 목표 및 필수 결제(부채)',
    selectGoalCategoryLabel: '목표 카테고리 선택 (자동차, 아파트, 여행 등):',
    settingsTitle: '프로필 설정 및 F.A.Q.',
    faqTabButton: '❓ F.A.Q. — 자주 묻는 질문 및 규칙',
    faqSectionTitle: '❓ F.A.Q. — OnPul Limitless 가이드',
    faqItems: [
      {
        q: '1. 월급날까지 일일 안전 한도는 어떻게 계산되나요?',
        a: '현재 잔액에서 예정된 필수 고정지출을 뺀 뒤, 다음 월급날까지 남은 일수로 나누어 오늘 써도 안전한 금액을 알려줍니다.',
      },
      {
        q: '2. 경험치(XP)와 4단계 캐릭터 진화 시스템은 무엇인가요?',
        a: '수입/지출 기록, 일일 미션(+100 XP), KYC 인증(+80 XP)을 통해 레벨 1부터 80까지 초인으로 진화합니다.',
      },
      {
        q: '3. 양방향 Win-Win 친구 추천 프로그램은 어떻게 작동하나요?',
        a: '초대한 나는 즉시 +50 XP와 +1 💎 NZT를 받고, 초대받은 친구도 즉시 +100 XP 패스트스타트 부스트와 +1 💎 NZT를 받습니다!',
      },
      {
        q: '4. 희귀 재화 💎 NZT 크리스탈과 NZT 연구소는 무엇인가요?',
        a: '💎 NZT는 KYC 인증, 친구 초대 등 핵심 달성으로만 얻는 희귀 크리스탈이며, NZT 연구소에서 ×2 XP 부스터, 스트릭 실드, VIP 오라를 해금합니다.',
      },
    ],
    nztLabTitle: '💎 NZT 연구소: 초인 뉴로 부스터',
    nztLabSub: '까다로운 금융 규율 달성으로만 획득 가능한 희귀 크리스탈',
    friendsWinWinTitle: 'Win-Win 파트너 추천 프로그램',
    inviterRewardsTitle: '🎁 내가 받는 보상 (초대자):',
    friendRewardsTitle: '🚀 친구가 받는 보상 (초대받은 친구):',
  },
  es: {
    navFinance: 'Finanzas y Tareas',
    navCharacter: 'Personaje',
    navSettings: 'Ajustes',
    levelWord: 'Nivel',
    clarityProgress: 'Progreso de Claridad Mental',
    leaderboardTop: 'Clasificación Top 1–2–3',
    yourRank: 'Tu Puesto',
    openBtn: 'Abrir →',
    orbTop: 'Top 1-2-3',
    orbGoals: 'Metas/Deudas',
    orbPayday: 'Límite Diario',
    orbFriends: 'Amigos +XP',
    orbKyc: 'KYC +80 XP',
    orbGuide: 'Guía',
    safeLimitTitle: 'Dinero disponible hasta el próximo sueldo',
    freeUntilPayday: 'Libre hasta sueldo',
    daysUntilPayday: 'Días para sueldo',
    dailyLimitLabel: 'Límite seguro hoy',
    mandatoryPaymentsLabel: 'Pagos obligatorios',
    recordTxLink: '+ Registrar ingreso / gasto →',
    financeHeaderTitle: 'Panel de Control de Dinero',
    quickTrackerTitle: 'Ingresos y Gastos en 5 segundos',
    quickTrackerSub: 'Cada registro actualiza tu límite diario y sube tu XP',
    dailyTasksHeader: '7 pasos hacia el 100% de claridad financiera',
    goalsSectionTitle: 'Metas y Pagos Obligatorios (Deudas)',
    selectGoalCategoryLabel: 'Elige categoría de meta (Automóvil, Apartamento, Viaje, etc.):',
    settingsTitle: 'Ajustes de Perfil y F.A.Q.',
    faqTabButton: '❓ F.A.Q. — Preguntas Frecuentes y Reglas',
    faqSectionTitle: '❓ F.A.Q. — Cómo funciona OnPul Limitless',
    faqItems: [
      {
        q: '1. ¿Cómo se calcula el Límite Diario Seguro hasta el sueldo?',
        a: 'Restamos tus pagos obligatorios de tu saldo actual y dividimos el saldo libre entre los días que faltan para tu próximo pago.',
      },
      {
        q: '2. ¿Cómo funcionan los niveles 1–80 y las 4 etapas de evolución?',
        a: 'Gana XP registrando gastos, ingresos, misiones diarias (+100 XP) y KYC (+80 XP) para evolucionar hasta el 100% de claridad mental.',
      },
      {
        q: '3. ¿Cómo funciona el Programa de Referidos Win-Win (Doble Beneficio)?',
        a: '¡Ambos ganan! Tú recibes +50 XP y +1 💎 NZT por amigo. ¡Tu amigo invitado recibe al instante +100 XP de Inicio Rápido y +1 💎 NZT!',
      },
      {
        q: '4. ¿Qué son los cristales raros 💎 NZT y el Laboratorio NZT?',
        a: '💎 NZT es una moneda escasa obtenida en hitos clave (KYC, referidos y misiones). Úsala en el Laboratorio NZT para activar el Booster ×2 XP, Escudo de Racha y Aura VIP.',
      },
    ],
    nztLabTitle: '💎 Laboratorio NZT: Neuro-Aceleradores',
    nztLabSub: 'Moneda escasa ganada por hitos reales de disciplina financiera',
    friendsWinWinTitle: 'Programa de Socios Win-Win (¡Ambos ganan!)',
    inviterRewardsTitle: '🎁 Lo que TÚ recibes (Socio Invitador):',
    friendRewardsTitle: '🚀 Lo que recibe TU AMIGO (Invitado):',
  },
};
