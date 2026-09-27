@echo off
chcp 65001 >nul
title OnPul by NIYAT - Telegram Simulator & Server Launcher
color 0A

echo ====================================================================
echo             🌟 ONPUL BY NIYAT — СЕРВЕР И ЭМУЛЯТОР TELEGRAM 🌟
echo ====================================================================
echo.

:: 1. Проверка наличия Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ОШИБКА] Python не найден в системе PATH!
    echo Установите Python с официального сайта: https://www.python.org/
    echo.
    pause
    exit /b 1
)

echo [1/3] Проверка Python: УСПЕШНО.
echo [2/3] Запуск локального сервера OnPul на порту 8080...

:: 2. Запуск локального сервера в отдельном окне
start "OnPul Local Server [Port 8080]" python server.py

:: 3. Небольшая пауза для инициализации сервера
timeout /t 2 /nobreak >nul

echo [3/3] Открытие Telegram Эмулятора в браузере...
start http://localhost:8080/

echo.
echo ====================================================================
echo ✅ ЭМУЛЯТОР И СЕРВЕР УСПЕШНО ЗАПУЩЕНЫ!
echo ====================================================================
echo.
echo 📱 Эмулятор Telegram:    http://localhost:8080/
echo 🎮 Mini App напрямую:    http://localhost:8080/app
echo 📊 Админ-панель:         http://localhost:8080/admin
echo.
echo 💡 Чтобы запустить реального Telegram-бота:
echo    1. Укажите BOT_TOKEN в файле .env
echo    2. Запустите в новом терминале: python bot.py
echo.
echo Для завершения закройте окно сервера или нажмите любую клавишу.
echo ====================================================================
pause
