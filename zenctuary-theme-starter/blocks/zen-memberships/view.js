document.addEventListener('DOMContentLoaded', () => {
  const sections = document.querySelectorAll('.wp-block-zenctuary-zen-memberships');

  sections.forEach(section => {
    const tabBtns = section.querySelectorAll('.zen-memberships-tab-btn');
    const monthlyContainer = section.querySelector('#zen-memberships-monthly-container');
    const yearlyContainer = section.querySelector('#zen-memberships-yearly-container');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');

        // Reset all buttons
        tabBtns.forEach(b => {
          b.classList.remove('active');
          const inactiveBg = b.getAttribute('data-inactive-bg');
          const inactiveText = b.getAttribute('data-inactive-text');
          const inactiveFontSize = b.getAttribute('data-inactive-font-size');
          const inactiveFontWeight = b.getAttribute('data-inactive-font-weight');
          const inactiveBorderRadius = b.getAttribute('data-inactive-border-radius');
          const inactiveBorderColor = b.getAttribute('data-inactive-border-color');
          const borderWidth = b.getAttribute('data-border-width');
          const padding = b.getAttribute('data-padding');
          const margin = b.getAttribute('data-margin');

          b.style.backgroundColor = inactiveBg;
          b.style.color = inactiveText;
          b.style.fontSize = inactiveFontSize;
          b.style.fontWeight = inactiveFontWeight;
          b.style.borderRadius = inactiveBorderRadius;
          b.style.borderColor = inactiveBorderColor;
          b.style.borderWidth = borderWidth;
          b.style.padding = padding;
          b.style.margin = margin;
        });

        // Set active stats
        btn.classList.add('active');
        const activeBg = btn.getAttribute('data-active-bg');
        const activeText = btn.getAttribute('data-active-text');
        const activeFontSize = btn.getAttribute('data-active-font-size');
        const activeFontWeight = btn.getAttribute('data-active-font-weight');
        const activeBorderRadius = btn.getAttribute('data-active-border-radius');
        const activeBorderColor = btn.getAttribute('data-active-border-color');
        const borderWidth = btn.getAttribute('data-border-width');
        const padding = btn.getAttribute('data-padding');
        const margin = btn.getAttribute('data-margin');

        btn.style.backgroundColor = activeBg;
        btn.style.color = activeText;
        btn.style.fontSize = activeFontSize;
        btn.style.fontWeight = activeFontWeight;
        btn.style.borderRadius = activeBorderRadius;
        btn.style.borderColor = activeBorderColor;
        btn.style.borderWidth = borderWidth;
        btn.style.padding = padding;
        btn.style.margin = margin;

        // Toggle layout containers
        if (target === 'monthly') {
          if (monthlyContainer) {
            monthlyContainer.style.display = 'block';
            monthlyContainer.classList.add('active');
          }
          if (yearlyContainer) {
            yearlyContainer.style.display = 'none';
            yearlyContainer.classList.remove('active');
          }
        } else {
          if (monthlyContainer) {
            monthlyContainer.style.display = 'none';
            monthlyContainer.classList.remove('active');
          }
          if (yearlyContainer) {
            yearlyContainer.style.display = 'block';
            yearlyContainer.classList.add('active');
          }
        }
      });
    });
  });
});
