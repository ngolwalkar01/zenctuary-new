document.addEventListener('DOMContentLoaded', () => {
    const blocks = document.querySelectorAll('.zenctuary-experience-panels');
    
    blocks.forEach(block => {
        const panels = block.querySelectorAll('.zep-panel');
        if (!panels.length) return;

        // Breakpoint matching style.css max-width: 1024px
        const mql = window.matchMedia('(max-width: 1024px)');
        
        let handlers = []; // Track to clean up

        const executeLayout = () => {
            clearHandlers();

            if (mql.matches) {
                // Mobile: Strip 'is-active' classes and wrapper classes so everything is equal vertically
                block.classList.remove('has-active-panel');
                panels.forEach(p => p.classList.remove('is-active'));
            } else {
                // Desktop: Interactive hover accordion with Neutral base
                panels.forEach(p => p.classList.remove('is-active'));
                block.classList.remove('has-active-panel');
                
                // Track mouse position over the block and divide equally among panels
                // This prevents 'runaway' boundaries where a growing panel traps the mouse.
                let currentIndex = -1;
                
                const moveHandler = (e) => {
                    const rect = block.getBoundingClientRect();
                    // clamp x between 0 and rect.width
                    let x = e.clientX - rect.left;
                    if (x < 0) x = 0;
                    if (x > rect.width) x = rect.width - 1;
                    
                    const slice = rect.width / panels.length;
                    const targetIndex = Math.floor(x / slice);
                    
                    if (targetIndex !== currentIndex) {
                        currentIndex = targetIndex;
                        if (!block.classList.contains('has-active-panel')) {
                            block.classList.add('has-active-panel');
                        }
                        
                        panels.forEach((p, index) => {
                            if (index === targetIndex) {
                                p.classList.add('is-active');
                            } else {
                                p.classList.remove('is-active');
                            }
                        });
                    }
                };

                // Add mouseleave to reset block
                const leaveHandler = () => {
                    currentIndex = -1;
                    block.classList.remove('has-active-panel');
                    panels.forEach(pa => pa.classList.remove('is-active'));
                };
                
                block.addEventListener('mousemove', moveHandler);
                block.addEventListener('mouseleave', leaveHandler);
                handlers['blockMove'] = moveHandler;
                handlers['blockLeave'] = leaveHandler;
            }
        };

        const clearHandlers = () => {
            if (handlers['blockMove']) {
                block.removeEventListener('mousemove', handlers['blockMove']);
            }
            if (handlers['blockLeave']) {
                block.removeEventListener('mouseleave', handlers['blockLeave']);
            }
        };

        // Initialize natively
        executeLayout();

        // Listen for screen resizing altering the layout boundary
        mql.addEventListener('change', executeLayout);
    });
});
