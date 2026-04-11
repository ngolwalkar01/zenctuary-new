<?php
/**
 * Server render callback for the Zen Soul Kitchen Menu block.
 *
 * @package Zenctuary
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$heading           = isset( $attributes['heading'] ) ? $attributes['heading'] : __( 'Soul Kitchen Menu', 'zenctuary' );
$active_filter     = isset( $attributes['activeFilter'] ) ? $attributes['activeFilter'] : 'drinks';
$drinks_tag_slug   = isset( $attributes['drinksTagSlug'] ) ? sanitize_title( $attributes['drinksTagSlug'] ) : 'drinks';
$food_tag_slug     = isset( $attributes['foodTagSlug'] ) ? sanitize_title( $attributes['foodTagSlug'] ) : 'food';
$category_settings = isset( $attributes['categorySettings'] ) && is_array( $attributes['categorySettings'] ) ? $attributes['categorySettings'] : array();
$section_padding   = isset( $attributes['sectionPadding'] ) && is_array( $attributes['sectionPadding'] ) ? $attributes['sectionPadding'] : array();
$section_margin    = isset( $attributes['sectionMargin'] ) && is_array( $attributes['sectionMargin'] ) ? $attributes['sectionMargin'] : array();
$spacing_style     = '';

foreach ( array( 'top', 'right', 'bottom', 'left' ) as $side ) {
	if ( isset( $section_padding[ $side ] ) && '' !== $section_padding[ $side ] ) {
		$spacing_style .= sprintf( 'padding-%1$s:%2$s;', $side, esc_attr( $section_padding[ $side ] ) );
	}

	if ( isset( $section_margin[ $side ] ) && '' !== $section_margin[ $side ] ) {
		$spacing_style .= sprintf( 'margin-%1$s:%2$s;', $side, esc_attr( $section_margin[ $side ] ) );
	}
}

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'style' => $spacing_style,
	)
);

if ( ! class_exists( 'WooCommerce' ) || ! function_exists( 'wc_get_products' ) ) {
	?>
	<section <?php echo $wrapper_attributes; /* phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped */ ?>>
		<h2 class="zen-soul-menu__heading"><?php echo esc_html( $heading ); ?></h2>
		<p class="zen-soul-menu__notice"><?php esc_html_e( 'WooCommerce must be active to display this menu.', 'zenctuary' ); ?></p>
	</section>
	<?php
	return;
}

if ( ! function_exists( 'zenctuary_soul_menu_get_product_attribute_text' ) ) {
	function zenctuary_soul_menu_get_product_attribute_text( WC_Product $product ): string {
		$attributes = $product->get_attributes();

		if ( empty( $attributes ) ) {
			return '';
		}

		$preferred_attribute = null;

		foreach ( $attributes as $attribute ) {
			$label = strtolower( wc_attribute_label( $attribute->get_name() ) );

			if ( false !== strpos( $label, 'ml' ) || false !== strpos( $label, 'size' ) || false !== strpos( $label, 'menge' ) || false !== strpos( $label, 'protein' ) ) {
				$preferred_attribute = $attribute;
				break;
			}
		}

		if ( ! $preferred_attribute ) {
			$preferred_attribute = reset( $attributes );
		}

		if ( ! $preferred_attribute instanceof WC_Product_Attribute ) {
			return '';
		}

		$options = array();

		if ( $preferred_attribute->is_taxonomy() ) {
			foreach ( wc_get_product_terms( $product->get_id(), $preferred_attribute->get_name(), array( 'fields' => 'names' ) ) as $term_name ) {
				$options[] = $term_name;
			}
		} else {
			$options = $preferred_attribute->get_options();
		}

		return wp_strip_all_tags( implode( ', ', array_filter( array_map( 'strval', $options ) ) ) );
	}
}

if ( ! function_exists( 'zenctuary_soul_menu_get_product_details' ) ) {
	function zenctuary_soul_menu_get_product_details( WC_Product $product ): string {
		foreach ( $product->get_attributes() as $attribute ) {
			$label = strtolower( wc_attribute_label( $attribute->get_name() ) );

			if ( false === strpos( $label, 'zutat' ) && false === strpos( $label, 'ingredient' ) && false === strpos( $label, 'detail' ) ) {
				continue;
			}

			if ( $attribute->is_taxonomy() ) {
				return wp_strip_all_tags( implode( ', ', wc_get_product_terms( $product->get_id(), $attribute->get_name(), array( 'fields' => 'names' ) ) ) );
			}

			return wp_strip_all_tags( implode( ', ', array_filter( array_map( 'strval', $attribute->get_options() ) ) ) );
		}

		return '';
	}
}

if ( ! function_exists( 'zenctuary_soul_menu_format_plain_text' ) ) {
	function zenctuary_soul_menu_format_plain_text( string $content ): string {
		if ( '' === trim( $content ) ) {
			return '';
		}

		$content = preg_replace( '/<\s*br\s*\/?>/i', "\n", $content );
		$content = preg_replace( '/<\/(p|div|li|h[1-6])>/i', "\n", $content );
		$content = wp_strip_all_tags( $content );
		$content = wp_specialchars_decode( $content, ENT_QUOTES );
		$content = preg_replace( "/\n{3,}/", "\n\n", $content );

		return trim( $content );
	}
}

