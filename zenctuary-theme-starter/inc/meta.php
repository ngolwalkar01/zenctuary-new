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

/**
 * Register term meta for experience_category taxonomy.
 *
 * Stores an image attachment ID so category images can use WordPress image
 * sizes and remain linked to Media Library metadata.
 */
add_action( 'init', 'zenctuary_register_experience_category_term_meta' );

function zenctuary_register_experience_category_term_meta(): void {
	register_term_meta(
		'experience_category',
		'_zen_experience_category_image_id',
		[
			'type'              => 'integer',
			'description'       => __( 'Image attachment ID for the experience category.', 'zenctuary' ),
			'single'            => true,
			'show_in_rest'      => true,
			'sanitize_callback' => 'absint',
			'auth_callback'     => '__return_true',
			'default'           => 0,
		]
	);
}

/**
 * Add image upload controls to experience_category term screens.
 */
add_action( 'experience_category_add_form_fields', 'zenctuary_experience_category_add_image_field' );
add_action( 'experience_category_edit_form_fields', 'zenctuary_experience_category_edit_image_field' );
add_action( 'created_experience_category', 'zenctuary_save_experience_category_meta' );
add_action( 'edited_experience_category', 'zenctuary_save_experience_category_meta' );
add_action( 'admin_enqueue_scripts', 'zenctuary_enqueue_experience_category_image_admin' );

function zenctuary_experience_category_add_image_field(): void {
	wp_nonce_field( 'zenctuary_save_experience_category_meta', 'zenctuary_experience_category_nonce' );
	?>
	<div class="form-field term-group">
		<label for="zen_experience_category_image_id"><?php esc_html_e( 'Category Image', 'zenctuary' ); ?></label>
		<input type="hidden" id="zen_experience_category_image_id" name="zen_experience_category_image_id" value="0" />
		<div class="zen-term-image-preview is-empty" data-placeholder="<?php esc_attr_e( 'No image selected', 'zenctuary' ); ?>">
			<span><?php esc_html_e( 'No image selected', 'zenctuary' ); ?></span>
		</div>
		<p>
			<button type="button" class="button zen-term-image-upload"><?php esc_html_e( 'Select Image', 'zenctuary' ); ?></button>
			<button type="button" class="button zen-term-image-remove" style="display:none;"><?php esc_html_e( 'Remove Image', 'zenctuary' ); ?></button>
		</p>
		<p><?php esc_html_e( 'Image used for this experience category.', 'zenctuary' ); ?></p>
	</div>
	<?php
}

function zenctuary_experience_category_edit_image_field( WP_Term $term ): void {
	$image_id  = absint( get_term_meta( $term->term_id, '_zen_experience_category_image_id', true ) );
	$image_url = $image_id ? wp_get_attachment_image_url( $image_id, 'thumbnail' ) : '';

	wp_nonce_field( 'zenctuary_save_experience_category_meta', 'zenctuary_experience_category_nonce' );
	?>
	<tr class="form-field term-group-wrap">
		<th scope="row"><label for="zen_experience_category_image_id"><?php esc_html_e( 'Category Image', 'zenctuary' ); ?></label></th>
		<td>
			<input type="hidden" id="zen_experience_category_image_id" name="zen_experience_category_image_id" value="<?php echo esc_attr( $image_id ); ?>" />
			<div class="zen-term-image-preview<?php echo $image_url ? '' : ' is-empty'; ?>" data-placeholder="<?php esc_attr_e( 'No image selected', 'zenctuary' ); ?>">
				<?php if ( $image_url ) : ?>
					<img src="<?php echo esc_url( $image_url ); ?>" alt="" />
				<?php else : ?>
					<span><?php esc_html_e( 'No image selected', 'zenctuary' ); ?></span>
				<?php endif; ?>
			</div>
			<p>
				<button type="button" class="button zen-term-image-upload"><?php echo $image_url ? esc_html__( 'Change Image', 'zenctuary' ) : esc_html__( 'Select Image', 'zenctuary' ); ?></button>
				<button type="button" class="button zen-term-image-remove" <?php echo $image_url ? '' : 'style="display:none;"'; ?>><?php esc_html_e( 'Remove Image', 'zenctuary' ); ?></button>
			</p>
			<p class="description"><?php esc_html_e( 'Image used for this experience category.', 'zenctuary' ); ?></p>
		</td>
	</tr>
	<?php
}

function zenctuary_save_experience_category_meta( int $term_id ): void {
	if ( ! isset( $_POST['zenctuary_experience_category_nonce'] ) ) {
		return;
	}

	if ( ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['zenctuary_experience_category_nonce'] ) ), 'zenctuary_save_experience_category_meta' ) ) {
		return;
	}

	if ( ! current_user_can( 'manage_categories' ) ) {
		return;
	}

	$image_id = isset( $_POST['zen_experience_category_image_id'] ) ? absint( $_POST['zen_experience_category_image_id'] ) : 0;

	if ( $image_id > 0 ) {
		update_term_meta( $term_id, '_zen_experience_category_image_id', $image_id );
		return;
	}

	delete_term_meta( $term_id, '_zen_experience_category_image_id' );
}

