document.addEventListener('DOMContentLoaded', () => {
  const backTrigger = document.querySelector('[data-zen-account-back]');

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
