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

add_filter( 'body_class', 'zenctuary_account_body_class' );
function zenctuary_account_body_class( array $classes ): array {
	if ( function_exists( 'is_account_page' ) && is_account_page() ) {
		$classes[] = 'zen-account-page-active';
	}

	return $classes;
}

add_filter( 'woocommerce_account_menu_items', 'zenctuary_customize_account_menu_items', 20 );
function zenctuary_customize_account_menu_items( array $items ): array {
	$labels = array(
		'edit-account'    => __( 'Personal information', 'zenctuary' ),
		'payment-methods' => __( 'Payment methods', 'zenctuary' ),
		'orders'          => __( 'Orders', 'zenctuary' ),
		'downloads'       => __( 'Downloads', 'zenctuary' ),
		'edit-address'    => __( 'Addresses', 'zenctuary' ),
		'dashboard'       => __( 'Overview', 'zenctuary' ),
		'customer-logout' => __( 'Log-Out', 'zenctuary' ),
	);

	foreach ( $labels as $key => $label ) {
		if ( isset( $items[ $key ] ) ) {
			$items[ $key ] = $label;
		}
	}

	$order    = array( 'edit-account', 'payment-methods', 'orders', 'downloads', 'edit-address', 'dashboard', 'customer-logout' );
	$ordered  = array();

	foreach ( $order as $key ) {
		if ( isset( $items[ $key ] ) ) {
			$ordered[ $key ] = $items[ $key ];
			unset( $items[ $key ] );
		}
	}

	return array_merge( $ordered, $items );
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
	$map = array(
		'edit-account'    => 'profile',
		'payment-methods' => 'payment',
		'orders'          => 'orders',
		'downloads'       => 'downloads',
		'edit-address'    => 'address',
		'dashboard'       => 'overview',
		'customer-logout' => 'logout',
	);

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
