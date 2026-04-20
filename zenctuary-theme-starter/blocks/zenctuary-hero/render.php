<?php
/**
 * Server-side render for zenctuary/hero block.
 *
 * @package Zenctuary
 */

$bg_img        = esc_url( $attributes['bgImageUrl'] ?? '' );
$bg_overlay_c  = sanitize_hex_color( $attributes['bgOverlayColor'] ?? '#000000' );
$bg_overlay_op = floatval( $attributes['bgOverlayOpacity'] ?? 0.4 );

$mode          = esc_attr( $attributes['centerMode'] ?? 'logo-tagline' );

$show_tags     = rest_sanitize_boolean( $attributes['showTagsRow'] ?? true );
$tags_items    = is_array( $attributes['tagsItems'] ?? null ) ? $attributes['tagsItems'] : ['CLASSES', 'SPA', 'CAFE', 'COMMUNITY'];

$show_contact  = rest_sanitize_boolean( $attributes['showContactBundle'] ?? true );
$contact_acts  = is_array( $attributes['contactActions'] ?? null ) ? $attributes['contactActions'] : [
    [ 'type' => 'whatsapp', 'label' => 'Write in Whatsapp', 'value' => '+491658954345' ],
    [ 'type' => 'email', 'label' => 'Write E-Mail', 'value' => 'info@example.com' ],
    [ 'type' => 'phone', 'label' => 'Call +49 1658954345', 'value' => '+491658954345' ]
];

// Parse animations
if ( ! function_exists( 'zh_anim_attrs' ) ) {
    function zh_anim_attrs( $type, $dur, $del ) {
        if ( $type === 'none' ) return '';
        return sprintf( ' data-animate="%s" style="transition-duration: %ss; transition-delay: %ss;"', esc_attr($type), floatval($dur), floatval($del) );
    }
}

$vars = [
    '--zh-bg-overlay-c:'   . $bg_overlay_c,
    '--zh-bg-overlay-op:'  . $bg_overlay_op,

    '--zh-gap-center:'     . absint( $attributes['gapCenterElements'] ?? 32 ) . 'px',
    '--zh-center-gap-x:'   . absint( $attributes['centerHorizontalGap'] ?? 32 ) . 'px',
    '--zh-center-gap-y:'   . absint( $attributes['centerVerticalGap'] ?? 24 ) . 'px',

    '--zh-tagline-fs:'     . absint( $attributes['taglineFontSize'] ?? 20 ) . 'px',
    '--zh-tagline-fw:'     . esc_attr( $attributes['taglineFontWeight'] ?? '400' ),
    '--zh-tagline-c:'      . sanitize_hex_color( $attributes['taglineColor'] ?? '#F6F2EA' ),

    '--zh-title-fs:'       . absint( $attributes['titleFontSize'] ?? 64 ) . 'px',
    '--zh-title-fw:'       . esc_attr( $attributes['titleFontWeight'] ?? '400' ),
    '--zh-title-tt:'       . esc_attr( $attributes['titleTextTransform'] ?? 'uppercase' ),
    '--zh-title-c:'        . sanitize_hex_color( $attributes['titleColor'] ?? '#F6F2EA' ),

    '--zh-tags-bottom:'    . absint( $attributes['tagsBottomOffset'] ?? 60 ) . 'px',
    '--zh-tags-bottom-mobile:' . absint( $attributes['tagsMobileBottomOffset'] ?? 80 ) . 'px',
    '--zh-tags-gap:'       . absint( $attributes['tagsGap'] ?? 24 ) . 'px',
    '--zh-tags-c:'         . sanitize_hex_color( $attributes['tagsColor'] ?? '#D8B355' ),
    '--zh-tags-fs:'        . absint( $attributes['tagsFontSize'] ?? 18 ) . 'px',
    '--zh-tags-bullet-size:' . absint( $attributes['tagsBulletSize'] ?? 18 ) . 'px',
    '--zh-tags-bullet-mobile-size:' . absint( $attributes['tagsBulletMobileSize'] ?? 18 ) . 'px',
    '--zh-tags-fw:'        . esc_attr( $attributes['tagsFontWeight'] ?? '500' ),
    '--zh-tags-tt:'        . esc_attr( $attributes['tagsTextTransform'] ?? 'uppercase' ),
    '--zh-tags-ls:'        . floatval( $attributes['tagsLetterSpacing'] ?? 0.05 ) . 'em',

    '--zh-contact-right:'  . absint( $attributes['contactRightOffset'] ?? 40 ) . 'px',
    '--zh-contact-bottom:' . absint( $attributes['contactBottomOffset'] ?? 40 ) . 'px',
    '--zh-contact-trig-bg:'. sanitize_hex_color( $attributes['contactTriggerBg'] ?? '#D8B355' ),
    '--zh-contact-trig-c:' . sanitize_hex_color( $attributes['contactTriggerColor'] ?? '#3F3E3E' ),
    '--zh-contact-trig-sz:'. absint( $attributes['contactTriggerSize'] ?? 64 ) . 'px',
    '--zh-contact-act-bg:' . sanitize_hex_color( $attributes['contactActionBg'] ?? '#3F3E3E' ),
    '--zh-contact-act-bd:' . sanitize_hex_color( $attributes['contactActionBorder'] ?? '#D8B355' ),
    '--zh-contact-act-c:'  . sanitize_hex_color( $attributes['contactActionColor'] ?? '#D8B355' ),
    '--zh-contact-act-gap:'. absint( $attributes['contactActionGap'] ?? 12 ) . 'px',
];

