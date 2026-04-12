<?php
/**
 * Render callback for the Zen-What-Zencoins block.
 *
 * @package Zenctuary
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'zen_what_zencoins_spacing' ) ) {
	function zen_what_zencoins_spacing( $value, string $property ): string {
		$value = is_array( $value ) ? wp_parse_args( $value, [ 'top' => '0px', 'right' => '0px', 'bottom' => '0px', 'left' => '0px' ] ) : [ 'top' => '0px', 'right' => '0px', 'bottom' => '0px', 'left' => '0px' ];
		return sprintf( '%1$s-top:%2$s;%1$s-right:%3$s;%1$s-bottom:%4$s;%1$s-left:%5$s;', esc_attr( $property ), esc_attr( $value['top'] ), esc_attr( $value['right'] ), esc_attr( $value['bottom'] ), esc_attr( $value['left'] ) );
	}
}

if ( ! function_exists( 'zen_what_zencoins_coin' ) ) {
	function zen_what_zencoins_coin( $value = '', int $size = 52, string $extra_class = '' ): string {
		$has_value = $value !== null && $value !== '';
		$output  = '<span class="' . esc_attr( trim( 'zen-what-zencoins-coin ' . $extra_class ) ) . '" style="width:' . absint( $size ) . 'px;height:' . absint( $size ) . 'px;font-size:' . absint( max( 12, round( $size * 0.34 ) ) ) . 'px;">';
		$output .= '<span class="zen-what-zencoins-coin__ring"></span>';
		if ( $has_value ) {
			$output .= '<span class="zen-what-zencoins-coin__value">' . esc_html( $value ) . '</span>';
		}
		$output .= '</span>';
		return $output;
	}
}

if ( ! function_exists( 'zen_what_zencoins_coin_stack' ) ) {
	function zen_what_zencoins_coin_stack( array $coins, int $size = 52 ): string {
		$output = '<span class="zen-what-zencoins-coin-stack" style="--zen-what-zencoins-overlap:' . esc_attr( round( $size * -0.34 ) ) . 'px;">';
		foreach ( $coins as $coin ) {
			$value = is_array( $coin ) && array_key_exists( 'value', $coin ) ? $coin['value'] : $coin;
			$output .= zen_what_zencoins_coin( $value, $size, 'zen-what-zencoins-coin-stack__coin' );
		}
		return $output . '</span>';
	}
}

if ( ! function_exists( 'zen_what_zencoins_price_values' ) ) {
	function zen_what_zencoins_price_values( array $term_ids ): array {
		$term_ids = array_values( array_filter( array_map( 'absint', $term_ids ) ) );
		if ( empty( $term_ids ) ) {
			return [];
		}
		$query = new WP_Query(
			[
				'post_type'              => 'product',
				'post_status'            => 'publish',
				'posts_per_page'         => -1,
				'fields'                 => 'ids',
				'no_found_rows'          => true,
				'update_post_meta_cache' => true,
				'update_post_term_cache' => false,
				'tax_query'              => [
					[
						'taxonomy' => 'experience_category',
						'field'    => 'term_id',
						'terms'    => $term_ids,
						'operator' => 'IN',
					],
				],
			]
		);
		$values = [];
		foreach ( $query->posts as $product_id ) {
			$value = get_post_meta( $product_id, '_zen_coins', true );
			if ( $value !== '' && is_numeric( $value ) ) {
				$values[] = absint( $value );
			}
		}
		return $values;
	}
}

if ( ! function_exists( 'zen_what_zencoins_price_range' ) ) {
	function zen_what_zencoins_price_range( array $term_ids, int $coin_size, array $fallback = [] ): string {
		$values = zen_what_zencoins_price_values( $term_ids );
		if ( empty( $values ) && ! empty( $fallback ) ) {
			$values = array_values( array_filter( array_map( 'absint', $fallback ) ) );
		}
		if ( empty( $values ) ) {
			return '<span class="zen-what-zencoins__empty-price">' . esc_html__( 'Not set', 'zenctuary' ) . '</span>';
		}
		$min = min( $values );
		$max = max( $values );
		if ( $min === $max ) {
			return zen_what_zencoins_coin( $min, $coin_size );
		}
		return '<span class="zen-what-zencoins__coin-range">' . zen_what_zencoins_coin( $min, $coin_size ) . zen_what_zencoins_coin( $max, $coin_size ) . '</span>';
	}
}

if ( ! function_exists( 'zen_what_zencoins_arrow' ) ) {
	function zen_what_zencoins_arrow(): string {
		return '<span class="zen-what-zencoins__button-icon"><svg viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d="M9.7 3.3 15.4 9l-5.7 5.7-1.2-1.2 3.7-3.7H2.6V8.2h9.6L8.5 4.5z"/></svg></span>';
	}
}

$rows = is_array( $attributes['rows'] ?? null ) ? $attributes['rows'] : [];
$wrapper_attributes = get_block_wrapper_attributes(
	[
		'class' => 'zen-what-zencoins',
		'style' => zen_what_zencoins_spacing( $attributes['sectionPadding'] ?? [], 'padding' ) . '--zen-what-zencoins-column-gap:' . absint( $attributes['columnGap'] ?? 120 ) . 'px;',
	]
);
$arrow_position = sanitize_key( $attributes['arrowPosition'] ?? 'right' );
$button_width_mode = sanitize_key( $attributes['buttonWidthMode'] ?? 'auto' );
$button_width_style = '';

if ( 'full' === $button_width_mode ) {
	$button_width_style = 'width:100%;';
} elseif ( 'custom' === $button_width_mode ) {
	$custom_width = sanitize_text_field( $attributes['buttonCustomWidth'] ?? '340px' );
	if ( ! preg_match( '/^\d+(\.\d+)?(px|%)$/', $custom_width ) ) {
		$custom_width = '340px';
	}
	$button_width_style = 'width:' . esc_attr( $custom_width ) . ';';
}

$button_style = sprintf(
	'background-color:%1$s;color:%2$s;font-size:%3$dpx;font-weight:%4$s;border-radius:%5$dpx;%6$s%7$s',
	esc_attr( $attributes['buttonBackgroundColor'] ?? '#d8b354' ),
	esc_attr( $attributes['buttonTextColor'] ?? '#3f3d3d' ),
	absint( $attributes['buttonFontSize'] ?? 16 ),
	esc_attr( $attributes['buttonFontWeight'] ?? '700' ),
	absint( $attributes['buttonBorderRadius'] ?? 30 ),
	zen_what_zencoins_spacing( $attributes['buttonPadding'] ?? [], 'padding' ),
	$button_width_style
);
?>
<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<div class="zen-what-zencoins__inner">
		<div class="zen-what-zencoins__left">
			<div class="zen-what-zencoins__heading-row">
				<h2 class="zen-what-zencoins__heading" style="color:<?php echo esc_attr( $attributes['headingColor'] ?? '#d8b354' ); ?>;font-size:<?php echo absint( $attributes['headingFontSize'] ?? 36 ); ?>px;font-weight:<?php echo esc_attr( $attributes['headingFontWeight'] ?? '800' ); ?>;"><?php echo wp_kses_post( $attributes['heading'] ?? '' ); ?></h2>
				<?php echo zen_what_zencoins_coin_stack( is_array( $attributes['headingCoins'] ?? null ) ? $attributes['headingCoins'] : [], absint( $attributes['headingCoinSize'] ?? 56 ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</div>
			<p class="zen-what-zencoins__paragraph" style="color:<?php echo esc_attr( $attributes['paragraphColor'] ?? '#f1eee7' ); ?>;font-size:<?php echo absint( $attributes['paragraphFontSize'] ?? 18 ); ?>px;font-weight:<?php echo esc_attr( $attributes['paragraphFontWeight'] ?? '400' ); ?>;"><?php echo wp_kses_post( $attributes['paragraph'] ?? '' ); ?></p>
			<a class="zen-what-zencoins__button is-arrow-<?php echo esc_attr( $arrow_position ); ?>" href="<?php echo esc_url( $attributes['buttonUrl'] ?? '#' ); ?>" style="<?php echo esc_attr( $button_style ); ?>">
				<?php echo ( $attributes['showArrow'] ?? true ) && in_array( $arrow_position, [ 'left', 'top' ], true ) ? zen_what_zencoins_arrow() : ''; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
				<span><?php echo wp_kses_post( $attributes['buttonText'] ?? '' ); ?></span>
				<?php echo ( $attributes['showArrow'] ?? true ) && in_array( $arrow_position, [ 'right', 'bottom' ], true ) ? zen_what_zencoins_arrow() : ''; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
			</a>
		</div>
		<div class="zen-what-zencoins__panel" style="border-color:<?php echo esc_attr( $attributes['panelBorderColor'] ?? '#f1eee7' ); ?>;border-width:<?php echo absint( $attributes['panelBorderWidth'] ?? 2 ); ?>px;border-radius:<?php echo absint( $attributes['panelBorderRadius'] ?? 22 ); ?>px;">
			<div class="zen-what-zencoins__conversion" style="font-size:<?php echo absint( $attributes['conversionFontSize'] ?? 18 ); ?>px;font-weight:<?php echo esc_attr( $attributes['conversionFontWeight'] ?? '800' ); ?>;">
				<span class="zen-what-zencoins__conversion-accent" style="color:<?php echo esc_attr( $attributes['conversionAccentColor'] ?? '#d8b354' ); ?>;"><?php echo zen_what_zencoins_coin( $attributes['conversionCoinValue'] ?? '1', absint( $attributes['conversionCoinSize'] ?? 56 ) ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?><?php echo esc_html( $attributes['conversionLabel'] ?? 'ZENCOIN =' ); ?></span>
				<span style="color:<?php echo esc_attr( $attributes['conversionValueColor'] ?? '#f1eee7' ); ?>;"><?php echo esc_html( $attributes['conversionValue'] ?? '5 EURO' ); ?></span>
			</div>
			<span class="zen-what-zencoins__separator" style="width:<?php echo absint( $attributes['separatorWidth'] ?? 100 ); ?>%;border-top-color:<?php echo esc_attr( $attributes['separatorColor'] ?? '#949494' ); ?>;border-top-width:<?php echo absint( $attributes['separatorThickness'] ?? 3 ); ?>px;"></span>
			<div class="zen-what-zencoins__rows">
				<?php foreach ( $rows as $index => $row ) : ?>
					<?php if ( ( $row['type'] ?? 'taxonomy' ) === 'separator' ) : ?>
						<div class="zen-what-zencoins__row-control"><span class="zen-what-zencoins__separator" style="width:<?php echo absint( $row['width'] ?? 100 ); ?>%;border-top-color:<?php echo esc_attr( $row['color'] ?? '#949494' ); ?>;border-top-width:<?php echo absint( $row['thickness'] ?? 3 ); ?>px;"></span></div>
					<?php elseif ( ( $row['type'] ?? '' ) === 'paragraph' ) : ?>
						<p class="zen-what-zencoins__right-paragraph" style="color:<?php echo esc_attr( $row['color'] ?? '#b9b9b9' ); ?>;font-size:<?php echo absint( $row['fontSize'] ?? 17 ); ?>px;font-weight:<?php echo esc_attr( $row['fontWeight'] ?? '400' ); ?>;<?php echo esc_attr( zen_what_zencoins_spacing( $row['margin'] ?? [], 'margin' ) . zen_what_zencoins_spacing( $row['padding'] ?? [], 'padding' ) ); ?>"><?php echo wp_kses_post( $row['text'] ?? '' ); ?></p>
					<?php else : ?>
						<?php
						$term_ids = is_array( $row['termIds'] ?? null ) ? array_values( array_filter( array_map( 'absint', $row['termIds'] ) ) ) : [];
						$term_names = [];
						if ( $term_ids ) {
							$terms = get_terms( [ 'taxonomy' => 'experience_category', 'include' => $term_ids, 'hide_empty' => false, 'orderby' => 'include' ] );
							if ( ! is_wp_error( $terms ) ) {
								$term_names = wp_list_pluck( $terms, 'name' );
							}
						}
						if ( empty( $term_names ) && ! empty( $row['termNames'] ) && is_array( $row['termNames'] ) ) {
							$term_names = array_map( 'sanitize_text_field', $row['termNames'] );
						}
						$fallback = $index > 2 ? [ 6, 8 ] : [ 5 ];
						?>
						<div class="zen-what-zencoins__data-row">
							<div class="zen-what-zencoins__term-label" style="color:<?php echo esc_attr( $row['labelColor'] ?? '#f1eee7' ); ?>;font-size:<?php echo absint( $row['labelFontSize'] ?? 18 ); ?>px;font-weight:<?php echo esc_attr( $row['labelFontWeight'] ?? '800' ); ?>;"><?php echo esc_html( strtoupper( implode( ' + ', array_slice( $term_names, 0, 2 ) ) ) ); ?></div>
							<div class="zen-what-zencoins__price" style="font-size:<?php echo absint( $row['priceFontSize'] ?? 18 ); ?>px;font-weight:<?php echo esc_attr( $row['priceFontWeight'] ?? '800' ); ?>;"><span style="color:<?php echo esc_attr( $row['priceLabelColor'] ?? '#d8b354' ); ?>;"><?php esc_html_e( 'ZENCOINS:', 'zenctuary' ); ?></span><?php echo zen_what_zencoins_price_range( $term_ids, absint( $row['coinSize'] ?? 50 ), $fallback ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></div>
						</div>
					<?php endif; ?>
				<?php endforeach; ?>
			</div>
		</div>
	</div>
</section>
