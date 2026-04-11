<?php
/**
 * Block Integration Examples
 *
 * This file contains reference render callback implementations
 * for custom Gutenberg blocks that consume the experience query layer.
 *
 * These are examples — copy the relevant callback into your specific
 * block's render_callback registration.
 *
 * @package Zenctuary
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// ============================================================
// EXAMPLE 1: Accordion Block — Classes Page
//
// Input:    experience_category = 'classes'
// Groups:   space_type → activity_type → products
//
// Renders:
//   [Movement Space]
//     [Yoga]  product list
//     [Pilates] product list
//   [Soul Space]
//     [Breathwork] product list
// ============================================================

function zenctuary_render_accordion_block( array $attributes ): string {

    $category_slug = sanitize_key( $attributes['category'] ?? 'classes' );

    // Single optimised query — no N+1.
    $query = get_experience_products( [
        'experience_category' => $category_slug,
    ] );

    if ( empty( $query->posts ) ) {
        return '<p>' . esc_html__( 'No experiences found.', 'zenctuary' ) . '</p>';
    }

    // Nest: space → activity → products (2 bulk taxonomy queries total).
    $grouped = group_products_by_space_then_activity( $query->posts );

    ob_start();

    foreach ( $grouped as $space_slug => $space_data ) {
        $space_name = esc_html( $space_data['term']->name );
        echo '<section class="zen-space-group" data-space="' . esc_attr( $space_slug ) . '">';
        echo '<h2 class="zen-space-title">' . $space_name . '</h2>';

        foreach ( $space_data['groups'] as $activity_slug => $activity_data ) {
            $activity_name = esc_html( $activity_data['term']->name );
            echo '<details class="zen-faq-accordion zen-activity-accordion">';
            echo '<summary>' . $activity_name . '</summary>';
            echo '<ul class="zen-experience-list">';

            foreach ( $activity_data['products'] as $product ) {
                $meta = get_experience_meta( $product->ID );
                echo '<li class="zen-experience-item">';
                echo '<strong>' . esc_html( get_the_title( $product ) ) . '</strong>';
                if ( $meta['duration'] ) {
                    echo ' <span class="zen-duration">' . esc_html( $meta['duration'] ) . '</span>';
                }
                if ( $meta['zen_coins'] ) {
                    echo ' <span class="zen-coins">' . (int) $meta['zen_coins'] . ' Zencoins</span>';
                }
                echo '</li>';
            }

            echo '</ul>';
            echo '</details>';
        }

        echo '</section>';
    }

    return ob_get_clean();
}


// ============================================================
// EXAMPLE 2: Cards Block — Fire & Ice Page
//
// Input:    experience_category = 'fire-ice'
// Groups:   activity_type (flat — no space hierarchy needed here)
//
// Renders:
//   [Guided Session group]
//     card card card
// ============================================================

function zenctuary_render_cards_block( array $attributes ): string {

    $category_slug = sanitize_key( $attributes['category'] ?? 'fire-ice' );

    $query = get_experience_products( [
        'experience_category' => $category_slug,
    ] );

    if ( empty( $query->posts ) ) {
        return '<p>' . esc_html__( 'No experiences found.', 'zenctuary' ) . '</p>';
    }

    // Group by activity only (no space level needed for Fire & Ice).
    $grouped = group_products_by_activity( $query->posts );

    ob_start();

    foreach ( $grouped as $activity_slug => $activity_data ) {
        $activity_name = esc_html( $activity_data['term']->name );
        echo '<section class="zen-activity-group" data-activity="' . esc_attr( $activity_slug ) . '">';
        echo '<h3 class="zen-activity-title">' . $activity_name . '</h3>';
        echo '<div class="zen-cards-grid">';

        foreach ( $activity_data['products'] as $product ) {
            $meta = get_experience_meta( $product->ID );
            $link = get_permalink( $product->ID );

            echo '<a class="zen-card" href="' . esc_url( $link ) . '">';

            if ( ! empty( $meta['badge_label'] ) ) {
                echo '<span class="zen-card__badge">' . esc_html( $meta['badge_label'] ) . '</span>';
            }

            echo '<h4 class="zen-card__title">' . esc_html( get_the_title( $product ) ) . '</h4>';

            if ( ! empty( $meta['short_description'] ) ) {
                echo '<p class="zen-card__desc">' . esc_html( $meta['short_description'] ) . '</p>';
            }

            if ( $meta['zen_coins'] ) {
                echo '<p class="zen-card__coins">' . (int) $meta['zen_coins'] . ' Zencoins</p>';
            }

            echo '</a>';
        }

        echo '</div>';
        echo '</section>';
    }

    return ob_get_clean();
}


// ============================================================
// EXAMPLE 3: Filter + Schedule Block
//
// Input:    category (from UI), activity (from UI)
// Returns:  filtered list of matching products
//
// The block attributes drive the query — no hardcoded logic.
// ============================================================

function zenctuary_render_schedule_block( array $attributes ): string {

    $category_slug = sanitize_key( $attributes['category'] ?? '' );
    $activity_slug = sanitize_key( $attributes['activity'] ?? '' );

    // Build filter UI data (cached).
    $filter_data = get_experience_filter_data();

    // Query with the selected filters.
    $query = get_experience_products( [
        'experience_category' => $category_slug,
        'activity_type'       => $activity_slug,
    ] );

    ob_start();

    // ----- Filter UI -----
    echo '<div class="zen-filter-bar">';

    echo '<select class="zen-filter-select" name="category" data-filter="category">';
    echo '<option value="">' . esc_html__( 'All Categories', 'zenctuary' ) . '</option>';
    foreach ( $filter_data['categories'] as $term ) {
        $selected = selected( $category_slug, $term->slug, false );
        echo '<option value="' . esc_attr( $term->slug ) . '"' . $selected . '>' . esc_html( $term->name ) . '</option>';
    }
    echo '</select>';

    echo '<select class="zen-filter-select" name="activity" data-filter="activity">';
    echo '<option value="">' . esc_html__( 'All Activities', 'zenctuary' ) . '</option>';
    foreach ( $filter_data['activities'] as $term ) {
        $selected = selected( $activity_slug, $term->slug, false );
        echo '<option value="' . esc_attr( $term->slug ) . '"' . $selected . '>' . esc_html( $term->name ) . '</option>';
    }
    echo '</select>';

    echo '</div>';

    // ----- Product List -----
    if ( empty( $query->posts ) ) {
        echo '<p class="zen-no-results">' . esc_html__( 'No experiences match your selection.', 'zenctuary' ) . '</p>';
    } else {
        echo '<ul class="zen-schedule-list">';
        foreach ( $query->posts as $product ) {
            $meta = get_experience_meta( $product->ID );
            echo '<li class="zen-schedule-item">';
            echo '<span class="zen-schedule-title">' . esc_html( get_the_title( $product ) ) . '</span>';
            if ( $meta['duration'] ) {
                echo '<span class="zen-schedule-duration">' . esc_html( $meta['duration'] ) . '</span>';
            }
            if ( $meta['instructor_name'] ) {
                echo '<span class="zen-schedule-instructor">' . esc_html( $meta['instructor_name'] ) . '</span>';
            }
            echo '</li>';
        }
        echo '</ul>';
    }

    return ob_get_clean();
}
