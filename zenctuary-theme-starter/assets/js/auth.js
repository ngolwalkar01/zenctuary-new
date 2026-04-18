/**
 * Zenctuary Authentication Modal Logic (Robust Version)
 * 
 * This version uses event delegation and dynamic DOM querying to remain
 * resilient even if WordPress or WooCommerce replaces DOM elements.
 */

window.zenctuaryAuth = (function() {
    'use strict';

    let isInitialized = false;

    /**
     * Initialize the global event listeners (Delegated)
     */
    function init() {
        if (isInitialized) return;

        // --- GLOBAL CLICK DELEGATION ---
        document.addEventListener('click', function(e) {
            // 1. Reusable Auth Triggers (data-auth)
            const authTrigger = e.target.closest('[data-auth]');
            if (authTrigger) {
                e.preventDefault();
                const action = authTrigger.dataset.auth;

                switch (action) {
                    case 'login':
                    case 'signup':
                    case 'account':
                        openModal(action);
                        break;
                    case 'logout':
                        handleLogout();
                        break;
                }
                return;
            }

            // 2. Modal Close Button
            if (e.target.closest('#zen-modal-close')) {
                closeModal();
                return;
            }

            // 3. Modal Overlay click
            const modal = document.getElementById('zenctuary-auth-modal');
            if (modal && e.target === modal) {
                closeModal();
                return;
            }

            // 4. View Switching (Login <-> Signup)
            const switchBtn = e.target.closest('[data-zen-switch-view]');
            if (switchBtn) {
                e.preventDefault();
                const targetView = switchBtn.dataset.zenSwitchView;
                setState(targetView);
                return;
            }

            // 5. Logout Trigger
            if (e.target.closest('.zen-logout-trigger')) {
                e.preventDefault();
                handleLogout();
                return;
            }
        });

        // --- GLOBAL SUBMIT DELEGATION ---
        document.addEventListener('submit', function(e) {
            const form = e.target;
            
            if (form.id === 'zen-login-form') {
                e.preventDefault();
                console.log('Zenctuary Auth: Login form submit');
                handleAuthSubmit(form, 'zenctuary_login');
            } else if (form.id === 'zen-register-form') {
                e.preventDefault();
                console.log('Zenctuary Auth: Register form submit');
                handleAuthSubmit(form, 'zenctuary_register');
            }
        });

        // --- GLOBAL KEYDOWN DELEGATION ---
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const modal = document.getElementById('zenctuary-auth-modal');
                if (modal && modal.classList.contains('is-active')) {
                    closeModal();
                }
            }
        });

        // Sync UI on load
        syncUI();

        isInitialized = true;
        console.log('Zenctuary Auth: Robust initialization complete');
    }

    /**
     * Synchronize UI elements with the current auth state
     * Re-queries DOM every time to avoid stale references.
     */
    function syncUI() {
        const isLoggedIn = zenctuaryAuthData.is_logged_in;
        const userData = zenctuaryAuthData.user_data;

        // Update Account View Content
        const displayNameEl = document.getElementById('zen-user-display-name');
        const emailEl = document.getElementById('zen-user-email');

        if (isLoggedIn && userData) {
            if (displayNameEl) displayNameEl.textContent = userData.display_name;
            if (emailEl) emailEl.textContent = userData.user_email;
        }

        // Update all data-auth triggers dynamically (ensures header and other triggers sync)
        const triggers = document.querySelectorAll('[data-auth="login"], [data-auth="account"]');
        triggers.forEach(trigger => {
            const label = trigger.querySelector('.zen-auth-label');
            
            if (isLoggedIn) {
                trigger.dataset.auth = 'account';
                if (label) label.textContent = 'My Account';
            } else {
                trigger.dataset.auth = 'login';
                if (label) label.textContent = 'Sign-In';
            }
        });

        // Sync modal view state
        if (isLoggedIn) {
            setState('account');
        } else {
            // Only force to login if current visible is account
            const modal = document.getElementById('zenctuary-auth-modal');
            if (modal) {
                const accountView = modal.querySelector('.zen-auth-view[data-view="account"]');
                if (accountView && accountView.classList.contains('is-active')) {
                    setState('login');
                }
            }
        }
    }

    /**
     * Handle AJAX authentication submissions
     */
    async function handleAuthSubmit(form, action) {
        const errorContainer = form.querySelector('.zen-error-container');
        const submitBtn = form.querySelector('button[type="submit"]');
        if (!submitBtn || !errorContainer) return;

        const formData = new FormData(form);

        // Reset UI
        errorContainer.textContent = '';
        submitBtn.disabled = true;
        submitBtn.classList.add('is-loading');

        // Prepare data
        formData.append('action', action);
        formData.append('security', zenctuaryAuthData.nonce);

        try {
            const response = await fetch(zenctuaryAuthData.ajax_url, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                zenctuaryAuthData.is_logged_in = true;
                zenctuaryAuthData.user_data = result.data.user_data;
                syncUI();
                setState('account');
            } else {
                errorContainer.textContent = result.data.message || 'An error occurred.';
            }
        } catch (error) {
            console.error('Zenctuary Auth Error:', error);
            errorContainer.textContent = 'Network error.';
        } finally {
            submitBtn.disabled = false;
            submitBtn.classList.remove('is-loading');
        }
    }

    /**
     * Handle Logout via AJAX
     */
    async function handleLogout() {
        const formData = new FormData();
        formData.append('action', 'zenctuary_logout');
        formData.append('security', zenctuaryAuthData.nonce);

        try {
            const response = await fetch(zenctuaryAuthData.ajax_url, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();

            if (result.success) {
                zenctuaryAuthData.is_logged_in = false;
                zenctuaryAuthData.user_data = null;
                syncUI();
                setState('login');
                console.log('Zenctuary Auth: Logout successful');
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    /**
     * Set the current modal state (view)
     */
    function setState(state) {
        const modal = document.getElementById('zenctuary-auth-modal');
        if (!modal) return;

        const views = modal.querySelectorAll('.zen-auth-view');
        let targetViewElement = null;

        views.forEach(view => {
            if (view.dataset.view === state) {
                view.classList.add('is-active');
                targetViewElement = view;
            } else {
                view.classList.remove('is-active');
            }
        });

        if (targetViewElement) {
            const heading = targetViewElement.querySelector('h2');
            if (heading) heading.focus();
        }
    }

    /**
     * Open the modal
     */
    function openModal(state = 'login') {
        const modal = document.getElementById('zenctuary-auth-modal');
        if (!modal) return;

        setState(state);
        modal.classList.add('is-active');
        document.body.classList.add('zen-modal-open');
        modal.setAttribute('aria-hidden', 'false');
    }

    /**
     * Close the modal
     */
    function closeModal() {
        const modal = document.getElementById('zenctuary-auth-modal');
        if (!modal) return;

        modal.classList.remove('is-active');
        document.body.classList.remove('zen-modal-open');
        modal.setAttribute('aria-hidden', 'true');
    }

    // Run init early or on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Public API
    return {
        openModal: openModal,
        closeModal: closeModal,
        setState: setState,
        syncUI: syncUI
    };

})();
