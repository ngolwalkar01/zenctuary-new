<?php
/**
 * Zenctuary Theme Authentication Handlers
 *
 * This file handles AJAX-based login, registration, and logout using 
 * native WordPress and WooCommerce functions.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * AJAX Login Handler
 */
function zenctuary_ajax_login() {
	// Security check
    check_ajax_referer( 'zenctuary_auth_nonce', 'security' );

	$info = array();
	$info['user_login']    = isset( $_POST['username'] ) ? sanitize_user( $_POST['username'] ) : '';
	$info['user_password'] = isset( $_POST['password'] ) ? $_POST['password'] : '';
	$info['remember']      = isset( $_POST['remember'] ) ? filter_var( $_POST['remember'], FILTER_VALIDATE_BOOLEAN ) : false;

	if ( empty( $info['user_login'] ) || empty( $info['user_password'] ) ) {
		wp_send_json_error( array( 'message' => __( 'Please enter both username and password.', 'zenctuary' ) ) );
	}

	$user_signon = wp_signon( $info, is_ssl() );

	if ( is_wp_error( $user_signon ) ) {
		wp_send_json_error( array( 'message' => $user_signon->get_error_message() ) );
	} else {
		wp_send_json_success( array( 
            'message' => __( 'Login successful!', 'zenctuary' ),
            'user_id' => $user_signon->ID,
            'user_data' => array(
                'display_name' => $user_signon->display_name,
                'user_email'   => $user_signon->user_email,
            )
        ) );
	}

	wp_die();
}
add_action( 'wp_ajax_nopriv_zenctuary_login', 'zenctuary_ajax_login' );
add_action( 'wp_ajax_zenctuary_login', 'zenctuary_ajax_login' );

/**
 * AJAX Registration Handler
 */
function zenctuary_ajax_register() {
	// Security check
    check_ajax_referer( 'zenctuary_auth_nonce', 'security' );

    // Check if registration is enabled
    if ( ! get_option( 'users_can_register' ) ) {
        wp_send_json_error( array( 'message' => __( 'Registration is currently disabled.', 'zenctuary' ) ) );
    }

	$email    = isset( $_POST['email'] ) ? sanitize_email( $_POST['email'] ) : '';
	$password = isset( $_POST['password'] ) ? $_POST['password'] : '';
    $username = isset( $_POST['username'] ) ? sanitize_user( $_POST['username'] ) : '';

	if ( empty( $email ) ) {
		wp_send_json_error( array( 'message' => __( 'Please provide a valid email address.', 'zenctuary' ) ) );
	}

    if ( empty( $username ) ) {
        $username = $email;
    }

    // WooCommerce Check
    if ( class_exists( 'WooCommerce' ) ) {
        $customer_id = wc_create_new_customer( $email, $username, $password );

        if ( is_wp_error( $customer_id ) ) {
            wp_send_json_error( array( 'message' => $customer_id->get_error_message() ) );
        }

        // Log the user in after registration if successful
        wp_set_auth_cookie( $customer_id );
        
        $user = get_userdata( $customer_id );
        wp_send_json_success( array( 
            'message' => __( 'Registration successful!', 'zenctuary' ),
            'user_id' => $customer_id,
            'user_data' => array(
                'display_name' => $user->display_name,
                'user_email'   => $user->user_email,
            )
        ) );

    } else {
        // Fallback to WordPress native registration
        $user_id = wp_create_user( $username, $password, $email );

        if ( is_wp_error( $user_id ) ) {
            wp_send_json_error( array( 'message' => $user_id->get_error_message() ) );
        }

        // Log the user in after registration
        wp_set_auth_cookie( $user_id );

        $user = get_userdata( $user_id );
        wp_send_json_success( array( 
            'message' => __( 'Registration successful!', 'zenctuary' ),
            'user_id' => $user_id,
            'user_data' => array(
                'display_name' => $user->display_name,
                'user_email'   => $user->user_email,
            )
        ) );
    }

	wp_die();
}
add_action( 'wp_ajax_nopriv_zenctuary_register', 'zenctuary_ajax_register' );
add_action( 'wp_ajax_zenctuary_register', 'zenctuary_ajax_register' );

/**
 * AJAX Logout Handler
 */
function zenctuary_ajax_logout() {
	wp_logout();
	wp_send_json_success( array( 'message' => __( 'Logged out successfully.', 'zenctuary' ) ) );
	wp_die();
}
add_action( 'wp_ajax_zenctuary_logout', 'zenctuary_ajax_logout' );
add_action( 'wp_ajax_nopriv_zenctuary_logout', 'zenctuary_ajax_logout' ); // Allow even if not logged in (to prevent weird states)
/**
 * Render Header Authentication Trigger (Shortcode)
 * 
 * Provides a PHP-controlled button that shows "Sign-In" or "My Account"
 * based on the user's login state.
 */
function zenctuary_render_auth_trigger() {
    $is_logged_in = is_user_logged_in();
    $action = $is_logged_in ? 'account' : 'login';
    $label = $is_logged_in ? __( 'My Account', 'zenctuary' ) : __( 'Sign-In', 'zenctuary' );
    $icon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"/></svg>';

    ob_start();
    ?>
    <div class="wp-block-button zen-btn zen-btn--outline-neutral zen-btn--small zen-auth-trigger" data-auth="<?php echo esc_attr( $action ); ?>">
        <a class="wp-block-button__link wp-element-button" href="javascript:void(0);">
            <span class="zen-auth-label"><?php echo esc_html( $label ); ?></span>
            <?php echo $icon; ?>
        </a>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode( 'zen_auth_trigger', 'zenctuary_render_auth_trigger' );
