#!/usr/bin/env python3
"""
🤖 OnPul by NIYAT — Telegram Bot Gateway (Aiogram 3.x)
Быстрый ввод расходов/доходов текстом, реферальная система и запуск Mini App.
Интегрирован с локальным сервером и базой данных transactions.json.
"""

import asyncio
import json
import logging
import os
import re
import sys
import time
from datetime import datetime
from dotenv import load_dotenv

# Загрузка переменных окружения
load_dotenv()

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Настройки бота
BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN") or os.environ.get("BOT_TOKEN") or "YOUR_BOT_TOKEN_HERE"
WEBAPP_URL = os.environ.get("WEBAPP_URL", "http://localhost:8080/app")

# Пути к данным
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
TRANSACTIONS_FILE = os.path.join(DATA_DIR, "transactions.json")
USERS_FILE = os.path.join(DATA_DIR, "users.json")

os.makedirs(DATA_DIR, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S"
)

# Проверка токена перед импортом и запуском
if not BOT_TOKEN or BOT_TOKEN == "YOUR_BOT_TOKEN_HERE":
    print("=" * 70)
    print("⚠️  ВНИМАНИЕ: TELEGRAM BOT TOKEN НЕ УСТАНОВЛЕН!")
    print("=" * 70)
    print("Чтобы запустить реального Telegram-бота:")
    print("1. Откройте Telegram и найдите официального бота @BotFather")
    print("2. Отправьте команду /newbot и задайте имя и юзернейм (например, OnPulBot)")
    print("3. Скопируйте полученный токен (вида 7123456789:AAFxxx...)")
    print("4. Добавьте его в файл .env в этой папке:")
    print("   BOT_TOKEN=ВАШ_ТОКЕН")
    print("   (или передайте в командной строке: python bot.py --token ВАШ_ТОКЕН)")
    print("=" * 70)
    print("💡 Вы также можете полноценно тестировать бот и Mini App БЕЗ токена")
    print("   в нашем Telegram Эмуляторе: http://localhost:8080/")
    print("=" * 70)
    
    # Проверяем аргументы командной строки
    if "--token" in sys.argv:
        idx = sys.argv.index("--token")
        if idx + 1 < len(sys.argv):
            BOT_TOKEN = sys.argv[idx + 1]
            print(f"✅ Токен принят из аргументов командной строки.")
    else:
        # Даем возможность ввести токен прямо в консоли
        try:
            user_input = input("👉 Введите токен сейчас (или нажмите Enter для выхода в тестовый режим): ").strip()
            if user_input and ":" in user_input:
                BOT_TOKEN = user_input
                # Сохраняем в .env для удобства
                with open(os.path.join(BASE_DIR, ".env"), "a", encoding="utf-8") as env_f:
                    env_f.write(f"\nBOT_TOKEN={BOT_TOKEN}\n")
                print("✅ Токен сохранен в .env!")
            else:
                print("ℹ️ Запуск в режиме ожидания токена завершен. Откройте эмулятор: http://localhost:8080/")
                sys.exit(0)
        except (KeyboardInterrupt, EOFError):
            sys.exit(0)

from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import CommandStart, Command
from aiogram.types import WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton, MenuButtonWebApp

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()


def save_transaction_to_db(tx_data: dict):
    """Синхронизация транзакции с локальной базой server.py"""
    try:
        txs = []
        if os.path.exists(TRANSACTIONS_FILE):
            with open(TRANSACTIONS_FILE, "r", encoding="utf-8") as f:
                txs = json.load(f)
        txs.insert(0, tx_data)
        with open(TRANSACTIONS_FILE, "w", encoding="utf-8") as f:
            json.dump(txs, f, ensure_ascii=False, indent=2)
    except Exception as e:
        logging.error(f"Ошибка сохранения транзакции: {e}")


@dp.message(CommandStart())
async def cmd_start(message: types.Message):
    """Обработка команды /start с поддержкой реферальных ссылок вида /start ref_123456"""
    args = message.text.split(maxsplit=1)
    ref_code = None
    if len(args) > 1 and args[1].startswith("ref_"):
        ref_code = args[1].replace("ref_", "")
        logging.info(f"Новый пользователь пришел по реферальному коду: {ref_code}")

    welcome_text = (
        f"👋 **Ассалому алейкум, {message.from_user.first_name}!**\n\n"
        f"Добро пожаловать в **OnPul by NIYAT** — ваш личный финансовый помощник и трекер капитала в Узбекистане!\n\n"
        f"🎮 **Что вас ждет:**\n"
        f"• ⚡ **Учет расходов за 2 секунды** прямо из этого чата (бензин, продукты, учеба, рассрочки)\n"
        f"• 🎯 **Накопления на цели:** Автомобиль, Квартира, Путешествия\n"
        f"• 📈 **Каталог вкладов банков Узбекистана** (до 24% годовых) и халяльных инвестиций (IMAN, Mayad)\n"
        f"• 🏆 **Прокачка финансового уровня (Mehnatkash ➔ Usta ➔ Sarmoyador)** и ежедневные квизы!\n\n"
        f"💡 *Попробуйте записать расход прямо сейчас:* напишите, например:\n"
        f"`бензин 150000` или `обед 45к`"
    )

    if ref_code:
        welcome_text += "\n\n🎁 **Вам начислен велкам-бонус за регистрацию по приглашению: +150 XP!**"

    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🚀 Открыть OnPul Mini App", web_app=WebAppInfo(url=WEBAPP_URL))],
        [InlineKeyboardButton(text="👥 Пригласить друга (+200 XP)", switch_inline_query="Веду личный бюджет в OnPul! Присоединяйся:")]
    ])

    await message.answer(welcome_text, reply_markup=kb, parse_mode="Markdown")

    # Установка постоянной кнопки меню
    try:
        await bot.set_chat_menu_button(
            chat_id=message.chat.id,
            menu_button=MenuButtonWebApp(text="📱 OnPul App", web_app=WebAppInfo(url=WEBAPP_URL))
        )
    except Exception as e:
        logging.warning(f"Не удалось установить кнопку меню (нормально при локальном URL): {e}")


