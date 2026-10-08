
window.StoreApp = window.StoreApp || {};
window.StoreApp.UI = window.StoreApp.UI || {};

window.StoreApp.UI.Sidebar = (function() {
    'use strict';

    let sidebarEl = null;

    function init() {
        if (!sidebarEl) {
            sidebarEl = document.getElementById('sidebar-drawer');
        }
    }

    function open() {
        init();
        if (!sidebarEl) return;
        
        // Update user data dynamically
        const user = window.StoreApp.Services.Telegram.getUser() || { id: 0, first_name: 'مستخدم', username: '' };
        const bal = window.StoreApp.Services.Storage.getBalance();
        
        const fname = user.first_name || 'مستخدم';
        document.getElementById('sidebar-name').innerText = fname;
        document.getElementById('sidebar-avatar').innerText = fname.charAt(0);
        document.getElementById('sidebar-uid').innerText = user.username || user.id;
        document.getElementById('sidebar-balance').innerText = '$' + parseFloat(bal).toFixed(4);

        sidebarEl.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function close(e) {
        if (e && e.target !== e.currentTarget) return; // Prevent closing when clicking content
        init();
        if (!sidebarEl) return;
        sidebarEl.classList.remove('active');
        document.body.style.overflow = '';
    }

    return { init, open, close };
})();
