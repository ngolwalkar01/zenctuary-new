<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'wp_enqueue_scripts', 'zenctuary_enqueue_account_assets' );
function zenctuary_enqueue_account_assets(): void {
	if ( ! function_exists( 'is_account_page' ) || ! is_account_page() ) {
		return;
	}

	wp_enqueue_style(
		'zenctuary-account',
		ZENCTUARY_THEME_URI . '/assets/css/account.css',
		array( 'zenctuary-utilities' ),
		ZENCTUARY_THEME_VERSION
	);

	wp_enqueue_script(
		'zenctuary-account',
		ZENCTUARY_THEME_URI . '/assets/js/account.js',
		array(),
		ZENCTUARY_THEME_VERSION,
		true
	);

	wp_localize_script(
		'zenctuary-account',
		'zenctuaryAccountData',
		array(
			'fallbackUrl' => home_url( '/' ),
		)
	);
}

add_action( 'admin_enqueue_scripts', 'zenctuary_enqueue_account_admin_assets' );
function zenctuary_enqueue_account_admin_assets( string $hook ): void {
	if ( 'appearance_page_zenctuary-account-nav' !== $hook ) {
		return;
	}

	wp_enqueue_media();
	wp_enqueue_style(
		'zenctuary-account-admin',
		ZENCTUARY_THEME_URI . '/assets/css/account-admin.css',
		array(),
		ZENCTUARY_THEME_VERSION
	);
	wp_enqueue_script(
		'zenctuary-account-admin',
		ZENCTUARY_THEME_URI . '/assets/js/account-admin.js',
		array( 'jquery' ),
		ZENCTUARY_THEME_VERSION,
		true
	);
}

add_filter( 'body_class', 'zenctuary_account_body_class' );
function zenctuary_account_body_class( array $classes ): array {
	if ( function_exists( 'is_account_page' ) && is_account_page() ) {
		$classes[] = 'zen-account-page-active';
	}

	return $classes;
}

add_action( 'admin_menu', 'zenctuary_register_account_nav_admin_page' );
function zenctuary_register_account_nav_admin_page(): void {
	add_theme_page(
		__( 'Account Navigation', 'zenctuary' ),
		__( 'Account Navigation', 'zenctuary' ),
		'manage_options',
		'zenctuary-account-nav',
		'zenctuary_render_account_nav_admin_page'
	);
}

add_action( 'admin_init', 'zenctuary_register_account_nav_settings' );
function zenctuary_register_account_nav_settings(): void {
	register_setting(
		'zenctuary_account_nav',
		'zenctuary_account_nav_icons',
		array(
			'type'              => 'array',
			'sanitize_callback' => 'zenctuary_sanitize_account_nav_icons',
			'default'           => array(),
		)
	);
}

function zenctuary_sanitize_account_nav_icons( $value ): array {
	$value = is_array( $value ) ? $value : array();
	$keys  = array( 'edit-account', 'payment-methods', 'orders', 'wallet', 'customer-logout' );
	$clean = array();

	foreach ( $keys as $key ) {
		$clean[ $key ] = isset( $value[ $key ] ) ? absint( $value[ $key ] ) : 0;
	}

	return $clean;
}

