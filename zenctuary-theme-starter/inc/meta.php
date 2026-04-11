<?php
/**
 * Experience Product Meta Fields
 *
 * Registers REST-compatible structured meta fields on WooCommerce products.
 * Uses native register_post_meta — no ACF dependency required.
 *
 * @package Zenctuary
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action( 'init', 'zenctuary_register_experience_meta' );

function zenctuary_register_experience_meta(): void {

    $defaults = [
        'object_subtype' => 'product',
        'show_in_rest'   => true,
        'single'         => true,
    ];

    // Duration: e.g., "60 min" or just 60
    register_post_meta( 'product', '_zen_duration', array_merge( $defaults, [
        'type'              => 'string',
        'description'       => __( 'Duration of the experience (e.g., "60 min")', 'zenctuary' ),
        'sanitize_callback' => 'sanitize_text_field',
        'auth_callback'     => '__return_true',
    ] ) );

    // Instructor name
    register_post_meta( 'product', '_zen_instructor_name', array_merge( $defaults, [
        'type'              => 'string',
        'description'       => __( 'Name of the instructor', 'zenctuary' ),
        'sanitize_callback' => 'sanitize_text_field',
        'auth_callback'     => '__return_true',
    ] ) );

    // Difficulty level: e.g., Beginner / Intermediate / Advanced / All Levels
    register_post_meta( 'product', '_zen_difficulty_level', array_merge( $defaults, [
        'type'              => 'string',
        'description'       => __( 'Difficulty level of the experience', 'zenctuary' ),
        'sanitize_callback' => 'sanitize_text_field',
        'auth_callback'     => '__return_true',
    ] ) );

    // Language
    register_post_meta( 'product', '_zen_language', array_merge( $defaults, [
        'type'              => 'string',
        'description'       => __( 'Language the experience is conducted in', 'zenctuary' ),
        'sanitize_callback' => 'sanitize_text_field',
        'auth_callback'     => '__return_true',
    ] ) );

    // Zencoin price/cost
    register_post_meta( 'product', '_zen_coins', array_merge( $defaults, [
        'type'              => 'integer',
        'description'       => __( 'Number of Zencoins required for this experience', 'zenctuary' ),
        'sanitize_callback' => 'absint',
        'auth_callback'     => '__return_true',
        'default'           => 0,
    ] ) );

    // Short description for card UI (separate from WooCommerce short_description)
    register_post_meta( 'product', '_zen_short_description', array_merge( $defaults, [
        'type'              => 'string',
        'description'       => __( 'Short summary for card display', 'zenctuary' ),
        'sanitize_callback' => 'sanitize_textarea_field',
        'auth_callback'     => '__return_true',
    ] ) );

    // Optional badge label: e.g., "NEW", "HOT", "Limited"
    register_post_meta( 'product', '_zen_badge_label', array_merge( $defaults, [
        'type'              => 'string',
        'description'       => __( 'Optional badge label displayed on cards', 'zenctuary' ),
        'sanitize_callback' => 'sanitize_text_field',
        'auth_callback'     => '__return_true',
    ] ) );

    // Sort order for manual ordering within groups
    register_post_meta( 'product', '_zen_sort_order', array_merge( $defaults, [
        'type'              => 'integer',
        'description'       => __( 'Manual sort order within a group (lower = first)', 'zenctuary' ),
        'sanitize_callback' => 'absint',
        'auth_callback'     => '__return_true',
        'default'           => 0,
    ] ) );
}

/**
 * Register the admin metabox on the product edit screen.
 *
 * register_post_meta() only covers REST/Gutenberg visibility.
 * add_meta_box() is required to display fields in the WP Admin UI.
 */
add_action( 'add_meta_boxes', 'zenctuary_add_experience_metabox' );

function zenctuary_add_experience_metabox(): void {
    add_meta_box(
        'zenctuary_experience_details',
        __( 'Experience Details (Zenctuary)', 'zenctuary' ),
        'zenctuary_render_experience_metabox',
        'product',
        'normal',
        'high'
    );
}

/**
 * Render the metabox HTML form.
 *
 * @param WP_Post $post
 */
