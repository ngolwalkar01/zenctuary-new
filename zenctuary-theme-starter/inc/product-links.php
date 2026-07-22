<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const ZENCTUARY_PRODUCT_LINK_TARGET_PAGE_OPTION = 'zenctuary_product_link_target_page_id';

add_action( 'admin_menu', 'zenctuary_register_product_links_admin_page' );
function zenctuary_register_product_links_admin_page(): void {
	add_theme_page(
		__( 'Product Links', 'zenctuary' ),
		__( 'Product Links', 'zenctuary' ),
		'manage_options',
		'zenctuary-product-links',
		'zenctuary_render_product_links_admin_page'
	);
}

add_action( 'admin_init', 'zenctuary_register_product_links_settings' );
function zenctuary_register_product_links_settings(): void {
	register_setting(
		'zenctuary_product_links',
		ZENCTUARY_PRODUCT_LINK_TARGET_PAGE_OPTION,
		array(
			'type'              => 'integer',
			'sanitize_callback' => 'absint',
			'default'           => 0,
		)
	);
}

function zenctuary_render_product_links_admin_page(): void {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	$target_page_id = zenctuary_get_product_link_target_page_id();
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'Product Links', 'zenctuary' ); ?></h1>
		<p><?php esc_html_e( 'Choose where front-end WooCommerce product detail links should point. This replaces product URLs before they render, so visitors do not pass through the product detail page.', 'zenctuary' ); ?></p>

		<form method="post" action="options.php">
			<?php settings_fields( 'zenctuary_product_links' ); ?>

			<table class="form-table" role="presentation">
				<tbody>
					<tr>
						<th scope="row">
							<label for="zenctuary-product-link-target-page"><?php esc_html_e( 'Product link target page', 'zenctuary' ); ?></label>
						</th>
						<td>
							<?php
							wp_dropdown_pages(
								array(
									'name'              => ZENCTUARY_PRODUCT_LINK_TARGET_PAGE_OPTION,
									'id'                => 'zenctuary-product-link-target-page',
									'selected'          => $target_page_id,
									'show_option_none'  => __( 'Use default product detail links', 'zenctuary' ),
									'option_none_value' => '0',
								)
							);
							?>
							<p class="description">
								<?php esc_html_e( 'When selected, product card/buttons that use WooCommerce product permalinks will point to this page directly.', 'zenctuary' ); ?>
							</p>
						</td>
					</tr>
				</tbody>
			</table>

			<?php submit_button(); ?>
		</form>
	</div>
	<?php
}

function zenctuary_get_product_link_target_page_id(): int {
	$page_id = absint( get_option( ZENCTUARY_PRODUCT_LINK_TARGET_PAGE_OPTION, 0 ) );

	return $page_id > 0 && 'publish' === get_post_status( $page_id ) ? $page_id : 0;
}

function zenctuary_get_product_link_target_url(): string {
	$page_id = zenctuary_get_product_link_target_page_id();

	if ( ! $page_id ) {
		return '';
	}

	$url = get_permalink( $page_id );

	return $url ? (string) $url : '';
}

/**
 * Track purchase blocks whose product buttons must keep their native WooCommerce URLs.
 *
 * @param mixed      $pre_render   Pre-rendered content. Null means WordPress should render normally.
 * @param array      $parsed_block Parsed block data.
 * @param WP_Block|null $parent_block Parent block instance.
 * @return mixed
 */
function zenctuary_track_product_link_excluded_block_start( $pre_render, array $parsed_block, $parent_block = null ) {
	if ( null !== $pre_render ) {
		return $pre_render;
	}

	$block_name = isset( $parsed_block['blockName'] ) ? (string) $parsed_block['blockName'] : '';

	if ( zenctuary_is_product_link_excluded_block( $block_name ) ) {
		$GLOBALS['zenctuary_product_link_exclusion_depth'] = zenctuary_get_product_link_exclusion_depth() + 1;
	}

	return $pre_render;
}
add_filter( 'pre_render_block', 'zenctuary_track_product_link_excluded_block_start', PHP_INT_MAX, 3 );

/**
 * Stop tracking purchase block product-link exclusions after the block renders.
 *
 * @param string $block_content Rendered block content.
 * @param array  $parsed_block  Parsed block data.
 * @return string
 */
function zenctuary_track_product_link_excluded_block_end( string $block_content, array $parsed_block ): string {
	$block_name = isset( $parsed_block['blockName'] ) ? (string) $parsed_block['blockName'] : '';

	if ( zenctuary_is_product_link_excluded_block( $block_name ) ) {
		$GLOBALS['zenctuary_product_link_exclusion_depth'] = max( 0, zenctuary_get_product_link_exclusion_depth() - 1 );
	}

	return $block_content;
}
add_filter( 'render_block', 'zenctuary_track_product_link_excluded_block_end', 0, 2 );

/**
 * Check whether a block should keep native WooCommerce product links.
 *
 * @param string $block_name Block name.
 * @return bool
 */
function zenctuary_is_product_link_excluded_block( string $block_name ): bool {
	$excluded_blocks = apply_filters(
		'zenctuary_product_link_excluded_blocks',
		array(
			'zen-purchase-blocks/membership-plans',
			'zen-purchase-blocks/zencoin-packages',
			'zen-purchase-blocks/drop-ins',
		)
	);

	return in_array( $block_name, (array) $excluded_blocks, true );
}

/**
 * Get the current excluded block render depth.
 *
 * @return int
 */
function zenctuary_get_product_link_exclusion_depth(): int {
	return isset( $GLOBALS['zenctuary_product_link_exclusion_depth'] ) ? max( 0, (int) $GLOBALS['zenctuary_product_link_exclusion_depth'] ) : 0;
}

/**
 * Check whether the current render stack is inside an excluded purchase block.
 *
 * @return bool
 */
function zenctuary_is_rendering_product_link_excluded_block(): bool {
	return zenctuary_get_product_link_exclusion_depth() > 0;
}
function zenctuary_should_replace_product_permalink(): bool {
	if ( is_admin() || wp_doing_ajax() || zenctuary_is_rendering_product_link_excluded_block() ) {
		return false;
	}

	if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
		return false;
	}

	return true;
}

function zenctuary_replace_product_permalink( string $permalink ): string {
	if ( ! zenctuary_should_replace_product_permalink() ) {
		return $permalink;
	}

	$target_url = zenctuary_get_product_link_target_url();

	return '' !== $target_url ? $target_url : $permalink;
}

function zenctuary_filter_product_post_type_link( string $permalink, WP_Post $post ): string {
	if ( 'product' !== $post->post_type ) {
		return $permalink;
	}

	return zenctuary_replace_product_permalink( $permalink );
}
add_filter( 'post_type_link', 'zenctuary_filter_product_post_type_link', 20, 2 );

function zenctuary_filter_wc_product_permalink( string $permalink, $product ): string {
	return zenctuary_replace_product_permalink( $permalink );
}
add_filter( 'woocommerce_product_get_permalink', 'zenctuary_filter_wc_product_permalink', 20, 2 );

function zenctuary_filter_wc_loop_product_link( string $permalink ): string {
	return zenctuary_replace_product_permalink( $permalink );
}
add_filter( 'woocommerce_loop_product_link', 'zenctuary_filter_wc_loop_product_link', 20 );