<?php
/**
 * Server-side render for zenctuary/why-zenctuary block.
 *
 * $attributes  (array)    — block attributes
 * $content     (string)   — inner content (unused)
 * $block       (WP_Block) — block instance
 *
 * @package Zenctuary
 */

// ─── Section-level attributes ────────────────────────────────────────────────
$heading    = esc_html( $attributes['heading']    ?? 'WHY ZENCTUARY?' );
$subheading = esc_html( $attributes['subheading'] ?? '' );
$items      = is_array( $attributes['items'] ?? null ) ? $attributes['items'] : [];

if ( empty( $items ) && empty( $heading ) ) { return; }

// ─── Colors ───────────────────────────────────────────────────────────────────
$bg_color    = sanitize_hex_color( $attributes['backgroundColor']  ?? '#3F3E3E' );
$h_color     = sanitize_hex_color( $attributes['headingColor']     ?? '#D8B355' );
$num_color   = sanitize_hex_color( $attributes['numberColor']      ?? '#F6F2EA' );
$icon_color  = sanitize_hex_color( $attributes['iconColor']        ?? '#D8B355' );
$title_color = sanitize_hex_color( $attributes['titleColor']       ?? '#F6F2EA' );
$desc_color  = sanitize_hex_color( $attributes['descriptionColor'] ?? '#F6F2EA' );

// ─── Section spacing ──────────────────────────────────────────────────────────
$pt = absint( $attributes['paddingTop']    ?? 80 );
$pb = absint( $attributes['paddingBottom'] ?? 80 );
$pl = absint( $attributes['paddingLeft']   ?? 120 );
$pr = absint( $attributes['paddingRight']  ?? 120 );

// ─── Layout ───────────────────────────────────────────────────────────────────
$max_width  = absint( $attributes['maxWidth']           ?? 1200 );
$head_mb    = absint( $attributes['headingMarginBottom'] ?? 48 );
$row_gap    = absint( $attributes['rowGap']              ?? 56 );
$col_gap    = absint( $attributes['columnGap']           ?? 80 );
$columns    = min( 3, max( 1, absint( $attributes['columns'] ?? 2 ) ) );

// ─── Item internal spacing ────────────────────────────────────────────────────
$gap_num_icon     = absint( $attributes['gapNumIcon']     ?? 16 );
$gap_icon_content = absint( $attributes['gapIconContent'] ?? 20 );
$gap_title_desc   = absint( $attributes['gapTitleDesc']   ?? 12 );

// ─── Typography ───────────────────────────────────────────────────────────────
$h_fs  = absint( $attributes['headingFontSize']      ?? 28 );
$h_fw  = esc_attr( $attributes['headingFontWeight']  ?? '700' );
$h_ls  = floatval( $attributes['headingLetterSpacing'] ?? 0.02 );
$h_tt  = esc_attr( $attributes['headingTextTransform'] ?? 'uppercase' );

$num_fs  = absint( $attributes['numberFontSize']  ?? 13 );
$num_fw  = esc_attr( $attributes['numberFontWeight'] ?? '400' );
$num_mw  = absint( $attributes['numberMinWidth']  ?? 24 );
$num_op  = floatval( $attributes['numberOpacity'] ?? 0.45 );

$title_fs  = absint( $attributes['titleFontSize']      ?? 22 );
$title_fw  = esc_attr( $attributes['titleFontWeight']  ?? '700' );
$title_tt  = esc_attr( $attributes['titleTextTransform'] ?? 'uppercase' );
$title_lh  = floatval( $attributes['titleLineHeight']  ?? 1.2 );

$desc_fs = absint( $attributes['descFontSize']  ?? 16 );
$desc_lh = floatval( $attributes['descLineHeight'] ?? 1.6 );
$desc_op = floatval( $attributes['descOpacity'] ?? 0.8 );

$icon_size = absint( $attributes['iconSize'] ?? 48 );

