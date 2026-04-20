<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
add_action( 'wp_enqueue_scripts', 'zenctuary_enqueue_assets' );
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

	// Intl-Tel-Input (International Phone Support)
	wp_enqueue_style(
		'intl-tel-input',
		'https://cdn.jsdelivr.net/npm/intl-tel-input@23.0.10/build/css/intlTelInput.css',
		array(),
		'23.0.10'
	);

	wp_enqueue_script(
		'intl-tel-input',
		'https://cdn.jsdelivr.net/npm/intl-tel-input@23.0.10/build/js/intlTelInput.min.js',
		array(),
		'23.0.10',
		true
	);

	wp_enqueue_script(
		'zenctuary-theme',
		ZENCTUARY_THEME_URI . '/assets/js/theme.js',
		array(),
		ZENCTUARY_THEME_VERSION,
		true
	);

	wp_enqueue_script(
		'zenctuary-auth',
		ZENCTUARY_THEME_URI . '/assets/js/auth.js',
		array( 'intl-tel-input' ),
		ZENCTUARY_THEME_VERSION,
		true
	);

	$current_user = wp_get_current_user();
	wp_localize_script( 'zenctuary-auth', 'zenctuaryAuthData', array(
		'ajax_url'     => admin_url( 'admin-ajax.php' ),
		'nonce'        => wp_create_nonce( 'zenctuary_auth_nonce' ),
		'is_logged_in' => is_user_logged_in(),
		'user_data'    => is_user_logged_in() ? array(
			'display_name' => $current_user->display_name,
			'user_email'   => $current_user->user_email,
		) : null,
	) );
}
