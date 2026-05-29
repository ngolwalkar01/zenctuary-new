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
		wp_set_current_user( $user_signon->ID );
		wp_send_json_success( array( 
            'message' => __( 'Login successful!', 'zenctuary' ),
            'user_id' => $user_signon->ID,
            'redirect_url' => function_exists( 'zenctuary_get_my_account_url' ) ? zenctuary_get_my_account_url() : admin_url( 'profile.php' ),
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
 * Read a text value from posted signup data.
 *
 * @param string $key Posted field key.
 * @return string
 */
function zenctuary_get_posted_text_field( string $key ): string {
    return isset( $_POST[ $key ] ) ? sanitize_text_field( wp_unslash( $_POST[ $key ] ) ) : '';
}

/**
 * Validate signup billing fields using WooCommerce address rules.
 *
 * @return array|WP_Error
 */
function zenctuary_validate_signup_billing_fields() {
    $billing_country   = zenctuary_get_posted_text_field( 'billing_country' );
    $billing_country   = $billing_country ? $billing_country : zenctuary_get_posted_text_field( 'country' );
    $billing_state     = zenctuary_get_posted_text_field( 'billing_state' );
    $billing_address_1 = zenctuary_get_posted_text_field( 'billing_address_1' );
    $billing_address_1 = $billing_address_1 ? $billing_address_1 : zenctuary_get_posted_text_field( 'address' );
    $billing_city      = zenctuary_get_posted_text_field( 'billing_city' );
    $billing_city      = $billing_city ? $billing_city : zenctuary_get_posted_text_field( 'city' );
    $billing_postcode  = zenctuary_get_posted_text_field( 'billing_postcode' );
    $billing_postcode  = $billing_postcode ? $billing_postcode : zenctuary_get_posted_text_field( 'postal_code' );

    $data = array(
        'billing_country'   => $billing_country,
        'billing_state'     => $billing_state,
        'billing_address_1' => $billing_address_1,
        'billing_city'      => $billing_city,
        'billing_postcode'  => $billing_postcode,
    );

    $errors = new WP_Error();

    if ( function_exists( 'WC' ) && WC()->countries ) {
        $countries = WC()->countries->get_countries();

        if ( '' === $billing_country ) {
            $errors->add( 'billing_country_required', __( 'Billing Country / Region is a required field.', 'zenctuary' ) );
        } elseif ( ! isset( $countries[ $billing_country ] ) ) {
            $errors->add( 'billing_country_validation', __( 'Billing Country / Region is not valid.', 'zenctuary' ) );
        }

        $address_fields = WC()->countries->get_address_fields( $billing_country, 'billing_' );
        $labels         = array(
            'billing_address_1' => __( 'Billing Street address', 'zenctuary' ),
            'billing_city'      => __( 'Billing Town / City', 'zenctuary' ),
            'billing_state'     => __( 'Billing State / County', 'zenctuary' ),
            'billing_postcode'  => __( 'Billing Postcode / ZIP', 'zenctuary' ),
        );

        foreach ( $labels as $key => $label ) {
            if ( ! isset( $address_fields[ $key ] ) ) {
                continue;
            }

            $required = ! empty( $address_fields[ $key ]['required'] );

            if ( $required && '' === $data[ $key ] ) {
                /* translators: %s: field label */
                $errors->add( $key . '_required', sprintf( __( '%s is a required field.', 'woocommerce' ), $label ) );
            }
        }

        if ( '' !== $billing_state ) {
            $valid_states = WC()->countries->get_states( $billing_country );

            if ( ! empty( $valid_states ) && is_array( $valid_states ) ) {
                $valid_state_values = array_map( 'wc_strtoupper', array_flip( array_map( 'wc_strtoupper', $valid_states ) ) );
                $billing_state      = wc_strtoupper( $billing_state );

                if ( isset( $valid_state_values[ $billing_state ] ) ) {
                    $billing_state = $valid_state_values[ $billing_state ];
                }

                if ( ! in_array( $billing_state, $valid_state_values, true ) ) {
                    $errors->add(
                        'billing_state_validation',
                        sprintf(
                            /* translators: 1: state field label, 2: valid states list */
                            __( '%1$s is not valid. Please enter one of the following: %2$s', 'woocommerce' ),
                            __( 'Billing State / County', 'zenctuary' ),
                            implode( ', ', $valid_states )
                        )
                    );
                }

                $data['billing_state'] = $billing_state;
            }
        }

        if ( '' !== $billing_postcode ) {
            $billing_postcode = function_exists( 'wc_format_postcode' ) ? wc_format_postcode( $billing_postcode, $billing_country ) : $billing_postcode;

            if ( class_exists( 'WC_Validation' ) && ! WC_Validation::is_postcode( $billing_postcode, $billing_country ) ) {
                $postcode_message = 'IE' === $billing_country
                    ? __( 'Please enter a valid Eircode.', 'woocommerce' )
                    : __( 'Please enter a valid postcode / ZIP.', 'woocommerce' );
                $errors->add( 'billing_postcode_validation', $postcode_message );
            }

            $data['billing_postcode'] = $billing_postcode;
        }
    } else {
        foreach ( $data as $key => $value ) {
            if ( '' === $value ) {
                $errors->add( $key . '_required', __( 'Please complete all required billing address fields.', 'zenctuary' ) );
                break;
            }
        }
    }

    if ( $errors->has_errors() ) {
        return $errors;
    }

    return $data;
}

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

    $billing_fields = zenctuary_validate_signup_billing_fields();

    if ( is_wp_error( $billing_fields ) ) {
        wp_send_json_error( array( 'message' => $billing_fields->get_error_message() ) );
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
        $phone_number = isset( $_POST['phone'] ) ? sanitize_text_field( $_POST['phone'] ) : '';
        // If the phone number already starts with '+', it's already an international full number
        if ( strpos( $phone_number, '+' ) === 0 ) {
            $full_phone = $phone_number;
        } else {
            $country_code = isset( $_POST['country_code'] ) ? sanitize_text_field( $_POST['country_code'] ) : '';
            $full_phone   = trim( "$country_code $phone_number" );
        }
        update_user_meta( $user_id, 'billing_phone', $full_phone );

        // Profile Details
        update_user_meta( $user_id, 'gender', isset( $_POST['gender'] ) ? sanitize_text_field( $_POST['gender'] ) : '' );
        update_user_meta( $user_id, 'billing_country', $billing_fields['billing_country'] );
        update_user_meta( $user_id, 'billing_state', $billing_fields['billing_state'] );
        update_user_meta( $user_id, 'billing_address_1', $billing_fields['billing_address_1'] );
        update_user_meta( $user_id, 'billing_city', $billing_fields['billing_city'] );
        update_user_meta( $user_id, 'billing_postcode', $billing_fields['billing_postcode'] );

        // Notifications
        update_user_meta( $user_id, 'zen_email_notifications', isset( $_POST['email_notifications'] ) ? 'yes' : 'no' );
        update_user_meta( $user_id, 'zen_sms_notifications', isset( $_POST['sms_notifications'] ) ? 'yes' : 'no' );

        // Log the user in
        wp_set_auth_cookie( $user_id );
        wp_set_current_user( $user_id );
        
        $user = get_userdata( $user_id );
        wp_send_json_success( array( 
            'message' => __( 'Registration successful!', 'zenctuary' ),
            'user_id' => $user_id,
            'redirect_url' => function_exists( 'zenctuary_get_my_account_url' ) ? zenctuary_get_my_account_url() : admin_url( 'profile.php' ),
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
 * Redirect all direct logout flows to the homepage.
 *
 * This covers native WordPress/WooCommerce logout URLs that bypass the
 * AJAX modal handler.
 *
 * @return string
 */
function zenctuary_logout_redirect_to_home(): string {
	return home_url( '/' );
}
add_filter( 'logout_redirect', 'zenctuary_logout_redirect_to_home', 999 );
