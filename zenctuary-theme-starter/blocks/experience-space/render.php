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

// Styling attributes.
$heading_icon_size      = (int) ( $attributes['headingIconSize'] ?? 48 );
$heading_icon_gap       = (int) ( $attributes['headingIconGap'] ?? 16 );
$heading_font_size      = (int) ( $attributes['headingFontSize'] ?? 36 );
$heading_font_weight    = esc_attr( $attributes['headingFontWeight'] ?? '700' );
$heading_letter_spacing = (float) ( $attributes['headingLetterSpacing'] ?? 0.05 );
$heading_text_transform = esc_attr( $attributes['headingTextTransform'] ?? 'uppercase' );
$heading_color          = esc_attr( $attributes['headingColor'] ?? '#D8B355' );

$desc_font_size      = (int) ( $attributes['descFontSize'] ?? 16 );
$desc_font_weight    = esc_attr( $attributes['descFontWeight'] ?? '400' );
$desc_line_height    = (float) ( $attributes['descLineHeight'] ?? 1.6 );
$desc_color          = esc_attr( $attributes['descColor'] ?? '#F6F2EA' );
$desc_max_width      = (int) ( $attributes['descMaxWidth'] ?? 900 );

$accordion_border_width   = (int) ( $attributes['accordionBorderWidth'] ?? 1 );
$accordion_border_color   = esc_attr( $attributes['accordionBorderColor'] ?? '#3d3c3c' );
$accordion_border_radius  = (int) ( $attributes['accordionBorderRadius'] ?? 24 );
$accordion_padding_x      = (int) ( $attributes['accordionPaddingX'] ?? 32 );
$accordion_padding_y      = (int) ( $attributes['accordionPaddingY'] ?? 24 );
$accordion_title_font_size      = (int) ( $attributes['accordionTitleFontSize'] ?? 20 );
$accordion_title_font_weight    = esc_attr( $attributes['accordionTitleFontWeight'] ?? '700' );
$accordion_title_color          = esc_attr( $attributes['accordionTitleColor'] ?? '#F6F2EA' );
$accordion_icon_size            = (int) ( $attributes['accordionIconSize'] ?? 28 );
$accordion_icon_weight          = esc_attr( $attributes['accordionIconWeight'] ?? '300' );
$accordion_gap                  = (int) ( $attributes['accordionGap'] ?? 8 );

$zencoin_placement       = esc_attr( $attributes['zencoinPlacement'] ?? 'bottom-right' );
$zencoin_label_font_size = (int) ( $attributes['zencoinLabelFontSize'] ?? 11 );
$zencoin_label_font_weight = esc_attr( $attributes['zencoinLabelFontWeight'] ?? '700' );
$zencoin_label_color     = esc_attr( $attributes['zencoinLabelColor'] ?? '#D8B355' );
$zencoin_badge_size      = (int) ( $attributes['zencoinBadgeSize'] ?? 32 );
$zencoin_badge_font_size = (int) ( $attributes['zencoinBadgeFontSize'] ?? 13 );
$zencoin_badge_bg_color  = esc_attr( $attributes['zencoinBadgeBgColor'] ?? '#D8B355' );
$zencoin_badge_text_color = esc_attr( $attributes['zencoinBadgeTextColor'] ?? '#3F3E3E' );
$zencoin_gap             = (int) ( $attributes['zencoinGap'] ?? 8 );

$btn_font_size     = (int) ( $attributes['btnFontSize'] ?? 16 );
$btn_font_weight   = esc_attr( $attributes['btnFontWeight'] ?? '700' );
$btn_padding_x     = (int) ( $attributes['btnPaddingX'] ?? 32 );
$btn_padding_y     = (int) ( $attributes['btnPaddingY'] ?? 16 );
$btn_border_radius = (int) ( $attributes['btnBorderRadius'] ?? 999 );
$btn_border_width  = (int) ( $attributes['btnBorderWidth'] ?? 1 );
$btn_border_color  = esc_attr( $attributes['btnBorderColor'] ?? '#D8B355' );
$btn_bg_color      = esc_attr( $attributes['btnBgColor'] ?? '#D8B355' );
$btn_text_color    = esc_attr( $attributes['btnTextColor'] ?? '#1D1D1B' );
$btn_margin_top    = (int) ( $attributes['btnMarginTop'] ?? 0 );

$card_image_height   = (int) ( $attributes['cardImageHeight'] ?? 220 );
$card_body_padding   = (int) ( $attributes['cardBodyPadding'] ?? 24 );
$card_border_radius  = (int) ( $attributes['cardBorderRadius'] ?? 24 );

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