$inline_style = implode( '; ', $vars );
$wrapper_attributes = get_block_wrapper_attributes(
    [
        'class' => 'zenctuary-hero',
        'style' => $inline_style,
    ]
);

// Icons library for Contact Actions
$icons = [
    'email'    => '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>',
    'phone'    => '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>',
    'whatsapp' => '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12.01 2C6.48 2 2 6.48 2 12c0 1.84.5 3.56 1.35 5.06L2 22l5.09-1.33c1.47.82 3.16 1.3 4.92 1.3 5.53 0 10-4.48 10-10l-.01-.03C22 6.45 17.52 2 12.01 2zM12 20.03c-1.57 0-3.08-.4-4.4-1.16l-.32-.18-3.27.86.87-3.19-.2-.31C3.96 14.65 3.5 13.36 3.5 12c0-4.69 3.82-8.5 8.5-8.5 4.69 0 8.5 3.82 8.5 8.5-.01 4.69-3.82 8.5-8.5 8.53zM16.64 14.2c-.25-.13-1.5-.74-1.73-.83-.23-.08-.41-.13-.58.13-.17.25-.66.83-.81 1-.15.17-.3.19-.55.06C12.46 14.33 11 13.6 10.02 12.28c-.1-.13 0-.19.12-.31.11-.11.25-.3.38-.45.13-.15.17-.25.25-.42.08-.17.04-.32-.02-.45-.06-.13-.58-1.41-.8-1.92-.21-.51-.43-.44-.58-.45-.15-.01-.32-.01-.49-.01-.17 0-.45.06-.68.32-.23.25-.89.87-.89 2.12s.91 2.45 1.04 2.62c.13.17 1.78 2.73 4.31 3.81.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.5-.61 1.71-1.2.21-.59.21-1.1.15-1.2-.06-.11-.23-.17-.48-.3z"/></svg>',
    'trigger'  => '<svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm5 0h-4v-4h4v4zm0-5H4V9h16v4z"/></svg>',
];

