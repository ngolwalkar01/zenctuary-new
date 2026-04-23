/**
 * Frontend JavaScript for Zen Soul Kitchen block.
 */

document.addEventListener('DOMContentLoaded', () => {
    const kitchenBlocks = document.querySelectorAll('.wp-block-zenctuary-zen-soul-kitchen');

    kitchenBlocks.forEach(block => {
        const filterButtons = block.querySelectorAll('.zen-soul-kitchen__filter-button');
        const categories = block.querySelectorAll('.zen-soul-kitchen__category');
        const products = block.querySelectorAll('.zen-soul-kitchen__product');

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const selectedTagId = button.getAttribute('data-tag-id');

                // Update active button state and styling
                filterButtons.forEach(btn => {
                    const isActive = btn === button;
                    btn.classList.toggle('is-active', isActive);

                    // Apply dynamic colors from data attributes
                    if (isActive) {
                        btn.style.backgroundColor = btn.getAttribute('data-active-bg');
                        btn.style.color = btn.getAttribute('data-active-color');
                        btn.style.borderColor = btn.getAttribute('data-active-border');
                        btn.style.fontWeight = '700';
                        btn.style.borderRadius = '25px';
                        btn.style.borderWidth = '1px';
                    } else {
                        btn.style.backgroundColor = btn.getAttribute('data-inactive-bg');
                        btn.style.color = btn.getAttribute('data-inactive-color');
                        btn.style.borderColor = btn.getAttribute('data-inactive-border');
                        btn.style.fontWeight = '400';
                        btn.style.borderRadius = btn.style.borderRadius || '25px'; // keep radius or default
                        btn.style.borderWidth = btn.style.borderWidth || '1px';
                    }
                });

                // Filter products
                products.forEach(product => {
                    const productTags = product.getAttribute('data-tags').split(',');
                    const isVisible = productTags.includes(selectedTagId);
                    product.style.display = isVisible ? 'block' : 'none';
                });

                // Filter categories (hide if no products are visible)
                categories.forEach(category => {
                    const visibleProducts = category.querySelectorAll('.zen-soul-kitchen__product[style*="display: block"]');
                    category.style.display = visibleProducts.length > 0 ? 'block' : 'none';
                });
            });
        });
    });
});
