/**
 * ==============================================================================
 * @file        orderService.js
 * @package     StoreApp.Services.Order
 * @description إدارة الطلبات، الحسابات المالية الدقيقة، والتحقق الأمني من المدخلات.
 * @author      Senior Software Architect (40+ Years Standards)
 * ==============================================================================
 */

window.StoreApp = window.StoreApp || {};
window.StoreApp.Services = window.StoreApp.Services || {};

window.StoreApp.Services.Order = (function() {
    'use strict';

    const Storage = window.StoreApp.Services.Storage;
    const Telegram = window.StoreApp.Services.Telegram;
    const Catalog = window.StoreApp.Config.ServicesCatalog;
    const Security = window.StoreApp.Utils.Security;
    const Formatters = window.StoreApp.Utils.Formatters;

    let isProcessingOrder = false;

    /**
     * @function findServiceById
     * @description البحث عن خدمة معينة واستخراج بياناتها مع المنصة التابعة لها.
     * @param {string} serviceId
     * @returns {{ service: Object, platform: Object }|null}
     */
    function findServiceById(serviceId) {
        if (!serviceId) return null;
        for (const platform of Catalog) {
            const service = platform.services.find(s => s.id === serviceId);
            if (service) {
                return { service, platform };
            }
        }
        return null;
    }

    /**
     * @function calculateCost
     * @description حساب التكلفة المالية بدقة متناهية ودون أخطاء الفاصلة العائمة.
     * @param {Object} service - كائن الخدمة.
     * @param {number|string} quantity - الكمية المطلوبة.
     * @returns {number} التكلفة المحسوبة بدقة.
     */
    function calculateCost(service, quantity) {
        if (!service || quantity === null || quantity === undefined) return 0;
        
        if (service.type === 'free') {
            return 0;
        }

        const qtyNum = parseFloat(quantity);
        if (isNaN(qtyNum) || qtyNum <= 0) return 0;

        if (service.type === 'campaign') {
            return Formatters.roundDecimal(qtyNum, 2);
        }

        const unit = service.unit || 1000;
        const total = (qtyNum / unit) * service.rate;
        return Formatters.roundDecimal(total, 3);
    }

    /**
     * @function validateOrderInput
     * @description التحقق الأمني والفني الصارم من مدخلات الطلب قبل الاعتماد.
     * @param {Object} service
     * @param {string} targetInput
     * @param {number|string} quantityInput
     * @returns {{ valid: boolean, message?: string, cost?: number, cleanTarget?: string, cleanQty?: number }}
     */
    function validateOrderInput(service, targetInput, quantityInput) {
        if (!service) {
            return { valid: false, message: '❌ الخدمة المحددة غير موجودة في النظام' };
        }

        // 1. التحقق من الرابط / اليوزر
        const targetValidation = Security.validateTargetUrl(targetInput, service.platformId || '');
        if (!targetValidation.valid) {
            return { valid: false, message: targetValidation.error };
        }

        const cleanTarget = targetValidation.sanitized;

        // 2. الخدمات المجانية
        if (service.type === 'free') {
            return {
                valid: true,
                cost: 0,
                cleanTarget,
                cleanQty: service.fixedQty || 1000
            };
        }

        // 3. الحملات الإعلانية الممولة
        if (service.type === 'campaign') {
            const budget = parseFloat(quantityInput);
            const minBudget = service.minBudget || 10;
            if (isNaN(budget) || budget < minBudget) {
                return { valid: false, message: `⚠️ الحد الأدنى لميزانية الحملة هو $${minBudget}.00` };
            }

            const state = Storage.getState();
            if (state.balance < budget) {
                return { valid: false, message: `❌ رصيدك الحالي ($${state.balance.toFixed(2)}) غير كافٍ لهذه الحملة` };
            }

            return {
                valid: true,
                cost: Formatters.roundDecimal(budget, 2),
                cleanTarget,
                cleanQty: 1
            };
        }

        // 4. الخدمات القياسية (Standard Services)
        const qty = parseInt(quantityInput, 10);
        if (isNaN(qty) || qty <= 0) {
            return { valid: false, message: '⚠️ يرجى إدخال كمية رقمية صحيحة أكبر من الصفر' };
        }

        if (service.min && qty < service.min) {
            return { valid: false, message: `⚠️ الحد الأدنى للطلب في هذه الخدمة هو ${Formatters.formatNumber(service.min)}` };
        }

        if (service.max && qty > service.max) {
            return { valid: false, message: `⚠️ الحد الأقصى للطلب في هذه الخدمة هو ${Formatters.formatNumber(service.max)}` };
        }

        const cost = calculateCost(service, qty);
        const state = Storage.getState();

        if (state.balance < cost) {
            return {
                valid: false,
                message: `❌ رصيدك غير كافٍ. المطلوب: $${cost.toFixed(2)} | رصيدك الحالي: $${state.balance.toFixed(2)}`
            };
        }

        return {
            valid: true,
            cost,
            cleanTarget,
            cleanQty: qty
        };
    }

    /**
     * @function submitOrder
     * @description تنفيذ الطلب وخصم الرصيد مع منع تكرار النقر وتوثيق المعاملة.
     * @param {string} serviceId
     * @param {string} targetInput
     * @param {number|string} quantityInput
     * @returns {Promise<{ success: boolean, message: string, order?: Object }>}
     */
    async function submitOrder(serviceId, targetInput, quantityInput) {
        if (isProcessingOrder) {
            return { success: false, message: '⏳ جاري تنفيذ طلب سابق، يرجى الانتظار...' };
        }

        const match = findServiceById(serviceId);
        if (!match) {
            return { success: false, message: '❌ الخدمة غير متوفرة' };
        }

        const { service, platform } = match;
        const validation = validateOrderInput(service, targetInput, quantityInput);

        if (!validation.valid) {
            Telegram.haptic('error');
            return { success: false, message: validation.message };
        }

        isProcessingOrder = true;

        try {
            const state = Storage.getState();
            const cost = validation.cost;

            // خصم الرصيد بدقة
            state.balance = Formatters.roundDecimal(state.balance - cost, 2);
            if (state.balance < 0) state.balance = 0;

            // توليد معرف مشفر فريد
            const orderId = Security.generateSecureId(6);

            const newOrder = {
                id: orderId,
                serviceId: service.id,
                service: service.name,
                platformName: platform.name,
                target: validation.cleanTarget,
                qty: validation.cleanQty,
                cost: cost,
                status: service.type === 'campaign' ? 'قيد التنفيذ' : 'قيد الانتظار',
                date: new Date().toISOString().replace('T', ' ').substring(0, 16)
            };

            state.orders.unshift(newOrder);

            // إضافة إشعار فوري
            state.notifications.unshift({
                id: Date.now(),
                title: '✅ تم استلام طلبك بنجاح',
                body: `طلب رقم #${orderId}: ${service.name} بقيمة $${cost.toFixed(2)}`,
                time: 'الآن',
                read: false
            });

            // حفظ في التخزين
            Storage.saveState(state);
            Telegram.haptic('success');

            // إرسال ومزامنة الطلب مع خادم البوت وقاعدة البيانات إن كان متصلاً
            const user = Telegram.getUser();
            try {
                fetch('/api/order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: user ? user.id : 0,
                        order_id: orderId,
                        service_name: service.name,
                        target: validation.cleanTarget,
                        qty: validation.cleanQty,
                        cost: cost
                    })
                }).catch(() => {});
            } catch (e) {}

            return {
                success: true,
                order: newOrder,
                message: '🚀 تم إرسال طلبك بنجاح وسيبدأ تنفيذه فوراً'
            };
        } finally {
            // فك القفل بعد فترة وجيزة
            setTimeout(() => {
                isProcessingOrder = false;
            }, 500);
        }
    }

    /**
     * @function getOrders
     * @description جلب الطلبات مع دعم التصفية بالحالة والبحث النصي الذكي.
     * @param {string} statusFilter
     * @param {string} searchQuery
     * @returns {Array} قائمة الطلبات المطابقة
     */
    function getOrders(statusFilter = 'all', searchQuery = '') {
        const state = Storage.getState();
        let list = state.orders || [];

        if (statusFilter && statusFilter !== 'all') {
            list = list.filter(o => o.status === statusFilter);
        }

        if (searchQuery && typeof searchQuery === 'string') {
            const q = searchQuery.toLowerCase().trim();
            if (q) {
                list = list.filter(o => 
                    String(o.id).includes(q) ||
                    (o.service && o.service.toLowerCase().includes(q)) ||
                    (o.target && o.target.toLowerCase().includes(q)) ||
                    (o.platformName && o.platformName.toLowerCase().includes(q))
                );
            }
        }

        return list;
    }

    /**
     * @function getOrderById
     * @description جلب طلب معين بواسطة معرفه الرقمي.
     */
    function getOrderById(orderId) {
        const state = Storage.getState();
        return (state.orders || []).find(o => String(o.id) === String(orderId)) || null;
    }

    return {
        findServiceById,
        calculateCost,
        validateOrderInput,
        submitOrder,
        getOrders,
        getOrderById
    };
})();

// التوافقية العكسية للاسم القديم
window.StoreApp.OrderService = window.StoreApp.Services.Order;