function zenctuary_render_experience_metabox( WP_Post $post ): void {
    wp_nonce_field( 'zenctuary_save_experience_meta', 'zenctuary_experience_nonce' );

    $duration          = get_post_meta( $post->ID, '_zen_duration', true );
    $instructor_name   = get_post_meta( $post->ID, '_zen_instructor_name', true );
    $difficulty_level  = get_post_meta( $post->ID, '_zen_difficulty_level', true );
    $language          = get_post_meta( $post->ID, '_zen_language', true );
    $zen_coins         = get_post_meta( $post->ID, '_zen_coins', true );
    $short_description = get_post_meta( $post->ID, '_zen_short_description', true );
    $badge_label       = get_post_meta( $post->ID, '_zen_badge_label', true );
    $sort_order        = get_post_meta( $post->ID, '_zen_sort_order', true );

    $difficulty_options = [
        ''               => '— Select —',
        'All Levels'     => 'All Levels',
        'Beginner Friendly' => 'Beginner Friendly',
        'Intermediate'   => 'Intermediate',
        'Advanced'       => 'Advanced',
    ];
    ?>
    <style>
        #zenctuary_experience_details .zen-meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px 24px;
            padding: 8px 0;
        }
        #zenctuary_experience_details .zen-meta-field {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        #zenctuary_experience_details .zen-meta-field.zen-meta-full {
            grid-column: 1 / -1;
        }
        #zenctuary_experience_details label {
            font-weight: 600;
            font-size: 13px;
        }
        #zenctuary_experience_details input[type="text"],
        #zenctuary_experience_details input[type="number"],
        #zenctuary_experience_details select,
        #zenctuary_experience_details textarea {
            width: 100%;
        }
        #zenctuary_experience_details textarea {
            min-height: 80px;
        }
    </style>

    <div class="zen-meta-grid">

        <div class="zen-meta-field">
            <label for="_zen_duration"><?php esc_html_e( 'Duration', 'zenctuary' ); ?></label>
            <input type="text" id="_zen_duration" name="_zen_duration"
                   value="<?php echo esc_attr( $duration ); ?>"
                   placeholder="e.g. 60 min" />
        </div>

        <div class="zen-meta-field">
            <label for="_zen_instructor_name"><?php esc_html_e( 'Instructor Name', 'zenctuary' ); ?></label>
            <input type="text" id="_zen_instructor_name" name="_zen_instructor_name"
                   value="<?php echo esc_attr( $instructor_name ); ?>"
                   placeholder="e.g. Anna Müller" />
        </div>

        <div class="zen-meta-field">
            <label for="_zen_difficulty_level"><?php esc_html_e( 'Difficulty Level', 'zenctuary' ); ?></label>
            <select id="_zen_difficulty_level" name="_zen_difficulty_level">
                <?php foreach ( $difficulty_options as $val => $label ) : ?>
                    <option value="<?php echo esc_attr( $val ); ?>" <?php selected( $difficulty_level, $val ); ?>>
                        <?php echo esc_html( $label ); ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>

        <div class="zen-meta-field">
            <label for="_zen_language"><?php esc_html_e( 'Language', 'zenctuary' ); ?></label>
            <input type="text" id="_zen_language" name="_zen_language"
                   value="<?php echo esc_attr( $language ); ?>"
                   placeholder="e.g. EN / DE" />
        </div>

        <div class="zen-meta-field">
            <label for="_zen_coins"><?php esc_html_e( 'Zencoins Cost', 'zenctuary' ); ?></label>
            <input type="number" id="_zen_coins" name="_zen_coins"
                   value="<?php echo esc_attr( $zen_coins ); ?>"
                   min="0" placeholder="e.g. 5" />
        </div>

        <div class="zen-meta-field">
            <label for="_zen_badge_label"><?php esc_html_e( 'Badge Label (optional)', 'zenctuary' ); ?></label>
            <input type="text" id="_zen_badge_label" name="_zen_badge_label"
                   value="<?php echo esc_attr( $badge_label ); ?>"
                   placeholder="e.g. NEW, HOT, Limited" />
        </div>

        <div class="zen-meta-field">
            <label for="_zen_sort_order"><?php esc_html_e( 'Sort Order', 'zenctuary' ); ?></label>
            <input type="number" id="_zen_sort_order" name="_zen_sort_order"
                   value="<?php echo esc_attr( $sort_order ); ?>"
                   min="0" placeholder="0 = first" />
        </div>

        <div class="zen-meta-field zen-meta-full">
            <label for="_zen_short_description"><?php esc_html_e( 'Short Description (for cards)', 'zenctuary' ); ?></label>
            <textarea id="_zen_short_description" name="_zen_short_description"
                      placeholder="Brief description shown on the experience card..."><?php echo esc_textarea( $short_description ); ?></textarea>
        </div>

    </div>
    <?php
}

/**
 * Save metabox values on product save.
 *
 * @param int $post_id
 */
add_action( 'save_post_product', 'zenctuary_save_experience_metabox' );

