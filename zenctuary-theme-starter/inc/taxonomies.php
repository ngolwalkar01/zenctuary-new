<?php
/**
 * Experience Taxonomies
 *
 * Registers experience_category, activity_type, and space_type
 * taxonomies for WooCommerce products.
 *
 * Architecture note:
 * - activity_type is FLAT (non-hierarchical) because activities like
 *   Yoga, Pilates, Breathwork are peer concepts with no parent-child
 *   relationship. Hierarchy would imply one "is a type of" another,
 *   which is not the case here. Filtering and grouping are handled
 *   by combining multiple taxonomies, not by nesting them.
 *
 * @package Zenctuary
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

add_action( 'init', 'zenctuary_register_experience_taxonomies' );

function zenctuary_register_experience_taxonomies(): void {

    // -------------------------------------------------------
    // 1. experience_category — top-level grouping
    // -------------------------------------------------------
    register_taxonomy( 'experience_category', 'product', [
        'label'              => __( 'Experience Category', 'zenctuary' ),
        'labels'             => [
            'name'          => __( 'Experience Categories', 'zenctuary' ),
            'singular_name' => __( 'Experience Category', 'zenctuary' ),
            'search_items'  => __( 'Search Categories', 'zenctuary' ),
            'all_items'     => __( 'All Categories', 'zenctuary' ),
            'edit_item'     => __( 'Edit Category', 'zenctuary' ),
            'update_item'   => __( 'Update Category', 'zenctuary' ),
            'add_new_item'  => __( 'Add New Category', 'zenctuary' ),
            'new_item_name' => __( 'New Category Name', 'zenctuary' ),
            'menu_name'     => __( 'Experience Categories', 'zenctuary' ),
        ],
        'hierarchical'       => true,   // supports parent/child if needed later
        'show_ui'            => true,
        'show_in_rest'       => true,
        'show_admin_column'  => true,
        'query_var'          => true,
        'rewrite'            => [ 'slug' => 'experience-category' ],
    ] );

    // -------------------------------------------------------
    // 2. activity_type — flat list of specific activities
    //
    // Intentionally NON-hierarchical because:
    // - Yoga / Pilates / Breathwork are co-equal peer terms.
    // - Hierarchy would imply "is a subtype of", which creates
    //   false constraints and complicates tax_query logic.
    // - Cross-dimensional filtering (e.g., Yoga in Movement Space)
    //   is handled by combining taxonomies, not nesting.
    // -------------------------------------------------------
    register_taxonomy( 'activity_type', 'product', [
        'label'              => __( 'Activity Type', 'zenctuary' ),
        'labels'             => [
            'name'          => __( 'Activity Types', 'zenctuary' ),
            'singular_name' => __( 'Activity Type', 'zenctuary' ),
            'search_items'  => __( 'Search Activity Types', 'zenctuary' ),
            'all_items'     => __( 'All Activity Types', 'zenctuary' ),
            'edit_item'     => __( 'Edit Activity Type', 'zenctuary' ),
            'update_item'   => __( 'Update Activity Type', 'zenctuary' ),
            'add_new_item'  => __( 'Add New Activity Type', 'zenctuary' ),
            'new_item_name' => __( 'New Activity Type Name', 'zenctuary' ),
            'menu_name'     => __( 'Activity Types', 'zenctuary' ),
        ],
        'hierarchical'       => false,  // flat — see rationale above
        'show_ui'            => true,
        'show_in_rest'       => true,
        'show_admin_column'  => true,
        'query_var'          => true,
        'rewrite'            => [ 'slug' => 'activity-type' ],
    ] );

    // -------------------------------------------------------
    // 3. space_type — physical space sub-grouping
    // -------------------------------------------------------
    register_taxonomy( 'space_type', 'product', [
        'label'              => __( 'Space Type', 'zenctuary' ),
        'labels'             => [
            'name'          => __( 'Space Types', 'zenctuary' ),
            'singular_name' => __( 'Space Type', 'zenctuary' ),
            'search_items'  => __( 'Search Space Types', 'zenctuary' ),
            'all_items'     => __( 'All Space Types', 'zenctuary' ),
            'edit_item'     => __( 'Edit Space Type', 'zenctuary' ),
            'update_item'   => __( 'Update Space Type', 'zenctuary' ),
            'add_new_item'  => __( 'Add New Space Type', 'zenctuary' ),
            'new_item_name' => __( 'New Space Type Name', 'zenctuary' ),
            'menu_name'     => __( 'Space Types', 'zenctuary' ),
        ],
        'hierarchical'       => false,
        'show_ui'            => true,
        'show_in_rest'       => true,
        'show_admin_column'  => true,
        'query_var'          => true,
        'rewrite'            => [ 'slug' => 'space-type' ],
    ] );

    // Seed default terms on first activation (idempotent — skips if terms exist).
    zenctuary_seed_taxonomy_terms();
}

/**
 * Seed default taxonomy terms if they don't already exist.
 * Safe to call on every request; get_term_by() prevents duplicates.
 */
function zenctuary_seed_taxonomy_terms(): void {

    $experience_categories = [ 'Classes', 'Fire & Ice', 'Workshops', 'Events' ];
    foreach ( $experience_categories as $term ) {
        if ( ! get_term_by( 'name', $term, 'experience_category' ) ) {
            wp_insert_term( $term, 'experience_category' );
        }
    }

    $activity_types = [
        'Yoga', 'Pilates', 'Barre', 'Sound Healing',
        'Breathwork', 'Meditation', 'Free Flow Session', 'Guided Session',
    ];
    foreach ( $activity_types as $term ) {
        if ( ! get_term_by( 'name', $term, 'activity_type' ) ) {
            wp_insert_term( $term, 'activity_type' );
        }
    }

    $space_types = [ 'Movement Space', 'Soul Space' ];
    foreach ( $space_types as $term ) {
        if ( ! get_term_by( 'name', $term, 'space_type' ) ) {
            wp_insert_term( $term, 'space_type' );
        }
    }
}
