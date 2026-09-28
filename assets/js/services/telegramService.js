/**
 * ==============================================================================
 * @file        telegramService.js
 * @package     StoreApp.Services.Telegram
 * @description تكامل متقدم ومحمي مع واجهة تليجرام البرمجية (Telegram Mini App SDK).
 * @author      Senior Software Architect (40+ Years Standards)
 * ==============================================================================
 */

window.StoreApp = window.StoreApp || {};
window.StoreApp.Services = window.StoreApp.Services || {};

window.StoreApp.Services.Telegram = (function() {
    'use strict';

    const tg = window.Telegram ? window.Telegram.WebApp : null;
    const backButtonStack = [];

    /**
     * @function init
     * @description تهيئة تطبيق تليجرام المصغر مع ضبط الألوان وتثبيت الشاشة.
     */
    function init() {
        if (!tg) {
            console.info('[TelegramService] Working in standalone browser mode.');
            return;
        }

        try {
            tg.ready();
            tg.expand();

            // منع إغلاق التطبيق بالسحب العرضي لأسفل لحماية تجربة المستخدم
            if (typeof tg.enableClosingConfirmation === 'function') {
                tg.enableClosingConfirmation();
            }

            // ضبط ألوان شريط التطبيق العلوي والخلفية
            if (typeof tg.setHeaderColor === 'function') {
                tg.setHeaderColor('#0e0f12');
            }
            if (typeof tg.setBackgroundColor === 'function') {
                tg.setBackgroundColor('#0e0f12');
            }

            // مزامنة ألوان ثيم تليجرام إن وجدت
            if (tg.themeParams && Object.keys(tg.themeParams).length > 0) {
                document.body.classList.add('telegram-theme');
            }

            console.info('[TelegramService] Initialized successfully. User:', tg.initDataUnsafe?.user?.id || 'Guest');
        } catch (e) {
            console.warn('[TelegramService] Init warning:', e);
        }
    }

    /**
     * @function getUser
     * @description استرجاع بيانات المستخدم الحالي الموثقة من تليجرام بأمان.
     * @returns {{ id: number, firstName: string, lastName: string, username: string, photoUrl: string|null }}
     */
    function getUser() {
        if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
            const u = tg.initDataUnsafe.user;
            return {
                id: u.id,
                firstName: window.StoreApp.Utils.Security.escapeHTML(u.first_name || 'مستخدم'),
                lastName: window.StoreApp.Utils.Security.escapeHTML(u.last_name || ''),
                username: u.username ? `@${window.StoreApp.Utils.Security.escapeHTML(u.username)}` : '',
                photoUrl: u.photo_url || null
            };
        }
        return {
            id: 1001,
            firstName: "حسين أثير",
            lastName: "",
            username: "@hussein_toxin",
            photoUrl: null
        };
    }

    /**
     * @function haptic
     * @description إرسال نبضات اهتزاز لمسية تفاعلية (Haptic Feedback) عبر جهاز المستخدم.
     * @param {'light'|'medium'|'heavy'|'rigid'|'soft'|'error'|'success'|'warning'} type
     */
    function haptic(type = 'light') {
        if (!tg || !tg.HapticFeedback) return;
        try {
            if (['error', 'success', 'warning'].includes(type)) {
                tg.HapticFeedback.notificationOccurred(type);
            } else {
                tg.HapticFeedback.impactOccurred(type);
            }
        } catch (e) {
            // Ignored on unsupported devices
        }
    }

    /**
     * @function pushBackButton
     * @description تسجيل إجراء رجوع في مكدس زر الرجوع الأصلي لتليجرام.
     * @param {Function} callback
     */
    function pushBackButton(callback) {
        if (!tg || !tg.BackButton) return;
        try {
            backButtonStack.push(callback);
            tg.BackButton.show();
            tg.BackButton.offClick();
            tg.BackButton.onClick(() => {
                haptic('light');
                const handler = backButtonStack.pop();
                if (typeof handler === 'function') {
                    handler();
                }
                if (backButtonStack.length === 0) {
                    tg.BackButton.hide();
                }
            });
        } catch (e) {
            console.warn('[TelegramService] BackButton error:', e);
        }
    }

    /**
     * @function clearBackButton
     * @description إخفاء زر الرجوع ومسح المكدس.
     */
    function clearBackButton() {
        if (!tg || !tg.BackButton) return;
        try {
            backButtonStack.length = 0;
            tg.BackButton.hide();
            tg.BackButton.offClick();
        } catch (e) {
            // Ignored
        }
    }

    /**
     * @function openTelegramLink
     * @description فتح محادثة أو قناة تليجرام داخل التطبيق مباشرة.
     */
    function openTelegramLink(url) {
        if (tg && typeof tg.openTelegramLink === 'function') {
            tg.openTelegramLink(url);
        } else {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    }

    /**
     * @function openExternalLink
     * @description فتح رابط خارجي بأمان.
     */
    function openExternalLink(url) {
        if (tg && typeof tg.openLink === 'function') {
            tg.openLink(url);
        } else {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    }

    /**
     * @function isTelegramEnvironment
     * @description التحقق مما إذا كان التطبيق يعمل داخل بيئة تليجرام.
     */
    function isTelegramEnvironment() {
        return !!(tg && tg.initData && tg.initData.length > 0);
    }

    return {
        init,
        getUser,
        haptic,
        pushBackButton,
        clearBackButton,
        openTelegramLink,
        openExternalLink,
        isTelegramEnvironment
    };
})();

// التوافقية العكسية للاسم القديم
window.StoreApp.TelegramService = window.StoreApp.Services.Telegram;
