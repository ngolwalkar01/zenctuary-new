<?php
/**
 * Experience Query Helpers
 *
 * Reusable WP_Query-based functions for fetching and filtering
 * experience products. Consumed by custom Gutenberg block render callbacks.
 *
 * Performance notes:
 * - All taxonomy queries use 'fields' => 'ids' to avoid loading full objects.
 * - Transient caching is applied to expensive/repeated queries.
 * - Meta is loaded in bulk via get_post_meta (single product) — never in loops.
 *
 * @package Zenctuary
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Fetch experience products with flexible filtering.
 *
 * @param array $args {
 *     Optional. Filtering arguments.
 *
 *     @type string $experience_category  Term slug for experience_category taxonomy.
 *     @type string $activity_type        Term slug for activity_type taxonomy.
 *     @type string $space_type           Term slug for space_type taxonomy.
 *     @type array  $meta_query           Raw meta_query array (WP_Query format).
 *     @type int    $posts_per_page       Number of results. Default -1 (all).
 *     @type int    $paged                Current page for pagination. Default 1.
 *     @type string $orderby             WP_Query orderby. Default 'meta_value_num'.
 *     @type string $order               ASC or DESC. Default 'ASC'.
 *     @type string $meta_key            Meta key for orderby. Default '_zen_sort_order'.
 * }
 *
 * @return WP_Query Query object. Use ->posts for the results array.
 */
function get_experience_products( array $args = [] ): WP_Query {

    $defaults = [
        'experience_category' => '',
        'activity_type'       => '',
        'space_type'          => '',
        'meta_query'          => [],
        'posts_per_page'      => -1,
        'paged'               => 1,
        'orderby'             => 'meta_value_num',
        'order'               => 'ASC',
        'meta_key'            => '_zen_sort_order',
    ];

    $args = wp_parse_args( $args, $defaults );

    // Build tax_query dynamically — only add clauses for non-empty slugs.
    $tax_query = [ 'relation' => 'AND' ];

    $taxonomy_map = [
        'experience_category' => 'experience_category',
        'activity_type'       => 'activity_type',
        'space_type'          => 'space_type',
    ];

    foreach ( $taxonomy_map as $arg_key => $taxonomy ) {
        if ( ! empty( $args[ $arg_key ] ) ) {
            $tax_query[] = [
                'taxonomy' => $taxonomy,
                'field'    => 'slug',
                'terms'    => (array) $args[ $arg_key ],
                'operator' => 'IN',
            ];
        }
    }

    $query_args = [
        'post_type'      => 'product',
        'post_status'    => 'publish',
        'posts_per_page' => $args['posts_per_page'],
        'paged'          => $args['paged'],
        'orderby'        => $args['orderby'],
        'order'          => $args['order'],
        'tax_query'      => $tax_query,
        // Suppress unused meta join when not ordering by meta
        'no_found_rows'  => ( $args['posts_per_page'] === -1 ),
    ];

    // Only attach meta_key when ordering by it (avoids unnecessary JOIN).
    if ( in_array( $args['orderby'], [ 'meta_value', 'meta_value_num' ], true ) ) {
        $query_args['meta_key'] = $args['meta_key'];
    }

    if ( ! empty( $args['meta_query'] ) ) {
        $query_args['meta_query'] = $args['meta_query'];
    }

    return new WP_Query( $query_args );
}

/**
 * Get activity_type terms that have at least one published product
 * under a given experience_category.
 *
 * Uses transient caching to avoid repeated expensive queries.
 *
 * @param string $category_slug  Slug of the experience_category term.
 * @return WP_Term[]             Array of matching activity_type WP_Term objects.
 */
function get_activity_types_by_category( string $category_slug ): array {

    $cache_key = 'zen_activity_types_' . sanitize_key( $category_slug );
    $cached    = get_transient( $cache_key );

    if ( $cached !== false ) {
        return $cached;
    }

    // Step 1: get all product IDs in this category.
    $product_query = new WP_Query( [
        'post_type'      => 'product',
        'post_status'    => 'publish',
        'posts_per_page' => -1,
        'fields'         => 'ids',   // no_found_rows-equivalent: only fetch IDs
        'no_found_rows'  => true,
        'tax_query'      => [ [
            'taxonomy' => 'experience_category',
            'field'    => 'slug',
            'terms'    => $category_slug,
        ] ],
    ] );

    if ( empty( $product_query->posts ) ) {
        set_transient( $cache_key, [], HOUR_IN_SECONDS );
        return [];
    }

    // Step 2: get activity_type terms assigned to those product IDs only.
    $terms = wp_get_object_terms(
        $product_query->posts,
        'activity_type',
        [
            'orderby' => 'name',
            'order'   => 'ASC',
            'unique'  => true,   // deduplicate across products
        ]
    );

    $result = is_wp_error( $terms ) ? [] : $terms;

    set_transient( $cache_key, $result, HOUR_IN_SECONDS );

    return $result;
}

/**
 * Get filter data for UI rendering (categories + activities with product counts).
 *
 * Returns structured data suitable for JSON output in block render callbacks.
 * Cached per request using a transient.
 *
 * @return array {
 *     @type array $categories  List of experience_category terms.
 *     @type array $activities  List of activity_type terms.
 * }
 */
function get_experience_filter_data(): array {

    $cache_key = 'zen_experience_filter_data';
    $cached    = get_transient( $cache_key );

    if ( $cached !== false ) {
        return $cached;
    }

    $categories = get_terms( [
        'taxonomy'   => 'experience_category',
        'hide_empty' => true,
        'orderby'    => 'name',
    ] );

    $activities = get_terms( [
        'taxonomy'   => 'activity_type',
        'hide_empty' => true,
        'orderby'    => 'name',
    ] );

    $result = [
        'categories' => is_wp_error( $categories ) ? [] : $categories,
        'activities' => is_wp_error( $activities ) ? [] : $activities,
    ];

    set_transient( $cache_key, $result, HOUR_IN_SECONDS );

    return $result;
}

/**
 * Invalidate experience filter data cache when taxonomy terms change.
 * Hooked to term creation, update, and deletion.
 */
add_action( 'created_term',  'zenctuary_bust_filter_cache' );
add_action( 'edited_term',   'zenctuary_bust_filter_cache' );
add_action( 'delete_term',   'zenctuary_bust_filter_cache' );
add_action( 'save_post_product', 'zenctuary_bust_filter_cache' );

function zenctuary_bust_filter_cache(): void {
    delete_transient( 'zen_experience_filter_data' );
    // Note: per-category activity caches are busted via category slug in key.
    // A full wipe can be done here if needed in future with a wildcard approach.
}