// Determine link formatting
if ( ! function_exists( 'zh_format_link' ) ) {
    function zh_format_link( $type, $val ) {
        if ( $type === 'email' ) return 'mailto:' . esc_attr($val);
        if ( $type === 'phone' ) return 'tel:' . esc_attr(preg_replace('/[^0-9+]/', '', $val));
        if ( $type === 'whatsapp' ) return 'https://wa.me/' . esc_attr(preg_replace('/[^0-9+]/', '', $val));
        return esc_url($val);
    }
}
?>
<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>

    <!-- 1. Background Media -->
    <div class="zenctuary-hero__bg">
        <?php if ( $bg_img ) : ?>
            <img src="<?php echo $bg_img; ?>" alt="" aria-hidden="true" loading="eager" />
        <?php endif; ?>
        <div class="zenctuary-hero__overlay"></div>
    </div>

    <!-- 2. Inner Container (100vh constraint & safe areas) -->
    <div class="zenctuary-hero__inner">

        <!-- 3. Center Content -->
        <div class="zenctuary-hero__center" data-mode="<?php echo $mode; ?>">
            
            <?php if ( $mode === 'logo-tagline' ) : ?>
                <div class="zenctuary-hero__logo-wrapper" <?php echo zh_anim_attrs($attributes['logoAnim'] ?? 'fade', $attributes['logoAnimDur'] ?? 1.2, $attributes['logoAnimDel'] ?? 0.2); ?>>
                    <?php if ( !empty($attributes['logoUrl']) ) : ?>
                        <img src="<?php echo esc_url($attributes['logoUrl']); ?>" alt="<?php echo esc_attr($attributes['logoAlt'] ?? ''); ?>" style="max-width: <?php echo absint($attributes['logoMaxWidth'] ?? 600); ?>px;" />
                    <?php endif; ?>
                </div>
                <div class="zenctuary-hero__tagline-wrapper" <?php echo zh_anim_attrs($attributes['taglineAnim'] ?? 'slide-up', $attributes['taglineAnimDur'] ?? 1.0, $attributes['taglineAnimDel'] ?? 0.4); ?>>
                    <?php echo esc_html($attributes['taglineText'] ?? ''); ?>
                </div>

            <?php elseif ( $mode === 'text-only' ) : ?>
                <h1 class="zenctuary-hero__title" <?php echo zh_anim_attrs($attributes['titleAnim'] ?? 'zoom-in', $attributes['titleAnimDur'] ?? 1.2, $attributes['titleAnimDel'] ?? 0.2); ?>>
                    <?php echo esc_html($attributes['titleText'] ?? ''); ?>
                </h1>

            <?php elseif ( $mode === 'icon-text' ) : ?>
                <div class="zenctuary-hero__icon-wrapper" <?php echo zh_anim_attrs($attributes['iconAnim'] ?? 'fade', $attributes['iconAnimDur'] ?? 1.0, $attributes['iconAnimDel'] ?? 0.1); ?>>
                    <?php if ( !empty($attributes['iconUrl']) ) : ?>
                        <img src="<?php echo esc_url($attributes['iconUrl']); ?>" alt="<?php echo esc_attr($attributes['iconAlt'] ?? ''); ?>" style="width: <?php echo absint($attributes['iconSize'] ?? 80); ?>px; height: <?php echo absint($attributes['iconSize'] ?? 80); ?>px;" />
                    <?php endif; ?>
                </div>
                <h1 class="zenctuary-hero__title" <?php echo zh_anim_attrs($attributes['titleAnim'] ?? 'slide-up', $attributes['titleAnimDur'] ?? 1.2, $attributes['titleAnimDel'] ?? 0.3); ?>>
                    <?php echo esc_html($attributes['titleText'] ?? ''); ?>
                </h1>
            <?php elseif ( $mode === 'title-icon-text' ) : ?>
                <h1 class="zenctuary-hero__title" <?php echo zh_anim_attrs($attributes['titleAnim'] ?? 'zoom-in', $attributes['titleAnimDur'] ?? 1.2, $attributes['titleAnimDel'] ?? 0.2); ?>>
                    <?php echo esc_html($attributes['titleText'] ?? ''); ?>
                </h1>
                <div class="zenctuary-hero__title-icon-text-row">
                    <div class="zenctuary-hero__icon-wrapper" <?php echo zh_anim_attrs($attributes['iconAnim'] ?? 'fade', $attributes['iconAnimDur'] ?? 1.0, $attributes['iconAnimDel'] ?? 0.1); ?>>
                        <?php if ( !empty($attributes['iconUrl']) ) : ?>
                            <img src="<?php echo esc_url($attributes['iconUrl']); ?>" alt="<?php echo esc_attr($attributes['iconAlt'] ?? ''); ?>" style="width: <?php echo absint($attributes['iconSize'] ?? 80); ?>px; height: <?php echo absint($attributes['iconSize'] ?? 80); ?>px;" />
                        <?php endif; ?>
                    </div>
                    <div class="zenctuary-hero__tagline-wrapper zenctuary-hero__tagline-wrapper--side" <?php echo zh_anim_attrs($attributes['taglineAnim'] ?? 'slide-up', $attributes['taglineAnimDur'] ?? 1.0, $attributes['taglineAnimDel'] ?? 0.4); ?>>
                        <?php echo esc_html($attributes['taglineText'] ?? ''); ?>
                    </div>
                </div>
            <?php endif; ?>

        </div>

    </div>

    <!-- 4. Bottom Tags Row -->
    <?php if ( $show_tags && !empty($tags_items) ) : ?>
    <div class="zenctuary-hero__tags-wrapper">
        <ul class="zenctuary-hero__tags-list">
            <?php foreach ( $tags_items as $tag ) : ?>
                <li><?php echo esc_html($tag); ?></li>
            <?php endforeach; ?>
        </ul>
    </div>
    <?php endif; ?>

    <!-- 5. Floating Contact Bundle -->
    <?php if ( $show_contact && !empty($contact_acts) ) : ?>
    <div class="zenctuary-hero__contact-wrapper">
        <div class="zenctuary-hero__contact-actions" id="zh-actions-<?php echo esc_attr(uniqid()); ?>" aria-hidden="true">
            <?php foreach ( $contact_acts as $act ) : 
                $t = esc_attr($act['type'] ?? 'email');
                $icon = $icons[$t] ?? $icons['email'];
            ?>
                <a href="<?php echo zh_format_link($t, $act['value'] ?? ''); ?>" class="zenctuary-hero__contact-btn">
                    <span class="zh-cbtn-label"><?php echo esc_html($act['label'] ?? ''); ?></span>
                    <span class="zh-cbtn-icon"><?php echo $icon; ?></span>
                </a>
            <?php endforeach; ?>
        </div>
        <button class="zenctuary-hero__contact-trigger" aria-label="<?php esc_attr_e('Open contact options', 'zenctuary'); ?>" aria-expanded="false" aria-controls="zh-actions-<?php echo esc_attr(uniqid()); ?>">
            <span class="zh-ctrigger-icons" aria-hidden="true">
                <span class="zh-ctrigger-icon zh-ctrigger-icon--phone"><?php echo $icons['phone']; ?></span>
                <span class="zh-ctrigger-icon zh-ctrigger-icon--email"><?php echo $icons['email']; ?></span>
                <span class="zh-ctrigger-icon zh-ctrigger-icon--whatsapp"><?php echo $icons['whatsapp']; ?></span>
            </span>
            <span class="zh-cclose-icon" style="display:none;" aria-hidden="true"><svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></span>
        </button>
    </div>
    <?php endif; ?>

</section>
