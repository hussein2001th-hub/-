/**
 * ==============================================================================
 * @file        toast.js
 * @package     StoreApp.UI.Toast
 * @description نافذة التنبيهات المنبثقة الخفيفة (Toast Notification Component).
 * @author      Senior Software Architect (40+ Years Standards)
 * ==============================================================================
 */

window.StoreApp = window.StoreApp || {};
window.StoreApp.UI = window.StoreApp.UI || {};

window.StoreApp.UI.Toast = (function() {
    'use strict';

    let timer = null;

    /**
     * @function show
     * @description إظهار إشعار سريع للمستخدم مع أيقونة مناسبة.
     * @param {string} message - نص التنبيه.
     * @param {'normal'|'success'|'error'|'warning'} type - نوع التنبيه.
     */
    function show(message, type = 'normal') {
        let toastEl = document.getElementById('toast');
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.id = 'toast';
            document.body.appendChild(toastEl);
        }

        // إيقاف أي مؤقت سابق
        if (timer) {
            clearTimeout(timer);
        }

        let icon = 'fas fa-info-circle';
        if (type === 'success') icon = 'fas fa-check-circle';
        else if (type === 'error') icon = 'fas fa-exclamation-circle';
        else if (type === 'warning') icon = 'fas fa-exclamation-triangle';

        // تطهير النص منعاً لحقن الأكواد
        const cleanMsg = window.StoreApp.Utils.Security.escapeHTML(message);

        toastEl.className = 'show';
        if (type === 'error') toastEl.classList.add('toast-error');
        else if (type === 'success') toastEl.classList.add('toast-success');
        else if (type === 'warning') toastEl.classList.add('toast-warning');

        toastEl.innerHTML = `<i class="${icon}"></i> <span>${cleanMsg}</span>`;

        timer = setTimeout(() => {
            toastEl.className = '';
        }, 3200);
    }

    return {
        show,
        success: (msg) => show(msg, 'success'),
        error: (msg) => show(msg, 'error'),
        warning: (msg) => show(msg, 'warning'),
        info: (msg) => show(msg, 'normal')
    };
})();
