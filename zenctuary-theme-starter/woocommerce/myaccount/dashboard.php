<?php
/**
 * My Account Dashboard Override
 *
 * Keeps "Hello {user} (not {user}? Log out)" while removing the dashboard description text.
 *
 * @package Zenctuary
 */

defined( 'ABSPATH' ) || exit;

/**
 * My Account dashboard.
 *
 * @since 2.6.0
 */
?>

<p>
	<?php
	/* translators: 1: user display name 2: logout url */
	echo wp_kses_post( sprintf( __( 'Hello %1$s (not %1$s? <a href="%2$s">Log out</a>)', 'woocommerce' ), '<strong>' . esc_html( $current_user->display_name ) . '</strong>', esc_url( wc_logout_url() ) ) );
	?>
</p>

<?php
	/**
	 * My Account dashboard.
	 *
	 * @since 2.6.0
	 */
	do_action( 'woocommerce_account_dashboard' );

	/**
	 * Deprecated woocommerce_before_my_account action.
	 *
	 * @deprecated 2.6.0
	 */
	do_action( 'woocommerce_before_my_account' );

	/**
	 * Deprecated woocommerce_after_my_account action.
	 *
	 * @deprecated 2.6.0
	 */
	do_action( 'woocommerce_after_my_account' );
