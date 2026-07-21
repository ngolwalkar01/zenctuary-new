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

function zenctuary_should_replace_product_permalink(): bool {
	if ( is_admin() || wp_doing_ajax() ) {
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