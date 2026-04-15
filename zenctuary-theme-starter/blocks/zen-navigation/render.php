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

$hover_vars = sprintf(
	'--zen-nav-hover-bg:%s; --zen-nav-hover-text:%s; --zen-nav-hover-radius:%dpx; --zen-nav-hover-pad-top:%s; --zen-nav-hover-pad-right:%s; --zen-nav-hover-pad-bottom:%s; --zen-nav-hover-pad-left:%s;',
	esc_attr( $hover_bg_color ),
	esc_attr( $hover_text_color ),
	intval( $hover_radius ),
	esc_attr( $hover_padding['top'] ),
	esc_attr( $hover_padding['right'] ),
	esc_attr( $hover_padding['bottom'] ),
	esc_attr( $hover_padding['left'] )
);

$wrapper_attrs = get_block_wrapper_attributes( [
	'class'         => 'zen-navigation',
	'style'         => esc_attr( $padding_style . ' ' . $margin_style . ' ' . $bg_style . ' ' . $hover_vars ),
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
				'color:%s; font-size:%dpx; font-weight:%s; letter-spacing:%dpx; text-transform:uppercase; transition:all 0.3s ease;',
				esc_attr( $text_color ),
				intval( $font_size ),
				esc_attr( $font_weight ),
				intval( $letter_spacing )
			);
			?>
			<a
				class="zen-navigation__item"
				href="<?php echo esc_url( $anchor ); ?>"
				style="<?php echo esc_attr( $item_style ); ?>"
			>
				<span><?php echo wp_kses_post( $label ); ?></span>
			</a>
		<?php endforeach; ?>
	</div>
</nav>
