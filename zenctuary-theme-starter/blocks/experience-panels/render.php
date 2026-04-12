<?php
/**
 * Server-side render for zenctuary/experience-panels block.
 *
 * @package Zenctuary
 */

$panels_str = $attributes['panelData'] ?? '';
$panels = json_decode($panels_str, true);

if ( ! is_array($panels) || empty($panels) ) {
    $panels = [
        [
            'defaultBackground' => ['id'=>0, 'url'=>'', 'alt'=>''],
            'activeBackground' => ['id'=>0, 'url'=>'', 'alt'=>''],
            'bgTransition' => 'fade',
            'centerIcon' => ['id'=>0, 'url'=>'', 'alt'=>''],
            'overlayEnable' => true, 'overlayColor' => '#1D1D1B', 'overlayOpacity' => 0.5,
            'centerTitle' => 'FIRE & ICE', 'centerDescription' => 'An energizing contrast therapy experience.',
            'leftHotspots' => [], 'rightHotspots' => []
        ],
        [
            'defaultBackground' => ['id'=>0, 'url'=>'', 'alt'=>''],
            'activeBackground' => ['id'=>0, 'url'=>'', 'alt'=>''],
            'bgTransition' => 'fade',
            'centerIcon' => ['id'=>0, 'url'=>'', 'alt'=>''],
            'overlayEnable' => true, 'overlayColor' => '#1D1D1B', 'overlayOpacity' => 0.5,
            'centerTitle' => 'YOGA', 'centerDescription' => 'Find your center, flow with purpose.',
            'leftHotspots' => [], 'rightHotspots' => []
        ],
        [
            'defaultBackground' => ['id'=>0, 'url'=>'', 'alt'=>''],
            'activeBackground' => ['id'=>0, 'url'=>'', 'alt'=>''],
            'bgTransition' => 'fade',
            'centerIcon' => ['id'=>0, 'url'=>'', 'alt'=>''],
            'overlayEnable' => true, 'overlayColor' => '#1D1D1B', 'overlayOpacity' => 0.5,
            'centerTitle' => 'MEDITATION', 'centerDescription' => 'Quiet the mind and look inward.',
            'leftHotspots' => [], 'rightHotspots' => []
        ]
    ];
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

// Ensure WP layout classes apply organically
$align_class = ! empty( $attributes['align'] ) ? 'align' . $attributes['align'] : 'alignfull';
$wrapper_class = trim( "zenctuary-experience-panels wp-block-zenctuary-experience-panels {$align_class}" );

?>
<section class="<?php echo esc_attr( $wrapper_class ); ?>" style="<?php echo esc_attr( $inline_style ); ?>">
    <div class="zep-layout-wrapper">
        <?php foreach ( $panels as $i => $panel ) : 
            
            $def_bg = is_array($panel['defaultBackground'] ?? null) ? $panel['defaultBackground'] : [];
            $def_bg_url = esc_url( $def_bg['url'] ?? '' );
            $def_bg_alt = esc_attr( $def_bg['alt'] ?? '' );
            
            $act_bg = is_array($panel['activeBackground'] ?? null) ? $panel['activeBackground'] : [];
            $act_bg_url = esc_url( $act_bg['url'] ?? '' );
            $act_bg_alt = esc_attr( $act_bg['alt'] ?? '' );
            
            $bg_trans   = esc_attr( $panel['bgTransition'] ?? 'fade' );
            
            // Calculate panel animations logically
            $cont_trans = 'popup-center';
            if ( $i === 0 || $i < floor(count($panels) / 2) ) $cont_trans = 'slide-from-left';
            else if ( $i > floor(count($panels) / 2) ) $cont_trans = 'slide-from-left';
            
            $has_ovl    = rest_sanitize_boolean( $panel['overlayEnable'] ?? true );
            $ovl_c      = sanitize_hex_color( $panel['overlayColor'] ?? '#1D1D1B' );
            $ovl_op     = floatval( $panel['overlayOpacity'] ?? 0.5 );
            
            $icon = is_array($panel['centerIcon'] ?? null) ? $panel['centerIcon'] : [];
            $icon_url   = esc_url( $icon['url'] ?? '' );
            $icon_alt   = esc_attr( $icon['alt'] ?? '' );
            
            $title      = esc_html( $panel['centerTitle'] ?? '' );
            $desc       = esc_html( $panel['centerDescription'] ?? '' );
            
            $left_hq    = is_array( $panel['leftHotspots'] ?? null ) ? $panel['leftHotspots'] : [];
            $right_hq   = is_array( $panel['rightHotspots'] ?? null ) ? $panel['rightHotspots'] : [];
        ?>
            <article class="zep-panel" data-index="<?php echo esc_attr($i); ?>" data-bg-trans="<?php echo $bg_trans; ?>" data-content-trans="<?php echo $cont_trans; ?>">
                
                <!-- Background Layer Collection -->
                <div class="zep-panel__bg-layer">
                    <!-- Default Background -->
                    <?php if ( $def_bg_url ) : ?>
                        <div class="zep-panel__bg-cell zep-panel__bg-cell--default">
                            <img class="zep-panel__bg-img" src="<?php echo $def_bg_url; ?>" alt="<?php echo $def_bg_alt; ?>" loading="lazy" />
                        </div>
                    <?php endif; ?>
                    
                    <!-- Active Background -->
                    <?php if ( $act_bg_url ) : ?>
                        <div class="zep-panel__bg-cell zep-panel__bg-cell--active">
                            <img class="zep-panel__bg-img" src="<?php echo $act_bg_url; ?>" alt="<?php echo $act_bg_alt; ?>" loading="lazy" />
                        </div>
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
                            $hObj = is_array($hot['icon'] ?? null) ? $hot['icon'] : [];
                            $h_icon = esc_url($hObj['url'] ?? '');
                            $h_alt  = esc_attr($hObj['alt'] ?? '');
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
                            $hObj = is_array($hot['icon'] ?? null) ? $hot['icon'] : [];
                            $h_icon = esc_url($hObj['url'] ?? '');
                            $h_alt  = esc_attr($hObj['alt'] ?? '');
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