// Build inline styles.
$inline_styles = '
:root {
    --zen-exp-heading-icon-size: ' . $heading_icon_size . 'px;
    --zen-exp-heading-icon-gap: ' . $heading_icon_gap . 'px;
    --zen-exp-heading-font-size: ' . $heading_font_size . 'px;
    --zen-exp-heading-font-weight: ' . $heading_font_weight . ';
    --zen-exp-heading-letter-spacing: ' . $heading_letter_spacing . 'px;
    --zen-exp-heading-text-transform: ' . $heading_text_transform . ';
    --zen-exp-heading-color: ' . $heading_color . ';

    --zen-exp-desc-font-size: ' . $desc_font_size . 'px;
    --zen-exp-desc-font-weight: ' . $desc_font_weight . ';
    --zen-exp-desc-line-height: ' . $desc_line_height . ';
    --zen-exp-desc-color: ' . $desc_color . ';
    --zen-exp-desc-max-width: ' . $desc_max_width . 'px;

    --zen-exp-accordion-border-width: ' . $accordion_border_width . 'px;
    --zen-exp-accordion-border-color: ' . $accordion_border_color . ';
    --zen-exp-accordion-border-radius: ' . $accordion_border_radius . 'px;
    --zen-exp-accordion-padding-x: ' . $accordion_padding_x . 'px;
    --zen-exp-accordion-padding-y: ' . $accordion_padding_y . 'px;
    --zen-exp-accordion-title-font-size: ' . $accordion_title_font_size . 'px;
    --zen-exp-accordion-title-font-weight: ' . $accordion_title_font_weight . ';
    --zen-exp-accordion-title-color: ' . $accordion_title_color . ';
    --zen-exp-accordion-icon-size: ' . $accordion_icon_size . 'px;
    --zen-exp-accordion-icon-weight: ' . $accordion_icon_weight . ';
    --zen-exp-accordion-gap: ' . $accordion_gap . 'px;

    --zen-exp-zencoin-placement: ' . $zencoin_placement . ';
    --zen-exp-zencoin-label-font-size: ' . $zencoin_label_font_size . 'px;
    --zen-exp-zencoin-label-font-weight: ' . $zencoin_label_font_weight . ';
    --zen-exp-zencoin-label-color: ' . $zencoin_label_color . ';
    --zen-exp-zencoin-badge-size: ' . $zencoin_badge_size . 'px;
    --zen-exp-zencoin-badge-font-size: ' . $zencoin_badge_font_size . 'px;
    --zen-exp-zencoin-badge-bg-color: ' . $zencoin_badge_bg_color . ';
    --zen-exp-zencoin-badge-text-color: ' . $zencoin_badge_text_color . ';
    --zen-exp-zencoin-gap: ' . $zencoin_gap . 'px;

    --zen-exp-btn-font-size: ' . $btn_font_size . 'px;
    --zen-exp-btn-font-weight: ' . $btn_font_weight . ';
    --zen-exp-btn-padding-x: ' . $btn_padding_x . 'px;
    --zen-exp-btn-padding-y: ' . $btn_padding_y . 'px;
    --zen-exp-btn-border-radius: ' . $btn_border_radius . 'px;
    --zen-exp-btn-border-width: ' . $btn_border_width . 'px;
    --zen-exp-btn-border-color: ' . $btn_border_color . ';
    --zen-exp-btn-bg-color: ' . $btn_bg_color . ';
    --zen-exp-btn-text-color: ' . $btn_text_color . ';
    --zen-exp-btn-margin-top: ' . $btn_margin_top . 'px;

    --zen-exp-card-image-height: ' . $card_image_height . 'px;
    --zen-exp-card-body-padding: ' . $card_body_padding . 'px;
    --zen-exp-card-border-radius: ' . $card_border_radius . 'px;
}
';


?>
<div class="zen-experience-space-block">

    <?php
    // Output inline CSS variables.
    echo '<style>' . $inline_styles . '</style>';
    ?>

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
                            $zencoin_placement_class = 'zen-zencoins--' . $zencoin_placement;
                        ?>
                        <article class="zen-class-card">
                            <div class="zen-class-card__image-wrap">
                                <?php if ( $thumb_url ) : ?>
                                    <img class="zen-class-card__image" src="<?php echo esc_url( $thumb_url ); ?>" alt="<?php echo esc_attr( $title ); ?>" />
                                <?php else : ?>
                                    <div class="zen-class-card__image zen-class-card__image--placeholder"></div>
                                <?php endif; ?>
                                <?php if ( $show_zencoins && $meta['zen_coins'] ) : ?>
                                <div class="zen-class-card__zencoins <?php echo esc_attr( $zencoin_placement_class ); ?>">
                                    <span class="zen-zencoins-label"><?php esc_html_e( 'ZENCOINS:', 'zenctuary' ); ?></span>
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
                $zencoin_placement_class = 'zen-zencoins--' . $zencoin_placement;
            ?>
            <article class="zen-class-card">
                <div class="zen-class-card__image-wrap">
                    <?php if ( $thumb_url ) : ?>
                        <img class="zen-class-card__image" src="<?php echo esc_url( $thumb_url ); ?>" alt="<?php echo esc_attr( $title ); ?>" />
                    <?php else : ?>
                        <div class="zen-class-card__image zen-class-card__image--placeholder"></div>
                    <?php endif; ?>
                    <?php if ( $show_zencoins && $meta['zen_coins'] ) : ?>
                    <div class="zen-class-card__zencoins <?php echo esc_attr( $zencoin_placement_class ); ?>">
                        <span class="zen-zencoins-label"><?php esc_html_e( 'ZENCOINS:', 'zenctuary' ); ?></span>
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
