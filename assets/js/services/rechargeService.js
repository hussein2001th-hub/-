/**
 * ==============================================================================
 * @file        rechargeService.js
 * @package     StoreApp.Services.Recharge
 * @description إدارة عمليات شحن الرصيد والتحقق من الحوالات وأكواد الكروت.
 * @author      Senior Software Architect (40+ Years Standards)
 * ==============================================================================
 */

window.StoreApp = window.StoreApp || {};
window.StoreApp.Services = window.StoreApp.Services || {};

window.StoreApp.Services.Recharge = (function() {
    'use strict';

    const Constants = window.StoreApp.Config.Constants;
    const Storage = window.StoreApp.Services.Storage;
    const Telegram = window.StoreApp.Services.Telegram;
    const Security = window.StoreApp.Utils.Security;
    const Formatters = window.StoreApp.Utils.Formatters;

    /**
     * @function getPaymentMethods
     * @description إرجاع كافة طرق الدفع المدعومة في النظام.
     */
    function getPaymentMethods() {
        return Constants.PAYMENT_METHODS;
    }

    /**
     * @function getPaymentMethodById
     * @description جلب تفاصيل طريقة دفع معينة عبر المعرف.
     */
    function getPaymentMethodById(methodId) {
        return Constants.PAYMENT_METHODS.find(m => m.id === methodId) || Constants.PAYMENT_METHODS[0];
    }

    /**
     * @function submitRechargeRequest
     * @description التحقق من بيانات الشحن وتسجيل الطلب في قائمة التنبيهات للمراجعة.
     * @param {string} methodId - معرف وسيلة الدفع.
     * @param {string} codeOrTx - رقم الحوالة أو كود الكارت.
     * @param {number|string} amount - المبلغ التقريبي بالدولار.
     * @returns {{ success: boolean, message: string, refId?: number }}
     */
    function submitRechargeRequest(methodId, codeOrTx, amount) {
        const cleanCode = Security.sanitizeString(codeOrTx);

        if (!cleanCode || cleanCode.length < 3) {
            Telegram.haptic('error');
            return {
                success: false,
                message: '⚠️ يرجى إدخال رقم الحوالة أو كود كارت الشحن بشكل صحيح'
            };
        }

        const method = getPaymentMethodById(methodId);
        const refId = Security.generateSecureId(5);
        const state = Storage.getState();

        let amountText = '';
        const parsedAmount = parseFloat(amount);
        if (!isNaN(parsedAmount) && parsedAmount > 0) {
            const formatted = Formatters.formatUSD(parsedAmount);
            const iqd = Formatters.formatIQD(parsedAmount);
            amountText = `بمبلغ: ${formatted} (≈ ${iqd})`;
        }

        // إضافة إشعار رسمي بحالة الطلب
        state.notifications.unshift({
            id: Date.now(),
            title: '⏳ طلب شحن قيد التدقيق السريع',
            body: `طلب رقم #${refId} عبر [${method.name}] - المعرف/الكود: (${cleanCode}) ${amountText}. سيتم التحقق الفوري وشحن رصيدك.`,
            time: 'الآن',
            read: false
        });

        Storage.saveState(state);
        Telegram.haptic('success');

        // إرسال طلب الشحن لسيرفر البوت لإشعار الآدمن فوراً
        const user = Telegram.getUser();
        try {
            fetch('/api/recharge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user ? user.id : 0,
                    ref_id: refId,
                    method: method.name,
                    code: cleanCode,
                    amount: parsedAmount || 0
                })
            }).catch(() => {});
        } catch (e) {}

        return {
            success: true,
            refId: refId,
            methodName: method.name,
            message: `📩 تم إرسال طلب الشحن بنجاح (رقم المعاملة #${refId})`
        };
    }

    return {
        getPaymentMethods,
        getPaymentMethodById,
        submitRechargeRequest
    };
})();

// التوافقية العكسية للاسم القديم
window.StoreApp.RechargeService = window.StoreApp.Services.Recharge;
