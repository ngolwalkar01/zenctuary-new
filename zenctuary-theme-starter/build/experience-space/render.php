<?php
/**
 * Server-side render template for zenctuary/experience-space block.
 *
 * Vars available from WordPress:
 *   $attributes  (array)    — block attributes
 *   $content     (string)   — inner block content (unused, dynamic block)
 *   $block       (WP_Block) — block instance
 *
 * @package Zenctuary
 */

// Pull and sanitize attributes.
$filter_taxonomy    = sanitize_key( $attributes['filterTaxonomy']    ?? 'experience_category' );
$filter_term_slug   = sanitize_key( $attributes['filterTermSlug']    ?? '' );
$primary_taxonomy   = sanitize_key( $attributes['primaryTaxonomy']   ?? 'space_type' );
$accordion_taxonomy = sanitize_key( $attributes['accordionTaxonomy'] ?? 'activity_type' );
$show_zencoins      = (bool) ( $attributes['showZencoins']    ?? true );
$show_difficulty    = (bool) ( $attributes['showDifficulty']  ?? true );
$show_book_btn      = (bool) ( $attributes['showBookButton']  ?? true );
$book_btn_label     = esc_html( $attributes['bookButtonLabel'] ?? 'Book now →' );

// Build query args — only add taxonomy filter if a term is selected.
$helper_args = [];
if ( $filter_term_slug && $filter_taxonomy ) {
    $helper_args[ $filter_taxonomy ] = $filter_term_slug;
}

$query = get_experience_products( $helper_args );

if ( empty( $query->posts ) ) {
    echo '<p class="zen-no-results">' . esc_html__( 'No experiences found. Assign products to the correct taxonomy terms.', 'zenctuary' ) . '</p>';
    return;
}

// Group: primary taxonomy → accordion taxonomy → products.
$grouped = group_products_nested( $query->posts, $primary_taxonomy, $accordion_taxonomy );

if ( empty( $grouped ) ) {
    echo '<p class="zen-no-results">' . esc_html__( 'Products were found but none are assigned to any "' . esc_html( $primary_taxonomy ) . '" term.', 'zenctuary' ) . '</p>';
    return;
}


