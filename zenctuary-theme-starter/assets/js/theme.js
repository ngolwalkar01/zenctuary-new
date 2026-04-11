document.addEventListener('DOMContentLoaded', () => {
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
          if(parent) {
             parent.classList.remove('zen-btn--primary');
             parent.classList.add('zen-btn--outline-neutral');
          }
        });

        // 2. Set the clicked FSE Button to primary (active state)
        const activeParent = btn.closest('.wp-block-button');
        if(activeParent) {
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
    if(tabButtons.length > 0) {
        tabButtons[0].click();
    }
  });
});
