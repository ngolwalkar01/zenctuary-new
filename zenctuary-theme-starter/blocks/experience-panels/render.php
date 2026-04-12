<?php
/**
 * Server-side render for zenctuary/experience-panels block.
 *
 * @package Zenctuary
 */

$panels = is_array( $attributes['panels'] ?? null ) ? $attributes['panels'] : [];
if ( empty($panels) ) {
    return;
}

$default_active = absint( $attributes['defaultActiveIndex'] ?? 0 );
if ( $default_active >= count($panels) ) {
    $default_active = 0;
}

$vars = [
    '--zep-dur:'          . floatval( $attributes['transitionDur'] ?? 0.6 ) . 's',
    '--zep-bg:'           . sanitize_hex_color( $attributes['sectionBgColor'] ?? '#f9f9f9' ),

    '--zep-tt-fs:'        . absint( $attributes['titleFontSize'] ?? 48 ) . 'px',
    '--zep-tt-fw:'        . esc_attr( $attributes['titleFontWeight'] ?? '400' ),
    '--zep-tt-lh:'        . floatval( $attributes['titleLineHeight'] ?? 1.1 ),
    '--zep-tt-ls:'        . floatval( $attributes['titleLetterSpacing'] ?? 0.05 ) . 'em',
    '--zep-tt-tc:'        . esc_attr( $attributes['titleTextTransform'] ?? 'uppercase' ),
    '--zep-tt-c:'         . sanitize_hex_color( $attributes['titleColor'] ?? '#ffffff' ),

    '--zep-desc-fs:'      . absint( $attributes['descFontSize'] ?? 16 ) . 'px',
    '--zep-desc-fw:'      . esc_attr( $attributes['descFontWeight'] ?? '400' ),
    '--zep-desc-lh:'      . floatval( $attributes['descLineHeight'] ?? 1.5 ),
    '--zep-desc-c:'       . sanitize_hex_color( $attributes['descColor'] ?? '#ffffff' ),

    '--zep-hot-fs:'       . absint( $attributes['hotspotFontSize'] ?? 14 ) . 'px',
    '--zep-hot-fw:'       . esc_attr( $attributes['hotspotFontWeight'] ?? '500' ),
    '--zep-hot-lh:'       . floatval( $attributes['hotspotLineHeight'] ?? 1.4 ),
    '--zep-hot-c:'        . sanitize_hex_color( $attributes['hotspotColor'] ?? '#ffffff' ),

    '--zep-gap-it:'       . absint( $attributes['gapIconTitle'] ?? 24 ) . 'px',
    '--zep-gap-td:'       . absint( $attributes['gapTitleDesc'] ?? 16 ) . 'px',
    '--zep-gap-hot-it:'   . absint( $attributes['gapHotspotIconText'] ?? 12 ) . 'px',
    '--zep-gap-hot-v:'    . absint( $attributes['gapHotspotVertical'] ?? 24 ) . 'px',
];

$inline_style = implode( '; ', $vars );

// Parse Future-Proof Hotspot Anchors
$zh_format_hotspot = function( $item, $inner_html ) {
    $is_link = $item['linkEnable'] ?? false;
    $url     = esc_url($item['linkUrl'] ?? '');
    
    // Check if truly a link
    if ( $is_link && !empty($url) ) {
        $target = ($item['newTab'] ?? false) ? ' target="_blank" rel="noopener noreferrer"' : '';
        return sprintf('<a href="%s" class="zep-hotspot"%s>%s</a>', $url, $target, $inner_html);
    }
    
    return sprintf('<div class="zep-hotspot">%s</div>', $inner_html);
};

