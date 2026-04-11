<?php
/**
 * Server-side render for zenctuary/experience-cards block.
 *
 * Queries WooCommerce products by experience_category and renders
 * them as overlay image cards matching the Fire & Ice Figma design.
 *
 * @package Zenctuary
 */

$category_slug  = sanitize_key( $attributes['categorySlug']  ?? 'fire-and-ice' );
$heading        = wp_kses_post( $attributes['heading']        ?? 'CHOOSE YOUR EXPERIENCE' );
$description    = wp_kses_post( $attributes['description']    ?? '' );
$show_zencoins  = (bool) ( $attributes['showZencoins']  ?? true );
$show_duration  = (bool) ( $attributes['showDuration']  ?? true );
$show_includes  = (bool) ( $attributes['showIncludes']  ?? true );
$show_best_for  = (bool) ( $attributes['showBestFor']   ?? true );
$show_book_btn  = (bool) ( $attributes['showBookBtn']   ?? true );
$book_btn_label = esc_html( $attributes['bookBtnLabel'] ?? 'Book Now →' );

// Query products in this experience_category.
$query_args = [];
if ( $category_slug ) {
    $query_args['experience_category'] = $category_slug;
}
$query = get_experience_products( $query_args );

if ( empty( $query->posts ) ) {
    if ( current_user_can( 'edit_posts' ) ) {
        echo '<div class="zen-ec-empty">'
            . '<p>' . esc_html__( 'Experience Cards: no published products found in category "', 'zenctuary' )
            . esc_html( $category_slug ) . '".</p>'
            . '<p>' . esc_html__( 'Create products and assign them to the "' . $category_slug . '" experience category.', 'zenctuary' ) . '</p>'
            . '</div>';
    }
    return;
}
?>

<section class="zen-ec-block">

    <?php if ( $heading || $description ) : ?>
    <div class="zen-ec-header">
        <?php if ( $heading ) : ?>
        <h2 class="zen-ec-heading"><?php echo $heading; ?></h2>
        <?php endif; ?>
        <?php if ( $description ) : ?>
        <p class="zen-ec-desc"><?php echo $description; ?></p>
        <?php endif; ?>
    </div>
    <?php endif; ?>

    <div class="zen-ec-grid">

        <?php foreach ( $query->posts as $product ) :
            $meta      = get_experience_meta( $product->ID );
            $link      = get_permalink( $product->ID );
            $title     = get_the_title( $product );
            $thumb_url = get_the_post_thumbnail_url( $product->ID, 'large' );
        ?>

        <article class="zen-ec-card">

            <!-- Zencoins bar (above image) -->
            <?php if ( $show_zencoins && $meta['zen_coins'] ) : ?>
            <div class="zen-ec-card__coins-bar">
                <span class="zen-ec-coins-label"><?php esc_html_e( 'ZENCOINS:', 'zenctuary' ); ?></span>
                <span class="zen-ec-coins-badge"><?php echo (int) $meta['zen_coins']; ?></span>
            </div>
            <?php endif; ?>

            <!-- Image area with overlay content -->
            <div class="zen-ec-card__image-area"<?php if ( $thumb_url ) echo ' style="background-image:url(\'' . esc_url( $thumb_url ) . '\')"'; ?>>

                <div class="zen-ec-card__overlay"></div>

                <div class="zen-ec-card__content">

                    <h3 class="zen-ec-card__title"><?php echo esc_html( strtoupper( $title ) ); ?></h3>

                    <?php if ( $show_duration && ! empty( $meta['duration'] ) ) : ?>
                    <div class="zen-ec-card__duration">
                        <svg class="zen-ec-clock" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/>
                            <path d="M12 7v5l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>
                        <span>(<?php echo esc_html( $meta['duration'] ); ?>)</span>
                    </div>
                    <?php endif; ?>

                    <?php if ( ! empty( $meta['short_description'] ) ) : ?>
                    <p class="zen-ec-card__short-desc"><?php echo esc_html( $meta['short_description'] ); ?></p>
                    <?php endif; ?>

                    <?php if ( $show_includes && ! empty( $meta['includes'] ) ) : ?>
                    <p class="zen-ec-card__meta-line">
                        <strong><?php esc_html_e( 'Includes:', 'zenctuary' ); ?></strong>
                        <?php echo esc_html( $meta['includes'] ); ?>
                    </p>
                    <?php endif; ?>

                    <?php if ( $show_best_for && ! empty( $meta['best_for'] ) ) : ?>
                    <p class="zen-ec-card__meta-line">
                        <strong><?php esc_html_e( 'Best for:', 'zenctuary' ); ?></strong>
                        <?php echo esc_html( $meta['best_for'] ); ?>
                    </p>
                    <?php endif; ?>

                </div><!-- /.zen-ec-card__content -->

                <?php if ( $show_book_btn ) : ?>
                <a href="<?php echo esc_url( $link ); ?>" class="zen-ec-card__btn">
                    <?php echo $book_btn_label; ?>
                </a>
                <?php endif; ?>

            </div><!-- /.zen-ec-card__image-area -->

        </article>

        <?php endforeach; ?>

    </div><!-- /.zen-ec-grid -->

</section>
