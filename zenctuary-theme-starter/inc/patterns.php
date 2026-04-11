<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
add_action( 'init', 'zenctuary_register_pattern_category' );
function zenctuary_register_pattern_category(): void {
	if ( function_exists( 'register_block_pattern_category' ) ) {
		register_block_pattern_category(
			'zenctuary',
			array(
				'label' => __( 'Zenctuary', 'zenctuary' ),
			)
		);
	}
}
