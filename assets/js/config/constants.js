/**
 * ==============================================================================
 * @file        constants.js
 * @package     StoreApp.Config.Constants
 * @description إعدادات النظام المركزية، أسعار الصرف، بوابات الدفع، وروابط الدعم.
 * @author      Senior Software Architect (40+ Years Standards)
 * ==============================================================================
 */

window.StoreApp = window.StoreApp || {};
window.StoreApp.Config = window.StoreApp.Config || {};

window.StoreApp.Config.Constants = {
    // معلومات المتجر
    APP_NAME: "متجر حسين أثير",
    APP_SUBTITLE: "منصة رشق وتمويل السوشيال ميديا الأولى في العراق",
    APP_VERSION: "2.6.0 Enterprise",
    APP_AUTHOR: "Hussein Atheer",
    
    // سعر الصرف المعتمد (1 دولار = دينار عراقي)
    USD_TO_IQD: 1520,

    // مفاتيح التخزين الآمن
    STORAGE_KEYS: {
        MAIN_STATE: "h98lh_data_v2",
        LEGACY_STATE: "h98lh_data",
        THEME_MODE: "hush_theme_mode"
    },

    // مبالغ الشحن السريع المقترحة (Quick Recharge Presets)
    RECHARGE_PRESETS: [5, 10, 25, 50, 100],

    // قنوات الدعم والتواصل الرسمي
    SUPPORT: {
        BOT_USERNAME:      "ttbbegbot",
        BOT_URL:           "https://t.me/ttbbegbot",
        TELEGRAM_USERNAME: "h99lh",
        TELEGRAM_URL:      "https://t.me/h99lh",
        TELEGRAM_CHANNEL:  "https://t.me/h98lh",
        getOrderInquiryUrl: function(orderId, serviceName) {
            const text = encodeURIComponent(
                `مرحباً، لدي استفسار عن الطلب رقم #${orderId} (${serviceName})`
            );
            return `https://t.me/h99lh?text=${text}`;
        }
    },

    // بوابات الدفع — مطابقة لقائمة البوت
    PAYMENT_METHODS: [
        {
            id: "stars", name: "نجوم تيليكرام ⭐", badge: "فوري",
            icon: "fas fa-star", accountNumber: "@ttbbegbot",
            accountHolder: "حسين أثير",
            instructions: "أرسل النجوم للبوت @ttbbegbot ثم أرسلنا عددها واسم حسابك.",
            isCard: false, color: "#f4c430"
        },
        {
            id: "asiasell", name: "أسياسيل 📱", badge: "شائع",
            icon: "fas fa-mobile-alt", accountNumber: "07739439110",
            accountHolder: "حسين أثير",
            instructions: "حوّل للرقم 07739439110 ثم أرسل رقم العملية والمبلغ.",
            isCard: false, color: "#00b4d8"
        },
        {
            id: "zaincash", name: "زين كاش 💳", badge: "فوري",
            icon: "fas fa-wallet", accountNumber: "07739439110",
            accountHolder: "حسين أثير",
            instructions: "حوّل للمحفظة 07739439110 ثم أرسل رقم العملية والمبلغ.",
            isCard: false, color: "#e63946"
        },
        {
            id: "master_rafidain", name: "ماستر الرافدين 💳", badge: "بنك",
            icon: "fas fa-credit-card", accountNumber: "1234-5678-9012-3456",
            accountHolder: "حسين أثير",
            instructions: "حوّل للحساب 1234-5678-9012-3456 ثم أرسل رقم التحويل والمبلغ.",
            isCard: true, color: "#7209b7"
        }
    ],

    // قيود الأمان وحدود المدخلات
    LIMITS: {
        MIN_RECHARGE_USD: 1.0,
        MAX_RECHARGE_USD: 1000.0,
        MAX_INPUT_LENGTH: 500
    }
};

// التوافقية العكسية للاسم القديم
window.StoreApp.Constants = window.StoreApp.Config.Constants;
