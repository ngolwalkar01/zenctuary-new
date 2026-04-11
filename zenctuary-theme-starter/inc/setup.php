<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
add_action( 'after_setup_theme', 'zenctuary_theme_setup' );
function zenctuary_theme_setup(): void {
	load_theme_textdomain( 'zenctuary', get_template_directory() . '/languages' );
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'editor-styles' );
	add_editor_style( 'assets/css/editor.css' );
	add_theme_support( 'wp-block-styles' );
	add_theme_support( 'responsive-embeds' );
	add_theme_support( 'custom-logo' );
	add_theme_support( 'woocommerce' );

	register_nav_menus(
		array(
			'primary' => __( 'Primary Navigation', 'zenctuary' ),
			'footer'  => __( 'Footer Navigation', 'zenctuary' ),
		)
	);
}

/**
 * Register Custom Gutenberg Blocks
 */
add_action( 'init', 'zenctuary_register_custom_blocks' );
function zenctuary_register_custom_blocks() {
	$block_manifests = glob( get_template_directory() . '/build/*/block.json' );

	if ( empty( $block_manifests ) ) {
		return;
	}

	foreach ( $block_manifests as $block_manifest ) {
		register_block_type( dirname( $block_manifest ) );
	}
}
