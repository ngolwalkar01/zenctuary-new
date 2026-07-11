document.addEventListener('DOMContentLoaded', () => {
  const getCartCount = () => {
    const count = Number(window.zenctuaryThemeData?.cart_count || 0);
    return Number.isFinite(count) && count > 0 ? count : 0;
  };

  const createHeaderCartButton = () => {
    const cartUrl = window.zenctuaryThemeData?.cart_url || '/cart/';
    const label = window.zenctuaryThemeData?.i18n?.cart || 'Cart';
    const button = document.createElement('a');

    button.className = 'zen-header-cart-trigger';
    button.href = cartUrl;
    button.setAttribute('data-zcf-open-checkout', '');
    button.setAttribute('aria-label', `${label} (${getCartCount()})`);
    button.innerHTML = `
      <span class="zen-header-cart-trigger__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <path d="M6.5 6.75h12.25l-1.4 7.15a2 2 0 0 1-1.96 1.6H9.12a2 2 0 0 1-1.96-1.59L5.85 4.75H3.75" />
          <path d="M9.25 19.25h.01M16.25 19.25h.01" />
        </svg>
      </span>
      <span class="zen-header-cart-trigger__count" data-zen-cart-count>${getCartCount()}</span>
    `;

    return button;
  };

  const openHeaderCartPopup = () => {
    const visibleMiniCartButton = Array.from(document.querySelectorAll(
      '.wc-block-mini-cart__button, .wp-block-woocommerce-mini-cart button, .site-header-cart a.cart-contents'
    )).find((button) => {
      const style = window.getComputedStyle(button);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });

    if (visibleMiniCartButton && typeof visibleMiniCartButton.click === 'function') {
      visibleMiniCartButton.click();
      return true;
    }

    if (window.jQuery) {
      window.jQuery(document.body).trigger('added_to_cart');
      return true;
    }

    document.body.dispatchEvent(new CustomEvent('added_to_cart'));
    return true;
  };

  const updateHeaderCartCount = (count) => {
    const nextCount = Math.max(0, Number(count || 0));

    window.zenctuaryThemeData = {
      ...(window.zenctuaryThemeData || {}),
      cart_count: nextCount,
    };

    document.querySelectorAll('[data-zen-cart-count]').forEach((node) => {
      node.textContent = String(nextCount);
      node.closest('.zen-header-cart-trigger')?.setAttribute(
        'aria-label',
        `${window.zenctuaryThemeData?.i18n?.cart || 'Cart'} (${nextCount})`
      );
    });
  };

  const getHeaderAccountButton = (header) => {
    if (!header) {
      return null;
    }

    return header.querySelector(
      '.wp-block-buttons .wp-block-button.zen-auth-trigger, .wp-block-buttons .wp-block-button[data-auth], .wp-block-buttons .wp-block-button'
    );
  };

  const ensureHeaderCartButton = () => {
    const header = document.querySelector('.zen-site-header');
    const accountButton = getHeaderAccountButton(header);

    if (!header || !accountButton || header.querySelector('.zen-header-cart-trigger')) {
      return;
    }

    accountButton.insertAdjacentElement('beforebegin', createHeaderCartButton());
  };

  const ensureMobileHeaderAccount = () => {
    const header = document.querySelector('.zen-site-header');
    const accountButton = getHeaderAccountButton(header);
    const accountLink = accountButton?.querySelector('.wp-block-button__link') || accountButton;
    const cartButton = header?.querySelector('.zen-header-cart-trigger');
    const responsiveContent = header?.querySelector('.wp-block-navigation__responsive-container-content');

    if (!accountLink || !responsiveContent || responsiveContent.querySelector('.zen-mobile-account-entry')) {
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'zen-mobile-account-entry';
    wrapper.innerHTML = accountLink.outerHTML;

    if (cartButton) {
      wrapper.appendChild(cartButton.cloneNode(true));
    }

    responsiveContent.appendChild(wrapper);
  };

  const initMobileHeaderSubmenus = () => {
    const isMobileView = () => window.matchMedia('(max-width: 1024px)').matches;
    const header = document.querySelector('.zen-site-header');

    if (!header) {
      return;
    }

    const getSubmenuParts = (item) => {
      if (!item) {
        return { toggle: null, submenu: null };
      }

      const directChildren = Array.from(item.children);
      const toggle =
        directChildren.find((child) => child.classList.contains('wp-block-navigation-submenu__toggle')) ||
        item.querySelector(':scope > .wp-block-navigation-submenu__toggle') ||
        item.querySelector('.wp-block-navigation-submenu__toggle');
      const submenu =
        directChildren.find((child) => child.classList.contains('wp-block-navigation__submenu-container')) ||
        item.querySelector(':scope > .wp-block-navigation__submenu-container') ||
        item.querySelector('.wp-block-navigation__submenu-container');

      return { toggle, submenu };
    };

    const getResponsiveContainers = () =>
      document.querySelectorAll('.zen-site-header .wp-block-navigation__responsive-container');

    const syncContainerSubmenus = (responsiveContainer, forceClosed = false) => {
      if (!responsiveContainer) {
        return;
      }

      const mobileView = window.matchMedia('(max-width: 1024px)').matches;
      const parentItems = responsiveContainer.querySelectorAll('.has-child');

      parentItems.forEach((item) => {
        const { toggle, submenu } = getSubmenuParts(item);

        if (!toggle || !submenu) {
          return;
        }

        if (!mobileView) {
          item.classList.remove('is-submenu-open');
          submenu.hidden = false;
          return;
        }

        if (forceClosed) {
          item.classList.remove('is-submenu-open');
        }

        const isOpen = item.classList.contains('is-submenu-open') && !forceClosed;
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        submenu.hidden = !isOpen;
      });
    };

    const syncAllResponsiveContainers = (forceClosed = false) => {
      getResponsiveContainers().forEach((container) => syncContainerSubmenus(container, forceClosed));
    };

    document.addEventListener('click', (event) => {
      const toggle = event.target.closest('.wp-block-navigation-submenu__toggle');

      if (!toggle || !isMobileView()) {
        return;
      }

      const responsiveContainer = toggle.closest('.wp-block-navigation__responsive-container');
      const item = toggle.closest('.has-child');
      const { submenu } = getSubmenuParts(item);

      if (!responsiveContainer || !item || !submenu) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const isOpen = item.classList.toggle('is-submenu-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      submenu.hidden = !isOpen;
    });

    document.addEventListener('click', (event) => {
      const openButton = event.target.closest('.wp-block-navigation__responsive-container-open');
      const closeButton = event.target.closest('.wp-block-navigation__responsive-container-close');

      if (openButton) {
        window.setTimeout(() => syncAllResponsiveContainers(true), 0);
      }

      if (closeButton) {
        syncAllResponsiveContainers(true);
      }
    });

    const observer = new MutationObserver(() => {
      syncAllResponsiveContainers(true);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    syncAllResponsiveContainers(true);
    window.addEventListener('resize', () => syncAllResponsiveContainers());
  };

  ensureHeaderCartButton();
  ensureMobileHeaderAccount();
  initMobileHeaderSubmenus();

  document.addEventListener('click', (event) => {
    const cartTrigger = event.target.closest('.zen-header-cart-trigger');

    if (!cartTrigger) {
      return;
    }

    event.preventDefault();
    openHeaderCartPopup();
  });

  document.addEventListener('zenctuary:cart-count-updated', (event) => {
    updateHeaderCartCount(event.detail?.count);
  });

  if (window.jQuery) {
    window.jQuery(document.body).on('added_to_cart removed_from_cart wc_fragments_refreshed', () => {
      window.setTimeout(() => {
        const fragmentCount = document.querySelector('.wc-block-mini-cart__badge, .cart-contents-count');

        if (fragmentCount) {
          updateHeaderCartCount(fragmentCount.textContent);
        }
      }, 0);
    });
  }

  // Existing snippet (if any)
  document.querySelectorAll('.zen-faq__question').forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('.zen-faq__item');
      if (item) item.classList.toggle('is-open');
    });
  });

  // Dynamic FSE Pattern FAQ Tab Filter Logic
  const faqSections = document.querySelectorAll('.zen-faq-section');

  faqSections.forEach(section => {
    // FSE Buttons behave as our Tabs
    const tabButtons = section.querySelectorAll('.wp-block-button__link');
    const faqGroups = section.querySelectorAll('.zen-faq-group');

    if (tabButtons.length === 0 || faqGroups.length === 0) return;

    tabButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const targetCategory = btn.textContent.trim().toLowerCase();

        // 1. Reset all FSE Buttons to outline (inactive state)
        tabButtons.forEach(b => {
          const parent = b.closest('.wp-block-button');
          if (parent) {
            parent.classList.remove('zen-btn--primary');
            parent.classList.add('zen-btn--outline-neutral');
          }
        });

        // 2. Set the clicked FSE Button to primary (active state)
        const activeParent = btn.closest('.wp-block-button');
        if (activeParent) {
          activeParent.classList.remove('zen-btn--outline-neutral');
          activeParent.classList.add('zen-btn--primary');
        }

        // 3. Hide all groups, then show the group matching the text
        faqGroups.forEach(group => {
          const h3 = group.querySelector('h3.wp-block-heading');
          if (h3 && h3.textContent.trim().toLowerCase() === targetCategory) {
            group.style.display = 'block'; // Or 'flex' depending on your native WP css
          } else {
            group.style.display = 'none';
          }
        });
      });
    });

    // Auto-click the first button on page load so it's not empty
    if (tabButtons.length > 0) {
      tabButtons[0].click();
    }
  });

  // ==========================================
  // SCROLL REVEAL — .zen-reveal
  // Observes sections with this class and adds
  // .is-visible when they enter the viewport.
  // Non-heading children animate up with stagger.
  // ==========================================
  const HEADING_TAGS = new Set(['H1', 'H2', 'H4', 'H5', 'H6']);

  document.querySelectorAll('.zen-reveal').forEach((section) => {
    // Collect animatable children (exclude headings and data-no-reveal)
    const animatableChildren = Array.from(section.children).filter((child) => {
      return !HEADING_TAGS.has(child.tagName) && !child.hasAttribute('data-no-reveal');
    });

    // Apply staggered transition-delay to each child
    animatableChildren.forEach((child, index) => {
      child.style.transitionDelay = (index * 0.1) + 's';
    });

    // Observe the section and add .is-visible once in viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // animate once only
          }
        });
      },
      { threshold: 0.12 } // trigger when 12% of section is visible
    );

    observer.observe(section);
  });
});
