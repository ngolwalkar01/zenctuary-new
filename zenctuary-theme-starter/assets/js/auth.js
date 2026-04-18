/**
 * Zenctuary Authentication Modal Logic
 */

window.zenctuaryAuth = (function() {
    'use strict';

    // Private variables
    let modal, overlay, closeBtn, views, headerTriggers;

    /**
     * Initialize the modal elements and events
     */
    function init() {
        modal = document.getElementById('zenctuary-auth-modal');
        if (!modal) return;

        overlay = modal;
        closeBtn = document.getElementById('zen-modal-close');
        views = document.querySelectorAll('.zen-auth-view');
        headerTriggers = document.querySelectorAll('.zen-auth-trigger');

        // Sync UI on load
        syncUI();

        // Header trigger clicks
        headerTriggers.forEach(trigger => {
            trigger.addEventListener('click', function(e) {
                e.preventDefault();
                if (zenctuaryAuthData.is_logged_in) {
                    openModal('account');
                } else {
                    openModal('login');
                }
            });
        });

        // Close button click
        if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
        }

        // Overlay click (closes only if clicking the overlay itself)
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeModal();
            }
        });

        // ESC key close
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('is-active')) {
                closeModal();
            }
        });

        // Delegate clicks for view switching
        modal.addEventListener('click', function(e) {
            const switchBtn = e.target.closest('[data-zen-switch-view]');
            if (switchBtn) {
                e.preventDefault();
                const targetView = switchBtn.dataset.zenSwitchView;
                setState(targetView);
            }

            // Logout trigger
            const logoutBtn = e.target.closest('.zen-logout-trigger');
            if (logoutBtn) {
                e.preventDefault();
                handleLogout();
            }
        });

        // Delegated form submissions
        modal.addEventListener('submit', function(e) {
            const form = e.target;
            
            if (form.id === 'zen-login-form') {
                e.preventDefault();
                console.log('Zenctuary Auth: Login form submit captured');
                handleAuthSubmit(form, 'zenctuary_login');
            } else if (form.id === 'zen-register-form') {
                e.preventDefault();
                console.log('Zenctuary Auth: Register form submit captured');
                handleAuthSubmit(form, 'zenctuary_register');
            }
        });

        console.log('Zenctuary Auth: Initialized');
    }

    /**
     * Synchronize UI elements with the current auth state
     */
    function syncUI() {
        const isLoggedIn = zenctuaryAuthData.is_logged_in;
        const userData = zenctuaryAuthData.user_data;

        // Update Account View
        const displayNameEl = document.getElementById('zen-user-display-name');
        const emailEl = document.getElementById('zen-user-email');

        if (isLoggedIn && userData) {
            if (displayNameEl) displayNameEl.textContent = userData.display_name;
            if (emailEl) emailEl.textContent = userData.user_email;
        }

        // Update Header Buttons
        headerTriggers.forEach(trigger => {
            const link = trigger.querySelector('a');
            if (!link) return;

            if (isLoggedIn) {
                // Change to "My Account"
                const icon = link.querySelector('svg');
                link.innerHTML = 'My Account ';
                if (icon) link.appendChild(icon);
                link.setAttribute('href', '#account');
            } else {
                // Change to "Sign-In"
                const icon = link.querySelector('svg');
                link.innerHTML = 'Sign-In ';
                if (icon) link.appendChild(icon);
                link.setAttribute('href', '/my-account');
            }
        });

        // Set default modal view based on session
        if (isLoggedIn) {
            setState('account');
        } else {
            // Default to login, but preserve if user was on signup
            const currentActive = Array.from(views).find(v => v.classList.contains('is-active'));
            if (!currentActive || currentActive.dataset.view === 'account') {
                setState('login');
            }
        }
    }

    /**
     * Handle AJAX authentication submissions
     * @param {HTMLFormElement} form - The form being submitted
     * @param {string} action - The WP AJAX action
     */
    async function handleAuthSubmit(form, action) {
        const errorContainer = form.querySelector('.zen-error-container');
        const submitBtn = form.querySelector('button[type="submit"]');
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
                // Update local state
                zenctuaryAuthData.is_logged_in = true;
                zenctuaryAuthData.user_data = result.data.user_data;
                
                // Sync UI and switch to account view
                syncUI();
                setState('account');
            } else {
                // Error: show message
                errorContainer.textContent = result.data.message || 'An error occurred. Please try again.';
            }
        } catch (error) {
            console.error('Zenctuary Auth Error:', error);
            errorContainer.textContent = 'Network error. Please check your connection.';
        } finally {
            submitBtn.disabled = false;
            submitBtn.classList.remove('is-loading');
        }
    }

    /**
     * Handle Logout
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
                // Update local state
                zenctuaryAuthData.is_logged_in = false;
                zenctuaryAuthData.user_data = null;

                // Sync UI and switch to login view
                syncUI();
                setState('login');
                
                console.log('Zenctuary Auth: Logged out successfully');
            }
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    /**
     * Set the current modal state (view)
     * @param {string} state - login, signup, or account
     */
    function setState(state) {
        if (!views) return;

        let targetViewElement = null;

        views.forEach(view => {
            if (view.dataset.view === state) {
                view.classList.add('is-active');
                targetViewElement = view;
            } else {
                view.classList.remove('is-active');
            }
        });

        // Accessibility: Focus the heading of the new view
        if (targetViewElement) {
            const heading = targetViewElement.querySelector('h2');
            if (heading) {
                heading.focus();
            }
        }
    }

    /**
     * Open the modal and switch to a specific state
     * @param {string} state - login, signup, or account
     */
    function openModal(state = 'login') {
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
        if (!modal) return;

        modal.classList.remove('is-active');
        document.body.classList.remove('zen-modal-open');
        modal.setAttribute('aria-hidden', 'true');
    }

    // Run init on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Public API
    return {
        openModal: openModal,
        closeModal: closeModal,
        setState: setState
    };

})();
