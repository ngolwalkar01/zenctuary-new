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
        });

        console.log('Zenctuary Auth: Initialized');
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
