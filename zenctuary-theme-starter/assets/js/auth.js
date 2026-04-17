/**
 * Zenctuary Authentication Modal Logic
 */

window.zenctuaryAuth = (function() {
    'use strict';

    // Private variables
    let modal, overlay, closeBtn, views;

    /**
     * Initialize the modal elements and events
     */
    function init() {
        modal = document.getElementById('zenctuary-auth-modal');
        if (!modal) return;

        overlay = modal;
        closeBtn = document.getElementById('zen-modal-close');
        views = document.querySelectorAll('.zen-auth-view');

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
                console.log('Zenctuary Auth: Login form submit captured (Delegated)');
                handleAuthSubmit(form, 'zenctuary_login');
            } else if (form.id === 'zen-register-form') {
                e.preventDefault();
                console.log('Zenctuary Auth: Register form submit captured (Delegated)');
                handleAuthSubmit(form, 'zenctuary_register');
            }
        });

        console.log('Zenctuary Auth: Initialized with delegation');
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
                // Success: switch to account view
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

        try {
            await fetch(zenctuaryAuthData.ajax_url, {
                method: 'POST',
                body: formData
            });
            
            // Reload page on logout to clear all sessions/menus
            window.location.reload();
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
