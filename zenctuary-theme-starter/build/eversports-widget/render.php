<?php
/**
 * Render callback for the Eversports Widget block.
 *
 * @package Zenctuary
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'zenctuary_eversports_widget_attr' ) ) {
	function zenctuary_eversports_widget_attr( array $attributes, string $key, $fallback = '' ) {
		return array_key_exists( $key, $attributes ) ? $attributes[ $key ] : $fallback;
	}
}

if ( ! function_exists( 'zenctuary_eversports_widget_css' ) ) {
	function zenctuary_eversports_widget_css( array $attributes ): string {
		$map = [
			'--zen-eversports-bg'            => 'sectionBackgroundColor',
			'--zen-eversports-color'         => 'sectionTextColor',
			'--zen-eversports-pt'            => 'sectionPaddingTop',
			'--zen-eversports-pr'            => 'sectionPaddingRight',
			'--zen-eversports-pb'            => 'sectionPaddingBottom',
			'--zen-eversports-pl'            => 'sectionPaddingLeft',
			'--zen-eversports-content-width' => 'contentMaxWidth',
			'--zen-eversports-min-height'    => 'widgetMinHeight',
		];

		$css = [];
		foreach ( $map as $var => $key ) {
			$value = zenctuary_eversports_widget_attr( $attributes, $key, '' );
			if ( '' === $value || null === $value ) {
				continue;
			}

			$css[] = $var . ':' . esc_attr( (string) $value );
		}

		return implode( ';', $css );
	}
}

$widget_id  = sanitize_text_field( (string) zenctuary_eversports_widget_attr( $attributes, 'widgetId', '2a24d07f-ce43-4ce7-a99f-07e5f02844ad' ) );
$loader_url = esc_url_raw( (string) zenctuary_eversports_widget_attr( $attributes, 'loaderUrl', 'https://widget-static.eversports.io/loader.js' ) );
$wrapper    = get_block_wrapper_attributes(
	[
		'class' => 'zen-eversports-widget',
		'style' => zenctuary_eversports_widget_css( $attributes ),
	]
);
?>
<section <?php echo $wrapper; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<div class="zen-eversports-widget__inner">
		<?php if ( $widget_id ) : ?>
			<div class="zen-eversports-widget__embed" data-eversports-widget-id="<?php echo esc_attr( $widget_id ); ?>"></div>
		<?php else : ?>
			<div class="zen-eversports-widget__placeholder">
				<div class="zen-eversports-widget__placeholder-title"><?php echo esc_html__( 'Eversports widget ID missing', 'zenctuary' ); ?></div>
			</div>
		<?php endif; ?>
	</div>
</section>
<?php
if ( $widget_id && $loader_url ) {
	global $zenctuary_eversports_widget_loader_printed;
	if ( empty( $zenctuary_eversports_widget_loader_printed ) ) {
		$zenctuary_eversports_widget_loader_printed = true;
		?>
		<script type="module" src="<?php echo esc_url( $loader_url ); ?>" async defer></script>
		<?php
	}
}