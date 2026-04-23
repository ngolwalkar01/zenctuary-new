<?php
/**
 * Render callback for Zen Soul Kitchen block.
 *
 * @package Zenctuary
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Attributes extraction
$heading           = $attributes['heading'] ?? '';
$selected_tags     = $attributes['selectedTags'] ?? [];
$active_tag_id     = (int) ( $attributes['activeTagId'] ?? 0 );
$category_meta     = $attributes['categoryMeta'] ?? [];
$category_styles   = $attributes['categoryStyles'] ?? [];
$product_styles    = $attributes['productStyles'] ?? [];
$inactive_styles   = $attributes['inactiveStyles'] ?? [];
$active_styles     = $attributes['activeStyles'] ?? [];
$heading_alignment = $attributes['headingAlignment'] ?? 'left';

// Determine the tag to fetch products for (defaults to first selected tag)
$current_tag_id = $active_tag_id;
if ( ! $current_tag_id && ! empty( $selected_tags ) ) {
	$current_tag_id = $selected_tags[0]['id'];
}

$products_query = [];
if ( $current_tag_id ) {
	$args = [
		'post_type'      => 'product',
		'posts_per_page' => -1,
		'post_status'    => 'publish',
		'tax_query'      => [
			[
				'taxonomy' => 'product_tag',
				'field'    => 'term_id',
				'terms'    => $current_tag_id,
			],
		],
	];
	$query          = new WP_Query( $args );
	$products_query = $query->posts;
}

// Group products by category
$grouped_data = [];
if ( ! empty( $products_query ) ) {
	foreach ( $products_query as $product_post ) {
		$product_id = $product_post->ID;
		$cats       = get_the_terms( $product_id, 'product_cat' );

		if ( $cats && ! is_wp_error( $cats ) ) {
			foreach ( $cats as $cat ) {
				if ( ! isset( $grouped_data[ $cat->term_id ] ) ) {
					$grouped_data[ $cat->term_id ] = [
						'id'       => $cat->term_id,
						'name'     => $cat->name,
						'products' => [],
					];
				}
				// Get WC Product object for data
				if ( function_exists( 'wc_get_product' ) ) {
					$product_obj = wc_get_product( $product_id );
					if ( $product_obj ) {
						$grouped_data[ $cat->term_id ]['products'][] = [
							'id'                => $product_id,
							'title'             => get_the_title( $product_id ),
							'short_description' => $product_obj->get_short_description(),
							'price_html'        => $product_obj->get_price_html(),
						];
					}
				}
			}
		}
	}
}

// Sort categories by name alphabetically
uasort(
	$grouped_data,
	function( $a, $b ) {
		return strcasecmp( $a['name'], $b['name'] );
	}
);

$wrapper_attributes = get_block_wrapper_attributes();
?>

<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<h2 class="zen-soul-kitchen__heading" style="
		color: <?php echo esc_attr( $attributes['headingColor'] ?? '' ); ?>;
		font-size: <?php echo esc_attr( $attributes['headingFontSize'] ?? '' ); ?>;
		font-weight: <?php echo esc_attr( $attributes['headingFontWeight'] ?? '700' ); ?>;
		text-align: <?php echo esc_attr( $heading_alignment ); ?>;
	">
		<?php echo wp_kses_post( $heading ); ?>
	</h2>

	<?php if ( ! empty( $selected_tags ) ) : ?>
		<div class="zen-soul-kitchen__filters" style="
			text-align: <?php echo esc_attr( $heading_alignment ); ?>;
			display: flex;
			gap: 10px;
			flex-wrap: wrap;
			margin-top: 20px;
		">
			<?php
			foreach ( $selected_tags as $tag_data ) :
				$is_active = ( (int) $current_tag_id === (int) $tag_data['id'] );
				$styles    = $is_active ? $active_styles : $inactive_styles;
				?>
				<span class="zen-soul-kitchen__filter-button <?php echo $is_active ? 'is-active' : ''; ?>" style="
					display: inline-block;
					padding: 10px 24px;
					background-color: <?php echo esc_attr( $styles['backgroundColor'] ?? '' ); ?>;
					color: <?php echo esc_attr( $styles['textColor'] ?? '' ); ?>;
					border-color: <?php echo esc_attr( $styles['borderColor'] ?? '' ); ?>;
					border-width: <?php echo esc_attr( $is_active ? '1px' : ( $styles['borderWidth'] ?? '1px' ) ); ?>;
					border-radius: <?php echo esc_attr( $is_active ? '25px' : ( $styles['borderRadius'] ?? '25px' ) ); ?>;
					font-weight: <?php echo esc_attr( $is_active ? '700' : ( $styles['fontWeight'] ?? '400' ) ); ?>;
					border-style: solid;
					cursor: pointer;
				">
					<?php echo esc_html( $tag_data['label'] ?? '' ); ?>
				</span>
			<?php endforeach; ?>
		</div>
	<?php endif; ?>

	<div class="zen-soul-kitchen__menu-content" style="margin-top: 40px;">
		<?php if ( ! empty( $grouped_data ) ) : ?>
			<?php foreach ( $grouped_data as $cat_id => $group ) : ?>
				<section class="zen-soul-kitchen__category" style="margin-bottom: 40px;">
					<div class="zen-soul-kitchen__category-header" style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid #eee; padding-bottom: 10px;">
						<h3 style="
							margin: 0;
							color: <?php echo esc_attr( $category_styles['titleColor'] ?? '' ); ?>;
							font-size: <?php echo esc_attr( $category_styles['titleFontSize'] ?? '' ); ?>;
							font-weight: <?php echo esc_attr( $category_styles['titleFontWeight'] ?? '700' ); ?>;
						">
							<?php echo esc_html( $group['name'] ); ?>
						</h3>
						<span style="
							color: <?php echo esc_attr( $category_styles['priceColor'] ?? '' ); ?>;
							font-size: <?php echo esc_attr( $category_styles['priceFontSize'] ?? '' ); ?>;
						">
							<?php echo esc_html( $category_meta[ $cat_id ]['priceText'] ?? '' ); ?>
						</span>
					</div>

					<?php if ( ! empty( $category_meta[ $cat_id ]['description'] ) ) : ?>
						<p class="zen-soul-kitchen__category-description" style="
							margin-top: 10px;
							color: <?php echo esc_attr( $category_styles['descColor'] ?? '' ); ?>;
							font-size: <?php echo esc_attr( $category_styles['descFontSize'] ?? '' ); ?>;
						">
							<?php echo esc_html( $category_meta[ $cat_id ]['description'] ); ?>
						</p>
					<?php endif; ?>

					<div class="zen-soul-kitchen__products" style="margin-top: 20px;">
						<?php foreach ( $group['products'] as $product ) : ?>
							<article class="zen-soul-kitchen__product" style="margin-bottom: 20px;">
								<h4 style="
									margin: 0;
									color: <?php echo esc_attr( $product_styles['nameColor'] ?? '' ); ?>;
									font-size: <?php echo esc_attr( $product_styles['nameFontSize'] ?? '' ); ?>;
									font-weight: <?php echo esc_attr( $product_styles['nameFontWeight'] ?? '700' ); ?>;
								">
									<?php echo esc_html( $product['title'] ); ?>
								</h4>

								<?php if ( ! empty( $product['short_description'] ) ) : ?>
									<div class="zen-soul-kitchen__product-description" style="
										margin-top: 5px;
										color: <?php echo esc_attr( $product_styles['descColor'] ?? '' ); ?>;
										font-size: <?php echo esc_attr( $product_styles['descFontSize'] ?? '' ); ?>;
									">
										<?php echo wp_kses_post( $product['short_description'] ); ?>
									</div>
								<?php endif; ?>

								<div class="zen-soul-kitchen__product-meta" style="
									margin-top: 5px;
									color: <?php echo esc_attr( $product_styles['metaColor'] ?? '' ); ?>;
									font-size: <?php echo esc_attr( $product_styles['metaFontSize'] ?? '' ); ?>;
								">
									<?php
									$price = wp_strip_all_tags( $product['price_html'] );
									if ( $price ) :
										?>
										<span><?php echo esc_html( $price ); ?></span>
									<?php endif; ?>
								</div>
							</article>
						<?php endforeach; ?>
					</div>
				</section>
			<?php endforeach; ?>
		<?php else : ?>
			<p><?php esc_html_e( 'No products found for this filter.', 'zenctuary' ); ?></p>
		<?php endif; ?>
	</div>
</div>
<?php
wp_reset_postdata();
