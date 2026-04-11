/**
 * Client-side script for zenctuary/hero block.
 */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Entrance Animations via IntersectionObserver
    const animatedElements = document.querySelectorAll('.zenctuary-hero [data-animate]');
    
    if (animatedElements.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target); // Only animate once
                }
            });
        }, observerOptions);

        animatedElements.forEach(el => {
            observer.observe(el);
        });
    }

    // 2. Floating Contact Bundle Toggle
    const bundles = document.querySelectorAll('.zenctuary-hero__contact-wrapper');
    
    bundles.forEach(bundle => {
        const trigger = bundle.querySelector('.zenctuary-hero__contact-trigger');
        if (!trigger) return;

        trigger.addEventListener('click', () => {
            const isOpen = bundle.classList.toggle('is-open');
            trigger.setAttribute('aria-expanded', isOpen);
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!bundle.contains(e.target) && bundle.classList.contains('is-open')) {
                bundle.classList.remove('is-open');
                trigger.setAttribute('aria-expanded', 'false');
            }
        });
    });

});