// ─── Build CSS custom properties scoped to this block instance ────────────────
$vars = [
    '--zwz-bg:'              . esc_attr( $bg_color ),
    '--zwz-h-color:'         . esc_attr( $h_color ),
    '--zwz-num-color:'       . esc_attr( $num_color ),
    '--zwz-icon-color:'      . esc_attr( $icon_color ),
    '--zwz-title-color:'     . esc_attr( $title_color ),
    '--zwz-desc-color:'      . esc_attr( $desc_color ),

    '--zwz-pt:'              . $pt . 'px',
    '--zwz-pb:'              . $pb . 'px',
    '--zwz-pl:'              . $pl . 'px',
    '--zwz-pr:'              . $pr . 'px',

    '--zwz-max-width:'       . $max_width . 'px',
    '--zwz-head-mb:'         . $head_mb . 'px',
    '--zwz-row-gap:'         . $row_gap . 'px',
    '--zwz-col-gap:'         . $col_gap . 'px',
    '--zwz-cols:'            . $columns,

    '--zwz-gap-num-icon:'    . $gap_num_icon . 'px',
    '--zwz-gap-icon-content:'. $gap_icon_content . 'px',
    '--zwz-gap-title-desc:'  . $gap_title_desc . 'px',

    '--zwz-h-fs:'            . $h_fs . 'px',
    '--zwz-h-fw:'            . $h_fw,
    '--zwz-h-ls:'            . $h_ls . 'em',
    '--zwz-h-tt:'            . $h_tt,

    '--zwz-num-fs:'          . $num_fs . 'px',
    '--zwz-num-fw:'          . $num_fw,
    '--zwz-num-mw:'          . $num_mw . 'px',
    '--zwz-num-op:'          . $num_op,

    '--zwz-title-fs:'        . $title_fs . 'px',
    '--zwz-title-fw:'        . $title_fw,
    '--zwz-title-tt:'        . $title_tt,
    '--zwz-title-lh:'        . $title_lh,

    '--zwz-desc-fs:'         . $desc_fs . 'px',
    '--zwz-desc-lh:'         . $desc_lh,
    '--zwz-desc-op:'         . $desc_op,

    '--zwz-icon-size:'       . $icon_size . 'px',
];

$inline_style = implode( '; ', $vars );

// ─── Placeholder SVG icon (meditation figure — matches Figma) ─────────────────
$placeholder_svg = '<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="' . $icon_size . '" height="' . $icon_size . '" aria-hidden="true">
    <circle cx="32" cy="12" r="6" stroke="currentColor" stroke-width="2"/>
    <path d="M20 28c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M14 36l8-8M50 36l-8-8M20 28l-6 8M44 28l6 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M20 48c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <path d="M16 52h32" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>';

?>
<section
    class="zen-why-zenctuary"
    style="<?php echo esc_attr( $inline_style ); ?>"
    aria-labelledby="zwz-heading-<?php echo esc_attr( uniqid() ); ?>"
>
    <div class="zen-why-zenctuary__inner">

        <?php if ( $heading || $subheading ) : ?>
        <header class="zen-why-zenctuary__header">
            <?php if ( $heading ) : ?>
            <h2 class="zen-why-zenctuary__heading">
                <?php echo $heading; ?>
            </h2>
            <?php endif; ?>
            <?php if ( $subheading ) : ?>
            <p class="zen-why-zenctuary__subheading">
                <?php echo $subheading; ?>
            </p>
            <?php endif; ?>
        </header>
        <?php endif; ?>

        <?php if ( ! empty( $items ) ) : ?>
        <ul class="zen-why-zenctuary__grid" role="list">

            <?php foreach ( $items as $index => $item ) :
                $number      = str_pad( $index + 1, 2, '0', STR_PAD_LEFT );
                $icon_url    = esc_url( $item['iconUrl']      ?? '' );
                $icon_alt    = esc_attr( $item['iconAlt']     ?? '' );
                $item_title  = esc_html( $item['title']       ?? '' );
                $description = esc_html( $item['description'] ?? '' );
            ?>

            <li class="zen-why-zenctuary__item">

                <!-- Zone 1: Number -->
                <span class="zen-why-zenctuary__number" aria-hidden="true">
                    <?php echo esc_html( $number ); ?>
                </span>

                <!-- Zone 2: Icon -->
                <div class="zen-why-zenctuary__icon" aria-hidden="true">
                    <?php if ( $icon_url ) : ?>
                        <img
                            src="<?php echo $icon_url; ?>"
                            alt="<?php echo $icon_alt; ?>"
                            width="<?php echo $icon_size; ?>"
                            height="<?php echo $icon_size; ?>"
                            loading="lazy"
                            decoding="async"
                        />
                    <?php else : ?>
                        <div class="zen-why-zenctuary__icon-placeholder">
                            <?php echo $placeholder_svg; ?>
                        </div>
                    <?php endif; ?>
                </div>

                <!-- Zone 3: Text content — title + description stacked -->
                <div class="zen-why-zenctuary__content">
                    <?php if ( $item_title ) : ?>
                    <h3 class="zen-why-zenctuary__title">
                        <?php echo $item_title; ?>
                    </h3>
                    <?php endif; ?>
                    <?php if ( $description ) : ?>
                    <p class="zen-why-zenctuary__desc">
                        <?php echo $description; ?>
                    </p>
                    <?php endif; ?>
                </div>

            </li>

            <?php endforeach; ?>

        </ul>
        <?php endif; ?>

    </div><!-- /.zen-why-zenctuary__inner -->
</section><!-- /.zen-why-zenctuary -->
