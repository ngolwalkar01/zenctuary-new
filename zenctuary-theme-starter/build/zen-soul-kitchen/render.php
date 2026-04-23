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

// Determine all tag IDs for fetching
$all_selected_tag_ids = array_map( function( $t ) {
	return $t['id'];
}, $selected_tags );

// Determine current tag to show initially
$current_tag_id = $active_tag_id;
if ( ! $current_tag_id && ! empty( $selected_tags ) ) {
	$current_tag_id = $selected_tags[0]['id'];
}

$products_query = [];
if ( ! empty( $all_selected_tag_ids ) ) {
	$args = [
		'post_type'      => 'product',
		'posts_per_page' => -1,
		'post_status'    => 'publish',
		'tax_query'      => [
			[
				'taxonomy' => 'product_tag',
				'field'    => 'term_id',
				'terms'    => $all_selected_tag_ids,
				'operator' => 'IN',
			],
		],
	];
	$query          = new WP_Query( $args );
	$products_query = $query->posts;
}

// Group products by category and record their tags
$grouped_data = [];
if ( ! empty( $products_query ) ) {
	foreach ( $products_query as $product_post ) {
		$product_id = $product_post->ID;
		$cats       = get_the_terms( $product_id, 'product_cat' );
		$tags       = get_the_terms( $product_id, 'product_tag' );
		
		$product_tag_ids = [];
		if ( $tags && ! is_wp_error( $tags ) ) {
			foreach ( $tags as $t ) {
				$product_tag_ids[] = $t->term_id;
			}
		}

		if ( $cats && ! is_wp_error( $cats ) ) {
			foreach ( $cats as $cat ) {
				if ( ! isset( $grouped_data[ $cat->term_id ] ) ) {
					$grouped_data[ $cat->term_id ] = [
						'id'          => $cat->term_id,
						'name'        => $cat->name,
						'description' => term_description( $cat->term_id, 'product_cat' ),
						'products'    => [],
					];
				}
				
				if ( function_exists( 'wc_get_product' ) ) {
					$product_obj = wc_get_product( $product_id );
					if ( $product_obj ) {
						// Description Priority: Short -> Full
						$short_desc = $product_obj->get_short_description();
						$display_desc = ! empty( $short_desc ) ? $short_desc : $product_obj->get_description();

						// Metadata (Attributes)
						$attributes_list = [];
						foreach ( $product_obj->get_attributes() as $attribute ) {
							if ( $attribute->get_visible() ) {
								$options = $attribute->get_options();
								if ( $attribute->is_taxonomy() ) {
									$values = array_map( function( $id ) use ( $attribute ) {
										$term = get_term( $id, $attribute->get_name() );
										return $term ? $term->name : '';
									}, $options );
									$attributes_list[] = implode( ', ', array_filter( $values ) );
								} else {
									$attributes_list[] = implode( ', ', $options );
								}
							}
						}
						$attr_string = implode( ' / ', array_filter( $attributes_list ) );

						$grouped_data[ $cat->term_id ]['products'][] = [
							'id'                => $product_id,
							'title'             => get_the_title( $product_id ),
							'display_description' => $display_desc,
							'price_html'        => $product_obj->get_price_html(),
							'attribute_string'  => $attr_string,
							'tag_ids'           => $product_tag_ids,
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

$wrapper_attributes = get_block_wrapper_attributes( [ 'class' => 'zen-soul-kitchen' ] );
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
				<span 
					class="zen-soul-kitchen__filter-button <?php echo $is_active ? 'is-active' : ''; ?>" 
					data-tag-id="<?php echo esc_attr( $tag_data['id'] ); ?>"
					data-active-bg="<?php echo esc_attr( $active_styles['backgroundColor'] ?? '' ); ?>"
					data-active-color="<?php echo esc_attr( $active_styles['textColor'] ?? '' ); ?>"
					data-active-border="<?php echo esc_attr( $active_styles['borderColor'] ?? '' ); ?>"
					data-inactive-bg="<?php echo esc_attr( $inactive_styles['backgroundColor'] ?? '' ); ?>"
					data-inactive-color="<?php echo esc_attr( $inactive_styles['textColor'] ?? '' ); ?>"
					data-inactive-border="<?php echo esc_attr( $inactive_styles['borderColor'] ?? '' ); ?>"
					style="
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
					"
				>
					<?php echo esc_html( $tag_data['label'] ?? '' ); ?>
				</span>
			<?php endforeach; ?>
		</div>
	<?php endif; ?>

	<div class="zen-soul-kitchen__menu-content" style="margin-top: 40px;">
		<?php if ( ! empty( $grouped_data ) ) : ?>
			<?php foreach ( $grouped_data as $cat_id => $group ) : 
				// Check if this category has ANY product matching the current tag
				$has_initial_products = false;
				foreach ( $group['products'] as $p ) {
					if ( in_array( (int) $current_tag_id, $p['tag_ids'] ) ) {
						$has_initial_products = true;
						break;
					}
				}
			?>
				<section 
					class="zen-soul-kitchen__category" 
					data-category-id="<?php echo esc_attr( $cat_id ); ?>"
					style="margin-bottom: 40px; display: <?php echo $has_initial_products ? 'block' : 'none'; ?>;"
				>
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

					<?php 
					// Row 2: Category Description (Priority: Manual Override -> Taxonomy Description)
					$cat_desc = ! empty( $category_meta[ $cat_id ]['description'] ) ? $category_meta[ $cat_id ]['description'] : $group['description'];
					if ( ! empty( $cat_desc ) ) : 
					?>
						<div class="zen-soul-kitchen__category-description" style="
							margin-top: 10px;
							color: <?php echo esc_attr( $category_styles['descColor'] ?? '' ); ?>;
							font-size: <?php echo esc_attr( $category_styles['descFontSize'] ?? '' ); ?>;
							font-weight: <?php echo esc_attr( $category_styles['descFontWeight'] ?? '400' ); ?>;
						">
							<?php echo wp_kses_post( $cat_desc ); ?>
						</div>
					<?php endif; ?>

					<div class="zen-soul-kitchen__products" style="margin-top: 20px;">
						<?php foreach ( $group['products'] as $product ) : 
							$is_visible = in_array( (int) $current_tag_id, $product['tag_ids'] );
						?>
							<article 
								class="zen-soul-kitchen__product" 
								data-tags="<?php echo esc_attr( implode( ',', $product['tag_ids'] ) ); ?>"
								style="margin-bottom: 20px; display: <?php echo $is_visible ? 'block' : 'none'; ?>;"
							>
								{ /* ROW 3: PRODUCT NAME */ }
								<h4 style="
									margin: 0;
									color: <?php echo esc_attr( $product_styles['nameColor'] ?? '' ); ?>;
									font-size: <?php echo esc_attr( $product_styles['nameFontSize'] ?? '' ); ?>;
									font-weight: <?php echo esc_attr( $product_styles['nameFontWeight'] ?? '700' ); ?>;
								">
									<?php echo esc_html( $product['title'] ); ?>
								</h4>

								{ /* ROW 4: PRODUCT DESCRIPTION */ }
								<?php if ( ! empty( $product['display_description'] ) ) : ?>
									<div class="zen-soul-kitchen__product-description" style="
										margin-top: 5px;
										color: <?php echo esc_attr( $product_styles['descColor'] ?? '' ); ?>;
										font-size: <?php echo esc_attr( $product_styles['descFontSize'] ?? '' ); ?>;
									">
										<?php echo wp_kses_post( $product['display_description'] ); ?>
									</div>
								<?php endif; ?>

								{ /* ROW 5: ATTRIBUTE + PRICE ROW */ }
								<?php 
								$price_label = wp_strip_all_tags( $product['price_html'] );
								$attr_label  = $product['attribute_string'];
								$meta_parts  = array_filter( [ $attr_label, $price_label ] );
								$meta_string = implode( ' / ', $meta_parts );

								if ( ! empty( $meta_parts ) ) :
								?>
									<div class="zen-soul-kitchen__product-meta" style="
										margin-top: 5px;
										color: <?php echo esc_attr( $product_styles['metaColor'] ?? '' ); ?>;
										font-size: <?php echo esc_attr( $product_styles['metaFontSize'] ?? '' ); ?>;
									">
										<span><?php echo esc_html( $meta_string ); ?></span>
									</div>
								<?php endif; ?>
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
