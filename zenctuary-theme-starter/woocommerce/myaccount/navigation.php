<?php
/**
 * Account navigation override.
 *
 * @package Zenctuary
 */

defined( 'ABSPATH' ) || exit;
?>

<ul class="zen-account-nav">
	<?php foreach ( wc_get_account_menu_items() as $endpoint => $label ) : ?>
		<li class="<?php echo esc_attr( wc_get_account_menu_item_classes( $endpoint ) . ( 'customer-logout' === $endpoint ? ' zen-account-nav__item--logout' : '' ) ); ?>">
			<a href="<?php echo esc_url( wc_get_account_endpoint_url( $endpoint ) ); ?>" <?php echo wc_is_current_account_menu_item( $endpoint ) ? 'aria-current="page"' : ''; ?>>
				<span class="zen-account-nav__icon" aria-hidden="true"><?php echo wp_kses_post( zenctuary_get_account_nav_icon( $endpoint ) ); ?></span>
				<span class="zen-account-nav__label"><?php echo esc_html( $label ); ?></span>
				<span class="zen-account-nav__chevron" aria-hidden="true"><?php echo wp_kses_post( zenctuary_get_account_svg_icon( 'chevron' ) ); ?></span>
			</a>
		</li>
	<?php endforeach; ?>
</ul>
