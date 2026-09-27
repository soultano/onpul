# 🎮 «ФинУровень» — Telegram Mini App для прокачки финансовой грамотности

**«ФинУровень»** — мобильная игра-тренажер в Telegram, где пользователь прокачивает свой уровень от 1 до 80 (80 — максимальный), честно фиксируя личные финансы и ежедневно проходя квизы по актуальным экономическим новостям.

> 🛡️ **Финансовый принцип игры:** Суммы зарплат, расходов и долгов **НИКАК** не влияют на начисление опыта (XP) и уровень. Приложение работает как зеркало финансов для самоанализа — баллы начисляются за сам факт честного заполнения, а не за размер цифр.

---

## ⚡ Быстрый запуск в 1 клик на Windows

Просто дважды кликните по файлу:
```bat
start_finuroven.bat
```
Скрипт автоматически:
1. Запустит бэкенд-сервер на `http://localhost:3001` (Node.js + Express + Prisma SQLite).
2. Запустит фронтенд-приложение на `http://localhost:3000` (React + TypeScript + Vite).
3. Откроет игру в вашем браузере по адресу: [http://localhost:3000/](http://localhost:3000/).

---

## 🚀 Ручной запуск из терминала

### 1. Установка зависимостей и базы данных

```powershell
# Установка и сидирование бэкенда
cd backend
npm install
npx prisma generate
npx prisma db push
npx tsx prisma/seed.ts   # Загружает 60 квизов в базу SQLite

# Установка фронтенда
cd ../frontend
npm install
```

### 2. Запуск в режиме разработки

```powershell
# Терминал 1 (Бэкенд):
cd backend
npm run dev

# Терминал 2 (Фронтенд):
cd frontend
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере. В dev-режиме автоматически подключен mock-пользователь, чтобы интерфейс можно было полноценно тестировать вне Telegram.

---

## 🧪 Запуск автоматических юнит-тестов

Все 5 обязательных тестовых наборов (24 теста) запускаются одной командой:

```powershell
cd backend
npm test
```

### Проверяемые сценарии:
1. **`tests/level.test.ts`**:
   - Формула опыта для перехода $50 + 15 \times L$.
   - Корректный рост от 1 до 80 уровня (80 — максимум).
   - Звания (1–9 «Новичок», 10–19 «Считающий», ..., 80 «Мастер финансов»).
   - 8 стадий эволюции внешнего вида аватара (каждые 10 уровней).
2. **`tests/quizXp.test.ts`**:
   - Начисление базового XP (3/3: 100 XP; 2/3: 60 XP; 1/3: 30 XP; 0/3: 10 XP).
   - Бонус винстрика: +10 XP за каждый день текущего стрика, максимум +50 XP (с 5-го дня).
   - При результате < 3/3 бонус стрика равен 0.
3. **`tests/streak.test.ts`**:
   - Увеличение стрика при игре в последовательные дни.
   - Сброс стрика до 0 при результате ниже 3/3.
   - Сброс стрика до 1 при пропуске одного или нескольких дней.
   - Смена суток и сброс задания в полночь по часовому поясу `Asia/Tashkent`.
4. **`tests/xpEvents.test.ts`**:
   - Однократность начисления XP за поля профиля и финансов.
   - Проверка, что изменение сумм (зарплаты, расходов) НЕ дает XP повторно.
   - Проверка, что удаление и повторное добавление статьи НЕ начисляет XP заново.
   - Доказательство: разница в сумме зарплаты (1 млн vs 100 млн) дает одинаковые 50 XP.
5. **`tests/auth.test.ts`**:
   - Валидация подписи Telegram `initData` по алгоритму HMAC-SHA256 с токеном бота.
   - Отклонение поддельных или искаженных данных.

---

## 🤖 Подключение к Telegram через @BotFather

### Шаг 1. Создание бота
1. Откройте Telegram и перейдите к официальному боту **[@BotFather](https://t.me/BotFather)**.
2. Отправьте команду: `/newbot`.
3. Укажите имя (например, `ФинУровень`) и юзернейм (например, `finuroven_game_bot`).
4. Скопируйте полученный API токен вида: `7123456789:AAFxxyyzz...`.

### Шаг 2. Создание Mini App
1. В `@BotFather` отправьте команду: `/newapp`.
2. Выберите вашего созданного бота.
3. Введите название и описание игры.
4. Отправьте иконку (640x360 px).
5. На шаге ввода URL укажите ваш HTTPS-адрес (см. Шаг 3).

### Шаг 3. Локальный проброс HTTPS (для смартфона)
Telegram требует защищенный HTTPS-протокол для открытия WebApp:

```powershell
# Вариант 1 (Localtunnel — без регистрации):
npx localtunnel --port 3000

# Вариант 2 (Cloudflare Tunnel):
cloudflared tunnel --url http://localhost:3000

# Вариант 3 (ngrok):
ngrok http 3000
```
Скопируйте полученный URL (например `https://your-domain.loca.lt`) и укажите его в `@BotFather` как URL приложения.

### Шаг 4. Настройка постоянной кнопки меню (Menu Button)
В диалоге с `@BotFather`:
1. Отправьте команду: `/setmenubutton`.
2. Выберите вашего бота.
3. Введите URL: `https://your-domain.loca.lt`.
4. Введите текст кнопки: `📱 ФинУровень`.

Теперь в чате с ботом в левом нижнем углу появится кнопка для запуска игры в 1 клик!

---

## ⚙️ Переменные окружения (.env)

В файле `backend/.env`:
```env
# URL базы данных SQLite (по умолчанию файл в папке backend/dev.db)
DATABASE_URL="file:./dev.db"

# Токен вашего бота от @BotFather
BOT_TOKEN="7123456789:AAFxxyyzz..."

# Порт бэкенда
PORT=3001

# Окружение (development / production)
NODE_ENV=development

# URL фронтенда
WEBAPP_URL="http://localhost:3000"
```

---

## ☁️ Развертывание (Деплой)

### Вариант: Vercel (Frontend) + Render / Railway (Backend)

1. **Backend (Render / Railway / VPS):**
   - Укажите переменные `DATABASE_URL` (можно SQLite на Persistent Disk или PostgreSQL) и `BOT_TOKEN`.
   - Команда сборки: `npm install && npx prisma generate && npx prisma db push && npx tsx prisma/seed.ts && npm run build`.
   - Команда запуска: `npm start`.

2. **Frontend (Vercel):**
   - Корневая папка: `frontend`.
   - Build Command: `npm run build`.
   - Output Directory: `dist`.
   - В настройках проекта задайте `VITE_API_BASE_URL` на URL вашего бэкенда.

---

## 📁 Структура проекта

```
onpul/
├── content/
│   └── daily_quizzes.json    # 60 подробных квизов на русском языке
├── src/
│   └── config/
│       └── xp.ts             # Единый конфиг XP, уровней 1..80, званий и стриков
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma     # Модели User, FinanceItem, Quiz, QuizAttempt, XpEvent, Achievement
│   │   └── seed.ts           # Загрузка 60 квизов в SQLite
│   ├── src/
│   │   ├── middleware/       # HMAC-SHA256 валидация initData Telegram
│   │   ├── routes/           # /auth, /me, /finance, /quiz/today, /history, /achievements
│   │   ├── services/         # xpService, streakService, quizService, financeService
│   │   ├── bot.ts            # Установка Menu Button в Telegram API
│   │   └── index.ts          # Сервер Express
│   └── tests/                # 24 юнит-теста Vitest (все 5 обязательных блоков)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Onboarding/   # Приветствие с дисклеймером, аватары, личные данные
│   │   │   ├── Home/         # Главная вкладка, аватар 1..80, задание дня, подсказки
│   │   │   ├── Finance/      # Мои финансы: доходы, постоянные, ежедневные, вклады, кредиты, сводка
│   │   │   ├── Profile/      # Профиль, статы, архив квизов, бейджи, настройки
│   │   │   ├── DailyQuiz/    # Пошаговый квиз дня с мгновенным пояснением
│   │   │   ├── AvatarDisplay # Интерактивный аватар с эволюцией (8 стадий)
│   │   │   └── LevelUpModal  # Полноэкранный салют конфетти и виброотклик
│   │   ├── hooks/            # useTelegram (HapticFeedback, BackButton, MainButton, темы)
│   │   ├── services/         # API-клиент с заголовком initData
│   │   ├── App.tsx           # Корневой компонент с навигацией по 3 вкладкам
│   │   └── index.css         # Telegram темы (--tg-theme-*)
│   └── vite.config.ts
├── start_finuroven.bat       # 1-клик запуск на Windows
└── README.md                 # Документация проекта
```
