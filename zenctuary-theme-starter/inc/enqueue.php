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
		array(),
		ZENCTUARY_THEME_VERSION,
		true
	);

	wp_localize_script( 'zenctuary-auth', 'zenctuaryAuthData', array(
		'ajax_url' => admin_url( 'admin-ajax.php' ),
		'nonce'    => wp_create_nonce( 'zenctuary_auth_nonce' ),
	) );
}
