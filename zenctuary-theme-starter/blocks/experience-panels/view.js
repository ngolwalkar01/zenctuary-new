document.addEventListener('DOMContentLoaded', () => {
    const blocks = document.querySelectorAll('.zenctuary-experience-panels');
    
    blocks.forEach(block => {
        const panels = block.querySelectorAll('.zep-panel');
        if (!panels.length) return;

        // Breakpoint matching style.css max-width: 1024px
        const mql = window.matchMedia('(max-width: 1024px)');
        
        let handlers = []; // Track to clean up

        const clearHandlers = () => {
            panels.forEach((p, idx) => {
                if (handlers[idx]) {
                    p.removeEventListener('mouseenter', handlers[idx]);
                }
            });
            handlers = [];
        };

        const executeLayout = () => {
            clearHandlers();

            if (mql.matches) {
                // Mobile: Strip 'is-active' classes so everything is equal
                panels.forEach(p => p.classList.remove('is-active'));
            } else {
                // Desktop: Interactive hover accordion
                const defaultActive = block.hasAttribute('data-default-active') ? parseInt(block.getAttribute('data-default-active'), 10) : 0;
                
                panels.forEach((p, index) => {
                    // Reset to default
                    if (index === defaultActive) p.classList.add('is-active');
                    else p.classList.remove('is-active');
                    
                    // Attach hover
                    const enterHandler = () => {
                        panels.forEach(pa => pa.classList.remove('is-active'));
                        p.classList.add('is-active');
                    };

                    p.addEventListener('mouseenter', enterHandler);
                    handlers[index] = enterHandler;
                });
            }
        };

        // Initialize natively
        executeLayout();

        // Listen for screen resizing altering the layout boundary
        mql.addEventListener('change', executeLayout);
    });
});