function zenctuary_render_account_nav_admin_page(): void {
	$icons = get_option( 'zenctuary_account_nav_icons', array() );
	$items = array(
		'edit-account'    => __( 'Personal Information', 'zenctuary' ),
		'payment-methods' => __( 'Payment Methods', 'zenctuary' ),
		'orders'          => __( 'Bookings', 'zenctuary' ),
		'wallet'          => __( 'Wallet', 'zenctuary' ),
		'customer-logout' => __( 'Logout', 'zenctuary' ),
	);
	?>
	<div class="wrap zen-account-admin">
		<h1><?php esc_html_e( 'Account Navigation Icons', 'zenctuary' ); ?></h1>
		<form method="post" action="options.php">
			<?php settings_fields( 'zenctuary_account_nav' ); ?>
			<table class="form-table" role="presentation">
				<tbody>
				<?php foreach ( $items as $key => $label ) : ?>
					<?php
					$attachment_id = isset( $icons[ $key ] ) ? absint( $icons[ $key ] ) : 0;
					$image_url     = $attachment_id ? wp_get_attachment_image_url( $attachment_id, 'thumbnail' ) : '';
					?>
					<tr>
						<th scope="row"><?php echo esc_html( $label ); ?></th>
						<td>
							<div class="zen-account-admin__media-row" data-target="zenctuary-account-nav-icon-<?php echo esc_attr( $key ); ?>">
								<div class="zen-account-admin__preview<?php echo $image_url ? '' : ' is-empty'; ?>">
									<?php if ( $image_url ) : ?>
										<img src="<?php echo esc_url( $image_url ); ?>" alt="">
									<?php else : ?>
										<span><?php esc_html_e( 'No icon selected', 'zenctuary' ); ?></span>
									<?php endif; ?>
								</div>
								<input type="hidden" id="zenctuary-account-nav-icon-<?php echo esc_attr( $key ); ?>" name="zenctuary_account_nav_icons[<?php echo esc_attr( $key ); ?>]" value="<?php echo esc_attr( $attachment_id ); ?>">
								<button type="button" class="button zen-account-admin__select"><?php esc_html_e( 'Select icon', 'zenctuary' ); ?></button>
								<button type="button" class="button zen-account-admin__remove"><?php esc_html_e( 'Remove', 'zenctuary' ); ?></button>
							</div>
						</td>
					</tr>
				<?php endforeach; ?>
				</tbody>
			</table>
			<?php submit_button(); ?>
		</form>
	</div>
	<?php
}

function zenctuary_find_wallet_menu_key( array $items ): string {
	foreach ( array_keys( $items ) as $key ) {
		if ( false !== strpos( $key, 'wallet' ) ) {
			return (string) $key;
		}
	}

	return '';
}

add_filter( 'woocommerce_account_menu_items', 'zenctuary_customize_account_menu_items', 20 );
function zenctuary_customize_account_menu_items( array $items ): array {
	$wallet_key = zenctuary_find_wallet_menu_key( $items );
	$labels = array(
		'edit-account'    => __( 'Personal information', 'zenctuary' ),
		'payment-methods' => __( 'Payment methods', 'zenctuary' ),
		'orders'          => __( 'Bookings', 'zenctuary' ),
		'customer-logout' => __( 'Log-Out', 'zenctuary' ),
	);

	if ( $wallet_key ) {
		$labels[ $wallet_key ] = __( 'Wallet', 'zenctuary' );
	}

	foreach ( $labels as $key => $label ) {
		if ( isset( $items[ $key ] ) ) {
			$items[ $key ] = $label;
		}
	}

	unset( $items['downloads'], $items['edit-address'], $items['dashboard'], $items['subscriptions'] );

	$order = array( 'edit-account', 'payment-methods', 'orders' );

	if ( $wallet_key ) {
		$order[] = $wallet_key;
	}

	$order[]   = 'customer-logout';
	$ordered  = array();

	foreach ( $order as $key ) {
		if ( isset( $items[ $key ] ) ) {
			$ordered[ $key ] = $items[ $key ];
		}
		unset( $items[ $key ] );
	}

	return $ordered;
}

function zenctuary_get_account_avatar_url( int $user_id ): string {
	$avatar_id = (int) get_user_meta( $user_id, 'zen_account_avatar_id', true );

	if ( $avatar_id ) {
		$image = wp_get_attachment_image_url( $avatar_id, 'thumbnail' );

		if ( $image ) {
			return $image;
		}
	}

	$avatar = get_avatar_url(
		$user_id,
		array(
			'size' => 120,
		)
	);

	return $avatar ? $avatar : '';
}

function zenctuary_get_account_svg_icon( string $icon ): string {
	$icons = array(
		'back' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.5 4.5 8 12l7.5 7.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>',
		'chevron' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>',
		'profile' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.2 0-7 2.1-7 4.1V20h14v-1.9c0-2-2.8-4.1-7-4.1Z" fill="currentColor"/></svg>',
		'payment' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm0 3v2h16V9Z" fill="currentColor"/></svg>',
		'orders' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12l1 2h2v2h-1l-1.2 8.1A2 2 0 0 1 16.8 17H9.2a2 2 0 0 1-2-1.9L6 7H4V5h2Zm4 14a2 2 0 1 0 2 2 2 2 0 0 0-2-2Zm7 0a2 2 0 1 0 2 2 2 2 0 0 0-2-2Z" fill="currentColor"/></svg>',
		'downloads' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 4h2v8h3l-4 4-4-4h3Zm-6 12h14v4H5Z" fill="currentColor"/></svg>',
		'address' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 4.8 7 13 7 13s7-8.2 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 14.5 9 2.5 2.5 0 0 1 12 11.5Z" fill="currentColor"/></svg>',
		'overview' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h7v7H4Zm9 0h7v5h-7ZM4 13h5v7H4Zm7 0h9v7h-9Z" fill="currentColor"/></svg>',
		'logout' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5v-2H6V6h4Zm7.6 3.4L16.2 8.8 18.4 11H9v2h9.4l-2.2 2.2 1.4 1.4 4.6-4.6Z" fill="currentColor"/></svg>',
	);

	return $icons[ $icon ] ?? $icons['chevron'];
}