function zenctuary_enqueue_experience_category_image_admin( string $hook_suffix ): void {
	if ( 'edit-tags.php' !== $hook_suffix && 'term.php' !== $hook_suffix ) {
		return;
	}

	$screen = get_current_screen();
	if ( ! $screen || 'experience_category' !== $screen->taxonomy ) {
		return;
	}

	wp_enqueue_media();
	wp_enqueue_script( 'jquery' );

	wp_register_style( 'zenctuary-experience-category-admin', false, [], '1.0.0' );
	wp_enqueue_style( 'zenctuary-experience-category-admin' );

	wp_add_inline_style(
		'zenctuary-experience-category-admin',
		'
		.zen-term-image-preview {
			align-items: center;
			background: #f6f7f7;
			border: 1px solid #dcdcde;
			display: flex;
			justify-content: center;
			margin: 8px 0;
			min-height: 90px;
			width: 120px;
		}
		.zen-term-image-preview img {
			display: block;
			height: auto;
			max-height: 120px;
			max-width: 120px;
		}
		.zen-term-image-preview span {
			color: #646970;
			font-size: 12px;
			padding: 8px;
			text-align: center;
		}
		'
	);

	wp_add_inline_script(
		'jquery',
		"
		jQuery(function($) {
			var frame;

			function setPreview(container, imageUrl) {
				var placeholder = container.data('placeholder') || 'No image selected';

				if (imageUrl) {
					container.removeClass('is-empty').html('<img src=\"' + imageUrl + '\" alt=\"\" />');
					return;
				}

				container.addClass('is-empty').html('<span>' + placeholder + '</span>');
			}

			$(document).on('click', '.zen-term-image-upload', function(e) {
				e.preventDefault();

				var button = $(this);
				var wrapper = button.closest('.form-field, td');
				var input = wrapper.find('#zen_experience_category_image_id');
				var preview = wrapper.find('.zen-term-image-preview');
				var remove = wrapper.find('.zen-term-image-remove');

				if (frame) {
					frame.off('select');
				}

				frame = wp.media({
					title: '" . esc_js( __( 'Select Category Image', 'zenctuary' ) ) . "',
					button: { text: '" . esc_js( __( 'Use this image', 'zenctuary' ) ) . "' },
					library: { type: 'image' },
					multiple: false
				});

				frame.on('select', function() {
					var attachment = frame.state().get('selection').first().toJSON();
					var imageUrl = attachment.sizes && attachment.sizes.thumbnail ? attachment.sizes.thumbnail.url : attachment.url;

					input.val(attachment.id);
					setPreview(preview, imageUrl);
					button.text('" . esc_js( __( 'Change Image', 'zenctuary' ) ) . "');
					remove.show();
				});

				frame.open();
			});

			$(document).on('click', '.zen-term-image-remove', function(e) {
				e.preventDefault();

				var button = $(this);
				var wrapper = button.closest('.form-field, td');

				wrapper.find('#zen_experience_category_image_id').val(0);
				setPreview(wrapper.find('.zen-term-image-preview'), '');
				wrapper.find('.zen-term-image-upload').text('" . esc_js( __( 'Select Image', 'zenctuary' ) ) . "');
				button.hide();
			});

			$(document).ajaxComplete(function(event, xhr, settings) {
				if (!settings.data || settings.data.indexOf('action=add-tag') === -1) {
					return;
				}

				var wrapper = $('#zen_experience_category_image_id').closest('.form-field');
				if (!wrapper.length) {
					return;
				}

				wrapper.find('#zen_experience_category_image_id').val(0);
				setPreview(wrapper.find('.zen-term-image-preview'), '');
				wrapper.find('.zen-term-image-upload').text('" . esc_js( __( 'Select Image', 'zenctuary' ) ) . "');
				wrapper.find('.zen-term-image-remove').hide();
			});
		});
		"
	);
}

/**
 * Register sticky news hover content post meta.
 */
add_action( 'init', 'zenctuary_register_news_hover_meta' );

function zenctuary_register_news_hover_meta(): void {
	$post_types = get_post_types(
		[
			'public'  => true,
			'show_ui' => true,
		],
		'objects'
	);

	foreach ( $post_types as $post_type ) {
		if ( empty( $post_type->show_in_rest ) || 'attachment' === $post_type->name ) {
			continue;
		}

		register_post_meta(
			$post_type->name,
			'news_hover_content',
			[
				'type'              => 'string',
				'single'            => true,
				'show_in_rest'      => true,
				'default'           => '',
				'sanitize_callback' => 'wp_kses_post',
				'auth_callback'     => static function() use ( $post_type ): bool {
					return current_user_can( $post_type->cap->edit_posts );
				},
				'description'       => __( 'Hover content used by the Latest News Sticky Stack block.', 'zenctuary' ),
			]
		);
	}
}