@dp.message(Command("help"))
async def cmd_help(message: types.Message):
    help_text = (
        "📖 **Как пользоваться OnPul by NIYAT:**\n\n"
        "1. **Запись расходов в чате:**\n"
        "   Просто отправьте сообщение, например:\n"
        "   • `бензин 180000`\n"
        "   • `продукты 120к`\n"
        "   • `такси 25000`\n"
        "   • `зарплата 18млн`\n\n"
        "2. **Кнопка '📱 OnPul App' слева от поля ввода:**\n"
        "   Открывает полноценное приложение с аналитикой, целями и каталогом депозитов.\n\n"
        "3. **Уровни и опыт (XP):**\n"
        "   За каждую запись вы получаете +10 XP. За прохождение квизов — до +25 XP!"
    )
    await message.answer(help_text, parse_mode="Markdown")


@dp.message(F.text)
async def handle_quick_expense(message: types.Message):
    """
    Быстрый парсер транзакций из чата:
    Примеры:
    - бензин 150000
    - такси 35к
    - обед 45000
    - зарплата 15000000
    """
    text = message.text.strip().lower()

    # Поиск шаблона: Категория + Число + Суффикс (к, k, млн)
    match = re.search(r"([а-яa-z\s]+?)\s*(\d+[\d\s]*)(к|k|млн)?$", text)
    if not match:
        await message.answer(
            "ℹ️ Чтобы быстро записать расход, отправьте категорию и сумму.\n"
            "Например: `бензин 180000` или `обед 45к`.\n\n"
            "Или откройте приложение по кнопке ниже:",
            reply_markup=InlineKeyboardMarkup(inline_keyboard=[
                [InlineKeyboardButton(text="📱 Открыть OnPul", web_app=WebAppInfo(url=WEBAPP_URL))]
            ]),
            parse_mode="Markdown"
        )
        return

    category_raw = match.group(1).strip().capitalize()
    amount_digits = int(re.sub(r"\s+", "", match.group(2)))
    multiplier = match.group(3)

    if multiplier in ["к", "k"]:
        amount = amount_digits * 1000
    elif multiplier == "млн":
        amount = amount_digits * 1000000
    else:
        amount = amount_digits

    # Определение типа
    is_income = any(w in category_raw.lower() for w in ["зарплата", "доход", "аванс", "бонус", "приход"])
    tx_type = "Доход" if is_income else "Расход"

    emoji = "💵"
    if not is_income:
        if "бензин" in category_raw.lower():
            emoji = "⛽"
        elif any(w in category_raw.lower() for w in ["хлеб", "продукт", "корзинка", "макро"]):
            emoji = "🍞"
        elif "такси" in category_raw.lower():
            emoji = "🚕"
        elif any(w in category_raw.lower() for w in ["обед", "еда", "кафе"]):
            emoji = "🍽️"
        elif any(w in category_raw.lower() for w in ["кредит", "рассрочка", "nasiya"]):
            emoji = "💳"
        elif any(w in category_raw.lower() for w in ["курс", "учеба", "книга"]):
            emoji = "🎓"

    # Сохраняем в локальную базу данных server.py
    tx_record = {
        "id": int(time.time() * 1000),
        "nature": "PERM" if any(w in category_raw.lower() for w in ["кредит", "продукт", "аренда"]) else "SUDDEN",
        "category": f"{emoji} {category_raw}",
        "amount": amount,
        "note": f"Через Telegram (@{message.from_user.username or message.from_user.first_name})",
        "time": datetime.now().strftime("%d %b, %H:%M"),
        "user_id": message.from_user.id
    }
    save_transaction_to_db(tx_record)

    response = (
        f"✅ **{tx_type} успешно учтен в OnPul!**\n"
        f"{emoji} **{category_raw}**: `{amount:,.0f} UZS`\n"
        f"⚡ **+10 XP начислено!** Прогресс обновлен.\n\n"
        f"📊 *Данные синхронизированы с вашим приложением.*"
    )

    kb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="📊 Посмотреть в приложении", web_app=WebAppInfo(url=WEBAPP_URL))]
    ])

    await message.answer(response, reply_markup=kb, parse_mode="Markdown")


async def main():
    bot_info = await bot.get_me()
    print("=" * 64)
    print(f"🤖 Телеграм бот успешно запущен: @{bot_info.username} ({bot_info.first_name})")
    print(f"🔗 Mini App URL: {WEBAPP_URL}")
    print("=" * 64)
    await dp.start_polling(bot)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n🛑 Остановка бота OnPul...")
