<?php
/**
 * Server-side render template for zenctuary/why-zenctuary block.
 *
 * Vars available from WordPress:
 *   $attributes  (array)    — block attributes as defined in block.json
 *   $content     (string)   — inner block content (unused, dynamic block)
 *   $block       (WP_Block) — block instance
 *
 * @package Zenctuary
 */

// ─── Pull & sanitize section-level attributes ─────────────────────────────────

$heading          = esc_html( $attributes['heading']         ?? 'WHY ZENCTUARY?' );
$subheading       = esc_html( $attributes['subheading']      ?? '' );
$background_color = sanitize_hex_color( $attributes['backgroundColor'] ?? '#3F3E3E' );
$heading_color    = sanitize_hex_color( $attributes['headingColor']     ?? '#D8B355' );
$text_color       = sanitize_hex_color( $attributes['textColor']        ?? '#F6F2EA' );
$accent_color     = sanitize_hex_color( $attributes['accentColor']      ?? '#D8B355' );
$padding_top      = absint( $attributes['paddingTop']     ?? 80 );
$padding_bottom   = absint( $attributes['paddingBottom']  ?? 80 );
$columns          = min( 3, max( 1, absint( $attributes['columns'] ?? 2 ) ) );

// Items array — each item: iconUrl, iconId, iconAlt, title, description.
$items = is_array( $attributes['items'] ?? null ) ? $attributes['items'] : [];

// Nothing to render silently when the editor left items empty.
if ( empty( $items ) && empty( $heading ) ) {
    return;
}

// ─── Build inline CSS custom properties for this block instance ───────────────

$inline_style = implode( '; ', [
    '--zwz-bg:'      . esc_attr( $background_color ),
    '--zwz-heading:' . esc_attr( $heading_color ),
    '--zwz-text:'    . esc_attr( $text_color ),
    '--zwz-accent:'  . esc_attr( $accent_color ),
    '--zwz-pt:'      . $padding_top . 'px',
    '--zwz-pb:'      . $padding_bottom . 'px',
    '--zwz-cols:'    . $columns,
] );

?>
<section
    class="zen-why-zenctuary"
    style="<?php echo esc_attr( $inline_style ); ?>"
    aria-label="<?php echo esc_attr( $heading ); ?>"
>
    <div class="zen-why-zenctuary__inner">

        <?php if ( $heading ) : ?>
        <header class="zen-why-zenctuary__header">
            <h2 class="zen-why-zenctuary__heading">
                <?php echo $heading; // Already escaped above. ?>
            </h2>
            <?php if ( $subheading ) : ?>
            <p class="zen-why-zenctuary__subheading">
                <?php echo $subheading; // Already escaped above. ?>
            </p>
            <?php endif; ?>
        </header>
        <?php endif; ?>

        <?php if ( ! empty( $items ) ) : ?>
        <ul class="zen-why-zenctuary__grid" role="list">

            <?php foreach ( $items as $index => $item ) :
                $number      = str_pad( $index + 1, 2, '0', STR_PAD_LEFT );
                $icon_url    = esc_url( $item['iconUrl']    ?? '' );
                $icon_alt    = esc_attr( $item['iconAlt']   ?? '' );
                $item_title  = esc_html( $item['title']     ?? '' );
                $description = esc_html( $item['description'] ?? '' );
            ?>
            <li class="zen-why-zenctuary__item">

                <div class="zen-why-zenctuary__item-meta">

                    <span class="zen-why-zenctuary__number" aria-hidden="true">
                        <?php echo esc_html( $number ); ?>
                    </span>

                    <?php if ( $icon_url ) : ?>
                    <div class="zen-why-zenctuary__icon" aria-hidden="true">
                        <img
                            src="<?php echo $icon_url; ?>"
                            alt="<?php echo $icon_alt; ?>"
                            width="48"
                            height="48"
                            loading="lazy"
                            decoding="async"
                        />
                    </div>
                    <?php else : ?>
                    <div class="zen-why-zenctuary__icon zen-why-zenctuary__icon--placeholder" aria-hidden="true">
                        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="48" height="48">
                            <circle cx="32" cy="12" r="6" stroke="currentColor" stroke-width="2"/>
                            <path d="M20 28c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            <path d="M14 36l8-8M50 36l-8-8M20 28l-6 8M44 28l6 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            <path d="M20 48c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            <path d="M16 52h32" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </div>
                    <?php endif; ?>

                </div><!-- /.zen-why-zenctuary__item-meta -->

                <div class="zen-why-zenctuary__item-content">
                    <?php if ( $item_title ) : ?>
                    <h3 class="zen-why-zenctuary__item-title">
                        <?php echo $item_title; // Already escaped above. ?>
                    </h3>
                    <?php endif; ?>

                    <?php if ( $description ) : ?>
                    <p class="zen-why-zenctuary__item-desc">
                        <?php echo $description; // Already escaped above. ?>
                    </p>
                    <?php endif; ?>
                </div><!-- /.zen-why-zenctuary__item-content -->

            </li>
            <?php endforeach; ?>

        </ul><!-- /.zen-why-zenctuary__grid -->
        <?php endif; ?>

    </div><!-- /.zen-why-zenctuary__inner -->
</section><!-- /.zen-why-zenctuary -->