function zenctuary_save_experience_metabox( int $post_id ): void {

    // Security checks.
    if ( ! isset( $_POST['zenctuary_experience_nonce'] ) ) {
        return;
    }
    if ( ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['zenctuary_experience_nonce'] ) ), 'zenctuary_save_experience_meta' ) ) {
        return;
    }
    if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
        return;
    }
    if ( ! current_user_can( 'edit_post', $post_id ) ) {
        return;
    }

    // Save each field.
    $string_fields = [
        '_zen_duration',
        '_zen_instructor_name',
        '_zen_difficulty_level',
        '_zen_language',
        '_zen_badge_label',
    ];

    foreach ( $string_fields as $key ) {
        if ( isset( $_POST[ $key ] ) ) {
            update_post_meta( $post_id, $key, sanitize_text_field( wp_unslash( $_POST[ $key ] ) ) );
        }
    }

    if ( isset( $_POST['_zen_short_description'] ) ) {
        update_post_meta( $post_id, '_zen_short_description', sanitize_textarea_field( wp_unslash( $_POST['_zen_short_description'] ) ) );
    }

    if ( isset( $_POST['_zen_coins'] ) ) {
        update_post_meta( $post_id, '_zen_coins', absint( $_POST['_zen_coins'] ) );
    }

    if ( isset( $_POST['_zen_sort_order'] ) ) {
        update_post_meta( $post_id, '_zen_sort_order', absint( $_POST['_zen_sort_order'] ) );
    }
}


/**
 * Register term meta for space_type taxonomy.
 *
 * Allows admins to set a custom icon image URL and description
 * per space term (e.g., Movement Space, Soul Space).
 * These are rendered in the section header of the experience-space block.
 */
add_action( 'init', 'zenctuary_register_space_term_meta' );

function zenctuary_register_space_term_meta(): void {

    // Icon image URL for the space header.
    register_term_meta( 'space_type', '_zen_space_icon_url', [
        'type'              => 'string',
        'description'       => __( 'URL of the icon image displayed in the space section header', 'zenctuary' ),
        'single'            => true,
        'show_in_rest'      => true,
        'sanitize_callback' => 'esc_url_raw',
        'auth_callback'     => '__return_true',
    ] );

    // Short description shown below the space title.
    register_term_meta( 'space_type', '_zen_space_description', [
        'type'              => 'string',
        'description'       => __( 'Short description shown below the space section title', 'zenctuary' ),
        'single'            => true,
        'show_in_rest'      => true,
        'sanitize_callback' => 'sanitize_textarea_field',
        'auth_callback'     => '__return_true',
    ] );
}

/**
 * Add icon URL and description fields to the space_type term edit screens in WP Admin.
 */
add_action( 'space_type_add_form_fields',  'zenctuary_space_type_add_fields' );
add_action( 'space_type_edit_form_fields', 'zenctuary_space_type_edit_fields' );
add_action( 'created_space_type',          'zenctuary_save_space_type_meta' );
add_action( 'edited_space_type',           'zenctuary_save_space_type_meta' );

function zenctuary_space_type_add_fields(): void {
    ?>
    <div class="form-field">
        <label for="zen_space_icon_url"><?php esc_html_e( 'Icon Image URL', 'zenctuary' ); ?></label>
        <input type="url" name="zen_space_icon_url" id="zen_space_icon_url" value="" />
        <p><?php esc_html_e( 'URL to the icon SVG or image shown next to the space title.', 'zenctuary' ); ?></p>
    </div>
    <div class="form-field">
        <label for="zen_space_description_custom"><?php esc_html_e( 'Section Description', 'zenctuary' ); ?></label>
        <textarea name="zen_space_description_custom" id="zen_space_description_custom" rows="4"></textarea>
        <p><?php esc_html_e( 'Short text displayed below the space title.', 'zenctuary' ); ?></p>
    </div>
    <?php
}

function zenctuary_space_type_edit_fields( WP_Term $term ): void {
    $icon_url    = get_term_meta( $term->term_id, '_zen_space_icon_url', true );
    $description = get_term_meta( $term->term_id, '_zen_space_description', true );
    ?>
    <tr class="form-field">
        <th scope="row"><label for="zen_space_icon_url"><?php esc_html_e( 'Icon Image URL', 'zenctuary' ); ?></label></th>
        <td>
            <input type="url" name="zen_space_icon_url" id="zen_space_icon_url" value="<?php echo esc_attr( $icon_url ); ?>" />
            <p class="description"><?php esc_html_e( 'URL to the icon SVG or image shown next to the space title.', 'zenctuary' ); ?></p>
        </td>
    </tr>
    <tr class="form-field">
        <th scope="row"><label for="zen_space_description_custom"><?php esc_html_e( 'Section Description', 'zenctuary' ); ?></label></th>
        <td>
            <textarea name="zen_space_description_custom" id="zen_space_description_custom" rows="4"><?php echo esc_textarea( $description ); ?></textarea>
            <p class="description"><?php esc_html_e( 'Short text displayed below the space title.', 'zenctuary' ); ?></p>
        </td>
    </tr>
    <?php
}

function zenctuary_save_space_type_meta( int $term_id ): void {
    if ( isset( $_POST['zen_space_icon_url'] ) ) {
        update_term_meta( $term_id, '_zen_space_icon_url', esc_url_raw( wp_unslash( $_POST['zen_space_icon_url'] ) ) );
    }
    if ( isset( $_POST['zen_space_description_custom'] ) ) {
        update_term_meta( $term_id, '_zen_space_description', sanitize_textarea_field( wp_unslash( $_POST['zen_space_description_custom'] ) ) );
    }
}

