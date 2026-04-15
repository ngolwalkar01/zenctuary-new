document.addEventListener('DOMContentLoaded', () => {
  const blocks = document.querySelectorAll('.wp-block-zenctuary-zen-memberships-section');

  blocks.forEach(block => {
    const tabBtns = block.querySelectorAll('.zen-memberships-tab-btn');
    const monthlyGrid = block.querySelector('#zen-cards-monthly');
    const yearlyGrid = block.querySelector('#zen-cards-yearly');

    // Tab Toggle Logic
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        
        // Reset all buttons to inactive style
        tabBtns.forEach(b => {
          b.classList.remove('active');
          const inactiveBg = b.getAttribute('data-inactive-bg');
          const inactiveText = b.getAttribute('data-inactive-text');
          const inactiveBorder = b.getAttribute('data-inactive-border-color');
          b.style.backgroundColor = inactiveBg;
          b.style.color = inactiveText;
          b.style.borderColor = inactiveBorder;
          b.style.borderWidth = '1px';
          b.style.borderRadius = '25px'; // default
        });

        // Set active style for clicked button
        btn.classList.add('active');
        const activeBg = btn.getAttribute('data-active-bg');
        const activeText = btn.getAttribute('data-active-text');
        const activeBorder = btn.getAttribute('data-active-border-color');
        const activeBorderWidth = btn.getAttribute('data-active-border-width');
        const activeBorderRadius = btn.getAttribute('data-active-border-radius');
        
        btn.style.backgroundColor = activeBg;
        btn.style.color = activeText;
        btn.style.borderColor = activeBorder;
        btn.style.borderWidth = activeBorderWidth + 'px';
        btn.style.borderRadius = activeBorderRadius;

        // Toggle grids
        if (target === 'monthly') {
          monthlyGrid.classList.add('active');
          if(yearlyGrid) yearlyGrid.classList.remove('active');
        } else {
          yearlyGrid.classList.add('active');
          if(monthlyGrid) monthlyGrid.classList.remove('active');
        }
      });
    });

    // Accordion Expand Logic
    const expandToggles = block.querySelectorAll('.zen-card-expand-toggle');
    expandToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        const content = toggle.nextElementSibling;
        const icon = toggle.querySelector('.zen-card-expand-icon');
        
        if (content.classList.contains('open')) {
          content.classList.remove('open');
          icon.textContent = '+';
        } else {
          content.classList.add('open');
          icon.textContent = '-';
        }
      });
    });
  });
});
