/**
 * ==============================================================================
 * @file        storageService.js
 * @package     StoreApp.Services.Storage
 * @description إدارة التخزين المحلي الآمن، الترحيل التلقائي للإصدارات، ومقاومة أخطاء الذاكرة.
 * @author      Senior Software Architect (40+ Years Standards)
 * ==============================================================================
 */

window.StoreApp = window.StoreApp || {};
window.StoreApp.Services = window.StoreApp.Services || {};

window.StoreApp.Services.Storage = (function() {
    'use strict';

    const Security = window.StoreApp.Utils.Security;
    const Constants = window.StoreApp.Config.Constants;

    const STORAGE_KEY = Constants.STORAGE_KEYS.MAIN_STATE;
    const LEGACY_KEY = Constants.STORAGE_KEYS.LEGACY_STATE;

    /**
     * الحالة الافتراضية المرجعية الأولية
     */
    const INITIAL_STATE = {
        version: "2.6.0",
        balance: 3.12,
        orders: [
            {
                id: 984120,
                serviceId: "insta-followers-30d",
                service: "متابعين إنستغرام (حقيقي) - ضمان 30 يوم",
                platformName: "إنستغرام",
                target: "https://instagram.com/hussein_toxin",
                qty: 1000,
                cost: 1.20,
                status: "مكتمل",
                date: "2026-09-25 14:20"
            },
            {
                id: 984121,
                serviceId: "insta-likes-fast",
                service: "لايكات إنستغرام (سريع جداً + فوري)",
                platformName: "إنستغرام",
                target: "https://instagram.com/p/C8xyz",
                qty: 500,
                cost: 0.18,
                status: "مكتمل",
                date: "2026-09-27 10:15"
            }
        ],
        notifications: [
            {
                id: 1,
                title: "مرحباً بك في متجر حسين أثير!",
                body: "تم تحديث واجهة المتجر بنجاح لمواكبة أحدث معايير السرعة والأمان مع دعم تليجرام الكامل.",
                time: "اليوم 12:00 م",
                read: false
            }
        ],
        settings: {
            theme: "dark",
            notificationsEnabled: true
        }
    };

    let cacheState = null;
    const subscribers = [];

    /**
     * @function init
     * @description تحميل الحالة الأولية مع فحص وترحيل البيانات من الإصدارات القديمة.
     */
    function init() {
        try {
            // محاولة جلب الإصدار v2
            const rawV2 = localStorage.getItem(STORAGE_KEY);
            if (rawV2) {
                const parsed = Security.safeJSONParse(rawV2, null);
                if (parsed && typeof parsed.balance === 'number') {
                    cacheState = sanitizeLoadedState(parsed);
                    return cacheState;
                }
            }

            // فحص وجود ترحيل من الإصدار القديم
            const rawLegacy = localStorage.getItem(LEGACY_KEY);
            if (rawLegacy) {
                console.info('[StorageService] Migrating data from legacy version...');
                const legacyParsed = Security.safeJSONParse(rawLegacy, null);
                if (legacyParsed) {
                    cacheState = {
                        ...INITIAL_STATE,
                        balance: typeof legacyParsed.balance === 'number' ? legacyParsed.balance : INITIAL_STATE.balance,
                        orders: Array.isArray(legacyParsed.orders) ? legacyParsed.orders : INITIAL_STATE.orders,
                        notifications: Array.isArray(legacyParsed.notifications) ? legacyParsed.notifications : INITIAL_STATE.notifications
                    };
                    saveState(cacheState);
                    return cacheState;
                }
            }

            // فحص وجود رصيد ممرر عبر رابط البوت (URL Query Parameter: ?balance=X&user_id=Y)
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('balance')) {
                const urlBal = parseFloat(urlParams.get('balance'));
                if (!isNaN(urlBal)) {
                    INITIAL_STATE.balance = urlBal;
                }
            }

            // في حال عدم وجود أي بيانات سابقة
            cacheState = JSON.parse(JSON.stringify(INITIAL_STATE));
            saveState(cacheState);
        } catch (e) {
            console.warn('[StorageService] LocalStorage read error, using memory fallback:', e);
            cacheState = JSON.parse(JSON.stringify(INITIAL_STATE));
        }

        // محاولة جلب الرصيد الحقيقي من خادم البوت إذا كان متصلاً
        const user = window.StoreApp.Services.Telegram?.getUser();
        if (user && user.id) {
            syncWithBotServer(user.id);
        }

        return cacheState;
    }

    /**
     * @function syncWithBotServer
     * @description مزامنة الرصيد والطلبات مباشرة مع قاعدة بيانات البوت عبر API السيرفر.
     */
    async function syncWithBotServer(userId) {
        if (!userId) return;
        try {
            const res = await fetch(`/api/user?id=${userId}`, { cache: 'no-cache' });
            if (res.ok) {
                const data = await res.json();
                if (data.success && typeof data.balance === 'number') {
                    console.info('[StorageService] Synced live balance with Bot DB:', data.balance);
                    const state = getState();
                    state.balance = data.balance;
                    if (Array.isArray(data.orders) && data.orders.length > 0) {
                        state.orders = data.orders;
                    }
                    saveState(state);
                }
            }
        } catch (e) {
            // العمل محلياً في حالة عدم تشغيل السيرفر
            console.info('[StorageService] Offline mode: using local cache.');
        }
    }

    /**
     * @function sanitizeLoadedState
     * @description تطهير وتدقيق بنية الكائن المحمل من التخزين لتفادي الأخطاء.
     */
    function sanitizeLoadedState(data) {
        return {
            version: "2.6.0",
            balance: typeof data.balance === 'number' && !isNaN(data.balance) ? Math.max(0, data.balance) : INITIAL_STATE.balance,
            orders: Array.isArray(data.orders) ? data.orders : INITIAL_STATE.orders,
            notifications: Array.isArray(data.notifications) ? data.notifications : INITIAL_STATE.notifications,
            settings: data.settings || INITIAL_STATE.settings
        };
    }

    /**
     * @function getState
     * @description جلب الحالة الحالية من الذاكرة المؤقتة.
     */
    function getState() {
        if (!cacheState) {
            init();
        }
        return cacheState;
    }

    /**
     * @function saveState
     * @description حفظ الحالة في الذاكرة المحلية وإخطار جميع المشتركين.
     */
    function saveState(newState) {
        cacheState = newState;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheState));
        } catch (e) {
            console.error('[StorageService] QuotaExceeded or write error:', e);
        }
        notifySubscribers();
    }

    /**
     * @function updateBalance
     * @description تعديل الرصيد بقيمة معينة مع التقريب الدقيق.
     */
    function updateBalance(deltaAmount) {
        const state = getState();
        state.balance = window.StoreApp.Utils.Formatters.roundDecimal(state.balance + deltaAmount, 2);
        if (state.balance < 0) state.balance = 0;
        saveState(state);
        return state.balance;
    }

    /**
     * @function subscribe
     * @description تسجيل دالة استماع للتغيرات في الحالة (Reactive pattern).
     */
    function subscribe(callback) {
        if (typeof callback === 'function') {
            subscribers.push(callback);
        }
    }

    /**
     * @function notifySubscribers
     * @description إشعار جميع المراقبين بتحديث البيانات.
     */
    function notifySubscribers() {
        subscribers.forEach(fn => {
            try {
                fn(cacheState);
            } catch (err) {
                console.error('[StorageService] Error in subscriber:', err);
            }
        });
    }

    /**
     * @function exportBackupJSON
     * @description تصدير نسخة احتياطية من بيانات المتجر بصيغة JSON.
     */
    function exportBackupJSON() {
        return JSON.stringify(getState(), null, 2);
    }

    /**
     * @function resetToDefault
     * @description إعادة تعيين المتجر إلى الإعدادات الأولية.
     */
    function resetToDefault() {
        cacheState = JSON.parse(JSON.stringify(INITIAL_STATE));
        saveState(cacheState);
    }

    return {
        init,
        getState,
        saveState,
        updateBalance,
        subscribe,
        syncWithBotServer,
        exportBackupJSON,
        resetToDefault
    };
})();

// التوافقية العكسية للاسم القديم
window.StoreApp.StorageService = window.StoreApp.Services.Storage;