/**
 * Add the hover content metabox to supported post types.
 */
add_action( 'add_meta_boxes', 'zenctuary_add_news_hover_metabox' );

function zenctuary_add_news_hover_metabox(): void {
	$post_types = get_post_types(
		[
			'public'  => true,
			'show_ui' => true,
		],
		'objects'
	);

	foreach ( $post_types as $post_type ) {
		if ( empty( $post_type->show_in_rest ) || 'attachment' === $post_type->name ) {
			continue;
		}

		add_meta_box(
			'zenctuary_news_hover_content',
			__( 'Hover Content', 'zenctuary' ),
			'zenctuary_render_news_hover_metabox',
			$post_type->name,
			'normal',
			'default'
		);
	}
}

/**
 * Render the hover content metabox UI.
 *
 * @param WP_Post $post Current post.
 */
function zenctuary_render_news_hover_metabox( WP_Post $post ): void {
	wp_nonce_field( 'zenctuary_save_news_hover_meta', 'zenctuary_news_hover_nonce' );

	$value = (string) get_post_meta( $post->ID, 'news_hover_content', true );
	?>
	<p>
		<?php esc_html_e( 'This content is shown in the expanded hover panel of the Latest News Sticky Stack block. It is separate from the full post content.', 'zenctuary' ); ?>
	</p>
	<?php
	wp_editor(
		$value,
		'zenctuary_news_hover_content_editor',
		[
			'textarea_name' => 'news_hover_content',
			'textarea_rows' => 8,
			'media_buttons' => false,
			'teeny'         => true,
			'quicktags'     => [
				'buttons' => 'strong,em,ul,ol,li,link,close',
			],
		]
	);
}

/**
 * Save hover content post meta.
 *
 * @param int $post_id Current post ID.
 */
add_action( 'save_post', 'zenctuary_save_news_hover_metabox' );

function zenctuary_save_news_hover_metabox( int $post_id ): void {
	if ( ! isset( $_POST['zenctuary_news_hover_nonce'] ) ) {
		return;
	}

	if ( ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['zenctuary_news_hover_nonce'] ) ), 'zenctuary_save_news_hover_meta' ) ) {
		return;
	}

	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}

	$post_type = get_post_type( $post_id );
	if ( ! $post_type || ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	if ( isset( $_POST['news_hover_content'] ) ) {
		update_post_meta(
			$post_id,
			'news_hover_content',
			wp_kses_post( wp_unslash( $_POST['news_hover_content'] ) )
		);
	}
}

/**
 * Register product feature card meta fields.
 */
add_action( 'init', 'zenctuary_register_product_feature_card_meta' );

function zenctuary_register_product_feature_card_meta(): void {
	$defaults = [
		'object_subtype' => 'product',
		'show_in_rest'   => true,
		'single'         => true,
		'auth_callback'  => '__return_true',
	];

	register_post_meta(
		'product',
		'_session_time',
		array_merge(
			$defaults,
			[
				'type'              => 'string',
				'description'       => __( 'Session time shown on Product Feature Cards.', 'zenctuary' ),
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '',
			]
		)
	);

	register_post_meta(
		'product',
		'_ideal_for',
		array_merge(
			$defaults,
			[
				'type'              => 'string',
				'description'       => __( 'Ideal for text used by Product Feature Cards.', 'zenctuary' ),
				'sanitize_callback' => 'sanitize_textarea_field',
				'default'           => '',
			]
		)
	);

	register_post_meta(
		'product',
		'_what_to_expect',
		array_merge(
			$defaults,
			[
				'type'              => 'string',
				'description'       => __( 'Expandable What to Expect content used by Product Feature Cards.', 'zenctuary' ),
				'sanitize_callback' => 'wp_kses_post',
				'default'           => '',
			]
		)
	);

	register_post_meta(
		'product',
		'_zencoin_value',
		array_merge(
			$defaults,
			[
				'type'              => 'string',
				'description'       => __( 'Independent Zencoin value shown on Product Feature Cards.', 'zenctuary' ),
				'sanitize_callback' => 'sanitize_text_field',
				'default'           => '',
			]
		)
	);
}

add_action( 'add_meta_boxes', 'zenctuary_add_product_feature_cards_metabox' );

function zenctuary_add_product_feature_cards_metabox(): void {
	add_meta_box(
		'zenctuary_product_feature_cards',
		__( 'Product Feature Card Details', 'zenctuary' ),
		'zenctuary_render_product_feature_cards_metabox',
		'product',
		'normal',
		'default'
	);
}

