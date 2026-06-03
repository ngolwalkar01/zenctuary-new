document.addEventListener('DOMContentLoaded', () => {
  const backTrigger = document.querySelector('[data-zen-account-back]');
  const accountShell = document.querySelector('.zen-account-page-active .wp-block-group.zen-container.has-global-padding.is-layout-constrained.wp-block-group-is-layout-constrained');

  if (accountShell && !accountShell.querySelector('[data-zen-account-close]')) {
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'zen-account-close';
    closeButton.setAttribute('aria-label', 'Close account');
    closeButton.setAttribute('data-zen-account-close', '');
    accountShell.prepend(closeButton);
  }

  document.addEventListener('click', (event) => {
    const closeTrigger = event.target.closest('[data-zen-account-close]');

    if (!closeTrigger) {
      return;
    }

    event.preventDefault();
    window.location.href = zenctuaryAccountData?.fallbackUrl || '/';
  });

  if (backTrigger) {
    backTrigger.addEventListener('click', (event) => {
      const referrer = document.referrer;
      const sameOriginReferrer = referrer && referrer.startsWith(window.location.origin);

      if (sameOriginReferrer && window.history.length > 1) {
        event.preventDefault();
        window.history.back();
      } else if (backTrigger.getAttribute('href') === '#') {
        event.preventDefault();
        window.location.href = zenctuaryAccountData?.fallbackUrl || '/';
      }
    });
  }
});