?>
<div class="zen-experience-space-block">

    <?php foreach ( $grouped as $primary_slug => $primary_group ) :
        $primary_term = $primary_group['term'];
        $sub_groups   = $primary_group['groups'] ?? [];

        // Load term meta for space icon + description (only meaningful for space_type).
        $space_icon_url    = get_term_meta( $primary_term->term_id, '_zen_space_icon_url', true );
        $space_description = get_term_meta( $primary_term->term_id, '_zen_space_description', true );
    ?>

    <section class="zen-space-section" id="space-<?php echo esc_attr( $primary_slug ); ?>">

        <!-- Space Header -->
        <header class="zen-space-header">
            <?php if ( $space_icon_url ) : ?>
                <img class="zen-space-icon" src="<?php echo esc_url( $space_icon_url ); ?>" alt="<?php echo esc_attr( $primary_term->name ); ?>" />
            <?php endif; ?>
            <h2 class="zen-space-title"><?php echo esc_html( $primary_term->name ); ?></h2>
        </header>

        <?php if ( $space_description ) : ?>
            <p class="zen-space-description"><?php echo esc_html( $space_description ); ?></p>
        <?php endif; ?>

        <!-- Accordion Groups (only when activity_type terms are assigned) -->
        <?php if ( ! empty( $sub_groups ) ) : ?>

        <div class="zen-accordion-wrapper">
            <?php foreach ( $sub_groups as $activity_slug => $activity_group ) :
                $activity_term     = $activity_group['term'];
                $activity_products = $activity_group['products'];
                $is_first          = ( array_key_first( $sub_groups ) === $activity_slug );
            ?>

            <div class="zen-accordion-item <?php echo $is_first ? 'zen-accordion-item--open' : ''; ?>"
                 data-activity="<?php echo esc_attr( $activity_slug ); ?>">

                <button class="zen-accordion-header" aria-expanded="<?php echo $is_first ? 'true' : 'false'; ?>">
                    <span class="zen-accordion-title"><?php echo esc_html( $activity_term->name ); ?></span>
                    <span class="zen-accordion-icon" aria-hidden="true">
                        <span class="zen-accordion-icon--minus">&#8212;</span>
                        <span class="zen-accordion-icon--plus">+</span>
                    </span>
                </button>

                <div class="zen-accordion-panel" <?php echo ! $is_first ? 'hidden' : ''; ?>>
                    <div class="zen-class-cards-grid">
                        <?php foreach ( $activity_products as $product ) :
                            $meta      = get_experience_meta( $product->ID );
                            $link      = get_permalink( $product->ID );
                            $title     = get_the_title( $product );
                            $thumb_url = get_the_post_thumbnail_url( $product->ID, 'large' );
                        ?>
                        <article class="zen-class-card">
                            <div class="zen-class-card__image-wrap">
                                <?php if ( $thumb_url ) : ?>
                                    <img class="zen-class-card__image" src="<?php echo esc_url( $thumb_url ); ?>" alt="<?php echo esc_attr( $title ); ?>" />
                                <?php else : ?>
                                    <div class="zen-class-card__image zen-class-card__image--placeholder"></div>
                                <?php endif; ?>
                                <?php if ( $show_zencoins && $meta['zen_coins'] ) : ?>
                                <div class="zen-class-card__zencoins">
                                    <span class="zen-zencoins-label"><?php esc_html_e( 'Zencoins:', 'zenctuary' ); ?></span>
                                    <span class="zen-zencoins-badge"><?php echo (int) $meta['zen_coins']; ?></span>
                                </div>
                                <?php endif; ?>
                            </div>
                            <div class="zen-class-card__body">
                                <h3 class="zen-class-card__title"><?php echo esc_html( strtoupper( $title ) ); ?></h3>
                                <?php if ( $show_difficulty && ! empty( $meta['difficulty_level'] ) ) : ?>
                                <div class="zen-class-card__difficulty">
                                    <svg class="zen-difficulty-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM9.29 16.29L5.7 12.7C5.31 12.31 5.31 11.68 5.7 11.29C6.09 10.9 6.72 10.9 7.11 11.29L10 14.17L16.88 7.29C17.27 6.9 17.9 6.9 18.29 7.29C18.68 7.68 18.68 8.31 18.29 8.7L10.7 16.29C10.32 16.68 9.68 16.68 9.29 16.29Z" fill="currentColor"/></svg>
                                    <span><?php echo esc_html( $meta['difficulty_level'] ); ?></span>
                                </div>
                                <?php endif; ?>
                                <?php if ( ! empty( $meta['short_description'] ) ) : ?>
                                <p class="zen-class-card__desc"><?php echo esc_html( $meta['short_description'] ); ?></p>
                                <?php endif; ?>
                                <?php if ( $show_book_btn ) : ?>
                                <a href="<?php echo esc_url( $link ); ?>" class="zen-btn zen-btn--primary zen-class-card__btn">
                                    <?php echo $book_btn_label; ?>
                                </a>
                                <?php endif; ?>
                            </div>
                        </article>
                        <?php endforeach; ?>
                    </div>
                </div>

            </div><!-- /.zen-accordion-item -->

            <?php endforeach; ?>
        </div><!-- /.zen-accordion-wrapper -->

        <?php else : ?>
        <!-- Fallback: products have no activity_type term — render cards directly without accordion -->
        <div class="zen-class-cards-grid">
            <?php foreach ( $primary_group['products'] as $product ) :
                $meta      = get_experience_meta( $product->ID );
                $link      = get_permalink( $product->ID );
                $title     = get_the_title( $product );
                $thumb_url = get_the_post_thumbnail_url( $product->ID, 'large' );
            ?>
            <article class="zen-class-card">
                <div class="zen-class-card__image-wrap">
                    <?php if ( $thumb_url ) : ?>
                        <img class="zen-class-card__image" src="<?php echo esc_url( $thumb_url ); ?>" alt="<?php echo esc_attr( $title ); ?>" />
                    <?php else : ?>
                        <div class="zen-class-card__image zen-class-card__image--placeholder"></div>
                    <?php endif; ?>
                    <?php if ( $show_zencoins && $meta['zen_coins'] ) : ?>
                    <div class="zen-class-card__zencoins">
                        <span class="zen-zencoins-label"><?php esc_html_e( 'Zencoins:', 'zenctuary' ); ?></span>
                        <span class="zen-zencoins-badge"><?php echo (int) $meta['zen_coins']; ?></span>
                    </div>
                    <?php endif; ?>
                </div>
                <div class="zen-class-card__body">
                    <h3 class="zen-class-card__title"><?php echo esc_html( strtoupper( $title ) ); ?></h3>
                    <?php if ( $show_difficulty && ! empty( $meta['difficulty_level'] ) ) : ?>
                    <div class="zen-class-card__difficulty">
                        <svg class="zen-difficulty-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM9.29 16.29L5.7 12.7C5.31 12.31 5.31 11.68 5.7 11.29C6.09 10.9 6.72 10.9 7.11 11.29L10 14.17L16.88 7.29C17.27 6.9 17.9 6.9 18.29 7.29C18.68 7.68 18.68 8.31 18.29 8.7L10.7 16.29C10.32 16.68 9.68 16.68 9.29 16.29Z" fill="currentColor"/></svg>
                        <span><?php echo esc_html( $meta['difficulty_level'] ); ?></span>
                    </div>
                    <?php endif; ?>
                    <?php if ( ! empty( $meta['short_description'] ) ) : ?>
                    <p class="zen-class-card__desc"><?php echo esc_html( $meta['short_description'] ); ?></p>
                    <?php endif; ?>
                    <?php if ( $show_book_btn ) : ?>
                    <a href="<?php echo esc_url( $link ); ?>" class="zen-btn zen-btn--primary zen-class-card__btn">
                        <?php echo $book_btn_label; ?>
                    </a>
                    <?php endif; ?>
                </div>
            </article>
            <?php endforeach; ?>
        </div>
        <?php endif; ?>

    </section>


    <?php endforeach; ?>

</div><!-- /.zen-experience-space-block -->

<script>
( function() {
    document.querySelectorAll( '.zen-accordion-header' ).forEach( function( btn ) {
        btn.addEventListener( 'click', function() {
            var item  = btn.closest( '.zen-accordion-item' );
            var panel = item.querySelector( '.zen-accordion-panel' );
            var open  = item.classList.contains( 'zen-accordion-item--open' );

            if ( open ) {
                item.classList.remove( 'zen-accordion-item--open' );
                btn.setAttribute( 'aria-expanded', 'false' );
                panel.setAttribute( 'hidden', '' );
            } else {
                item.classList.add( 'zen-accordion-item--open' );
                btn.setAttribute( 'aria-expanded', 'true' );
                panel.removeAttribute( 'hidden' );
            }
        } );
    } );
} )();
</script>
