<?php
/**
 * My Account page shell override.
 *
 * @package Zenctuary
 */

defined( 'ABSPATH' ) || exit;

$current_user     = wp_get_current_user();
$avatar_url       = zenctuary_get_account_avatar_url( get_current_user_id() );
$current_endpoint = '';
$account_url      = function_exists( 'wc_get_page_permalink' ) ? wc_get_page_permalink( 'myaccount' ) : home_url( '/my-account/' );

if ( function_exists( 'WC' ) && WC()->query && method_exists( WC()->query, 'get_current_endpoint' ) ) {
	$current_endpoint = (string) WC()->query->get_current_endpoint();
}

if ( '' === $current_endpoint ) {
	foreach ( array_keys( wc_get_account_menu_items() ) as $endpoint ) {
		if ( isset( $GLOBALS['wp']->query_vars[ $endpoint ] ) ) {
			$current_endpoint = (string) $endpoint;
			break;
		}
	}
}

$has_endpoint  = '' !== $current_endpoint && 'dashboard' !== $current_endpoint;
$shell_classes = 'zen-account-shell' . ( $has_endpoint ? ' zen-account-shell--endpoint' : ' zen-account-shell--menu' );
?>

<section class="<?php echo esc_attr( $shell_classes ); ?>">
	<div class="zen-account-shell__inner">
		<div class="zen-account-shell__panel">
			<aside class="zen-account-shell__sidebar">
				<div class="zen-account-shell__profile">
					<div class="zen-account-shell__avatar-wrap">
						<?php if ( $avatar_url ) : ?>
							<img class="zen-account-shell__avatar" src="<?php echo esc_url( $avatar_url ); ?>" alt="<?php echo esc_attr( $current_user->display_name ); ?>">
						<?php else : ?>
							<div class="zen-account-shell__avatar zen-account-shell__avatar--placeholder" aria-hidden="true"><?php echo wp_kses_post( zenctuary_get_account_svg_icon( 'profile' ) ); ?></div>
						<?php endif; ?>
					</div>
					<div class="zen-account-shell__profile-text">
						<strong class="zen-account-shell__profile-name"><?php echo esc_html( $current_user->display_name ); ?></strong>
						<span class="zen-account-shell__profile-email"><?php echo esc_html( $current_user->user_email ); ?></span>
					</div>
				</div>

				<nav class="zen-account-shell__nav" aria-label="<?php esc_attr_e( 'Account navigation', 'zenctuary' ); ?>">
					<?php do_action( 'woocommerce_account_navigation' ); ?>
				</nav>
			</aside>

			<div class="zen-account-shell__content">
				<a class="zen-account-shell__mobile-menu-link" href="<?php echo esc_url( $account_url ); ?>">
					<span aria-hidden="true"><?php echo wp_kses_post( zenctuary_get_account_svg_icon( 'back' ) ); ?></span>
					<?php esc_html_e( 'Back to account menu', 'zenctuary' ); ?>
				</a>
				<div class="zen-account-shell__content-scroll">
					<?php do_action( 'woocommerce_account_content' ); ?>
				</div>
			</div>
		</div>
	</div>
</section>
