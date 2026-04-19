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
	$info['user_login']    = isset( $_POST['username'] ) ? sanitize_user( $_POST['username'] ) : (isset( $_POST['email'] ) ? sanitize_email( $_POST['email'] ) : '');
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
    $confirm_password = isset( $_POST['confirm_password'] ) ? $_POST['confirm_password'] : '';
    $terms    = isset( $_POST['terms'] ) ? true : false;
    
    // --- VALIDATIONS ---
    if ( empty( $email ) ) {
        wp_send_json_error( array( 'message' => __( 'Please provide a valid email address.', 'zenctuary' ) ) );
    }

    if ( empty( $password ) ) {
        wp_send_json_error( array( 'message' => __( 'Please enter a password.', 'zenctuary' ) ) );
    }

    if ( $password !== $confirm_password ) {
        wp_send_json_error( array( 'message' => __( 'Passwords do not match.', 'zenctuary' ) ) );
    }

    if ( ! $terms ) {
        wp_send_json_error( array( 'message' => __( 'You must accept the terms and conditions.', 'zenctuary' ) ) );
    }

    $username = $email; // Defaulting username to email

    // --- CREATE USER ---
    $user_id = 0;

    if ( class_exists( 'WooCommerce' ) ) {
        $user_id = wc_create_new_customer( $email, $username, $password );
        if ( is_wp_error( $user_id ) ) {
            wp_send_json_error( array( 'message' => $user_id->get_error_message() ) );
        }
    } else {
        $user_id = wp_create_user( $username, $password, $email );
        if ( is_wp_error( $user_id ) ) {
            wp_send_json_error( array( 'message' => $user_id->get_error_message() ) );
        }
    }

    // --- SAVE ADDITIONAL FIELDS ---
    if ( $user_id ) {
        // Names
        $first_name = isset( $_POST['first_name'] ) ? sanitize_text_field( $_POST['first_name'] ) : '';
        $last_name  = isset( $_POST['last_name'] ) ? sanitize_text_field( $_POST['last_name'] ) : '';
        
        update_user_meta( $user_id, 'first_name', $first_name );
        update_user_meta( $user_id, 'last_name', $last_name );
        
        // Sync Display Name
        if ( ! empty( $first_name ) || ! empty( $last_name ) ) {
            $display_name = trim( "$first_name $last_name" );
            wp_update_user( array(
                'ID'           => $user_id,
                'display_name' => $display_name,
                'nickname'     => $display_name,
            ) );
        }

        // Phone (WooCommerce Billing Key)
        $country_code = isset( $_POST['country_code'] ) ? sanitize_text_field( $_POST['country_code'] ) : '';
        $phone_number = isset( $_POST['phone'] ) ? sanitize_text_field( $_POST['phone'] ) : '';
        $full_phone   = trim( "$country_code $phone_number" );
        update_user_meta( $user_id, 'billing_phone', $full_phone );

        // Profile Details
        update_user_meta( $user_id, 'gender', isset( $_POST['gender'] ) ? sanitize_text_field( $_POST['gender'] ) : '' );
        update_user_meta( $user_id, 'billing_country', isset( $_POST['country'] ) ? sanitize_text_field( $_POST['country'] ) : '' );
        update_user_meta( $user_id, 'billing_address_1', isset( $_POST['address'] ) ? sanitize_text_field( $_POST['address'] ) : '' );
        update_user_meta( $user_id, 'billing_city', isset( $_POST['city'] ) ? sanitize_text_field( $_POST['city'] ) : '' );
        update_user_meta( $user_id, 'billing_postcode', isset( $_POST['postal_code'] ) ? sanitize_text_field( $_POST['postal_code'] ) : '' );

        // Notifications
        update_user_meta( $user_id, 'zen_email_notifications', isset( $_POST['email_notifications'] ) ? 'yes' : 'no' );
        update_user_meta( $user_id, 'zen_sms_notifications', isset( $_POST['sms_notifications'] ) ? 'yes' : 'no' );

        // Log the user in
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
