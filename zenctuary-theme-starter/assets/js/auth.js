/**
 * Zenctuary Authentication Modal Logic (Robust Version)
 * 
 * This version uses event delegation and dynamic DOM querying to remain
 * resilient even if WordPress or WooCommerce replaces DOM elements.
 */

window.zenctuaryAuth = (function() {
    'use strict';

    const postAuthRedirectKey = 'zenctuary_post_auth_redirect';
    let isInitialized = false;

    let itiInstance = null;
    let intlTelInputPromise = null;

    function loadStylesheet(href) {
        if (!href || document.querySelector(`link[href="${href}"]`)) {
            return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }

    function loadScript(src) {
        if (!src) {
            return Promise.reject(new Error('Missing script URL.'));
        }

        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
            return new Promise((resolve, reject) => {
                if (existing.dataset.loaded === 'true') {
                    resolve();
                    return;
                }

                existing.addEventListener('load', resolve, { once: true });
                existing.addEventListener('error', reject, { once: true });
            });
        }

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            script.onload = () => {
                script.dataset.loaded = 'true';
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    function ensurePhoneEnhancer() {
        const phoneInput = document.getElementById('zen-reg-phone');
        if (!phoneInput || itiInstance) {
            return Promise.resolve();
        }

        if (typeof window.intlTelInput !== 'undefined') {
            const assets = zenctuaryAuthData.intl_tel_input || {};

            itiInstance = window.intlTelInput(phoneInput, {
                initialCountry: 'de',
                separateDialCode: true,
                countrySearch: true,
                utilsScript: assets.utils_url || '',
                autoPlaceholder: 'polite',
                preferredCountries: ['de', 'us', 'gb', 'fr'],
                dropdownContainer: document.body
            });

            return Promise.resolve();
        }

        if (!intlTelInputPromise) {
            const assets = zenctuaryAuthData.intl_tel_input || {};

            loadStylesheet(assets.style_url);
            intlTelInputPromise = loadScript(assets.script_url)
                .then(() => ensurePhoneEnhancer())
                .catch((error) => {
                    intlTelInputPromise = null;
                    console.error('Zenctuary Auth: Phone input library failed to load', error);
                });
        }

        return intlTelInputPromise;
    }

    /**
     * Initialize the global event listeners (Delegated)
     */
    function init() {
        if (isInitialized) return;

        populateCountryStateFields();

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
                        openModal(action);
                        break;
                    case 'account':
                        window.location.href = zenctuaryAuthData.my_account_url;
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

            // 6. Clear Input Field
            const clearBtn = e.target.closest('.zen-clear-input');
            if (clearBtn) {
                const input = clearBtn.closest('.zen-input-container').querySelector('input');
                if (input) {
                    input.value = '';
                    input.focus();
                }
                return;
            }

            // 7. Toggle Password Visibility
            const toggleBtn = e.target.closest('.zen-toggle-password');
            if (toggleBtn) {
                const input = toggleBtn.closest('.zen-input-container').querySelector('input');
                if (input) {
                    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                    input.setAttribute('type', type);
                    
                    // Update icon visual state
                    const eyeOpen = toggleBtn.querySelector('.eye-open');
                    const eyeClosed = toggleBtn.querySelector('.eye-closed');
                    if (eyeOpen && eyeClosed) {
                        if (type === 'text') {
                            eyeOpen.style.display = 'block';
                            eyeClosed.style.display = 'none';
                        } else {
                            eyeOpen.style.display = 'none';
                            eyeClosed.style.display = 'block';
                        }
                    }
                    toggleBtn.classList.toggle('is-visible', type === 'text');
                }
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
    }

    function getPostAuthRedirect() {
        try {
            return window.sessionStorage.getItem(postAuthRedirectKey) || '';
        } catch (error) {
            return '';
        }
    }

    function clearPostAuthRedirect() {
        try {
            window.sessionStorage.removeItem(postAuthRedirectKey);
        } catch (error) {
            // Ignore storage access failures.
        }
    }

    function populateCountryStateFields() {
        const countrySelect = document.getElementById('zen-reg-country');
        const stateSelect = document.getElementById('zen-reg-state');

        if (!countrySelect || !stateSelect) return;

        const countries = zenctuaryAuthData.countries || {};
        const states = zenctuaryAuthData.states || {};

        countrySelect.innerHTML = '<option value="" disabled selected>Country</option>';

        Object.entries(countries).forEach(([code, name]) => {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = name;
            countrySelect.appendChild(option);
        });

        const defaultCountry = zenctuaryAuthData.default_country || '';
        if (defaultCountry && countries[defaultCountry]) {
            countrySelect.value = defaultCountry;
        }

        function updateStates() {
            const country = countrySelect.value;
            const countryStates = states[country] || {};
            const stateEntries = Array.isArray(countryStates) ? countryStates : Object.entries(countryStates);

            stateSelect.innerHTML = '';

            if (!stateEntries.length) {
                const option = document.createElement('option');
                option.value = '';
                option.textContent = 'State';
                option.selected = true;
                stateSelect.appendChild(option);
                stateSelect.required = false;
                stateSelect.disabled = true;
                return;
            }

            const placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.textContent = 'State';
            placeholder.disabled = true;
            placeholder.selected = true;
            stateSelect.appendChild(placeholder);

            stateEntries.forEach((entry) => {
                const code = Array.isArray(entry) ? entry[0] : entry;
                const name = Array.isArray(entry) ? entry[1] : entry;
                const option = document.createElement('option');
                option.value = code;
                option.textContent = name;
                stateSelect.appendChild(option);
            });

            stateSelect.required = true;
            stateSelect.disabled = false;
        }

        countrySelect.addEventListener('change', updateStates);
        updateStates();
    }

    function resolvePostAuthRedirect(defaultUrl) {
        const storedRedirect = getPostAuthRedirect();

        if (storedRedirect) {
            clearPostAuthRedirect();
            return storedRedirect;
        }

        return defaultUrl || zenctuaryAuthData.my_account_url;
    }

    /**
     * Handle AJAX authentication submissions
     */
    async function handleAuthSubmit(form, action) {
        const errorContainer = form.querySelector('.zen-error-container');
        const submitBtn = form.querySelector('button[type="submit"]');
        if (!submitBtn || !errorContainer) return;

        // Reset UI
        errorContainer.textContent = '';
        
        // --- CUSTOM VALIDATION ---
        
        // 1. Phone validation (Registration only)
        if (form.id === 'zen-register-form') {
            await ensurePhoneEnhancer();
        }

        if (form.id === 'zen-register-form' && itiInstance) {
            const phoneInput = form.querySelector('#zen-reg-phone');
            if (phoneInput && phoneInput.value.trim() !== '') {
                if (!itiInstance.isValidNumber()) {
                    errorContainer.textContent = 'Please enter a valid phone number.';
                    return;
                }
            }
        }

        // 2. Password Match (Registration only)
        if (form.id === 'zen-register-form') {
            const pass = form.querySelector('#zen-reg-password').value;
            const confirm = form.querySelector('#zen-reg-confirm-password').value;
            if (pass !== confirm) {
                errorContainer.textContent = 'Passwords do not match.';
                return;
            }
        }

        const formData = new FormData(form);

        // --- DATA PREPARATION ---

        // Append full phone number if registration
        if (form.id === 'zen-register-form' && itiInstance) {
            formData.set('phone', itiInstance.getNumber());
        }

        submitBtn.disabled = true;
        submitBtn.classList.add('is-loading');

        // Prepare data for WordPress
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
                window.location.href = resolvePostAuthRedirect(result.data.redirect_url || zenctuaryAuthData.my_account_url);
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
                clearPostAuthRedirect();
                syncUI();
                setState('login');
                window.location.href = zenctuaryAuthData.home_url || '/';
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
        const container = modal.querySelector('.zen-modal-container');
        let targetViewElement = null;

        if (container) {
            container.dataset.view = state;
        }

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

        if (state === 'signup') {
            ensurePhoneEnhancer();
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
