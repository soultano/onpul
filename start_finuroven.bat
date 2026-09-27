@echo off
chcp 65001 >nul
title ФинУровень - Запуск Telegram Mini App
color 0A

echo ====================================================================
echo         🌟 ФИНУРОВЕНЬ — ЗАПУСК TELEGRAM MINI APP (REACT + NODE)
echo ====================================================================
echo.

:: 1. Проверка Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ОШИБКА] Node.js не найден в системе PATH!
    echo Установите Node.js: https://nodejs.org/
    pause
    exit /b 1
)

echo [1/3] Запуск Backend сервера (Express + Prisma SQLite на порту 3001)...
start "ФинУровень - Backend [3001]" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo [2/3] Запуск Frontend приложения (Vite + React на порту 3000)...
start "ФинУровень - Frontend [3000]" cmd /k "cd frontend && npm run dev"

timeout /t 2 /nobreak >nul

echo [3/3] Открытие приложения в браузере...
start http://localhost:3000/

echo.
echo ====================================================================
echo ✅ ПРИЛОЖЕНИЕ УСПЕШНО ЗАПУЩЕНО!
echo ====================================================================
echo.
echo 📱 Frontend (Mini App):  http://localhost:3000/
echo ⚡ Backend API:          http://localhost:3001/health
echo.
echo 💡 Для подключения к Telegram на телефоне:
echo    1. Запустите в новом окне: npx localtunnel --port 3000
echo    2. Скопируйте HTTPS-ссылку
echo    3. Пропишите ссылку в @BotFather: /newapp или /setmenubutton
echo.
echo Нажмите любую клавишу для закрытия этого окна (серверы останутся работать).
echo ====================================================================
pause