/**
 * Render the Product Feature Cards metabox.
 *
 * @param WP_Post $post Product post object.
 */
function zenctuary_render_product_feature_cards_metabox( WP_Post $post ): void {
	wp_nonce_field( 'zenctuary_save_product_feature_cards_meta', 'zenctuary_product_feature_cards_nonce' );

	$session_time   = (string) get_post_meta( $post->ID, '_session_time', true );
	$ideal_for      = (string) get_post_meta( $post->ID, '_ideal_for', true );
	$what_to_expect = (string) get_post_meta( $post->ID, '_what_to_expect', true );
	$zencoin_value  = (string) get_post_meta( $post->ID, '_zencoin_value', true );
	?>
	<style>
		#zenctuary_product_feature_cards .zen-meta-grid {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 16px 24px;
			padding: 8px 0;
		}
		#zenctuary_product_feature_cards .zen-meta-field {
			display: flex;
			flex-direction: column;
			gap: 4px;
		}
		#zenctuary_product_feature_cards .zen-meta-field.zen-meta-full {
			grid-column: 1 / -1;
		}
		#zenctuary_product_feature_cards label {
			font-size: 13px;
			font-weight: 600;
		}
		#zenctuary_product_feature_cards input[type="text"],
		#zenctuary_product_feature_cards textarea {
			width: 100%;
		}
	</style>
	<div class="zen-meta-grid">
		<div class="zen-meta-field">
			<label for="_session_time"><?php esc_html_e( 'Session Time', 'zenctuary' ); ?></label>
			<input type="text" id="_session_time" name="_session_time" value="<?php echo esc_attr( $session_time ); ?>" placeholder="<?php esc_attr_e( 'e.g. 60 min', 'zenctuary' ); ?>" />
		</div>

		<div class="zen-meta-field">
			<label for="_zencoin_value"><?php esc_html_e( 'Zencoin Value', 'zenctuary' ); ?></label>
			<input type="text" id="_zencoin_value" name="_zencoin_value" value="<?php echo esc_attr( $zencoin_value ); ?>" placeholder="<?php esc_attr_e( 'e.g. 5', 'zenctuary' ); ?>" />
		</div>

		<div class="zen-meta-field zen-meta-full">
			<label for="_ideal_for"><?php esc_html_e( 'Ideal for', 'zenctuary' ); ?></label>
			<textarea id="_ideal_for" name="_ideal_for" rows="4" placeholder="<?php esc_attr_e( 'Short ideal-for text used inside the product card.', 'zenctuary' ); ?>"><?php echo esc_textarea( $ideal_for ); ?></textarea>
		</div>

		<div class="zen-meta-field zen-meta-full">
			<label for="zenctuary_what_to_expect_editor"><?php esc_html_e( 'What to Expect', 'zenctuary' ); ?></label>
			<?php
			wp_editor(
				$what_to_expect,
				'zenctuary_what_to_expect_editor',
				[
					'textarea_name' => '_what_to_expect',
					'textarea_rows' => 8,
					'media_buttons' => false,
					'teeny'         => true,
					'quicktags'     => [
						'buttons' => 'strong,em,ul,ol,li,link,close',
					],
				]
			);
			?>
		</div>
	</div>
	<?php
}

add_action( 'save_post_product', 'zenctuary_save_product_feature_cards_metabox' );

function zenctuary_save_product_feature_cards_metabox( int $post_id ): void {
	if ( ! isset( $_POST['zenctuary_product_feature_cards_nonce'] ) ) {
		return;
	}

	if ( ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['zenctuary_product_feature_cards_nonce'] ) ), 'zenctuary_save_product_feature_cards_meta' ) ) {
		return;
	}

	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}

	if ( ! current_user_can( 'edit_post', $post_id ) ) {
		return;
	}

	if ( isset( $_POST['_session_time'] ) ) {
		update_post_meta( $post_id, '_session_time', sanitize_text_field( wp_unslash( $_POST['_session_time'] ) ) );
	}

	if ( isset( $_POST['_zencoin_value'] ) ) {
		update_post_meta( $post_id, '_zencoin_value', sanitize_text_field( wp_unslash( $_POST['_zencoin_value'] ) ) );
	}

	if ( isset( $_POST['_ideal_for'] ) ) {
		update_post_meta( $post_id, '_ideal_for', sanitize_textarea_field( wp_unslash( $_POST['_ideal_for'] ) ) );
	}

	if ( isset( $_POST['_what_to_expect'] ) ) {
		update_post_meta( $post_id, '_what_to_expect', wp_kses_post( wp_unslash( $_POST['_what_to_expect'] ) ) );
	}
}
