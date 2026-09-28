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
        MAIN_STATE: "hush_store_data_v2",
        LEGACY_STATE: "hush_store_data",
        THEME_MODE: "hush_theme_mode"
    },

    // مبالغ الشحن السريع المقترحة (Quick Recharge Presets)
    RECHARGE_PRESETS: [5, 10, 25, 50, 100],

    // قنوات الدعم والتواصل الرسمي
    SUPPORT: {
        TELEGRAM_USERNAME: "hussein_toxin",
        TELEGRAM_URL: "https://t.me/hussein_toxin",
        TELEGRAM_CHANNEL: "https://t.me/hush_store",
        WHATSAPP_NUMBER: "+9647800000000",
        WHATSAPP_URL: "https://wa.me/9647800000000",
        
        /**
         * @function getOrderInquiryUrl
         * @description توليد رابط تليجرام مباشر للاستفسار عن طلب معين مع رسالة مجهزة مسبقاً.
         */
        getOrderInquiryUrl: function(orderId, serviceName) {
            const text = encodeURIComponent(`مرحباً أخي حسين، لدي استفسار بخصوص الطلب رقم #${orderId} (${serviceName})`);
            return `https://t.me/hussein_toxin?text=${text}`;
        }
    },

    // بوابات ومحافظ الدفع المتاحة داخل العراق
    PAYMENT_METHODS: [
        {
            id: "zain_cash",
            name: "زين كاش (ZainCash)",
            badge: "فوري وتلقائي",
            icon: "fas fa-mobile-alt",
            accountNumber: "07801234567",
            accountHolder: "حسين أثير",
            instructions: "قم بتحويل المبلغ المطلوب إلى رقم محفظة زين كاش أعلاه، ثم الصق رقم الحوالة هنا.",
            isCard: false,
            color: "#e63946"
        },
        {
            id: "asia_hawala",
            name: "آسيا حوالة (AsiaHawala)",
            badge: "شائع في العراق",
            icon: "fas fa-money-check-alt",
            accountNumber: "07701234567",
            accountHolder: "حسين أثير",
            instructions: "قم بتحويل المبلغ المطلوب إلى رقم محفظة آسيا حوالة ثم اكتب رقم عملية الإشعار.",
            isCard: false,
            color: "#00b4d8"
        },
        {
            id: "asia_card",
            name: "كارت شحن آسيا سيل (رصيد)",
            badge: "كارت مباشر",
            icon: "fas fa-ticket-alt",
            accountNumber: "كارت رصيد آسيا",
            accountHolder: "كود الكارت",
            instructions: "اكتب كود كارت الشحن (14 أو 16 رقم) مع ذكر فئة الكارت (مثال: كارت 5$ أو 10$).",
            isCard: true,
            color: "#e76f51"
        },
        {
            id: "atheer_card",
            name: "كارت شحن زين العراق (أثير)",
            badge: "كارت مباشر",
            icon: "fas fa-credit-card",
            accountNumber: "كارت رصيد زين",
            accountHolder: "كود الكارت",
            instructions: "اكتب كود كارت الشحن زين مع تحديد فئة الكارت وقيمته.",
            isCard: true,
            color: "#7209b7"
        },
        {
            id: "usdt_trc20",
            name: "USDT (TRON - TRC20)",
            badge: "عملات رقمية",
            icon: "fas fa-coins",
            accountNumber: "TNb3H4m8Kpx9QwE21Yz7bV6X1s0Lk9J2",
            accountHolder: "محفظة USDT TRC-20",
            instructions: "يرجى التحويل حصراً على شبكة TRC20، ووضع معرف المعاملة (TxID) بدقة.",
            isCard: false,
            color: "#2ec4b6"
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
