/**
 * ==============================================================================
 * @file        app.js
 * @package     StoreApp.Main
 * @description المنسق العام ومتحكم بدء تشغيل التطبيق (Application Orchestrator).
 * @author      Senior Software Architect (40+ Years Standards)
 * ==============================================================================
 */

window.StoreApp = window.StoreApp || {};

window.StoreApp.Main = (function() {
    'use strict';

    const Constants = window.StoreApp.Config.Constants;
    const Telegram = window.StoreApp.Services.Telegram;
    const Storage = window.StoreApp.Services.Storage;
    const Navigation = window.StoreApp.UI.Navigation;
    const Renderers = window.StoreApp.UI.Renderers;
    const Modal = window.StoreApp.UI.Modal;
    const Security = window.StoreApp.Utils.Security;
    const Formatters = window.StoreApp.Utils.Formatters;

    /**
     * @function init
     * @description نقطة انطلاق التطبيق المركزية.
     */
    function init() {
        console.info(`[StoreApp] Initializing ${Constants.APP_NAME} v${Constants.APP_VERSION}...`);

        // 1. تهيئة تكامل تليجرام SDK
        Telegram.init();

        // 2. تهيئة التخزين وترحيل البيانات القديمة إن وجدت
        Storage.init();

        // 3. تهيئة المودال
        Modal.init();

        // 4. رسم الواجهات الأولية
        Renderers.renderHeaderAndStats();
        Renderers.renderCategoryFilterTabs();
        Renderers.renderPlatformsGrid();
        Renderers.renderOrders('all');
        Renderers.renderRechargeMethods();
        Renderers.renderNotifications();

        // 5. تهيئة نظام التوجيه
        Navigation.init();

        // 6. ربط الأحداث العامة
        bindGlobalEvents();

        // 7. الاستماع لتحديثات التخزين التفاعلي
        Storage.subscribe(() => {
            Renderers.renderHeaderAndStats();
            const activePage = Navigation.getActivePage();
            if (activePage === 'page-orders') {
                Renderers.renderOrders();
            } else if (activePage === 'page-notifications') {
                Renderers.renderNotifications();
            }
        });

        console.info('[StoreApp] StoreApp is fully initialized and operational.');
    }

    /**
     * @function bindGlobalEvents
     * @description ربط أزرار القائمة، حاسبة العملات، والتنبيهات العامة.
     */
    function bindGlobalEvents() {
        // زر القائمة العلوية
        const menuBtn = document.getElementById('btn-top-menu');
        if (menuBtn) {
            menuBtn.onclick = () => {
                Telegram.haptic('light');
                showStoreInfoModal();
            };
        }

        // حقل البحث في الطلبات مع Debounce لمنع اللاغ
        const orderSearchInput = document.getElementById('order-search-input');
        if (orderSearchInput) {
            orderSearchInput.oninput = Security.debounce(() => {
                Renderers.renderOrders();
            }, 250);
        }

        // زر مسح الإشعارات
        const clearNotifsBtn = document.getElementById('btn-clear-notifs');
        if (clearNotifsBtn) {
            clearNotifsBtn.onclick = () => {
                Telegram.haptic('medium');
                window.StoreApp.Services.Notification.clearAll();
                Renderers.renderNotifications();
                Navigation.updateNotifBadge();
                window.StoreApp.UI.Toast.info("تم مسح كافة التنبيهات");
            };
        }

        // بطاقة الرصيد: النقر على الرصيد يفتح حاسبة الصرف السريع
        const balanceCard = document.querySelector('.balance-amount');
        if (balanceCard) {
            balanceCard.style.cursor = 'pointer';
            balanceCard.title = 'انقر لفتح حاسبة العملات (USD / IQD)';
            balanceCard.onclick = () => {
                Telegram.haptic('light');
                showCurrencyCalculatorModal();
            };
        }
    }

    /**
     * @function showStoreInfoModal
     * @description عرض واجهة الملف الشخصي الخاصة بالمستخدم مع اسم المستخدم والرصيد (تحاكي القائمة الجانبية).
     */
    function showStoreInfoModal() {
        const user = window.StoreApp.Services.Telegram.getUser();
        const shortId = 'h' + user.id.toString(36);
        const currentBalance = window.StoreApp.Services.Storage.getBalance();

        Modal.show({
            title: '<i class="fas fa-user-circle text-primary"></i> ملفي الشخصي',
            bodyHtml: `
                <div style="background: var(--bg-surface); border-radius: var(--radius-md); padding: 16px; margin-bottom: 20px; text-align: center; border: 1px solid var(--border-color);">
                    <div style="width: 56px; height: 56px; border-radius: 18px; background: var(--bg-card); display: flex; align-items: center; justify-content: center; font-size: 24px; color: var(--primary); font-weight: 800; margin: 0 auto 12px; border: 1px solid var(--border-color-hover);">
                        ${user.firstName.charAt(0)}
                    </div>
                    <div style="font-weight: 800; font-size: 16px; color: var(--text-main); margin-bottom: 4px;">${user.firstName}</div>
                    
                    <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 16px;">
                        <span style="font-size: 13px; color: var(--text-muted); background: var(--bg-card); padding: 4px 10px; border-radius: 6px; letter-spacing: 1px;">
                            ${shortId}
                        </span>
                        <i class="far fa-copy" style="color: var(--text-muted); cursor: pointer; font-size: 14px;" onclick="navigator.clipboard.writeText('${shortId}'); window.StoreApp.UI.Toast.success('تم نسخ اسم المستخدم!');"></i>
                    </div>

                    <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 12px; margin-bottom: 12px;">
                        <div style="text-align: right;">
                            <div style="font-size: 11px; color: var(--text-muted);">الرصيد المتاح</div>
                            <div style="font-size: 18px; font-weight: 800; color: var(--text-main);">$${currentBalance.toFixed(2)}</div>
                        </div>
                    </div>

                    <button class="btn-primary" style="width: 100%; padding: 12px; border-radius: var(--radius-md); font-weight: 800; display: flex; justify-content: center; align-items: center; gap: 8px; font-size: 14px;" onclick="window.StoreApp.UI.Modal.hide(); window.StoreApp.UI.Navigation.navigateTo('page-recharge');">
                        <i class="fas fa-plus"></i> شحن الرصيد
                    </button>
                </div>

                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <button type="button" class="btn-action btn-secondary" onclick="window.StoreApp.Main.openCurrencyCalc()">
                        <i class="fas fa-calculator text-primary"></i> حاسبة تحويل العملة
                    </button>
                    <a href="${Constants.SUPPORT.TELEGRAM_URL}" target="_blank" class="btn-action btn-secondary" style="text-decoration:none;">
                        <i class="fas fa-headset text-primary"></i> الدعم الفني
                    </a>
                </div>
            `,
            showCancel: false,
            confirmText: 'إغلاق'
        });
    }

    /**
     * @function showCurrencyCalculatorModal
     * @description حاسبة تحويل لحظية بين الدولار والدينار العراقي.
     */
    function showCurrencyCalculatorModal() {
        const rate = Constants.USD_TO_IQD;
        Modal.show({
            title: '<i class="fas fa-calculator text-primary"></i> حاسبة العملات الفورية',
            bodyHtml: `
                <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 12px;">
                    سعر الصرف المعتمد داخل المتجر: <strong>1 USD = ${rate.toLocaleString()} د.ع</strong>
                </div>

                <div class="form-group">
                    <label>المبلغ بالدولار الأمريكي ($):</label>
                    <input type="number" id="calc-usd" class="form-control" placeholder="1.00" value="5"
                           oninput="window.StoreApp.Main.onCalcUsdChange(this.value)">
                </div>

                <div class="price-summary-box">
                    <span class="price-summary-label">يعادل بالدينار العراقي:</span>
                    <span class="price-summary-value text-primary" id="calc-iqd-result">
                        ${(5 * rate).toLocaleString('ar-IQ')} د.ع
                    </span>
                </div>
            `,
            showCancel: false,
            confirmText: 'تم'
        });
    }

    function onCalcUsdChange(val) {
        const resultEl = document.getElementById('calc-iqd-result');
        if (!resultEl) return;
        const num = parseFloat(val);
        if (isNaN(num) || num <= 0) {
            resultEl.innerText = '0 د.ع';
            return;
        }
        const iqd = Math.round(num * Constants.USD_TO_IQD);
        resultEl.innerText = `${iqd.toLocaleString('ar-IQ')} د.ع`;
    }

    return {
        init,
        openCurrencyCalc: showCurrencyCalculatorModal,
        onCalcUsdChange
    };
})();

// بدء التشغيل عند اكتمال تحميل شجرة العناصر DOM
document.addEventListener('DOMContentLoaded', () => {
    window.StoreApp.Main.init();
});
