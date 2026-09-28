"""
==============================================================================
  سيرفر البوت والمتجر الموحد - متجر حسين أثير (Bot & WebApp Backend Server)
==============================================================================
  - يعمل بدون الحاجة لتثبيت أي مكاتب معقدة (يعتمد فقط على requests و sqlite3 و http.server).
  - يربط رصيد المستخدم الفعلي بين البوت والمتجر عبر قاعدة بيانات SQLite مشتركة.
  - يرسل إشعارات فورية للآدمن عند كل طلب رشق أو طلب شحن مع إمكانية القبول والرفض.
  - أوامر الآدمن:
      /add <user_id> <amount>   -> إضافة رصيد للمستخدم
      /set <user_id> <amount>   -> تعيين رصيد محدد للمستخدم
      /users                    -> عرض قائمة المستخدمين والأرصدة
==============================================================================
"""

import os
import sys
import json
import time
import sqlite3
import threading
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler
import requests

# ============================================================================
# 1. إعدادات البوت والآدمن (قم بوضع التوكن والآيدي الخاص بك هنا)
# ============================================================================
BOT_TOKEN = "ضع_توكن_البوت_هنا_من_BotFather"
ADMIN_ID = 0  # ضع معرف الآدمن (Telegram ID) الخاص بك هنا لاستلام الإشعارات

WEBAPP_URL = "http://localhost:8080"  # أو رابط موقعك المنشور (مثلاً على Vercel أو Cloudflare)
SERVER_PORT = 8080
DB_FILE = os.path.join(os.path.dirname(__file__), "store_database.db")


