<?php
/**
 * Experience Grouping Helpers
 *
 * Functions that take a flat array of WP_Post products and
 * group them by taxonomy (activity_type or space_type).
 *
 * These avoid additional DB queries by using already-fetched term data,
 * preventing N+1 query patterns in accordion and card block rendering.
 *
 * @package Zenctuary
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Group a flat array of products by their activity_type term.
 *
 * Returns an associative array keyed by term slug, where each value
 * contains the WP_Term and the products assigned to it.
 *
 * Avoids N+1 by fetching all term relationships in one
 * wp_get_object_terms call for all post IDs at once.
 *
 * @param WP_Post[] $products  Array of WP_Post product objects.
 * @return array {
 *     Keyed by activity_type slug:
 *     @type WP_Term  $term      The activity_type term.
 *     @type WP_Post[] $products  Products in this activity group.
 * }
 */
function group_products_by_activity( array $products ): array {

    if ( empty( $products ) ) {
        return [];
    }

    $post_ids = wp_list_pluck( $products, 'ID' );

    // Fetch all activity_type terms for ALL posts in a single query.
    $all_terms = wp_get_object_terms( $post_ids, 'activity_type', [
        'orderby' => 'name',
        'order'   => 'ASC',
    ] );

    if ( is_wp_error( $all_terms ) || empty( $all_terms ) ) {
        return [];
    }

    // Build a map: post_id => [ term_slug, ... ]
    $post_term_map = [];
    foreach ( $all_terms as $term ) {
        if ( ! isset( $term->object_id ) ) {
            continue;
        }
        $post_term_map[ $term->object_id ][] = $term->slug;
    }

    // Build unique terms index keyed by slug (preserving term object).
    $terms_index = [];
    foreach ( $all_terms as $term ) {
        $terms_index[ $term->slug ] = $term;
    }

    // Assemble final grouped structure.
    $grouped = [];

    foreach ( $terms_index as $slug => $term ) {
        $grouped[ $slug ] = [
            'term'     => $term,
            'products' => [],
        ];
    }

    foreach ( $products as $product ) {
        $product_slugs = $post_term_map[ $product->ID ] ?? [];
        foreach ( $product_slugs as $slug ) {
            if ( isset( $grouped[ $slug ] ) ) {
                $grouped[ $slug ]['products'][] = $product;
            }
        }
    }

    return $grouped;
}

/**
 * Group a flat array of products by their space_type term.
 *
 * Same approach as group_products_by_activity() but for space grouping.
 * Used in accordion layouts like:
 *   Movement Space → [Yoga, Pilates, ...]
 *   Soul Space     → [Breathwork, Meditation, ...]
 *
 * @param WP_Post[] $products  Array of WP_Post product objects.
 * @return array {
 *     Keyed by space_type slug:
 *     @type WP_Term   $term      The space_type term.
 *     @type WP_Post[] $products  Products in this space group.
 * }
 */
function group_products_by_space( array $products ): array {

    if ( empty( $products ) ) {
        return [];
    }

    $post_ids = wp_list_pluck( $products, 'ID' );

    $all_terms = wp_get_object_terms( $post_ids, 'space_type', [
        'orderby' => 'name',
        'order'   => 'ASC',
    ] );

    if ( is_wp_error( $all_terms ) || empty( $all_terms ) ) {
        return [];
    }

    // Build post → term slug map.
    $post_term_map = [];
    foreach ( $all_terms as $term ) {
        if ( ! isset( $term->object_id ) ) {
            continue;
        }
        $post_term_map[ $term->object_id ][] = $term->slug;
    }

    $terms_index = [];
    foreach ( $all_terms as $term ) {
        $terms_index[ $term->slug ] = $term;
    }

    $grouped = [];

    foreach ( $terms_index as $slug => $term ) {
        $grouped[ $slug ] = [
            'term'     => $term,
            'products' => [],
        ];
    }

    foreach ( $products as $product ) {
        $product_slugs = $post_term_map[ $product->ID ] ?? [];
        foreach ( $product_slugs as $slug ) {
            if ( isset( $grouped[ $slug ] ) ) {
                $grouped[ $slug ]['products'][] = $product;
            }
        }
    }

    return $grouped;
}

/**
 * Deeply group products by space_type → then by activity_type.
 *
 * Used for the Classes accordion layout:
 *   Movement Space
 *     └── Yoga → [products]
 *     └── Pilates → [products]
 *   Soul Space
 *     └── Breathwork → [products]
 *     └── Meditation → [products]
 *
 * @param WP_Post[] $products  Flat array of product post objects.
 * @return array  Nested: space_slug → { term, groups: activity_slug → { term, products } }
 */
