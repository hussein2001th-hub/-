/**
 * ==============================================================================
 * @file        modal.js
 * @package     StoreApp.UI.Modal
 * @description نظام النوافذ المنبثقة التفاعلي والمحمي (Accessible Modal Dialog).
 * @author      Senior Software Architect (40+ Years Standards)
 * ==============================================================================
 */

window.StoreApp = window.StoreApp || {};
window.StoreApp.UI = window.StoreApp.UI || {};

window.StoreApp.UI.Modal = (function() {
    'use strict';

    let modalEl = null;

    /**
     * @function init
     * @description تجهيز عناصر المودال وربط أحداث الإغلاق وزر الهروب Escape.
     */
    function init() {
        if (!modalEl) {
            modalEl = document.getElementById('app-modal');
            if (modalEl) {
                // إغلاق عند النقر على الخلفية الضبابية
                modalEl.addEventListener('click', (e) => {
                    if (e.target === modalEl) {
                        close();
                    }
                });

                // إغلاق عند الضغط على زر Escape من لوحة المفاتيح
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && modalEl.classList.contains('active')) {
                        close();
                    }
                });
            }
        }
    }

    /**
     * @function show
     * @description فتح المودال مع تعبئة المحتوى ديناميكياً.
     * @param {Object} options
     * @param {string} options.title - عنوان النافذة.
     * @param {string} options.bodyHtml - محتوى HTML مجهز.
     * @param {string} [options.confirmText='تأكيد'] - نص زر التأكيد.
     * @param {string} [options.cancelText='إلغاء'] - نص زر الإلغاء.
     * @param {Function} [options.onConfirm] - دالة التنفيذ عند التأكيد.
     * @param {boolean} [options.showCancel=true] - إظهار زر الإلغاء.
     */
    function show({ title, bodyHtml, confirmText = 'تأكيد', cancelText = 'إلغاء', onConfirm = null, showCancel = true }) {
        init();
        if (!modalEl) return;

        const titleEl = modalEl.querySelector('.modal-title');
        const bodyEl = modalEl.querySelector('.modal-body');
        const footerEl = modalEl.querySelector('.modal-footer');

        if (titleEl) titleEl.innerHTML = title;
        if (bodyEl) bodyEl.innerHTML = bodyHtml;

        if (footerEl) {
            footerEl.innerHTML = `
                ${showCancel ? `<button type="button" class="btn-action btn-secondary modal-cancel-btn">${cancelText}</button>` : ''}
                <button type="button" class="btn-action modal-confirm-btn">${confirmText}</button>
            `;

            const confirmBtn = footerEl.querySelector('.modal-confirm-btn');
            const cancelBtn = footerEl.querySelector('.modal-cancel-btn');

            if (confirmBtn) {
                confirmBtn.onclick = () => {
                    close();
                    if (typeof onConfirm === 'function') {
                        onConfirm();
                    }
                };
            }

            if (cancelBtn) {
                cancelBtn.onclick = () => close();
            }
        }

        modalEl.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * @function close
     * @description إغلاق نافذة المودال واستعادة التمرير.
     */
    function close() {
        init();
        if (!modalEl) return;
        modalEl.classList.remove('active');
        document.body.style.overflow = '';
    }

    return {
        init,
        show,
        close
    };
})();