if ( ! function_exists( 'zenctuary_soul_menu_get_groups' ) ) {
	function zenctuary_soul_menu_get_groups( string $tag_slug, array $category_settings ): array {
		$products = wc_get_products(
			array(
				'limit'  => -1,
				'status' => 'publish',
				'tag'    => array( $tag_slug ),
				'orderby' => 'menu_order',
				'order'  => 'ASC',
			)
		);

		$groups = array();

		foreach ( $products as $product ) {
			if ( ! $product instanceof WC_Product ) {
				continue;
			}

			$categories = get_the_terms( $product->get_id(), 'product_cat' );

			if ( empty( $categories ) || is_wp_error( $categories ) ) {
				continue;
			}

			foreach ( $categories as $category ) {
				$key = (string) $category->term_id;

				if ( ! isset( $groups[ $key ] ) ) {
					$settings       = isset( $category_settings[ $key ] ) && is_array( $category_settings[ $key ] ) ? $category_settings[ $key ] : array();
					$description    = ! empty( $settings['description'] ) ? $settings['description'] : $category->description;
					$groups[ $key ] = array(
						'term'        => $category,
						'meta_text'   => isset( $settings['metaText'] ) ? $settings['metaText'] : '',
						'description' => $description,
						'products'    => array(),
					);
				}

				$groups[ $key ]['products'][] = $product;
			}
		}

		uasort(
			$groups,
			static function ( $a, $b ) {
				return strcasecmp( $a['term']->name, $b['term']->name );
			}
		);

		return $groups;
	}
}

$filters = array(
	'drinks' => array(
		'label' => __( 'Drinks', 'zenctuary' ),
		'slug'  => $drinks_tag_slug,
	),
	'food'   => array(
		'label' => __( 'Food', 'zenctuary' ),
		'slug'  => $food_tag_slug,
	),
);
?>

<section <?php echo $wrapper_attributes; /* phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped */ ?> data-active-filter="<?php echo esc_attr( $active_filter ); ?>">
	<h2 class="zen-soul-menu__heading"><?php echo esc_html( $heading ); ?></h2>

	<div class="zen-soul-menu__filters" role="group" aria-label="<?php esc_attr_e( 'Menu filters', 'zenctuary' ); ?>">
		<?php foreach ( $filters as $filter_key => $filter ) : ?>
			<button
				type="button"
				class="zen-soul-menu__filter-button<?php echo $active_filter === $filter_key ? ' is-active' : ''; ?>"
				data-filter="<?php echo esc_attr( $filter_key ); ?>"
				aria-pressed="<?php echo $active_filter === $filter_key ? 'true' : 'false'; ?>"
			>
				<?php echo esc_html( $filter['label'] ); ?>
			</button>
		<?php endforeach; ?>
	</div>

	<?php foreach ( $filters as $filter_key => $filter ) : ?>
		<?php $groups = zenctuary_soul_menu_get_groups( $filter['slug'], $category_settings ); ?>
		<div class="zen-soul-menu__filter-panel" data-filter="<?php echo esc_attr( $filter_key ); ?>" <?php echo $active_filter === $filter_key ? '' : 'hidden'; ?>>
			<?php if ( empty( $groups ) ) : ?>
				<p class="zen-soul-menu__notice"><?php esc_html_e( 'No menu products found for this filter.', 'zenctuary' ); ?></p>
			<?php endif; ?>

			<?php foreach ( $groups as $group ) : ?>
				<section class="zen-soul-menu__category">
					<div class="zen-soul-menu__category-header">
						<h3 class="zen-soul-menu__category-title"><?php echo esc_html( $group['term']->name ); ?></h3>
						<?php if ( ! empty( $group['meta_text'] ) ) : ?>
							<p class="zen-soul-menu__category-meta"><?php echo esc_html( $group['meta_text'] ); ?></p>
						<?php endif; ?>
					</div>

					<?php if ( ! empty( $group['description'] ) ) : ?>
						<p class="zen-soul-menu__category-description"><?php echo esc_html( wp_strip_all_tags( $group['description'] ) ); ?></p>
					<?php endif; ?>

					<div class="zen-soul-menu__products">
						<?php foreach ( $group['products'] as $product ) : ?>
							<?php
							$attribute_text     = zenctuary_soul_menu_get_product_attribute_text( $product );
							$price_text         = wp_strip_all_tags( $product->get_price_html() );
							$details_text       = zenctuary_soul_menu_get_product_details( $product );
							$description        = zenctuary_soul_menu_format_plain_text( $product->get_description() );
							$short_description = zenctuary_soul_menu_format_plain_text( $product->get_short_description() );
							?>
							<article class="zen-soul-menu__product">
								<h4 class="zen-soul-menu__product-title"><?php echo esc_html( $product->get_name() ); ?></h4>
								<?php if ( $description ) : ?>
									<p class="zen-soul-menu__product-description"><?php echo esc_html( $description ); ?></p>
								<?php endif; ?>
								<?php if ( $short_description ) : ?>
									<p class="zen-soul-menu__product-short-description"><?php echo esc_html( $short_description ); ?></p>
								<?php endif; ?>
								<?php if ( $details_text ) : ?>
									<p class="zen-soul-menu__product-details"><?php echo esc_html( $details_text ); ?></p>
								<?php endif; ?>
								<?php if ( $attribute_text || $price_text ) : ?>
									<p class="zen-soul-menu__product-meta"><?php echo esc_html( implode( ' / ', array_filter( array( $attribute_text, $price_text ) ) ) ); ?></p>
								<?php endif; ?>
							</article>
						<?php endforeach; ?>
					</div>
				</section>
			<?php endforeach; ?>
		</div>
	<?php endforeach; ?>
</section>
