document.addEventListener('DOMContentLoaded', () => {
  const ensureMobileHeaderAccount = () => {
    const header = document.querySelector('.zen-site-header');
    const accountLink = header?.querySelector('.wp-block-buttons .wp-block-button__link[href*="my-account"]');
    const responsiveContent = header?.querySelector('.wp-block-navigation__responsive-container-content');

    if (!accountLink || !responsiveContent || responsiveContent.querySelector('.zen-mobile-account-entry')) {
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'zen-mobile-account-entry';
    wrapper.innerHTML = accountLink.outerHTML;
    responsiveContent.appendChild(wrapper);
  };

  const initMobileHeaderSubmenus = () => {
    const header = document.querySelector('.zen-site-header');
    const responsiveContainer = header?.querySelector('.wp-block-navigation__responsive-container');

    if (!responsiveContainer) {
      return;
    }

    const getDirectChild = (parent, className) =>
      Array.from(parent.children).find((child) => child.classList.contains(className));

    const syncSubmenuState = () => {
      const mobileView = window.matchMedia('(max-width: 1024px)').matches;
      const parentItems = responsiveContainer.querySelectorAll('.wp-block-navigation-item.has-child');

      parentItems.forEach((item) => {
        const toggle = getDirectChild(item, 'wp-block-navigation-submenu__toggle');
        const submenu = getDirectChild(item, 'wp-block-navigation__submenu-container');

        if (!toggle || !submenu) {
          return;
        }

        if (!mobileView) {
          item.classList.remove('is-submenu-open');
          toggle.setAttribute('aria-expanded', 'false');
          submenu.hidden = false;
          return;
        }

        const isOpen = item.classList.contains('is-submenu-open');
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        submenu.hidden = !isOpen;
      });
    };

    const parentItems = responsiveContainer.querySelectorAll('.wp-block-navigation-item.has-child');

    parentItems.forEach((item) => {
      const toggle = getDirectChild(item, 'wp-block-navigation-submenu__toggle');
      const submenu = getDirectChild(item, 'wp-block-navigation__submenu-container');

      if (!toggle || !submenu || toggle.dataset.zenMobileBound === 'true') {
        return;
      }

      item.classList.remove('is-submenu-open');
      toggle.setAttribute('aria-expanded', 'false');
      submenu.hidden = true;
      toggle.dataset.zenMobileBound = 'true';

      toggle.addEventListener('click', (event) => {
        if (!window.matchMedia('(max-width: 1024px)').matches) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        const isOpen = item.classList.toggle('is-submenu-open');
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        submenu.hidden = !isOpen;
      });
    });

    syncSubmenuState();
    window.addEventListener('resize', syncSubmenuState);
  };

  ensureMobileHeaderAccount();
  initMobileHeaderSubmenus();

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
