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
                // Mobile: Strip 'is-active' classes and wrapper classes so everything is equal vertically
                block.classList.remove('has-active-panel');
                panels.forEach(p => p.classList.remove('is-active'));
            } else {
                // Desktop: Interactive hover accordion with Neutral base
                
                panels.forEach((p, index) => {
                    // Start in grouped neutral state
                    p.classList.remove('is-active');
                    block.classList.remove('has-active-panel');
                    
                    // Attach hover to panels
                    const enterHandler = () => {
                        panels.forEach(pa => pa.classList.remove('is-active'));
                        block.classList.add('has-active-panel');
                        p.classList.add('is-active');
                    };

                    p.addEventListener('mouseenter', enterHandler);
                    handlers[index] = enterHandler;
                });
                
                // Add mouseleave to reset block
                const leaveHandler = () => {
                    block.classList.remove('has-active-panel');
                    panels.forEach(pa => pa.classList.remove('is-active'));
                };
                block.addEventListener('mouseleave', leaveHandler);
                handlers['blockLeave'] = leaveHandler;
            }
        };

        // Initialize natively
        executeLayout();

        // Listen for screen resizing altering the layout boundary
        mql.addEventListener('change', executeLayout);
    });
});