# ============================================================================
# 2. إدارة قاعدة البيانات (SQLite Database Manager)
# ============================================================================
def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    # جدول المستخدمين والأرصدة
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY,
            username TEXT,
            first_name TEXT,
            balance REAL DEFAULT 3.00,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    # جدول الطلبات
    c.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY,
            user_id INTEGER,
            service_name TEXT,
            target TEXT,
            qty INTEGER,
            cost REAL,
            status TEXT DEFAULT 'قيد الانتظار',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    # جدول طلبات الشحن
    c.execute('''
        CREATE TABLE IF NOT EXISTS recharges (
            id INTEGER PRIMARY KEY,
            user_id INTEGER,
            method TEXT,
            code TEXT,
            amount REAL,
            status TEXT DEFAULT 'قيد التدقيق',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()
    print("[DB] Database initialized successfully.")

def get_or_create_user(user_id, username="", first_name=""):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT user_id, username, first_name, balance FROM users WHERE user_id = ?", (user_id,))
    row = c.fetchone()
    if row:
        # تحديث الاسم أو اليوزر إن تغير
        if username or first_name:
            c.execute("UPDATE users SET username = ?, first_name = ? WHERE user_id = ?", (username, first_name, user_id))
            conn.commit()
        user = {"user_id": row[0], "username": row[1], "first_name": row[2], "balance": row[3]}
    else:
        initial_balance = 3.00  # هدية ترحيبية 3$ لكل مستخدم جديد
        c.execute("INSERT INTO users (user_id, username, first_name, balance) VALUES (?, ?, ?, ?)",
                  (user_id, username, first_name, initial_balance))
        conn.commit()
        user = {"user_id": user_id, "username": username, "first_name": first_name, "balance": initial_balance}
    conn.close()
    return user

def update_user_balance(user_id, delta):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("UPDATE users SET balance = MAX(0, ROUND(balance + ?, 2)) WHERE user_id = ?", (delta, user_id))
    conn.commit()
    c.execute("SELECT balance FROM users WHERE user_id = ?", (user_id,))
    row = c.fetchone()
    conn.close()
    return row[0] if row else 0.0

def set_user_balance(user_id, new_balance):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("UPDATE users SET balance = ? WHERE user_id = ?", (round(float(new_balance), 2), user_id))
    conn.commit()
    conn.close()

def save_order(user_id, order_id, service_name, target, qty, cost):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("INSERT INTO orders (id, user_id, service_name, target, qty, cost) VALUES (?, ?, ?, ?, ?, ?)",
              (order_id, user_id, service_name, target, qty, cost))
    conn.commit()
    conn.close()

def save_recharge(ref_id, user_id, method, code, amount):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("INSERT INTO recharges (id, user_id, method, code, amount) VALUES (?, ?, ?, ?, ?)",
              (ref_id, user_id, method, code, amount))
    conn.commit()
    conn.close()

def get_user_orders(user_id):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute("SELECT id, service_name, target, qty, cost, status, created_at FROM orders WHERE user_id = ? ORDER BY id DESC", (user_id,))
    rows = c.fetchall()
    conn.close()
    return [
        {"id": r[0], "service": r[1], "target": r[2], "qty": r[3], "cost": r[4], "status": r[5], "date": r[6]}
        for r in rows
    ]


# ============================================================================
# 3. واجهة تليجرام البرمجية (Telegram Bot API Client)
# ============================================================================
def telegram_api(method, data=None):
    if not BOT_TOKEN or "ضع_توكن" in BOT_TOKEN:
        return None
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/{method}"
    try:
        r = requests.post(url, json=data, timeout=10)
        return r.json()
    except Exception as e:
        print(f"[Telegram API Error] {method}:", e)
        return None

def send_message(chat_id, text, reply_markup=None):
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML"
    }
    if reply_markup:
        payload["reply_markup"] = reply_markup
    return telegram_api("sendMessage", payload)

def notify_admin(text, reply_markup=None):
    if ADMIN_ID and ADMIN_ID != 0:
        send_message(ADMIN_ID, text, reply_markup)


# ============================================================================
# 4. خادم الويب المدمج لخدمة التطبيق وAPI (Combined Web & API Server)
# ============================================================================
class StoreAPIHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # تفعيل CORS والسماح بطلبات تليجرام
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)

        # مسار جلب رصيد وبيانات المستخدم: /api/user?id=123456
        if parsed.path == '/api/user':
            user_id = params.get('id', [None])[0]
            if user_id:
                try:
                    uid = int(user_id)
                    user = get_or_create_user(uid)
                    orders = get_user_orders(uid)
                    response_data = {
                        "success": True,
                        "user_id": uid,
                        "balance": user["balance"],
                        "orders": orders
                    }
                except Exception as e:
                    response_data = {"success": False, "error": str(e)}
            else:
                response_data = {"success": False, "error": "Missing user id"}

            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode('utf-8'))
            return

        # تقديم ملفات المتجر العادية (index.html, css, js)
        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8')

        try:
            data = json.loads(body)
        except Exception:
            data = {}

        # 1. إرسال طلب جديد من المتجر: /api/order
        if parsed.path == '/api/order':
            user_id = int(data.get('user_id', 0))
            service_name = data.get('service_name', '')
            target = data.get('target', '')
            qty = int(data.get('qty', 0))
            cost = float(data.get('cost', 0))
            order_id = int(data.get('order_id', 0))

            user = get_or_create_user(user_id)
            if user["balance"] < cost:
                res = {"success": False, "message": "❌ رصيدك غير كافٍ في البوت!"}
            else:
                new_bal = update_user_balance(user_id, -cost)
                save_order(user_id, order_id, service_name, target, qty, cost)

                # إشعار الآدمن في تليجرام فوراً
                admin_msg = (
                    f"🚀 <b>طلب رشق جديد من المتجر!</b>\n\n"
                    f"🔢 <b>رقم الطلب:</b> <code>#{order_id}</code>\n"
                    f"👤 <b>المستخدم:</b> <code>{user_id}</code> (@{user.get('username', '-')})\n"
                    f"📦 <b>الخدمة:</b> {service_name}\n"
                    f"🔗 <b>الرابط:</b> {target}\n"
                    f"📊 <b>الكمية:</b> {qty}\n"
                    f"💰 <b>التكلفة:</b> ${cost:.2f}\n"
                    f"💵 <b>رصيد العميل المتبقي:</b> ${new_bal:.2f}"
                )
                notify_admin(admin_msg)

                # إشعار المستخدم في محادثة البوت
                user_msg = (
                    f"✅ <b>تم استلام طلبك بنجاح من المتجر!</b>\n"
                    f"📦 الخدمة: {service_name}\n"
                    f"🔢 رقم الطلب: <code>#{order_id}</code>\n"
                    f"💰 التكلفة: ${cost:.2f} | رصيدك المتبقي: ${new_bal:.2f}"
                )
                send_message(user_id, user_msg)

                res = {"success": True, "balance": new_bal, "message": "تم خصم الرصيد وتنفيذ الطلب بنجاح!"}

            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps(res, ensure_ascii=False).encode('utf-8'))
            return

        # 2. إرسال طلب شحن رصيد من المتجر: /api/recharge
        if parsed.path == '/api/recharge':
            user_id = int(data.get('user_id', 0))
            method = data.get('method', '')
            code = data.get('code', '')
            amount = float(data.get('amount', 0))
            ref_id = int(data.get('ref_id', 0))

            user = get_or_create_user(user_id)
            save_recharge(ref_id, user_id, method, code, amount)

            # إشعار الآدمن مع أزرار الموافقة والرفض
            admin_msg = (
                f"💳 <b>طلب شحن رصيد جديد!</b>\n\n"
                f"🧾 <b>رقم المعاملة:</b> <code>#{ref_id}</code>\n"
                f"👤 <b>العميل:</b> <code>{user_id}</code> (@{user.get('username', '-')})\n"
                f"🏦 <b>طريقة الدفع:</b> {method}\n"
                f"🔑 <b>الكود / رقم العملية:</b> <code>{code}</code>\n"
                f"💵 <b>المبلغ:</b> ${amount:.2f}\n\n"
                f"💡 <i>لشحن رصيده اكتب:</i>\n<code>/add {user_id} {amount}</code>"
            )
            notify_admin(admin_msg)

            res = {"success": True, "message": "تم إرسال طلب الشحن للآدمن للمراجعة!"}
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps(res, ensure_ascii=False).encode('utf-8'))
            return

        self.send_response(404)
        self.end_headers()


def run_web_server():
    os.chdir(os.path.dirname(__file__))
    server = HTTPServer(('0.0.0.0', SERVER_PORT), StoreAPIHandler)
    print(f"[Web Server] Running at http://localhost:{SERVER_PORT}")
    server.serve_forever()


# ============================================================================
# 5. معالج رسائل وأوامر بوت تليجرام (Telegram Bot Long Polling)
# ============================================================================
def handle_bot_message(message):
    chat_id = message.get("chat", {}).get("id")
    user = message.get("from", {})
    user_id = user.get("id")
    username = user.get("username", "")
    first_name = user.get("first_name", "مستخدم")
    text = message.get("text", "").strip()

    # فحص البيانات المرسلة من WebApp مباشرة (sendData)
    web_app_data = message.get("web_app_data")
    if web_app_data:
        try:
            payload = json.loads(web_app_data.get("data", "{}"))
            send_message(chat_id, f"📥 <b>تم استلام بيانات من المتجر بنجاح!</b>\n<code>{json.dumps(payload, ensure_ascii=False, indent=2)}</code>")
        except Exception:
            pass
        return

    # تسجيل المستخدم وجلب رصيده
    db_user = get_or_create_user(user_id, username, first_name)
    balance = db_user["balance"]

    # 1. أمر البداية /start
    if text.startswith("/start"):
        keyboard = {
            "keyboard": [
                [
                    {
                        "text": "⚡ فتح متجر حسين أثير",
                        "web_app": {"url": f"{WEBAPP_URL}?user_id={user_id}&balance={balance}"}
                    }
                ],
                [
                    {"text": "💰 رصيدي الحالي"},
                    {"text": "📞 الدعم الفني"}
                ]
            ],
            "resize_keyboard": True
        }

        msg = (
            f"🎉 <b>أهلاً بك يا {first_name} في متجر حسين أثير!</b>\n\n"
            f"💵 <b>رصيدك الحالي:</b> <code>${balance:.2f}</code>\n"
            f"🆔 <b>معرفك (ID):</b> <code>{user_id}</code>\n\n"
            f"اضغط على زر <b>⚡ فتح متجر حسين أثير</b> بالأسفل لتصفح كافة خدمات الرشق والتمويل وشحن حسابك فوراً!"
        )
        send_message(chat_id, msg, keyboard)
        return

    # 2. زر رصيدي الحالي
    if text == "💰 رصيدي الحالي":
        db_user = get_or_create_user(user_id)
        send_message(chat_id, f"💵 رصيدك الحالي في المتجر هو: <b>${db_user['balance']:.2f}</b>")
        return

    # 3. زر الدعم الفني
    if text == "📞 الدعم الفني":
        send_message(chat_id, "👨‍💻 للتواصل المباشر مع صاحب المتجر والدعم الفني:\n👉 @hussein_toxin")
        return

    # 4. أوامر الآدمن لإدارة الأرصدة
    if user_id == ADMIN_ID or ADMIN_ID == 0:
        # إضافة رصيد: /add 123456 10
        if text.startswith("/add"):
            parts = text.split()
            if len(parts) == 3:
                try:
                    target_uid = int(parts[1])
                    amount = float(parts[2])
                    new_bal = update_user_balance(target_uid, amount)
                    send_message(chat_id, f"✅ تمت إضافة <b>${amount:.2f}</b> للمستخدم <code>{target_uid}</code>.\nرصيده الجديد: <b>${new_bal:.2f}</b>")
                    # إشعار العميل
                    send_message(target_uid, f"🎁 <b>مبروك! تمت إضافة ${amount:.2f} إلى رصيدك.</b>\nرصيدك الحالي: <b>${new_bal:.2f}</b>")
                except Exception as e:
                    send_message(chat_id, f"❌ خطأ بالأمر: {e}")
            else:
                send_message(chat_id, "⚠️ الصيغة الصحيحة: <code>/add user_id amount</code>\nمثال: <code>/add 987654 10</code>")
            return

        # تعيين رصيد: /set 123456 25
        if text.startswith("/set"):
            parts = text.split()
            if len(parts) == 3:
                try:
                    target_uid = int(parts[1])
                    amount = float(parts[2])
                    set_user_balance(target_uid, amount)
                    send_message(chat_id, f"✅ تم ضبط رصيد المستخدم <code>{target_uid}</code> إلى <b>${amount:.2f}</b>.")
                    send_message(target_uid, f"ℹ️ تم تحديث رصيدك في المتجر إلى: <b>${amount:.2f}</b>")
                except Exception as e:
                    send_message(chat_id, f"❌ خطأ: {e}")
            return

        # عرض المستخدمين: /users
        if text == "/users":
            conn = sqlite3.connect(DB_FILE)
            c = conn.cursor()
            c.execute("SELECT user_id, username, balance FROM users ORDER BY balance DESC LIMIT 20")
            rows = c.fetchall()
            conn.close()
            users_text = "📋 <b>قائمة المشتركين والأرصدة:</b>\n\n"
            for r in rows:
                users_text += f"• <code>{r[0]}</code> (@{r[1] or '-'}): <b>${r[2]:.2f}</b>\n"
            send_message(chat_id, users_text)
            return


def start_bot_polling():
    if not BOT_TOKEN or "ضع_توكن" in BOT_TOKEN:
        print("\n" + "="*65)
        print("⚠️  تنبيه: لم تضع توكن البوت في bot_backend.py بعد!")
        print("يرجى فتح ملف bot_backend.py ووضع التوكن ومعرف الآدمن لتشغيل الربط مع تليجرام.")
        print("="*65 + "\n")
        return

    print("[Bot Polling] Started Telegram bot listening...")
    offset = 0
    while True:
        try:
            updates = telegram_api("getUpdates", {"offset": offset, "timeout": 20})
            if updates and updates.get("ok"):
                for item in updates.get("result", []):
                    offset = item["update_id"] + 1
                    if "message" in item:
                        handle_bot_message(item["message"])
        except Exception as e:
            time.sleep(3)


# ============================================================================
# 6. نقطة الانطلاق الرئيسية (Entry Point)
# ============================================================================
if __name__ == '__main__':
    init_db()

    # تشغيل خادم الويب وAPI في Thread منفصل
    server_thread = threading.Thread(target=run_web_server, daemon=True)
    server_thread.start()

    # تشغيل البوت في الـ Main Thread
    start_bot_polling()
