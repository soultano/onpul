#!/usr/bin/env python3
"""
🚀 OnPul by NIYAT — Local Server & API Gateway
Запускает локальный сервер для Telegram Mini App, эмулятора и REST API.
Порт: 8080 (http://localhost:8080)
"""

import http.server
import json
import os
import socketserver
import sys
import time
import urllib.parse
from datetime import datetime

PORT = int(os.environ.get("PORT", 8080))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
TRANSACTIONS_FILE = os.path.join(DATA_DIR, "transactions.json")
USERS_FILE = os.path.join(DATA_DIR, "users.json")

# Гарантируем наличие папки для данных
os.makedirs(DATA_DIR, exist_ok=True)

# Инициализация тестовых данных, если файлов нет
if not os.path.exists(TRANSACTIONS_FILE):
    initial_transactions = [
        {"id": 1, "nature": "PERM", "category": "⛽ Бензин", "amount": 250000, "note": "Лукойл АИ-92", "time": "Сегодня, 14:15", "user_id": 77712345},
        {"id": 2, "nature": "PERM", "category": "🍞 Продукты", "amount": 180000, "note": "Корзинка маркет", "time": "Сегодня, 11:20", "user_id": 77712345},
        {"id": 3, "nature": "SUDDEN", "category": "🚕 Такси", "amount": 45000, "note": "Яндекс Такси", "time": "Вчера", "user_id": 77712345},
        {"id": 4, "nature": "PERM", "category": "💳 Рассрочка", "amount": 850000, "note": "Uzum Nasiya", "time": "12 сент", "user_id": 77712345},
        {"id": 5, "nature": "PERM", "category": "🎓 Обучение", "amount": 600000, "note": "Курсы языка", "time": "10 сент", "user_id": 77712345}
    ]
    with open(TRANSACTIONS_FILE, "w", encoding="utf-8") as f:
        json.dump(initial_transactions, f, ensure_ascii=False, indent=2)