function group_products_by_space_then_activity( array $products ): array {

    if ( empty( $products ) ) {
        return [];
    }

    // Group by space first, then apply activity grouping within each space.
    $by_space = group_products_by_space( $products );

    foreach ( $by_space as $space_slug => &$space_group ) {
        $space_group['groups'] = group_products_by_activity( $space_group['products'] );
    }
    unset( $space_group );

    return $by_space;
}

/**
 * Retrieve sanitized meta fields for a single product.
 *
 * Returns all Zenctuary meta as a flat associative array.
 * Use this in render callbacks instead of individual get_post_meta calls.
 *
 * @param int $product_id  WP_Post ID of the product.
 * @return array
 */
function get_experience_meta( int $product_id ): array {
    return [
        'duration'          => get_post_meta( $product_id, '_zen_duration', true ),
        'instructor_name'   => get_post_meta( $product_id, '_zen_instructor_name', true ),
        'difficulty_level'  => get_post_meta( $product_id, '_zen_difficulty_level', true ),
        'language'          => get_post_meta( $product_id, '_zen_language', true ),
        'zen_coins'         => (int) get_post_meta( $product_id, '_zen_coins', true ),
        'short_description' => get_post_meta( $product_id, '_zen_short_description', true ),
        'badge_label'       => get_post_meta( $product_id, '_zen_badge_label', true ),
        'sort_order'        => (int) get_post_meta( $product_id, '_zen_sort_order', true ),
    ];
}

/**
 * Generic: group a flat array of products by any given taxonomy.
 *
 * This is the flexible version used by the experience-space block so
 * the admin can choose any taxonomy for primary or sub grouping.
 *
 * Uses a single bulk wp_get_object_terms() call — no N+1.
 *
 * @param WP_Post[] $products  Flat array of WP_Post objects.
 * @param string    $taxonomy  Taxonomy slug to group by.
 * @return array {
 *     Keyed by term slug:
 *     @type WP_Term   $term      The term object.
 *     @type int       $order     The term's sort order (from _zen_sort_order term meta, if set).
 *     @type WP_Post[] $products  Products assigned to this term.
 * }
 */
function group_products_by_taxonomy( array $products, string $taxonomy ): array {

    if ( empty( $products ) || empty( $taxonomy ) ) {
        return [];
    }

    $post_ids = wp_list_pluck( $products, 'ID' );

    // 'all_with_object_id' ensures object_id is always set on each returned term.
    // Without this, WordPress may return cached term objects that lack object_id,
    // which breaks the post→term mapping and causes products to silently disappear.
    $all_terms = wp_get_object_terms( $post_ids, $taxonomy, [
        'orderby' => 'name',
        'order'   => 'ASC',
        'fields'  => 'all_with_object_id',
    ] );

    if ( is_wp_error( $all_terms ) || empty( $all_terms ) ) {
        return [];
    }

    // Map: post_id => [ slug, ... ]
    $post_term_map = [];
    foreach ( $all_terms as $term ) {
        if ( isset( $term->object_id ) ) {
            $post_term_map[ $term->object_id ][] = $term->slug;
        }
    }

    // Unique term index keyed by slug.
    $terms_index = [];
    foreach ( $all_terms as $term ) {
        $terms_index[ $term->slug ] = $term;
    }

    // Initialise grouped structure.
    $grouped = [];
    foreach ( $terms_index as $slug => $term ) {
        $grouped[ $slug ] = [
            'term'     => $term,
            'products' => [],
        ];
    }

    // Populate products into their term buckets.
    foreach ( $products as $product ) {
        $slugs = $post_term_map[ $product->ID ] ?? [];
        foreach ( $slugs as $slug ) {
            if ( isset( $grouped[ $slug ] ) ) {
                $grouped[ $slug ]['products'][] = $product;
            }
        }
    }

    return $grouped;
}


/**
 * Two-level flexible grouping: primary taxonomy → sub taxonomy → products.
 *
 * @param WP_Post[] $products          Flat product array.
 * @param string    $primary_taxonomy  Outer group (e.g., 'space_type').
 * @param string    $sub_taxonomy      Inner accordion (e.g., 'activity_type').
 * @return array  primary_slug → { term, groups: sub_slug → { term, products } }
 */
function group_products_nested( array $products, string $primary_taxonomy, string $sub_taxonomy ): array {

    if ( empty( $products ) ) {
        return [];
    }

    $by_primary = group_products_by_taxonomy( $products, $primary_taxonomy );

    foreach ( $by_primary as $slug => &$group ) {
        $group['groups'] = group_products_by_taxonomy( $group['products'], $sub_taxonomy );
    }
    unset( $group );

    return $by_primary;
}

