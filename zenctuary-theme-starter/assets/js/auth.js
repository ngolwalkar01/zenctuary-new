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

        console.log('Zenctuary Auth: Initialized');
    }

    /**
     * Open the modal and switch to a specific view
     * @param {string} view - login, signup, or account
     */
    function openModal(view = 'login') {
        if (!modal) return;

        switchView(view);
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

    /**
     * Switch between auth views
     * @param {string} viewName - login, signup, or account
     */
    function switchView(viewName) {
        views.forEach(view => {
            if (view.dataset.view === viewName) {
                view.classList.add('is-active');
            } else {
                view.classList.remove('is-active');
            }
        });
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
        switchView: switchView
    };

})();
