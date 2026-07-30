<?php
/**
 * Render callback for Static Contact Form.
 *
 * @package Zenctuary
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'zenctuary_static_contact_attr' ) ) {
	function zenctuary_static_contact_attr( array $attributes, string $key, $fallback = '' ) {
		return array_key_exists( $key, $attributes ) ? $attributes[ $key ] : $fallback;
	}
}

if ( ! function_exists( 'zenctuary_static_contact_css' ) ) {
	function zenctuary_static_contact_css( array $attributes ): string {
		$map = [
			'--zen-static-contact-bg'                  => 'sectionBackgroundColor',
			'--zen-static-contact-overlay'             => 'overlayColor',
			'--zen-static-contact-overlay-opacity'     => 'overlayOpacity',
			'--zen-static-contact-gradient-start'      => 'gradientStartColor',
			'--zen-static-contact-gradient-end'        => 'gradientEndColor',
			'--zen-static-contact-pt'                  => 'sectionPaddingTop',
			'--zen-static-contact-pr'                  => 'sectionPaddingRight',
			'--zen-static-contact-pb'                  => 'sectionPaddingBottom',
			'--zen-static-contact-pl'                  => 'sectionPaddingLeft',
			'--zen-static-contact-content-width'       => 'contentMaxWidth',
			'--zen-static-contact-gap'                 => 'columnsGap',
			'--zen-static-contact-left-width'          => 'leftWidth',
			'--zen-static-contact-right-width'         => 'rightWidth',
			'--zen-static-contact-form-bg'             => 'formCardBackgroundColor',
			'--zen-static-contact-form-border'         => 'formCardBorderColor',
			'--zen-static-contact-form-border-width'   => 'formCardBorderWidth',
			'--zen-static-contact-form-radius'         => 'formCardBorderRadius',
			'--zen-static-contact-form-pt'             => 'formCardPaddingTop',
			'--zen-static-contact-form-pr'             => 'formCardPaddingRight',
			'--zen-static-contact-form-pb'             => 'formCardPaddingBottom',
			'--zen-static-contact-form-pl'             => 'formCardPaddingLeft',
			'--zen-static-contact-field-gap'           => 'formFieldGap',
			'--zen-static-contact-field-bg'            => 'formFieldBackgroundColor',
			'--zen-static-contact-field-border'        => 'formFieldBorderColor',
			'--zen-static-contact-field-border-width'  => 'formFieldBorderWidth',
			'--zen-static-contact-field-radius'        => 'formFieldBorderRadius',
			'--zen-static-contact-field-pt'            => 'formFieldPaddingTop',
			'--zen-static-contact-field-pr'            => 'formFieldPaddingRight',
			'--zen-static-contact-field-pb'            => 'formFieldPaddingBottom',
			'--zen-static-contact-field-pl'            => 'formFieldPaddingLeft',
			'--zen-static-contact-label-family'        => 'formLabelFontFamily',
			'--zen-static-contact-label-size'          => 'formLabelFontSize',
			'--zen-static-contact-label-weight'        => 'formLabelFontWeight',
			'--zen-static-contact-label-line-height'   => 'formLabelLineHeight',
			'--zen-static-contact-label-letter'        => 'formLabelLetterSpacing',
			'--zen-static-contact-label-color'         => 'formLabelColor',
			'--zen-static-contact-input-family'        => 'formInputFontFamily',
			'--zen-static-contact-input-size'          => 'formInputFontSize',
			'--zen-static-contact-input-weight'        => 'formInputFontWeight',
			'--zen-static-contact-input-line-height'   => 'formInputLineHeight',
			'--zen-static-contact-input-letter'        => 'formInputLetterSpacing',
			'--zen-static-contact-input-color'         => 'formInputColor',
			'--zen-static-contact-placeholder-color'   => 'formPlaceholderColor',
			'--zen-static-contact-submit-bg'           => 'submitBackgroundColor',
			'--zen-static-contact-submit-color'        => 'submitTextColor',
			'--zen-static-contact-submit-border'       => 'submitBorderColor',
			'--zen-static-contact-submit-border-width' => 'submitBorderWidth',
			'--zen-static-contact-submit-radius'       => 'submitBorderRadius',
			'--zen-static-contact-submit-pt'           => 'submitPaddingTop',
			'--zen-static-contact-submit-pr'           => 'submitPaddingRight',
			'--zen-static-contact-submit-pb'           => 'submitPaddingBottom',
			'--zen-static-contact-submit-pl'           => 'submitPaddingLeft',
			'--zen-static-contact-submit-mt'           => 'submitMarginTop',
			'--zen-static-contact-submit-family'       => 'submitFontFamily',
			'--zen-static-contact-submit-size'         => 'submitFontSize',
			'--zen-static-contact-submit-weight'       => 'submitFontWeight',
			'--zen-static-contact-submit-line-height'  => 'submitLineHeight',
			'--zen-static-contact-submit-letter'       => 'submitLetterSpacing',
			'--zen-static-contact-heading-mb'          => 'headingBottomSpacing',
			'--zen-static-contact-description-mb'      => 'descriptionBottomSpacing',
			'--zen-static-contact-rows-gap'            => 'contactRowsGap',
			'--zen-static-contact-icon-size'           => 'contactIconSize',
			'--zen-static-contact-icon-color'          => 'contactIconColor',
			'--zen-static-contact-text-family'         => 'contactTextFontFamily',
			'--zen-static-contact-text-size'           => 'contactTextFontSize',
			'--zen-static-contact-text-weight'         => 'contactTextFontWeight',
			'--zen-static-contact-text-line-height'    => 'contactTextLineHeight',
			'--zen-static-contact-text-letter'         => 'contactTextLetterSpacing',
			'--zen-static-contact-text-color'          => 'contactTextColor',
		];

		$css = [];
		foreach ( $map as $var => $key ) {
			$value = zenctuary_static_contact_attr( $attributes, $key, '' );
			if ( '' === $value || null === $value ) {
				continue;
			}

			if ( in_array( $key, [ 'columnsGap', 'formFieldGap', 'contactRowsGap', 'formCardBorderWidth', 'formFieldBorderWidth', 'submitBorderWidth', 'contactIconSize' ], true ) ) {
				$value = absint( $value ) . 'px';
			} elseif ( in_array( $key, [ 'leftWidth', 'rightWidth' ], true ) ) {
				$value = absint( $value ) . '%';
			} elseif ( 'overlayOpacity' === $key ) {
				$value = min( 1, max( 0, (float) $value ) );
			}

			$css[] = $var . ':' . esc_attr( (string) $value );
		}

		$background_image = zenctuary_static_contact_attr( $attributes, 'backgroundImageUrl', '' );
		if ( $background_image ) {
			$css[] = '--zen-static-contact-bg-image:url(' . esc_url_raw( $background_image ) . ')';
		}

		$background_position = zenctuary_static_contact_attr( $attributes, 'backgroundPosition', 'center center' );
		$css[] = '--zen-static-contact-bg-position:' . esc_attr( $background_position );

		return implode( ';', $css );
	}
}

if ( ! function_exists( 'zenctuary_static_contact_text_style' ) ) {
	function zenctuary_static_contact_text_style( array $attributes, string $prefix ): string {
		$props = [
			'font-family'    => zenctuary_static_contact_attr( $attributes, $prefix . 'FontFamily', '' ),
			'font-size'      => zenctuary_static_contact_attr( $attributes, $prefix . 'FontSize', '' ),
			'font-weight'    => zenctuary_static_contact_attr( $attributes, $prefix . 'FontWeight', '' ),
			'line-height'    => zenctuary_static_contact_attr( $attributes, $prefix . 'LineHeight', '' ),
			'letter-spacing' => zenctuary_static_contact_attr( $attributes, $prefix . 'LetterSpacing', '' ),
			'color'          => zenctuary_static_contact_attr( $attributes, $prefix . 'Color', '' ),
		];
		if ( 'heading' === $prefix ) {
			$props['text-transform'] = zenctuary_static_contact_attr( $attributes, 'headingTextTransform', '' );
		}

		$style = [];
		foreach ( $props as $prop => $value ) {
			if ( '' !== $value && null !== $value ) {
				$style[] = $prop . ':' . esc_attr( (string) $value );
			}
		}

		return implode( ';', $style );
	}
}

if ( ! function_exists( 'zenctuary_static_contact_icon' ) ) {
	function zenctuary_static_contact_icon( string $icon ): string {
		if ( 'phone' === $icon ) {
			return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M6.6 10.8c1.7 3.3 3.3 4.9 6.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.3 1.3.4 2.7.6 4.1.6.7 0 1.3.6 1.3 1.3v3.5c0 .7-.6 1.3-1.3 1.3C10.4 22 2 13.6 2 3.3 2 2.6 2.6 2 3.3 2h3.5c.7 0 1.3.6 1.3 1.3 0 1.4.2 2.8.6 4.1.1.4 0 .9-.3 1.2l-1.8 2.2Z"/></svg>';
		}
		if ( 'location' === $icon ) {
			return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.3 7 13 7 13s7-7.7 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z"/></svg>';
		}

		return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3 5h18c.6 0 1 .4 1 1v12c0 .6-.4 1-1 1H3c-.6 0-1-.4-1-1V6c0-.6.4-1 1-1Zm9 8.2L4.9 7H19l-7 6.2Zm0 2.6L4 8.8V17h16V8.8l-8 7Z"/></svg>';
	}
}

$form_id          = absint( zenctuary_static_contact_attr( $attributes, 'formId', 0 ) );
$manual_shortcode = trim( (string) zenctuary_static_contact_attr( $attributes, 'manualShortcode', '' ) );
$form_markup      = '';

if ( $form_id > 0 ) {
	$form_markup = do_shortcode( '[contact-form-7 id="' . $form_id . '"]' );
} elseif ( $manual_shortcode ) {
	$form_markup = do_shortcode( wp_kses_post( $manual_shortcode ) );
}

if ( ! $form_markup ) {
	$form_markup = '<div class="zen-static-contact__empty-form">' . esc_html__( 'Select a Contact Form 7 form in block settings.', 'zenctuary' ) . '</div>';
}

$contact_rows = zenctuary_static_contact_attr( $attributes, 'contactRows', [] );
$contact_rows = is_array( $contact_rows ) ? $contact_rows : [];
$wrapper      = get_block_wrapper_attributes(
	[
		'class' => 'zen-static-contact',
		'style' => zenctuary_static_contact_css( $attributes ),
	]
);
$heading_style     = zenctuary_static_contact_text_style( $attributes, 'heading' );
$description_style = zenctuary_static_contact_text_style( $attributes, 'description' );
$contact_style     = zenctuary_static_contact_text_style( $attributes, 'contactText' );
$heading_wrap      = ! empty( $attributes['headingWrap'] ) ? 'normal' : 'nowrap';
?>
<section <?php echo $wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<div class="zen-static-contact__backdrop" aria-hidden="true"></div>
	<div class="zen-static-contact__inner">
		<div class="zen-static-contact__form-card">
			<?php echo $form_markup; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
		</div>
		<div class="zen-static-contact__content">
			<?php if ( ! empty( $attributes['heading'] ) ) : ?>
				<h2 class="zen-static-contact__heading" style="<?php echo esc_attr( $heading_style ); ?>;white-space:<?php echo esc_attr( $heading_wrap ); ?>"><?php echo wp_kses_post( $attributes['heading'] ); ?></h2>
			<?php endif; ?>
			<?php if ( ! empty( $attributes['description'] ) ) : ?>
				<div class="zen-static-contact__description" style="<?php echo esc_attr( $description_style ); ?>"><?php echo wp_kses_post( wpautop( $attributes['description'] ) ); ?></div>
			<?php endif; ?>
			<?php if ( $contact_rows ) : ?>
				<div class="zen-static-contact__rows">
					<?php foreach ( $contact_rows as $row ) :
						$text = isset( $row['text'] ) ? (string) $row['text'] : '';
						if ( '' === trim( $text ) ) {
							continue;
						}
						$url    = isset( $row['url'] ) ? trim( (string) $row['url'] ) : '';
						$target = ! empty( $row['openInNewTab'] ) ? '_blank' : '';
						$rel    = $target ? 'noreferrer noopener' : '';
						$icon   = isset( $row['icon'] ) ? (string) $row['icon'] : 'email';
						?>
						<?php if ( $url ) : ?>
							<a class="zen-static-contact__row" href="<?php echo esc_url( $url ); ?>" <?php echo $target ? 'target="' . esc_attr( $target ) . '" rel="' . esc_attr( $rel ) . '"' : ''; ?> style="<?php echo esc_attr( $contact_style ); ?>">
								<span class="zen-static-contact__row-icon"><?php echo zenctuary_static_contact_icon( $icon ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
								<span><?php echo wp_kses_post( $text ); ?></span>
							</a>
						<?php else : ?>
							<span class="zen-static-contact__row" style="<?php echo esc_attr( $contact_style ); ?>">
								<span class="zen-static-contact__row-icon"><?php echo zenctuary_static_contact_icon( $icon ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
								<span><?php echo wp_kses_post( $text ); ?></span>
							</span>
						<?php endif; ?>
					<?php endforeach; ?>
				</div>
			<?php endif; ?>
		</div>
	</div>
</section>