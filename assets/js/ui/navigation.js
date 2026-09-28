/**
 * ==============================================================================
 * @file        navigation.js
 * @package     StoreApp.UI.Navigation
 * @description موجه الصفحات (SPA Router) وإدارة التنقل السلس مع زر الرجوع الأصلي.
 * @author      Senior Software Architect (40+ Years Standards)
 * ==============================================================================
 */

window.StoreApp = window.StoreApp || {};
window.StoreApp.UI = window.StoreApp.UI || {};

window.StoreApp.UI.Navigation = (function() {
    'use strict';

    const Telegram = window.StoreApp.Services.Telegram;
    let activePageId = 'page-home';

    /**
     * @function init
     * @description بدء تشغيل الموجه وعرض الصفحة الرئيسية.
     */
    function init() {
        navigateTo('page-home');
    }

    /**
     * @function navigateTo
     * @description التنقل بين الصفحات وتحديث شريط التنقل السفلي وزر الرجوع.
     * @param {string} pageId - معرف الصفحة المستهدفة.
     * @param {HTMLElement} [navElement] - عنصر الشريط السفلي إذا تم النقر عليه.
     */
    function navigateTo(pageId, navElement = null) {
        activePageId = pageId;

        // إخفاء كافة أقسام الصفحات
        document.querySelectorAll('.page-section').forEach(sec => {
            sec.classList.remove('active');
        });

        // إظهار الصفحة المستهدفة
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }

        // تحديث حالة الشريط السفلي
        if (navElement) {
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            navElement.classList.add('active');
        } else {
            syncBottomNav(pageId);
        }

        // مزامنة زر الرجوع الأصلي في تليجرام
        if (pageId === 'page-home') {
            Telegram.clearBackButton();
        } else {
            Telegram.pushBackButton(() => {
                navigateTo('page-home');
            });
        }

        // إذا تم الدخول لصفحة الإشعارات، تحديدها كمقروءة
        if (pageId === 'page-notifications') {
            window.StoreApp.Services.Notification.markAllAsRead();
            updateNotifBadge();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /**
     * @function openPlatformView
     * @description فتح صفحة المنصة الفرعية وتوليد خدماتها.
     * @param {string} platformId - معرف المنصة.
     */
    function openPlatformView(platformId) {
        window.StoreApp.UI.Renderers.renderPlatformView(platformId);
        navigateTo('platform-view-page');
    }

    /**
     * @function syncBottomNav
     * @description مزامنة التحديد النشط في الشريط السفلي.
     */
    function syncBottomNav(pageId) {
        const navMap = {
            'page-home': 0,
            'page-orders': 1,
            'page-recharge': 2,
            'page-notifications': 3
        };

        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(n => n.classList.remove('active'));

        const index = navMap[pageId];
        if (index !== undefined && navItems[index]) {
            navItems[index].classList.add('active');
        }
    }

    /**
     * @function updateNotifBadge
     * @description تحديث نقطة التنبيهات الحمراء والشارة الرقمية.
     */
    function updateNotifBadge() {
        const count = window.StoreApp.Services.Notification.getUnreadCount();
        const badge = document.getElementById('header-notif-badge');
        const navBadge = document.getElementById('bottom-nav-notif-badge');

        if (badge) {
            badge.style.display = count > 0 ? 'block' : 'none';
        }
        if (navBadge) {
            navBadge.style.display = count > 0 ? 'inline-block' : 'none';
            navBadge.innerText = count > 99 ? '99+' : count;
        }
    }

    /**
     * @function getActivePage
     * @description معرفة الصفحة النشطة حالياً.
     */
    function getActivePage() {
        return activePageId;
    }

    return {
        init,
        navigateTo,
        openPlatformView,
        updateNotifBadge,
        getActivePage
    };
})();
