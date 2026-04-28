<?php
/**
 * Edit account form override.
 *
 * @package Zenctuary
 */

defined( 'ABSPATH' ) || exit;

$user = wp_get_current_user();
$user_id       = get_current_user_id();
$avatar_url    = zenctuary_get_account_avatar_url( $user_id );
$billing_phone = get_user_meta( $user_id, 'billing_phone', true );
$address_line1 = get_user_meta( $user_id, 'billing_address_1', true );
$address_line2 = get_user_meta( $user_id, 'billing_address_2', true );
$gender        = get_user_meta( $user_id, 'account_gender', true );

$gender_options = array(
	''                  => __( 'Select gender', 'zenctuary' ),
	'male'              => __( 'Male', 'zenctuary' ),
	'female'            => __( 'Female', 'zenctuary' ),
	'non-binary'        => __( 'Non-binary', 'zenctuary' ),
	'transgender'       => __( 'Transgender', 'zenctuary' ),
	'prefer-not-to-say' => __( 'Prefer not to say', 'zenctuary' ),
);
?>

<form class="woocommerce-EditAccountForm edit-account zen-account-form" action="" method="post" <?php do_action( 'woocommerce_edit_account_form_tag' ); ?> enctype="multipart/form-data">
	<?php do_action( 'woocommerce_edit_account_form_start' ); ?>

	<header class="zen-account-form__header">
		<div>
			<p class="zen-account-form__eyebrow"><?php esc_html_e( 'My account', 'zenctuary' ); ?></p>
			<h1 class="zen-account-form__title"><?php esc_html_e( 'Edit Profile', 'zenctuary' ); ?></h1>
		</div>
	</header>

	<div class="zen-account-form__grid zen-account-form__grid--profile">
		<div class="zen-account-form__field zen-account-form__field--avatar">
			<label class="zen-account-form__label"><?php esc_html_e( 'Profile photo', 'zenctuary' ); ?></label>
			<div class="zen-account-form__avatar-group">
				<div class="zen-account-form__avatar-preview">
					<?php if ( $avatar_url ) : ?>
						<img src="<?php echo esc_url( $avatar_url ); ?>" alt="<?php echo esc_attr( $user->display_name ); ?>">
					<?php else : ?>
						<span aria-hidden="true"><?php echo wp_kses_post( zenctuary_get_account_svg_icon( 'profile' ) ); ?></span>
					<?php endif; ?>
				</div>
				<div class="zen-account-form__avatar-actions">
					<label class="zen-account-form__upload-button" for="zen-account-avatar">
						<span><?php esc_html_e( 'Edit Photo', 'zenctuary' ); ?></span>
					</label>
					<input id="zen-account-avatar" type="file" name="zen_account_avatar" accept="image/*">
					<?php if ( $avatar_url ) : ?>
						<label class="zen-account-form__checkbox">
							<input type="checkbox" name="zen_account_avatar_remove" value="1">
							<span><?php esc_html_e( 'Remove current photo', 'zenctuary' ); ?></span>
						</label>
					<?php endif; ?>
				</div>
			</div>
		</div>
	</div>

	<div class="zen-account-form__grid">
		<div class="zen-account-form__field">
			<label class="zen-account-form__label" for="account_first_name"><?php esc_html_e( 'First Name', 'zenctuary' ); ?></label>
			<input type="text" class="woocommerce-Input woocommerce-Input--text input-text" name="account_first_name" id="account_first_name" autocomplete="given-name" value="<?php echo esc_attr( $user->first_name ); ?>" />
		</div>

		<div class="zen-account-form__field">
			<label class="zen-account-form__label" for="account_last_name"><?php esc_html_e( 'Last Name', 'zenctuary' ); ?></label>
			<input type="text" class="woocommerce-Input woocommerce-Input--text input-text" name="account_last_name" id="account_last_name" autocomplete="family-name" value="<?php echo esc_attr( $user->last_name ); ?>" />
		</div>

		<div class="zen-account-form__field zen-account-form__field--full">
			<label class="zen-account-form__label" for="account_email"><?php esc_html_e( 'Email', 'zenctuary' ); ?></label>
			<input type="email" class="woocommerce-Input woocommerce-Input--email input-text" name="account_email" id="account_email" autocomplete="email" value="<?php echo esc_attr( $user->user_email ); ?>" />
		</div>

		<div class="zen-account-form__field">
			<label class="zen-account-form__label" for="billing_phone"><?php esc_html_e( 'Phone', 'zenctuary' ); ?></label>
			<input type="text" class="woocommerce-Input woocommerce-Input--text input-text" name="billing_phone" id="billing_phone" autocomplete="tel" value="<?php echo esc_attr( $billing_phone ); ?>" />
		</div>

		<div class="zen-account-form__field zen-account-form__field--address">
			<label class="zen-account-form__label" for="billing_address_1"><?php esc_html_e( 'Address', 'zenctuary' ); ?></label>
			<input type="text" class="woocommerce-Input woocommerce-Input--text input-text" name="billing_address_1" id="billing_address_1" autocomplete="address-line1" value="<?php echo esc_attr( $address_line1 ); ?>" />
		</div>

		<div class="zen-account-form__field zen-account-form__field--number">
			<label class="zen-account-form__label" for="billing_address_2"><?php esc_html_e( 'Number', 'zenctuary' ); ?></label>
			<input type="text" class="woocommerce-Input woocommerce-Input--text input-text" name="billing_address_2" id="billing_address_2" autocomplete="address-line2" value="<?php echo esc_attr( $address_line2 ); ?>" />
		</div>

		<div class="zen-account-form__field zen-account-form__field--full">
			<label class="zen-account-form__label" for="account_gender"><?php esc_html_e( 'Gender', 'zenctuary' ); ?></label>
			<select class="woocommerce-Input woocommerce-Input--select input-text" name="account_gender" id="account_gender">
				<?php foreach ( $gender_options as $value => $label ) : ?>
					<option value="<?php echo esc_attr( $value ); ?>" <?php selected( $gender, $value ); ?>><?php echo esc_html( $label ); ?></option>
				<?php endforeach; ?>
			</select>
		</div>
	</div>

	<div class="zen-account-form__password">
		<h2 class="zen-account-form__section-title"><?php esc_html_e( 'Change Password', 'zenctuary' ); ?></h2>
		<div class="zen-account-form__grid">
			<div class="zen-account-form__field zen-account-form__field--full">
				<label class="zen-account-form__label" for="password_current"><?php esc_html_e( 'Current password', 'zenctuary' ); ?></label>
				<input type="password" class="woocommerce-Input woocommerce-Input--password input-text" name="password_current" id="password_current" autocomplete="off" />
			</div>

			<div class="zen-account-form__field">
				<label class="zen-account-form__label" for="password_1"><?php esc_html_e( 'New password', 'zenctuary' ); ?></label>
				<input type="password" class="woocommerce-Input woocommerce-Input--password input-text" name="password_1" id="password_1" autocomplete="off" />
			</div>

			<div class="zen-account-form__field">
				<label class="zen-account-form__label" for="password_2"><?php esc_html_e( 'Confirm new password', 'zenctuary' ); ?></label>
				<input type="password" class="woocommerce-Input woocommerce-Input--password input-text" name="password_2" id="password_2" autocomplete="off" />
			</div>
		</div>
	</div>

	<p>
		<input type="hidden" name="account_display_name" value="<?php echo esc_attr( $user->display_name ); ?>" />
		<?php wp_nonce_field( 'save_account_details', 'save-account-details-nonce' ); ?>
		<button type="submit" class="woocommerce-Button button zen-account-form__submit" name="save_account_details" value="<?php esc_attr_e( 'Save changes', 'woocommerce' ); ?>"><?php esc_html_e( 'Save changes', 'woocommerce' ); ?></button>
		<input type="hidden" name="action" value="save_account_details" />
	</p>

	<?php do_action( 'woocommerce_edit_account_form' ); ?>
	<?php do_action( 'woocommerce_edit_account_form_end' ); ?>
</form>