?>
<section class="zenctuary-experience-panels" style="<?php echo esc_attr( $inline_style ); ?>" data-default-active="<?php echo esc_attr($default_active); ?>">
    <div class="zep-layout-wrapper">
        <?php foreach ( $panels as $i => $panel ) : 
            $is_active = ( $i === $default_active ) ? ' is-active' : '';
            
            $bg_url    = esc_url( $panel['bgImageUrl'] ?? '' );
            $bg_alt    = esc_attr( $panel['bgImageAlt'] ?? '' );
            $has_ovl   = rest_sanitize_boolean( $panel['overlayEnable'] ?? true );
            $ovl_c     = sanitize_hex_color( $panel['overlayColor'] ?? '#1D1D1B' );
            $ovl_op    = floatval( $panel['overlayOpacity'] ?? 0.5 );
            
            $icon_url  = esc_url( $panel['centerIconUrl'] ?? '' );
            $icon_alt  = esc_attr( $panel['centerIconAlt'] ?? '' );
            $title     = esc_html( $panel['centerTitle'] ?? '' );
            $desc      = esc_html( $panel['centerDescription'] ?? '' );
            
            $left_hq   = is_array( $panel['leftHotspots'] ?? null ) ? $panel['leftHotspots'] : [];
            $right_hq  = is_array( $panel['rightHotspots'] ?? null ) ? $panel['rightHotspots'] : [];
        ?>
            <article class="zep-panel<?php echo $is_active; ?>" data-index="<?php echo esc_attr($i); ?>">
                
                <!-- Background Layer -->
                <div class="zep-panel__bg-layer">
                    <?php if ( $bg_url ) : ?>
                        <img class="zep-panel__bg-img" src="<?php echo $bg_url; ?>" alt="<?php echo $bg_alt; ?>" loading="lazy" />
                    <?php endif; ?>
                    <?php if ( $has_ovl ) : ?>
                        <div class="zep-panel__overlay" style="background-color: <?php echo esc_attr($ovl_c); ?>; opacity: <?php echo esc_attr($ovl_op); ?>;"></div>
                    <?php endif; ?>
                </div>

                <!-- Center Content Constraint Container -->
                <div class="zep-panel__core">
                    
                    <!-- Left Hotspots -->
                    <?php if ( !empty($left_hq) ) : ?>
                    <div class="zep-panel__hotspots zep-panel__hotspots--left">
                        <?php foreach ( $left_hq as $hot ) : 
                            $h_icon = esc_url($hot['iconUrl'] ?? '');
                            $h_alt  = esc_attr($hot['iconAlt'] ?? '');
                            $h_desc = esc_html($hot['description'] ?? '');
                            
                            $inner = '';
                            if ( $h_icon ) {
                                $inner .= '<img class="zep-hotspot__icon" src="' . $h_icon . '" alt="' . $h_alt . '" />';
                            }
                            if ( $h_desc ) {
                                $inner .= '<span class="zep-hotspot__desc">' . $h_desc . '</span>';
                            }
                            
                            echo $zh_format_hotspot($hot, $inner);
                        endforeach; ?>
                    </div>
                    <?php endif; ?>

                    <!-- Center Primary Content -->
                    <div class="zep-panel__center">
                        <?php if ( $icon_url ) : ?>
                            <img class="zep-panel__center-icon" src="<?php echo $icon_url; ?>" alt="<?php echo $icon_alt; ?>" />
                        <?php endif; ?>
                        
                        <?php if ( $title ) : ?>
                            <h3 class="zep-panel__title"><?php echo $title; ?></h3>
                        <?php endif; ?>
                        
                        <?php if ( $desc ) : ?>
                            <p class="zep-panel__desc"><?php echo $desc; ?></p>
                        <?php endif; ?>
                    </div>

                    <!-- Right Hotspots -->
                    <?php if ( !empty($right_hq) ) : ?>
                    <div class="zep-panel__hotspots zep-panel__hotspots--right">
                        <?php foreach ( $right_hq as $hot ) : 
                            $h_icon = esc_url($hot['iconUrl'] ?? '');
                            $h_alt  = esc_attr($hot['iconAlt'] ?? '');
                            $h_desc = esc_html($hot['description'] ?? '');
                            
                            $inner = '';
                            if ( $h_icon ) {
                                $inner .= '<img class="zep-hotspot__icon" src="' . $h_icon . '" alt="' . $h_alt . '" />';
                            }
                            if ( $h_desc ) {
                                $inner .= '<span class="zep-hotspot__desc">' . $h_desc . '</span>';
                            }
                            
                            echo $zh_format_hotspot($hot, $inner);
                        endforeach; ?>
                    </div>
                    <?php endif; ?>

                </div><!-- /.zep-panel__core -->

            </article>
        <?php endforeach; ?>
    </div>
</section>
