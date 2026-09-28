/**
 * ==============================================================================
 * @file        formatters.js
 * @package     StoreApp.Utils.Formatters
 * @description منسقات الأرقام، العملات (USD / IQD)، التواريخ، ودقة الحسابات العشرية.
 * @author      Senior Software Architect (40+ Years Standards)
 * ==============================================================================
 */

window.StoreApp = window.StoreApp || {};
window.StoreApp.Utils = window.StoreApp.Utils || {};

window.StoreApp.Utils.Formatters = (function() {
    'use strict';

    /**
     * @function roundDecimal
     * @description معالجة أخطاء الفاصلة العائمة (Floating Point Precision) في جافاسكربت بدقة عالية.
     * @param {number} value - القيمة المراد تقريبها.
     * @param {number} decimals - عدد الخانات العشرية (الافتراضي 2 أو 3).
     * @returns {number} الرقم المقرب بدقة متناهية.
     */
    function roundDecimal(value, decimals = 3) {
        if (isNaN(value) || value === null) return 0;
        const factor = Math.pow(10, decimals);
        return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
    }

    /**
     * @function formatUSD
     * @description تنسيق المبلغ المالي بالدولار الأمريكي.
     * @param {number} amount - المبلغ.
     * @param {number} decimals - عدد الخانات العشرية.
     * @returns {string} النص المنسق مثل $1.20
     */
    function formatUSD(amount, decimals = 2) {
        const rounded = roundDecimal(amount, decimals);
        return `$${rounded.toFixed(decimals)}`;
    }

    /**
     * @function formatIQD
     * @description تحويل المبلغ من الدولار إلى الدينار العراقي وتنسيقه مع الفواصل.
     * @param {number} usdAmount - المبلغ بالدولار.
     * @param {number} exchangeRate - سعر الصرف (الافتراضي 1520).
     * @returns {string} المبلغ منسق مثل 15,200 د.ع
     */
    function formatIQD(usdAmount, exchangeRate = 1520) {
        if (isNaN(usdAmount) || usdAmount <= 0) return '0 د.ع';
        const iqd = Math.round(usdAmount * exchangeRate);
        return `${iqd.toLocaleString('ar-IQ')} د.ع`;
    }

    /**
     * @function formatNumber
     * @description إضافة فواصل الآلاف للأرقام والكميات الكبيرة.
     * @param {number|string} num - الرقم المدخل.
     * @returns {string} الرقم مع فواصل الآلاف مثل 10,000
     */
    function formatNumber(num) {
        if (num === null || num === undefined || isNaN(num)) return '0';
        return Number(num).toLocaleString('en-US');
    }

    /**
     * @function formatDate
     * @description تنسيق التاريخ والوقت بصيغة عربية واضحة ومقروءة.
     * @param {string|Date} dateInput - التاريخ.
     * @returns {string} تاريخ منسق.
     */
    function formatDate(dateInput) {
        if (!dateInput) return '';
        try {
            const date = new Date(dateInput);
            if (isNaN(date.getTime())) return String(dateInput);
            
            const now = new Date();
            const diffSeconds = Math.floor((now - date) / 1000);

            if (diffSeconds < 60) return 'الآن';
            if (diffSeconds < 3600) return `منذ ${Math.floor(diffSeconds / 60)} دقيقة`;
            if (diffSeconds < 86400) return `منذ ${Math.floor(diffSeconds / 3600)} ساعة`;

            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            const hh = String(date.getHours()).padStart(2, '0');
            const min = String(date.getMinutes()).padStart(2, '0');

            return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
        } catch (e) {
            return String(dateInput);
        }
    }

    return {
        roundDecimal,
        formatUSD,
        formatIQD,
        formatNumber,
        formatDate
    };
})();