if not os.path.exists(USERS_FILE):
    initial_users = {
        "77712345": {
            "id": 77712345,
            "name": "Нодирбек",
            "username": "nodir_invest",
            "avatar": "🦁",
            "salary": 18000000,
            "xp": 240,
            "level": 1,
            "level_name": "Mehnatkash",
            "invited_count": 3,
            "joined_at": "2026-09-01T10:00:00"
        }
    }
    with open(USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(initial_users, f, ensure_ascii=False, indent=2)


class OnPulRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Кастомный обработчик запросов с поддержкой REST API и CORS"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        # CORS заголовки для безопасной интеграции с Telegram WebApp
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200, "OK")
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        # Роуты API
        if path == "/api/health":
            self.send_json_response({
                "status": "online",
                "service": "OnPul by NIYAT Local Server",
                "version": "2.1.0",
                "uptime_timestamp": int(time.time()),
                "port": PORT
            })
            return

        if path == "/api/transactions":
            try:
                with open(TRANSACTIONS_FILE, "r", encoding="utf-8") as f:
                    txs = json.load(f)
                self.send_json_response({"success": True, "transactions": txs})
            except Exception as e:
                self.send_json_response({"success": False, "error": str(e)}, status=500)
            return

        if path == "/api/stats":
            try:
                with open(TRANSACTIONS_FILE, "r", encoding="utf-8") as f:
                    txs = json.load(f)
                with open(USERS_FILE, "r", encoding="utf-8") as f:
                    users = json.load(f)
                
                total_spent = sum(t.get("amount", 0) for t in txs)
                self.send_json_response({
                    "success": True,
                    "total_users": len(users),
                    "total_transactions": len(txs),
                    "total_volume_uzs": total_spent,
                    "avg_spent": total_spent // max(1, len(txs)),
                    "active_levels": {
                        "Mehnatkash": len([u for u in users.values() if u.get("level") == 1]),
                        "Usta": len([u for u in users.values() if u.get("level") == 2]),
                        "Sarmoyador": len([u for u in users.values() if u.get("level") >= 3])
                    }
                })
            except Exception as e:
                self.send_json_response({"success": False, "error": str(e)}, status=500)
            return

        # Удобные шорткаты в браузере
        if path in ["/", "/emulator", "/tg"]:
            self.path = "/telegram_emulator.html"
        elif path == "/app":
            self.path = "/index.html"
        elif path == "/admin":
            self.path = "/admin.html"

        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"

        try:
            body = json.loads(post_data) if post_data else {}
        except Exception:
            body = {}

        if path == "/api/transactions":
            # Добавление новой транзакции
            amount = int(body.get("amount", 0))
            category = body.get("category", "Другое")
            nature = body.get("nature", "PERM" if "Кредит" in category or "Продукты" in category else "SUDDEN")
            note = body.get("note", "Через приложение")
            user_id = body.get("user_id", 77712345)

            new_tx = {
                "id": int(time.time() * 1000),
                "nature": nature,
                "category": category,
                "amount": amount,
                "note": note,
                "time": datetime.now().strftime("%d %b, %H:%M"),
                "user_id": user_id
            }

            try:
                with open(TRANSACTIONS_FILE, "r", encoding="utf-8") as f:
                    txs = json.load(f)
                txs.insert(0, new_tx)
                with open(TRANSACTIONS_FILE, "w", encoding="utf-8") as f:
                    json.dump(txs, f, ensure_ascii=False, indent=2)

                # Начисление XP пользователю
                xp_earned = 10
                self.send_json_response({
                    "success": True,
                    "transaction": new_tx,
                    "xp_earned": xp_earned,
                    "message": f"Транзакция на {amount:,} UZS записана! (+{xp_earned} XP)"
                })
            except Exception as e:
                self.send_json_response({"success": False, "error": str(e)}, status=500)
            return

        if path == "/api/quiz-answer":
            # Ответ на финансовый квиз
            question_id = body.get("question_id")
            answer_idx = body.get("answer_idx")
            correct = body.get("correct", False)

            xp_earned = 25 if correct else 5
            advice = (
                "💡 Рекомендация NIYAT: Направьте 15% свободного остатка в партнерский пул IMAN (24% годовых) или вклады Kapitalbank для создания пассивного капитала."
                if correct else
                "💡 Совет NIYAT: Обратите внимание на оптимизацию спонтанных покупок. Сохранение даже 10% дохода формирует финансовую безопасность."
            )

            self.send_json_response({
                "success": True,
                "correct": correct,
                "xp_earned": xp_earned,
                "ai_advice": advice
            })
            return

        # Если эндпоинт не найден
        self.send_json_response({"error": "Not Found"}, status=404)

    def send_json_response(self, data, status=200):
        response_bytes = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(response_bytes)))
        self.end_headers()
        self.wfile.write(response_bytes)

    def log_message(self, format, *args):
        # Аккуратный вывод в консоль
        sys.stdout.write(f"[{datetime.now().strftime('%H:%M:%S')}] {args[0]} {args[1]} -> {args[2]}\n")
        sys.stdout.flush()


if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass


def run_server():
    server_address = ("", PORT)
    with socketserver.ThreadingTCPServer(server_address, OnPulRequestHandler) as httpd:
        httpd.allow_reuse_address = True
        print("=" * 64)
        print("   [ONPUL BY NIYAT] - LOCAL SERVER STARTED")
        print("=" * 64)
        print(f"   * Telegram Emulator:   http://localhost:{PORT}/")
        print(f"   * Mini App Direct:     http://localhost:{PORT}/app")
        print(f"   * Admin Dashboard:     http://localhost:{PORT}/admin")
        print(f"   * REST API Health:     http://localhost:{PORT}/api/health")
        print("=" * 64)
        print("   Press Ctrl + C to stop server.\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[STOP] Stopping OnPul server...")
            httpd.shutdown()


if __name__ == "__main__":
    run_server()