function zenctuary_get_account_nav_icon( string $endpoint ): string {
	$custom_icons = get_option( 'zenctuary_account_nav_icons', array() );
	$attachment_id = isset( $custom_icons[ $endpoint ] ) ? absint( $custom_icons[ $endpoint ] ) : 0;

	if ( ! $attachment_id && false !== strpos( $endpoint, 'wallet' ) && isset( $custom_icons['wallet'] ) ) {
		$attachment_id = absint( $custom_icons['wallet'] );
	}

	if ( $attachment_id ) {
		$image = wp_get_attachment_image(
			$attachment_id,
			'thumbnail',
			false,
			array(
				'class'        => 'zen-account-nav__custom-icon-image',
				'loading'      => 'lazy',
				'decoding'     => 'async',
				'aria-hidden'  => 'true',
				'alt'          => '',
			)
		);

		if ( $image ) {
			return $image;
		}
	}

	$map = array(
		'edit-account'    => 'profile',
		'payment-methods' => 'payment',
		'orders'          => 'orders',
		'customer-logout' => 'logout',
	);

	if ( false !== strpos( $endpoint, 'wallet' ) ) {
		return zenctuary_get_account_svg_icon( 'payment' );
	}

	return zenctuary_get_account_svg_icon( $map[ $endpoint ] ?? 'chevron' );
}

add_action( 'woocommerce_save_account_details', 'zenctuary_save_custom_account_fields', 20 );
function zenctuary_save_custom_account_fields( int $user_id ): void {
	if ( ! isset( $_POST['save-account-details-nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['save-account-details-nonce'] ) ), 'save_account_details' ) ) {
		return;
	}

	$gender = isset( $_POST['account_gender'] ) ? sanitize_text_field( wp_unslash( $_POST['account_gender'] ) ) : '';
	$phone  = isset( $_POST['billing_phone'] ) ? sanitize_text_field( wp_unslash( $_POST['billing_phone'] ) ) : '';
	$line_1 = isset( $_POST['billing_address_1'] ) ? sanitize_text_field( wp_unslash( $_POST['billing_address_1'] ) ) : '';
	$line_2 = isset( $_POST['billing_address_2'] ) ? sanitize_text_field( wp_unslash( $_POST['billing_address_2'] ) ) : '';

	update_user_meta( $user_id, 'billing_phone', $phone );
	update_user_meta( $user_id, 'billing_address_1', $line_1 );
	update_user_meta( $user_id, 'billing_address_2', $line_2 );

	$allowed_genders = array( 'male', 'female', 'non-binary', 'transgender', 'prefer-not-to-say' );
	update_user_meta( $user_id, 'account_gender', in_array( $gender, $allowed_genders, true ) ? $gender : '' );

	if ( ! empty( $_POST['zen_account_avatar_remove'] ) ) {
		delete_user_meta( $user_id, 'zen_account_avatar_id' );
	}

	if ( empty( $_FILES['zen_account_avatar']['name'] ) ) {
		return;
	}

	require_once ABSPATH . 'wp-admin/includes/file.php';
	require_once ABSPATH . 'wp-admin/includes/image.php';
	require_once ABSPATH . 'wp-admin/includes/media.php';

	$avatar_id = media_handle_upload( 'zen_account_avatar', 0 );

	if ( is_wp_error( $avatar_id ) ) {
		wc_add_notice( $avatar_id->get_error_message(), 'error' );
		return;
	}

	update_user_meta( $user_id, 'zen_account_avatar_id', (int) $avatar_id );
}
