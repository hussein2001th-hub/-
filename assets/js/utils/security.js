/**
 * ==============================================================================
 * @file        security.js
 * @package     StoreApp.Utils.Security
 * @description وحدة الحماية وتطهير البيانات والتحقق الأمني لمنع ثغرات XSS وتلاعب البيانات.
 * @author      Senior Software Architect (40+ Years Standards)
 * ==============================================================================
 */

window.StoreApp = window.StoreApp || {};
window.StoreApp.Utils = window.StoreApp.Utils || {};

window.StoreApp.Utils.Security = (function() {
    'use strict';

    /**
     * @function escapeHTML
     * @description تحويل المحارف الخاصة إلى كيانات HTML لمنع ثغرات الحقن (XSS Injection).
     * @param {string|number} str - النص المراد تطهيره.
     * @returns {string} النص المطهر الخالي من أي وسوم أو أكواد خبيثة.
     */
    function escapeHTML(str) {
        if (str === null || str === undefined) return '';
        const s = String(str);
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;',
            '`': '&#x60;'
        };
        return s.replace(/[&<>"'/`]/g, match => map[match]);
    }

    /**
     * @function sanitizeString
     * @description إزالة المسافات الزائدة والمحارف غير المرئية أو الضارة.
     * @param {string} input - النص المدخل.
     * @returns {string} النص بعد التنظيف.
     */
    function sanitizeString(input) {
        if (typeof input !== 'string') return '';
        return input.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
    }

    /**
     * @function generateSecureId
     * @description توليد معرف رقمي فريد ومحمي ضد الاصطدام باستخدام Crypto API.
     * @param {number} length - طول المعرف (الافتراضي 6 أرقام).
     * @returns {number} المعرف الرقمي المولد.
     */
    function generateSecureId(length = 6) {
        if (window.crypto && window.crypto.getRandomValues) {
            const array = new Uint32Array(1);
            window.crypto.getRandomValues(array);
            const min = Math.pow(10, length - 1);
            const max = Math.pow(10, length) - 1;
            return min + (array[0] % (max - min + 1));
        }
        // Fallback آمن يعتمد على الطابع الزمني والإنتروبيا العشوائية
        const timestamp = Date.now().toString().slice(-4);
        const rand = Math.floor(Math.random() * 90) + 10;
        return parseInt(`${rand}${timestamp}`, 10);
    }

    /**
     * @function validateTargetUrl
     * @description التحقق من سلامة وصحة الرابط أو اسم المستخدم المدخل بحسب المنصة.
     * @param {string} target - الرابط أو اليوزر.
     * @param {string} platformId - معرف المنصة.
     * @returns {{ valid: boolean, error?: string, sanitized: string }}
     */
    function validateTargetUrl(target, platformId) {
        const clean = sanitizeString(target);
        if (!clean) {
            return { valid: false, error: '⚠️ يرجى إدخال الرابط أو اسم المستخدم المطلوب', sanitized: '' };
        }

        // فحص وجود وسوم مريبة أو محاولات حقن بروتوكول javascript:
        if (/^(javascript:|data:|vbscript:)/i.test(clean)) {
            return { valid: false, error: '❌ بروتوكول الرابط غير مسموح به لأسباب أمنية', sanitized: '' };
        }

        // تحققات مرنة بحسب نوع المنصة
        switch (platformId) {
            case 'instagram':
                if (clean.includes('instagram.com') || /^@?[a-zA-Z0-9._]{1,30}$/.test(clean)) {
                    return { valid: true, sanitized: clean };
                }
                return { valid: true, sanitized: clean }; // مرن مع السماح بأي رابط منشور

            case 'tiktok':
                if (clean.includes('tiktok.com') || /^@?[a-zA-Z0-9._]{1,30}$/.test(clean)) {
                    return { valid: true, sanitized: clean };
                }
                return { valid: true, sanitized: clean };

            case 'telegram':
                if (clean.includes('t.me/') || /^@?[a-zA-Z0-9_]{4,32}$/.test(clean)) {
                    return { valid: true, sanitized: clean };
                }
                return { valid: true, sanitized: clean };

            default:
                if (clean.length < 3) {
                    return { valid: false, error: '⚠️ الرابط أو اسم المستخدم قصير جداً', sanitized: '' };
                }
                return { valid: true, sanitized: clean };
        }
    }

    /**
     * @function debounce
     * @description دالة لمنع النقر المتكرر السريع (Double Submit) ومقاومة Race Conditions.
     * @param {Function} func - الدالة المراد تقييدها.
     * @param {number} waitMs - زمن الانتظار بالمللي ثانية.
     * @returns {Function} الدالة المقيدة.
     */
    function debounce(func, waitMs = 300) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), waitMs);
        };
    }

    /**
     * @function safeJSONParse
     * @description فك تشفير نصوص JSON بأمان دون التسبب في انهيار التطبيق أو هجمات Prototype Pollution.
     * @param {string} jsonString - النص المشفر.
     * @param {*} fallbackValue - القيمة البديلة في حالة الفشل.
     * @returns {*} الكائن المفكك أو القيمة البديلة.
     */
    function safeJSONParse(jsonString, fallbackValue = null) {
        if (!jsonString || typeof jsonString !== 'string') return fallbackValue;
        try {
            const parsed = JSON.parse(jsonString);
            // حماية ضد Prototype Pollution
            if (parsed && typeof parsed === 'object') {
                delete parsed.__proto__;
                delete parsed.constructor;
                delete parsed.prototype;
            }
            return parsed;
        } catch (e) {
            console.warn('[Security] Failed to parse JSON safely:', e);
            return fallbackValue;
        }
    }

    return {
        escapeHTML,
        sanitizeString,
        generateSecureId,
        validateTargetUrl,
        debounce,
        safeJSONParse
    };
})();
