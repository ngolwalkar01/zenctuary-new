<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
add_action( 'wp_enqueue_scripts', 'zenctuary_enqueue_assets' );
function zenctuary_get_my_account_url(): string {
	if ( function_exists( 'wc_get_page_permalink' ) ) {
		$my_account_url = wc_get_page_permalink( 'myaccount' );

		if ( $my_account_url ) {
			return $my_account_url;
		}
	}

	$page_id = (int) get_option( 'woocommerce_myaccount_page_id' );

	if ( $page_id ) {
		$permalink = get_permalink( $page_id );

		if ( $permalink ) {
			return $permalink;
		}
	}

	return admin_url( 'profile.php' );
}

function zenctuary_enqueue_assets(): void {
	wp_enqueue_style(
		'zenctuary-google-fonts',
		'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Montserrat:wght@500;600;700&display=swap',
		array(),
		null
	);

	wp_enqueue_style(
		'zenctuary-base',
		ZENCTUARY_THEME_URI . '/assets/css/base.css',
		array( 'zenctuary-google-fonts' ),
		ZENCTUARY_THEME_VERSION
	);

	wp_enqueue_style(
		'zenctuary-components',
		ZENCTUARY_THEME_URI . '/assets/css/components.css',
		array( 'zenctuary-base' ),
		ZENCTUARY_THEME_VERSION
	);

	wp_enqueue_style(
		'zenctuary-utilities',
		ZENCTUARY_THEME_URI . '/assets/css/utilities.css',
		array( 'zenctuary-components' ),
		ZENCTUARY_THEME_VERSION
	);

	wp_enqueue_style(
		'zenctuary-auth',
		ZENCTUARY_THEME_URI . '/assets/css/auth.css',
		array( 'zenctuary-utilities' ),
		ZENCTUARY_THEME_VERSION
	);

	wp_enqueue_script(
		'zenctuary-theme',
		ZENCTUARY_THEME_URI . '/assets/js/theme.js',
		array(),
		ZENCTUARY_THEME_VERSION,
		true
	);

	wp_localize_script( 'zenctuary-theme', 'zenctuaryThemeData', array(
		'cart_url'   => function_exists( 'wc_get_cart_url' ) ? wc_get_cart_url() : home_url( '/' ),
		'cart_count' => function_exists( 'WC' ) && WC()->cart ? WC()->cart->get_cart_contents_count() : 0,
		'i18n'       => array(
			'cart' => __( 'Cart', 'zenctuary' ),
		),
	) );

	wp_enqueue_script(
		'zenctuary-auth',
		ZENCTUARY_THEME_URI . '/assets/js/auth.js',
		array(),
		ZENCTUARY_THEME_VERSION,
		true
	);

	$current_user = wp_get_current_user();
	$countries    = array();
	$states       = array();
	$default_country = '';

	if ( function_exists( 'WC' ) && WC()->countries ) {
		$countries       = WC()->countries->get_countries();
		$states          = WC()->countries->get_states();
		$default_country = WC()->countries->get_base_country();
	}

	wp_localize_script( 'zenctuary-auth', 'zenctuaryAuthData', array(
		'ajax_url'     => admin_url( 'admin-ajax.php' ),
		'nonce'        => wp_create_nonce( 'zenctuary_auth_nonce' ),
		'is_logged_in' => is_user_logged_in(),
		'home_url'     => home_url( '/' ),
		'my_account_url' => zenctuary_get_my_account_url(),
		'intl_tel_input' => array(
			'style_url' => 'https://cdn.jsdelivr.net/npm/intl-tel-input@23.0.10/build/css/intlTelInput.css',
			'script_url' => 'https://cdn.jsdelivr.net/npm/intl-tel-input@23.0.10/build/js/intlTelInput.min.js',
			'utils_url' => 'https://cdn.jsdelivr.net/npm/intl-tel-input@23.0.10/build/js/utils.js',
		),
		'countries'    => $countries,
		'states'       => $states,
		'default_country' => $default_country,
		'user_data'    => is_user_logged_in() ? array(
			'display_name' => $current_user->display_name,
			'user_email'   => $current_user->user_email,
		) : null,
	) );
}
