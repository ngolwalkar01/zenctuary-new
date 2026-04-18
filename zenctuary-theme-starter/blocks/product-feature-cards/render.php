<?php
/**
 * Render callback for Product Feature Cards.
 *
 * @package Zenctuary
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'zenctuary_pfc_arrow_icon' ) ) {
	function zenctuary_pfc_arrow_icon(): string {
		return '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M10.8 4.1 15.7 9l-4.9 4.9-1.1-1.1 3.2-3.2H3.8V8.4h9.1L9.7 5.2z" fill="currentColor"/></svg>';
	}
}

if ( ! function_exists( 'zenctuary_pfc_clock_icon' ) ) {
	function zenctuary_pfc_clock_icon(): string {
		return '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M10 2.2a7.8 7.8 0 1 0 0 15.6 7.8 7.8 0 0 0 0-15.6Zm0 1.6a6.2 6.2 0 1 1 0 12.4 6.2 6.2 0 0 1 0-12.4Zm-.8 2.3h1.6v4.1l3 1.8-.8 1.4-3.8-2.2V6.1Z" fill="currentColor"/></svg>';
	}
}

if ( ! function_exists( 'zenctuary_pfc_clean_ids' ) ) {
	function zenctuary_pfc_clean_ids( $value ): array {
		if ( empty( $value ) || ! is_array( $value ) ) {
			return [];
		}

		return array_values( array_filter( array_map( 'absint', $value ) ) );
	}
}

if ( ! function_exists( 'zenctuary_pfc_excerpt' ) ) {
	function zenctuary_pfc_excerpt( int $product_id ): string {
		$custom_excerpt = get_post_meta( $product_id, '_card_excerpt', true );
		if ( '' !== trim( (string) $custom_excerpt ) ) {
			return (string) $custom_excerpt;
		}

		$legacy_excerpt = get_post_meta( $product_id, '_zen_short_description', true );
		if ( '' !== trim( (string) $legacy_excerpt ) ) {
			return (string) $legacy_excerpt;
		}

		$product = wc_get_product( $product_id );
		if ( $product && $product->get_short_description() ) {
			return wp_strip_all_tags( $product->get_short_description() );
		}

		$post = get_post( $product_id );
		if ( $post && has_excerpt( $post ) ) {
			return get_the_excerpt( $post );
		}

		return '';
	}
}

if ( ! function_exists( 'zenctuary_pfc_expect_content' ) ) {
	function zenctuary_pfc_expect_content( int $product_id ): string {
		$content = get_post_meta( $product_id, '_what_to_expect', true );

		if ( '' === trim( (string) $content ) ) {
			return '';
		}

		return wpautop( wp_kses_post( $content ) );
	}
}

if ( ! function_exists( 'zenctuary_pfc_zencoin_value' ) ) {
	function zenctuary_pfc_zencoin_value( WC_Product $product, string $source ): string {
		if ( 'none' === $source ) {
			return '';
		}

		if ( 'regular_price' === $source ) {
			return (string) $product->get_regular_price();
		}

		if ( 'sale_price' === $source ) {
			return (string) $product->get_sale_price();
		}

		$custom = get_post_meta( $product->get_id(), '_zencoin_value', true );
		if ( '' !== trim( (string) $custom ) ) {
			return (string) $custom;
		}

		$legacy = get_post_meta( $product->get_id(), '_zen_coins', true );
		if ( '' !== trim( (string) $legacy ) ) {
			return (string) $legacy;
		}

		return '';
	}
}

$query_mode         = sanitize_key( $attributes['queryMode'] ?? 'taxonomy' );
$taxonomy           = sanitize_key( $attributes['productTaxonomy'] ?? 'product_cat' );
$term_ids           = zenctuary_pfc_clean_ids( $attributes['termIds'] ?? [] );
$manual_product_ids = zenctuary_pfc_clean_ids( $attributes['manualProductIds'] ?? [] );
$exclude_ids        = zenctuary_pfc_clean_ids( $attributes['excludeProductIds'] ?? [] );
$products_to_show   = max( 1, absint( $attributes['productsToShow'] ?? 6 ) );
$order_by           = sanitize_key( $attributes['orderBy'] ?? 'date' );
$order              = 'ASC' === strtoupper( (string) ( $attributes['order'] ?? 'DESC' ) ) ? 'ASC' : 'DESC';
$offset             = max( 0, absint( $attributes['offset'] ?? 0 ) );
$hide_out_of_stock  = ! empty( $attributes['hideOutOfStock'] );
$only_featured      = ! empty( $attributes['onlyFeaturedProducts'] );
$preview_state      = sanitize_key( $attributes['previewState'] ?? 'collapsed' );
$allow_multiple     = ! empty( $attributes['allowMultipleExpanded'] );

if ( ! post_type_exists( 'product' ) || ! function_exists( 'wc_get_product' ) ) {
	echo '<div ' . get_block_wrapper_attributes() . '><p>' . esc_html__( 'WooCommerce is required for Product Feature Cards.', 'zenctuary' ) . '</p></div>';
	return;
}

$tax_query = [];
$meta_query = [];

if ( taxonomy_exists( $taxonomy ) && ! empty( $term_ids ) ) {
	$tax_query[] = [
		'taxonomy' => $taxonomy,
		'field'    => 'term_id',
		'terms'    => $term_ids,
	];
}

if ( $only_featured && taxonomy_exists( 'product_visibility' ) ) {
	$tax_query[] = [
		'taxonomy' => 'product_visibility',
		'field'    => 'name',
		'terms'    => [ 'featured' ],
	];
}

if ( $hide_out_of_stock ) {
	$meta_query[] = [
		'key'     => '_stock_status',
		'value'   => 'outofstock',
		'compare' => '!=',
	];
}

$query_args = [
	'post_type'           => 'product',
	'post_status'         => 'publish',
	'posts_per_page'      => $products_to_show,
	'orderby'             => in_array( $order_by, [ 'date', 'title', 'modified', 'rand', 'menu_order' ], true ) ? $order_by : 'date',
	'order'               => $order,
	'offset'              => $offset,
	'post__not_in'        => $exclude_ids,
	'ignore_sticky_posts' => true,
];

if ( ! empty( $tax_query ) ) {
	$query_args['tax_query'] = $tax_query;
}

if ( ! empty( $meta_query ) ) {
	$query_args['meta_query'] = $meta_query;
}

if ( 'manual' === $query_mode && ! empty( $manual_product_ids ) ) {
	$query_args['post__in'] = $manual_product_ids;
	$query_args['posts_per_page'] = count( $manual_product_ids );
	$query_args['orderby'] = 'post__in';
}

$query = new WP_Query( $query_args );
$posts = $query->posts;

if ( 'hybrid' === $query_mode && ! empty( $manual_product_ids ) && ! empty( $posts ) ) {
	$manual_positions = array_flip( $manual_product_ids );
	usort(
		$posts,
		static function ( WP_Post $a, WP_Post $b ) use ( $manual_positions ): int {
			$pos_a = $manual_positions[ $a->ID ] ?? 99999;
			$pos_b = $manual_positions[ $b->ID ] ?? 99999;

			if ( $pos_a === $pos_b ) {
				return 0;
			}

			return $pos_a < $pos_b ? -1 : 1;
		}
	);
}

$css_vars = [
	'--pfc-section-bg:' . esc_attr( $attributes['sectionBackgroundColor'] ?? '#3f3d3d' ),
	'--pfc-section-text:' . esc_attr( $attributes['sectionTextColor'] ?? '#f6f2ea' ),
	'--pfc-max-width:' . absint( $attributes['sectionMaxWidth'] ?? 1600 ) . 'px',
	'--pfc-pt:' . absint( $attributes['sectionPaddingTop'] ?? 88 ) . 'px',
	'--pfc-pb:' . absint( $attributes['sectionPaddingBottom'] ?? 88 ) . 'px',
	'--pfc-pl:' . absint( $attributes['sectionPaddingLeft'] ?? 40 ) . 'px',
	'--pfc-pr:' . absint( $attributes['sectionPaddingRight'] ?? 40 ) . 'px',
	'--pfc-mt:' . absint( $attributes['sectionMarginTop'] ?? 0 ) . 'px',
	'--pfc-mb:' . absint( $attributes['sectionMarginBottom'] ?? 0 ) . 'px',
	'--pfc-heading-color:' . esc_attr( $attributes['headingColor'] ?? '#d8b354' ),
	'--pfc-heading-size:' . absint( $attributes['headingFontSize'] ?? 36 ) . 'px',
	'--pfc-heading-weight:' . esc_attr( $attributes['headingFontWeight'] ?? '700' ),
	'--pfc-heading-transform:' . esc_attr( $attributes['headingTextTransform'] ?? 'uppercase' ),
	'--pfc-intro-color:' . esc_attr( $attributes['introColor'] ?? '#f6f2ea' ),
	'--pfc-intro-size:' . absint( $attributes['introFontSize'] ?? 18 ) . 'px',
	'--pfc-intro-line:' . esc_attr( $attributes['introLineHeight'] ?? 1.6 ),
	'--pfc-heading-gap:' . absint( $attributes['headingBottomSpacing'] ?? 18 ) . 'px',
	'--pfc-intro-gap:' . absint( $attributes['introBottomSpacing'] ?? 38 ) . 'px',
	'--pfc-card-width:' . absint( $attributes['cardWidth'] ?? 620 ) . 'px',
	'--pfc-card-max-width:' . absint( $attributes['cardMaxWidth'] ?? 680 ) . 'px',
	'--pfc-card-height:' . absint( $attributes['cardHeight'] ?? 980 ) . 'px',
	'--pfc-card-height-tablet:' . absint( $attributes['cardHeightTablet'] ?? 860 ) . 'px',
	'--pfc-card-height-mobile:' . absint( $attributes['cardHeightMobile'] ?? 760 ) . 'px',
	'--pfc-gap:' . absint( $attributes['cardGapDesktop'] ?? 36 ) . 'px',
	'--pfc-gap-tablet:' . absint( $attributes['cardGapTablet'] ?? 26 ) . 'px',
	'--pfc-gap-mobile:' . absint( $attributes['cardGapMobile'] ?? 18 ) . 'px',
	'--pfc-slides-desktop:' . max( 1, (float) ( $attributes['slidesPerViewDesktop'] ?? 2 ) ),
	'--pfc-slides-tablet:' . max( 1, (float) ( $attributes['slidesPerViewTablet'] ?? 1.35 ) ),
	'--pfc-slides-mobile:' . max( 1, (float) ( $attributes['slidesPerViewMobile'] ?? 1.08 ) ),
	'--pfc-card-radius:' . absint( $attributes['cardBorderRadius'] ?? 28 ) . 'px',
	'--pfc-card-border-color:' . esc_attr( $attributes['cardBorderColor'] ?? 'rgba(246, 242, 234, 0.58)' ),
	'--pfc-card-border-width:' . absint( $attributes['cardBorderWidth'] ?? 2 ) . 'px',
	'--pfc-card-shadow:' . esc_attr( $attributes['cardShadow'] ?? 'none' ),
	'--pfc-overlay-color:' . esc_attr( $attributes['cardOverlayColor'] ?? '#20201f' ),
	'--pfc-overlay-opacity:' . esc_attr( $attributes['cardOverlayOpacity'] ?? 0.4 ),
	'--pfc-strip-height:' . absint( $attributes['topStripHeight'] ?? 108 ) . 'px',
	'--pfc-strip-bg:' . esc_attr( $attributes['topStripBackgroundColor'] ?? '#3f3d3d' ),
	'--pfc-strip-px:' . absint( $attributes['topStripPaddingX'] ?? 30 ) . 'px',
	'--pfc-strip-py:' . absint( $attributes['topStripPaddingY'] ?? 18 ) . 'px',
	'--pfc-strip-justify:' . ( 'end' === ( $attributes['topStripAlignment'] ?? 'center' ) ? 'flex-end' : ( 'start' === ( $attributes['topStripAlignment'] ?? 'center' ) ? 'flex-start' : 'center' ) ),
	'--pfc-zc-label-color:' . esc_attr( $attributes['zencoinLabelColor'] ?? '#d8b354' ),
	'--pfc-zc-label-size:' . absint( $attributes['zencoinLabelFontSize'] ?? 24 ) . 'px',
	'--pfc-zc-label-weight:' . esc_attr( $attributes['zencoinLabelFontWeight'] ?? '700' ),
	'--pfc-zc-value-color:' . esc_attr( $attributes['zencoinValueColor'] ?? '#3f3d3d' ),
	'--pfc-zc-value-size:' . absint( $attributes['zencoinValueFontSize'] ?? 22 ) . 'px',
	'--pfc-zc-value-weight:' . esc_attr( $attributes['zencoinValueFontWeight'] ?? '700' ),
	'--pfc-zc-badge-size:' . absint( $attributes['zencoinBadgeSize'] ?? 56 ) . 'px',
	'--pfc-zc-badge-border-width:' . absint( $attributes['zencoinBadgeBorderWidth'] ?? 2 ) . 'px',
	'--pfc-zc-badge-border-color:' . esc_attr( $attributes['zencoinBadgeBorderColor'] ?? '#d8b354' ),
	'--pfc-zc-badge-bg:' . esc_attr( $attributes['zencoinBadgeBackgroundColor'] ?? '#d8b354' ),
	'--pfc-zc-gap:' . absint( $attributes['zencoinGap'] ?? 16 ) . 'px',
	'--pfc-content-px:' . absint( $attributes['contentPaddingX'] ?? 52 ) . 'px',
	'--pfc-content-pt:' . absint( $attributes['contentPaddingTop'] ?? 50 ) . 'px',
	'--pfc-content-pb:' . absint( $attributes['contentPaddingBottom'] ?? 32 ) . 'px',
	'--pfc-title-color:' . esc_attr( $attributes['titleColor'] ?? '#ffffff' ),
	'--pfc-title-size:' . absint( $attributes['titleFontSize'] ?? 58 ) . 'px',
	'--pfc-title-weight:' . esc_attr( $attributes['titleFontWeight'] ?? '700' ),
	'--pfc-title-line:' . esc_attr( $attributes['titleLineHeight'] ?? 1.06 ),
	'--pfc-title-ls:' . (float) ( $attributes['titleLetterSpacing'] ?? 0 ) . 'px',
	'--pfc-title-transform:' . esc_attr( $attributes['titleTextTransform'] ?? 'uppercase' ),
	'--pfc-title-gap:' . absint( $attributes['titleBottomSpacing'] ?? 28 ) . 'px',
	'--pfc-session-icon-size:' . absint( $attributes['sessionIconSize'] ?? 18 ) . 'px',
	'--pfc-session-icon-color:' . esc_attr( $attributes['sessionIconColor'] ?? '#3f3d3d' ),
	'--pfc-session-badge-bg:' . esc_attr( $attributes['sessionBadgeBackground'] ?? '#d8b354' ),
	'--pfc-session-color:' . esc_attr( $attributes['sessionTextColor'] ?? '#f6f2ea' ),
	'--pfc-session-size:' . absint( $attributes['sessionFontSize'] ?? 18 ) . 'px',
	'--pfc-session-weight:' . esc_attr( $attributes['sessionFontWeight'] ?? '400' ),
	'--pfc-session-gap:' . absint( $attributes['sessionGap'] ?? 12 ) . 'px',
	'--pfc-session-bottom:' . absint( $attributes['sessionBottomSpacing'] ?? 28 ) . 'px',
	'--pfc-excerpt-color:' . esc_attr( $attributes['excerptColor'] ?? '#f6f2ea' ),
	'--pfc-excerpt-size:' . absint( $attributes['excerptFontSize'] ?? 19 ) . 'px',
	'--pfc-excerpt-line:' . esc_attr( $attributes['excerptLineHeight'] ?? 1.5 ),
	'--pfc-excerpt-max:' . absint( $attributes['excerptMaxWidth'] ?? 470 ) . 'px',
	'--pfc-excerpt-bottom:' . absint( $attributes['excerptBottomSpacing'] ?? 32 ) . 'px',
	'--pfc-cta-color:' . esc_attr( $attributes['ctaTextColor'] ?? '#d8b354' ),
	'--pfc-cta-bg:' . esc_attr( $attributes['ctaBackgroundColor'] ?? '#3f3d3d' ),
	'--pfc-cta-border-color:' . esc_attr( $attributes['ctaBorderColor'] ?? '#d8b354' ),
	'--pfc-cta-border-width:' . absint( $attributes['ctaBorderWidth'] ?? 2 ) . 'px',
	'--pfc-cta-radius:' . absint( $attributes['ctaBorderRadius'] ?? 999 ) . 'px',
	'--pfc-cta-size:' . absint( $attributes['ctaFontSize'] ?? 18 ) . 'px',
	'--pfc-cta-weight:' . esc_attr( $attributes['ctaFontWeight'] ?? '700' ),
	'--pfc-cta-py:' . absint( $attributes['ctaPaddingY'] ?? 18 ) . 'px',
	'--pfc-cta-px:' . absint( $attributes['ctaPaddingX'] ?? 42 ) . 'px',
	'--pfc-divider-color:' . esc_attr( $attributes['dividerColor'] ?? 'rgba(246, 242, 234, 0.7)' ),
	'--pfc-divider-thickness:' . absint( $attributes['dividerThickness'] ?? 2 ) . 'px',
	'--pfc-divider-top:' . absint( $attributes['dividerTopSpacing'] ?? 40 ) . 'px',
	'--pfc-divider-bottom:' . absint( $attributes['dividerBottomSpacing'] ?? 22 ) . 'px',
	'--pfc-expand-label-color:' . esc_attr( $attributes['expandLabelColor'] ?? '#f6f2ea' ),
	'--pfc-expand-label-size:' . absint( $attributes['expandLabelFontSize'] ?? 18 ) . 'px',
	'--pfc-expand-label-weight:' . esc_attr( $attributes['expandLabelFontWeight'] ?? '700' ),
	'--pfc-expand-icon-size:' . absint( $attributes['expandIconSize'] ?? 28 ) . 'px',
	'--pfc-expand-icon-color:' . esc_attr( $attributes['expandIconColor'] ?? '#f6f2ea' ),
	'--pfc-expand-row-py:' . absint( $attributes['expandRowPaddingY'] ?? 8 ) . 'px',
	'--pfc-expanded-color:' . esc_attr( $attributes['expandedContentColor'] ?? '#f6f2ea' ),
	'--pfc-expanded-size:' . absint( $attributes['expandedContentFontSize'] ?? 16 ) . 'px',
	'--pfc-expanded-line:' . esc_attr( $attributes['expandedContentLineHeight'] ?? 1.6 ),
	'--pfc-expanded-top:' . absint( $attributes['expandedContentSpacingTop'] ?? 18 ) . 'px',
	'--pfc-expanded-max:' . absint( $attributes['expandedContentMaxHeight'] ?? 260 ) . 'px',
];

$wrapper_attributes = get_block_wrapper_attributes(
	[
		'class' => 'product-feature-cards align' . esc_attr( $attributes['contentAlignment'] ?? 'start' ) . ( 'expanded' === $preview_state ? ' is-preview-expanded' : ' is-preview-collapsed' ),
		'style' => implode( ';', $css_vars ),
	]
);
?>

<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<div class="pfc__inner">
		<?php if ( ! empty( $attributes['sectionHeading'] ) || ! empty( $attributes['sectionIntro'] ) ) : ?>
			<header class="pfc__header">
				<?php if ( ! empty( $attributes['sectionHeading'] ) ) : ?>
					<h2 class="pfc__heading"><?php echo esc_html( $attributes['sectionHeading'] ); ?></h2>
				<?php endif; ?>
				<?php if ( ! empty( $attributes['sectionIntro'] ) ) : ?>
					<p class="pfc__intro"><?php echo esc_html( $attributes['sectionIntro'] ); ?></p>
				<?php endif; ?>
			</header>
		<?php endif; ?>

		<div class="pfc__rail-shell">
			<?php if ( ! empty( $attributes['showArrows'] ) ) : ?>
				<div class="pfc__nav">
					<button type="button" class="pfc__arrow pfc__arrow--prev" aria-label="<?php esc_attr_e( 'Previous products', 'zenctuary' ); ?>">
						<span class="pfc__arrow-icon"><?php echo wp_kses_post( zenctuary_pfc_arrow_icon() ); ?></span>
					</button>
					<button type="button" class="pfc__arrow pfc__arrow--next" aria-label="<?php esc_attr_e( 'Next products', 'zenctuary' ); ?>">
						<span class="pfc__arrow-icon"><?php echo wp_kses_post( zenctuary_pfc_arrow_icon() ); ?></span>
					</button>
				</div>
			<?php endif; ?>

			<div
				class="pfc__viewport"
				data-loop="<?php echo esc_attr( ! empty( $attributes['enableLoop'] ) ? 'true' : 'false' ); ?>"
				data-drag="<?php echo esc_attr( ! empty( $attributes['enableDrag'] ) ? 'true' : 'false' ); ?>"
				data-autoplay="<?php echo esc_attr( ! empty( $attributes['autoplay'] ) ? 'true' : 'false' ); ?>"
				data-autoplay-speed="<?php echo esc_attr( absint( $attributes['autoplaySpeed'] ?? 4500 ) ); ?>"
				data-allow-multiple="<?php echo esc_attr( $allow_multiple ? 'true' : 'false' ); ?>"
			>
				<div class="pfc__track">
					<?php if ( empty( $posts ) ) : ?>
						<div class="pfc__empty"><?php esc_html_e( 'No products matched this selection.', 'zenctuary' ); ?></div>
					<?php else : ?>
						<?php foreach ( $posts as $index => $post ) : ?>
							<?php
							$product = wc_get_product( $post->ID );
							if ( ! $product ) {
								continue;
							}

							$session_time     = (string) get_post_meta( $post->ID, '_session_time', true );
							$card_excerpt     = zenctuary_pfc_excerpt( $post->ID );
							$what_to_expect   = zenctuary_pfc_expect_content( $post->ID );
							$zencoin_value    = zenctuary_pfc_zencoin_value( $product, sanitize_key( $attributes['zencoinSource'] ?? 'custom' ) );
							$image_url        = get_the_post_thumbnail_url( $post, 'large' );
							$expanded_default = 'expanded' === $preview_state && 0 === $index;
							$panel_id         = 'pfc-expect-' . $post->ID . '-' . wp_unique_id();
							?>
							<article class="pfc__card<?php echo $expanded_default ? ' is-expanded' : ''; ?>">
								<div class="pfc__top-strip">
									<div class="pfc__zencoin">
										<?php if ( ! empty( $attributes['zencoinLabel'] ) ) : ?>
											<span class="pfc__zencoin-label"><?php echo esc_html( $attributes['zencoinLabel'] ); ?></span>
										<?php endif; ?>
										<?php if ( '' !== $zencoin_value ) : ?>
											<span class="pfc__zencoin-badge">
												<span class="pfc__zencoin-badge-ring" aria-hidden="true"></span>
												<span class="pfc__zencoin-badge-value"><?php echo esc_html( $zencoin_value ); ?></span>
											</span>
										<?php endif; ?>
									</div>
								</div>

								<div class="pfc__media-area">
									<?php if ( $image_url ) : ?>
										<img class="pfc__image" src="<?php echo esc_url( $image_url ); ?>" alt="<?php echo esc_attr( get_the_title( $post ) ); ?>" loading="lazy" />
									<?php endif; ?>
									<div class="pfc__overlay" aria-hidden="true"></div>

									<div class="pfc__content">
										<h3 class="pfc__title"><?php echo esc_html( get_the_title( $post ) ); ?></h3>

										<?php if ( $session_time ) : ?>
											<div class="pfc__session-row">
												<?php if ( ! empty( $attributes['showSessionIcon'] ) ) : ?>
													<span class="pfc__session-icon-badge" aria-hidden="true">
														<?php echo wp_kses_post( zenctuary_pfc_clock_icon() ); ?>
													</span>
												<?php endif; ?>
												<span class="pfc__session-text"><?php echo esc_html( $session_time ); ?></span>
											</div>
										<?php endif; ?>

										<?php if ( $card_excerpt ) : ?>
											<div class="pfc__excerpt"><?php echo wp_kses_post( wpautop( esc_html( $card_excerpt ) ) ); ?></div>
										<?php endif; ?>

										<a class="pfc__cta<?php echo ! empty( $attributes['ctaShowIcon'] ) && 'left' === ( $attributes['ctaIconPosition'] ?? 'right' ) ? ' is-icon-left' : ''; ?>" href="<?php echo esc_url( get_permalink( $post ) ); ?>">
											<?php if ( ! empty( $attributes['ctaShowIcon'] ) ) : ?>
												<span class="pfc__cta-icon"><?php echo wp_kses_post( zenctuary_pfc_arrow_icon() ); ?></span>
											<?php endif; ?>
											<span class="pfc__cta-label"><?php echo esc_html( $attributes['ctaLabel'] ?? __( 'Book Now', 'zenctuary' ) ); ?></span>
										</a>

										<div class="pfc__expect">
											<div class="pfc__divider" aria-hidden="true"></div>
											<button
												type="button"
												class="pfc__expect-toggle"
												aria-expanded="<?php echo $expanded_default ? 'true' : 'false'; ?>"
												aria-controls="<?php echo esc_attr( $panel_id ); ?>"
											>
												<span class="pfc__expect-label"><?php echo esc_html( $attributes['expandLabel'] ?? __( 'What to expect', 'zenctuary' ) ); ?></span>
												<span class="pfc__expect-icon" aria-hidden="true">
													<span class="pfc__expect-icon-plus">+</span>
													<span class="pfc__expect-icon-minus">−</span>
												</span>
											</button>
											<div id="<?php echo esc_attr( $panel_id ); ?>" class="pfc__expect-panel" <?php echo $expanded_default ? '' : 'hidden'; ?>>
												<div class="pfc__expect-panel-inner">
													<?php if ( $what_to_expect ) : ?>
														<?php echo wp_kses_post( $what_to_expect ); ?>
													<?php else : ?>
														<p><?php esc_html_e( 'Add What to Expect content in the product editor to show details here.', 'zenctuary' ); ?></p>
													<?php endif; ?>
												</div>
											</div>
										</div>
									</div>
								</div>
							</article>
						<?php endforeach; ?>
					<?php endif; ?>
				</div>
			</div>
		</div>
	</div>
</section>
<?php
wp_reset_postdata();
