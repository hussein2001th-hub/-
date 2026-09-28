/**
 * ==============================================================================
 * @file        notificationService.js
 * @package     StoreApp.Services.Notification
 * @description إدارة مركز الإشعارات والتنبيهات، وحساب الرسائل غير المقروءة.
 * @author      Senior Software Architect (40+ Years Standards)
 * ==============================================================================
 */

window.StoreApp = window.StoreApp || {};
window.StoreApp.Services = window.StoreApp.Services || {};

window.StoreApp.Services.Notification = (function() {
    'use strict';

    const Storage = window.StoreApp.Services.Storage;

    /**
     * @function getNotifications
     * @description جلب كافة الإشعارات المسجلة مرتبة من الأحدث إلى الأقدم.
     */
    function getNotifications() {
        const state = Storage.getState();
        return state.notifications || [];
    }

    /**
     * @function getUnreadCount
     * @description إحصاء عدد التنبيهات الجديدة غير المقروءة لتحديث شارة الجرس.
     */
    function getUnreadCount() {
        const list = getNotifications();
        return list.filter(n => !n.read).length;
    }

    /**
     * @function markAllAsRead
     * @description تحديد كافة الإشعارات كمقروءة وإخفاء النقطة الحمراء.
     */
    function markAllAsRead() {
        const state = Storage.getState();
        if (Array.isArray(state.notifications)) {
            let changed = false;
            state.notifications.forEach(n => {
                if (!n.read) {
                    n.read = true;
                    changed = true;
                }
            });
            if (changed) {
                Storage.saveState(state);
            }
        }
    }

    /**
     * @function addNotification
     * @description إضافة تنبيه جديد إلى القائمة.
     */
    function addNotification(title, body, time = 'الآن') {
        const state = Storage.getState();
        state.notifications.unshift({
            id: Date.now(),
            title: title,
            body: body,
            time: time,
            read: false
        });
        Storage.saveState(state);
    }

    /**
     * @function clearAll
     * @description مسح سجل الإشعارات بالكامل.
     */
    function clearAll() {
        const state = Storage.getState();
        state.notifications = [];
        Storage.saveState(state);
    }

    return {
        getNotifications,
        getUnreadCount,
        markAllAsRead,
        addNotification,
        clearAll
    };
})();

// التوافقية العكسية للاسم القديم
window.StoreApp.NotificationService = window.StoreApp.Services.Notification;
