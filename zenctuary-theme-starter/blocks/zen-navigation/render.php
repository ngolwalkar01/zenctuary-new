<?php
/**
 * Server-side rendering for zenctuary/zen-navigation block.
 *
 * @package Zenctuary
 */

$nav_items     = isset( $attributes['navItems'] ) ? $attributes['navItems'] : array();
$item_gap      = isset( $attributes['itemGap'] ) ? $attributes['itemGap'] : 32;
$text_color    = isset( $attributes['textColor'] ) ? $attributes['textColor'] : '#000000';
$font_size     = isset( $attributes['fontSize'] ) ? $attributes['fontSize'] : 16;
$font_weight   = isset( $attributes['fontWeight'] ) ? $attributes['fontWeight'] : '500';
$letter_spacing = isset( $attributes['letterSpacing'] ) ? $attributes['letterSpacing'] : 1;
$hover_bg_color = isset( $attributes['hoverBgColor'] ) ? $attributes['hoverBgColor'] : '#f5f5f5';
$hover_text_color = isset( $attributes['hoverTextColor'] ) ? $attributes['hoverTextColor'] : '#000000';
$hover_radius  = isset( $attributes['hoverBorderRadius'] ) ? $attributes['hoverBorderRadius'] : 8;
$hover_padding = isset( $attributes['hoverPadding'] ) ? $attributes['hoverPadding'] : array(
	'top'    => '12px',
	'right'  => '24px',
	'bottom' => '12px',
	'left'   => '24px',
);
$section_padding = isset( $attributes['sectionPadding'] ) ? $attributes['sectionPadding'] : array(
	'top'    => '24px',
	'right'  => '24px',
	'bottom' => '24px',
	'left'   => '24px',
);
$section_margin = isset( $attributes['sectionMargin'] ) ? $attributes['sectionMargin'] : array(
	'top'    => '0px',
	'right'  => '0px',
	'bottom' => '0px',
	'left'   => '0px',
);
$bg_color      = isset( $attributes['backgroundColor'] ) ? $attributes['backgroundColor'] : 'transparent';
$mobile_layout = isset( $attributes['mobileLayout'] ) ? $attributes['mobileLayout'] : 'row';

if ( empty( $nav_items ) ) {
	return '';
}

$padding_style = 'padding:' . $section_padding['top'] . ' ' . $section_padding['right'] . ' ' . $section_padding['bottom'] . ' ' . $section_padding['left'] . ';';
$margin_style  = 'margin:' . $section_margin['top'] . ' ' . $section_margin['right'] . ' ' . $section_margin['bottom'] . ' ' . $section_margin['left'] . ';';
$bg_style      = 'background-color:' . $bg_color . ';';

$hover_padding_style = $hover_padding['top'] . ' ' . $hover_padding['right'] . ' ' . $hover_padding['bottom'] . ' ' . $hover_padding['left'];

$wrapper_attrs = get_block_wrapper_attributes( [
	'class'         => 'zen-navigation',
	'style'         => esc_attr( $padding_style . ' ' . $margin_style . ' ' . $bg_style ),
	'data-mobile-layout' => esc_attr( $mobile_layout ),
] );
?>
<nav <?php echo $wrapper_attrs; ?>>
	<div class="zen-navigation__inner" style="gap: <?php echo esc_attr( $item_gap ); ?>px;">
		<?php foreach ( $nav_items as $index => $item ) : ?>
			<?php
			$label  = isset( $item['label'] ) ? $item['label'] : '';
			$anchor = isset( $item['anchor'] ) ? $item['anchor'] : '#';

			$item_style = sprintf(
				'color:%s; font-size:%dpx; font-weight:%s; letter-spacing:%dpx; text-transform:uppercase; padding:%s; border-radius:%dpx; transition:all 0.3s ease;',
				esc_attr( $text_color ),
				intval( $font_size ),
				esc_attr( $font_weight ),
				intval( $letter_spacing ),
				esc_attr( $hover_padding_style ),
				intval( $hover_radius )
			);
			?>
			<a
				class="zen-navigation__item"
				href="<?php echo esc_url( $anchor ); ?>"
				style="<?php echo esc_attr( $item_style ); ?>"
			>
				<?php echo wp_kses_post( $label ); ?>
			</a>
		<?php endforeach; ?>
	</div>
</nav>

<style>
	.zen-navigation__item:hover,
	.zen-navigation__item:focus {
		background-color: <?php echo esc_attr( $hover_bg_color ); ?> !important;
		color: <?php echo esc_attr( $hover_text_color ); ?> !important;
		border-radius: <?php echo esc_attr( $hover_radius ); ?>px !important;
		padding: <?php echo esc_attr( $hover_padding_style ); ?> !important;
		text-decoration: none;
	}
</style>
