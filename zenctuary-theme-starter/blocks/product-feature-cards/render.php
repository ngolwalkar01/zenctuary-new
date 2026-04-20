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

if ( ! function_exists( 'zenctuary_pfc_ideal_for' ) ) {
	function zenctuary_pfc_ideal_for( int $product_id ): string {
		$ideal_for = (string) get_post_meta( $product_id, '_ideal_for', true );
		if ( '' !== trim( $ideal_for ) ) {
			return $ideal_for;
		}

		$product = wc_get_product( $product_id );
		if ( $product && $product->get_short_description() ) {
			return wp_strip_all_tags( $product->get_short_description() );
		}

		return '';
	}
}

if ( ! function_exists( 'zenctuary_pfc_expect_content' ) ) {
	function zenctuary_pfc_expect_content( int $product_id ): string {
		$content = (string) get_post_meta( $product_id, '_what_to_expect', true );

		if ( '' === trim( $content ) ) {
			return '';
		}

		return wpautop( wp_kses_post( $content ) );
	}
}

if ( ! function_exists( 'zenctuary_pfc_zencoin_value' ) ) {
	function zenctuary_pfc_zencoin_value( int $product_id ): string {
		return (string) get_post_meta( $product_id, '_zencoin_value', true );
	}
}

$query_mode         = sanitize_key( $attributes['queryMode'] ?? 'taxonomy' );
$product_taxonomy   = sanitize_key( $attributes['productTaxonomy'] ?? 'product_cat' );
$term_ids           = zenctuary_pfc_clean_ids( $attributes['termIds'] ?? [] );
$manual_product_ids = zenctuary_pfc_clean_ids( $attributes['manualProductIds'] ?? [] );
$products_to_show   = max( 1, absint( $attributes['productsToShow'] ?? 2 ) );
$order_by           = sanitize_key( $attributes['orderBy'] ?? 'date' );
$order              = 'DESC' === strtoupper( (string) ( $attributes['order'] ?? 'ASC' ) ) ? 'DESC' : 'ASC';
$preview_state      = sanitize_key( $attributes['previewState'] ?? 'collapsed' );
$allow_multiple     = ! empty( $attributes['allowMultipleOpen'] );

if ( ! post_type_exists( 'product' ) || ! function_exists( 'wc_get_product' ) ) {
	echo '<div ' . get_block_wrapper_attributes() . '><p>' . esc_html__( 'WooCommerce is required for Product Feature Cards.', 'zenctuary' ) . '</p></div>';
	return;
}

$query_args = [
	'post_type'           => 'product',
	'post_status'         => 'publish',
	'posts_per_page'      => $products_to_show,
	'orderby'             => in_array( $order_by, [ 'date', 'title', 'menu_order', 'rand' ], true ) ? $order_by : 'date',
	'order'               => $order,
	'ignore_sticky_posts' => true,
];

if ( 'manual' === $query_mode ) {
	$query_args['post__in']       = ! empty( $manual_product_ids ) ? $manual_product_ids : [ 0 ];
	$query_args['orderby']        = 'post__in';
	$query_args['posts_per_page'] = max( 1, count( $manual_product_ids ) );
} elseif ( taxonomy_exists( $product_taxonomy ) && ! empty( $term_ids ) ) {
	$query_args['tax_query'] = [
		[
			'taxonomy' => $product_taxonomy,
			'field'    => 'term_id',
			'terms'    => $term_ids,
		],
	];
}

$query = new WP_Query( $query_args );
$posts = $query->posts;

$css_vars = [
	'--pfc-section-bg:' . esc_attr( $attributes['sectionBackgroundColor'] ?? '#3f3d3d' ),
	'--pfc-section-text:' . esc_attr( $attributes['sectionTextColor'] ?? '#f6f2ea' ),
	'--pfc-header-align:' . esc_attr( $attributes['sectionHeaderAlignment'] ?? 'center' ),
	'--pfc-heading-align:' . esc_attr( $attributes['sectionHeadingAlignment'] ?? 'center' ),
	'--pfc-intro-align:' . esc_attr( $attributes['sectionIntroAlignment'] ?? 'center' ),
	'--pfc-heading-color:' . esc_attr( $attributes['sectionHeadingColor'] ?? '#d8b354' ),
	'--pfc-heading-size:' . absint( $attributes['sectionHeadingFontSize'] ?? 36 ) . 'px',
	'--pfc-heading-weight:' . esc_attr( $attributes['sectionHeadingFontWeight'] ?? '700' ),
	'--pfc-intro-color:' . esc_attr( $attributes['sectionIntroColor'] ?? '#f6f2ea' ),
	'--pfc-intro-size:' . absint( $attributes['sectionIntroFontSize'] ?? 18 ) . 'px',
	'--pfc-intro-line-height:' . esc_attr( $attributes['sectionIntroLineHeight'] ?? 1.55 ),
	'--pfc-heading-bottom:' . absint( $attributes['sectionHeadingBottomSpacing'] ?? 22 ) . 'px',
	'--pfc-intro-bottom:' . absint( $attributes['sectionIntroBottomSpacing'] ?? 48 ) . 'px',
	'--pfc-intro-max-width:' . absint( $attributes['sectionIntroMaxWidth'] ?? 830 ) . 'px',
	'--pfc-section-max-width:' . absint( $attributes['sectionMaxWidth'] ?? 1400 ) . 'px',
	'--pfc-row-max-width:' . absint( $attributes['sectionRowMaxWidth'] ?? 1200 ) . 'px',
	'--pfc-pt:' . absint( $attributes['sectionPaddingTop'] ?? 80 ) . 'px',
	'--pfc-pr:' . absint( $attributes['sectionPaddingRight'] ?? 24 ) . 'px',
	'--pfc-pb:' . absint( $attributes['sectionPaddingBottom'] ?? 80 ) . 'px',
	'--pfc-pl:' . absint( $attributes['sectionPaddingLeft'] ?? 24 ) . 'px',
	'--pfc-pt-tablet:' . absint( $attributes['sectionPaddingTopTablet'] ?? 64 ) . 'px',
	'--pfc-pr-tablet:' . absint( $attributes['sectionPaddingRightTablet'] ?? 20 ) . 'px',
	'--pfc-pb-tablet:' . absint( $attributes['sectionPaddingBottomTablet'] ?? 64 ) . 'px',
	'--pfc-pl-tablet:' . absint( $attributes['sectionPaddingLeftTablet'] ?? 20 ) . 'px',
	'--pfc-pt-mobile:' . absint( $attributes['sectionPaddingTopMobile'] ?? 48 ) . 'px',
	'--pfc-pr-mobile:' . absint( $attributes['sectionPaddingRightMobile'] ?? 16 ) . 'px',
	'--pfc-pb-mobile:' . absint( $attributes['sectionPaddingBottomMobile'] ?? 48 ) . 'px',
	'--pfc-pl-mobile:' . absint( $attributes['sectionPaddingLeftMobile'] ?? 16 ) . 'px',
	'--pfc-mt:' . absint( $attributes['sectionMarginTop'] ?? 0 ) . 'px',
	'--pfc-mb:' . absint( $attributes['sectionMarginBottom'] ?? 0 ) . 'px',
	'--pfc-gap:' . absint( $attributes['cardGapDesktop'] ?? 32 ) . 'px',
	'--pfc-gap-tablet:' . absint( $attributes['cardGapTablet'] ?? 24 ) . 'px',
	'--pfc-gap-mobile:' . absint( $attributes['cardGapMobile'] ?? 18 ) . 'px',
	'--pfc-card-width:' . absint( $attributes['cardWidth'] ?? 370 ) . 'px',
	'--pfc-card-height:' . absint( $attributes['cardHeight'] ?? 566 ) . 'px',
	'--pfc-card-width-tablet:' . absint( $attributes['cardWidthTablet'] ?? 340 ) . 'px',
	'--pfc-card-height-tablet:' . absint( $attributes['cardHeightTablet'] ?? 540 ) . 'px',
	'--pfc-card-width-mobile:' . absint( $attributes['cardWidthMobile'] ?? 320 ) . 'px',
	'--pfc-card-height-mobile:' . absint( $attributes['cardHeightMobile'] ?? 520 ) . 'px',
	'--pfc-card-min-height:' . absint( $attributes['cardMinHeight'] ?? 566 ) . 'px',
	'--pfc-card-radius:' . absint( $attributes['cardBorderRadius'] ?? 28 ) . 'px',
	'--pfc-card-border-color:' . esc_attr( $attributes['cardBorderColor'] ?? 'rgba(246, 242, 234, 0.55)' ),
	'--pfc-card-border-width:' . absint( $attributes['cardBorderWidth'] ?? 2 ) . 'px',
	'--pfc-card-bg:' . esc_attr( $attributes['cardBackgroundColor'] ?? '#3f3d3d' ),
	'--pfc-card-shadow:' . esc_attr( $attributes['cardShadow'] ?? 'none' ),
	'--pfc-top-bar-height:' . absint( $attributes['topBarHeight'] ?? 86 ) . 'px',
	'--pfc-top-bar-bg:' . esc_attr( $attributes['topBarBackgroundColor'] ?? '#3f3d3d' ),
	'--pfc-top-bar-px:' . absint( $attributes['topBarPaddingX'] ?? 24 ) . 'px',
	'--pfc-top-bar-py:' . absint( $attributes['topBarPaddingY'] ?? 14 ) . 'px',
	'--pfc-zencoin-label-color:' . esc_attr( $attributes['zencoinLabelColor'] ?? '#d8b354' ),
	'--pfc-zencoin-label-size:' . absint( $attributes['zencoinLabelFontSize'] ?? 18 ) . 'px',
	'--pfc-zencoin-label-weight:' . esc_attr( $attributes['zencoinLabelFontWeight'] ?? '700' ),
	'--pfc-zencoin-gap:' . absint( $attributes['zencoinGap'] ?? 12 ) . 'px',
	'--pfc-zencoin-badge-size:' . absint( $attributes['zencoinBadgeSize'] ?? 42 ) . 'px',
	'--pfc-zencoin-badge-border-width:' . absint( $attributes['zencoinBadgeBorderWidth'] ?? 2 ) . 'px',
	'--pfc-zencoin-badge-bg:' . esc_attr( $attributes['zencoinBadgeBackgroundColor'] ?? '#d8b354' ),
	'--pfc-zencoin-badge-border-color:' . esc_attr( $attributes['zencoinBadgeBorderColor'] ?? '#d8b354' ),
	'--pfc-zencoin-badge-ring-color:' . esc_attr( $attributes['zencoinBadgeRingColor'] ?? '#3f3d3d' ),
	'--pfc-zencoin-badge-text-color:' . esc_attr( $attributes['zencoinBadgeTextColor'] ?? '#d8b354' ),
	'--pfc-zencoin-badge-font-size:' . absint( $attributes['zencoinBadgeFontSize'] ?? 20 ) . 'px',
	'--pfc-zencoin-badge-font-weight:' . esc_attr( $attributes['zencoinBadgeFontWeight'] ?? '700' ),
	'--pfc-overlay-color:' . esc_attr( $attributes['overlayColor'] ?? '#111111' ),
	'--pfc-overlay-opacity:' . esc_attr( $attributes['overlayOpacity'] ?? 0.38 ),
	'--pfc-body-pt:' . absint( $attributes['bodyPaddingTop'] ?? 30 ) . 'px',
	'--pfc-body-pr:' . absint( $attributes['bodyPaddingRight'] ?? 20 ) . 'px',
	'--pfc-body-pb:' . absint( $attributes['bodyPaddingBottom'] ?? 24 ) . 'px',
	'--pfc-body-pl:' . absint( $attributes['bodyPaddingLeft'] ?? 20 ) . 'px',
	'--pfc-body-pt-mobile:' . absint( $attributes['bodyPaddingTopMobile'] ?? 24 ) . 'px',
	'--pfc-body-pr-mobile:' . absint( $attributes['bodyPaddingRightMobile'] ?? 18 ) . 'px',
	'--pfc-body-pb-mobile:' . absint( $attributes['bodyPaddingBottomMobile'] ?? 22 ) . 'px',
	'--pfc-body-pl-mobile:' . absint( $attributes['bodyPaddingLeftMobile'] ?? 18 ) . 'px',
	'--pfc-title-color:' . esc_attr( $attributes['titleColor'] ?? '#ffffff' ),
	'--pfc-title-size:' . absint( $attributes['titleFontSize'] ?? 52 ) . 'px',
	'--pfc-title-size-tablet:' . absint( $attributes['titleFontSizeTablet'] ?? 44 ) . 'px',
	'--pfc-title-size-mobile:' . absint( $attributes['titleFontSizeMobile'] ?? 36 ) . 'px',
	'--pfc-title-weight:' . esc_attr( $attributes['titleFontWeight'] ?? '700' ),
	'--pfc-title-line-height:' . esc_attr( $attributes['titleLineHeight'] ?? 1.05 ),
	'--pfc-title-letter-spacing:' . (float) ( $attributes['titleLetterSpacing'] ?? 0 ) . 'px',
	'--pfc-title-transform:' . esc_attr( $attributes['titleTextTransform'] ?? 'uppercase' ),
	'--pfc-title-max-width:' . absint( $attributes['titleMaxWidth'] ?? 240 ) . 'px',
	'--pfc-title-bottom:' . absint( $attributes['titleBottomSpacing'] ?? 18 ) . 'px',
	'--pfc-session-icon-size:' . absint( $attributes['sessionIconSize'] ?? 15 ) . 'px',
	'--pfc-session-icon-color:' . esc_attr( $attributes['sessionIconColor'] ?? '#3f3d3d' ),
	'--pfc-session-icon-bg:' . esc_attr( $attributes['sessionIconBackgroundColor'] ?? '#d8b354' ),
	'--pfc-session-text-color:' . esc_attr( $attributes['sessionTextColor'] ?? '#ffffff' ),
	'--pfc-session-font-size:' . absint( $attributes['sessionFontSize'] ?? 16 ) . 'px',
	'--pfc-session-font-weight:' . esc_attr( $attributes['sessionFontWeight'] ?? '400' ),
	'--pfc-session-gap:' . absint( $attributes['sessionGap'] ?? 10 ) . 'px',
	'--pfc-session-bottom:' . absint( $attributes['sessionBottomSpacing'] ?? 18 ) . 'px',
	'--pfc-ideal-for-color:' . esc_attr( $attributes['idealForColor'] ?? '#f6f2ea' ),
	'--pfc-ideal-for-font-size:' . absint( $attributes['idealForFontSize'] ?? 16 ) . 'px',
	'--pfc-ideal-for-font-size-mobile:' . absint( $attributes['idealForFontSizeMobile'] ?? 15 ) . 'px',
	'--pfc-ideal-for-font-weight:' . esc_attr( $attributes['idealForFontWeight'] ?? '400' ),
	'--pfc-ideal-for-line-height:' . esc_attr( $attributes['idealForLineHeight'] ?? 1.55 ),
	'--pfc-ideal-for-max-width:' . absint( $attributes['idealForMaxWidth'] ?? 310 ) . 'px',
	'--pfc-ideal-for-bottom:' . absint( $attributes['idealForBottomSpacing'] ?? 22 ) . 'px',
	'--pfc-button-text-color:' . esc_attr( $attributes['buttonTextColor'] ?? '#d8b354' ),
	'--pfc-button-bg:' . esc_attr( $attributes['buttonBackgroundColor'] ?? '#3f3d3d' ),
	'--pfc-button-border-color:' . esc_attr( $attributes['buttonBorderColor'] ?? '#d8b354' ),
	'--pfc-button-border-width:' . absint( $attributes['buttonBorderWidth'] ?? 2 ) . 'px',
	'--pfc-button-radius:' . absint( $attributes['buttonBorderRadius'] ?? 999 ) . 'px',
	'--pfc-button-font-size:' . absint( $attributes['buttonFontSize'] ?? 16 ) . 'px',
	'--pfc-button-font-size-mobile:' . absint( $attributes['buttonFontSizeMobile'] ?? 15 ) . 'px',
	'--pfc-button-font-weight:' . esc_attr( $attributes['buttonFontWeight'] ?? '700' ),
	'--pfc-button-py:' . absint( $attributes['buttonPaddingY'] ?? 16 ) . 'px',
	'--pfc-button-px:' . absint( $attributes['buttonPaddingX'] ?? 28 ) . 'px',
	'--pfc-button-mt:' . absint( $attributes['buttonSpacingTop'] ?? 0 ) . 'px',
	'--pfc-button-mb:' . absint( $attributes['buttonSpacingBottom'] ?? 22 ) . 'px',
	'--pfc-divider-color:' . esc_attr( $attributes['dividerColor'] ?? 'rgba(246, 242, 234, 0.72)' ),
	'--pfc-divider-thickness:' . absint( $attributes['dividerThickness'] ?? 2 ) . 'px',
	'--pfc-divider-pt:' . absint( $attributes['dividerSpacingTop'] ?? 0 ) . 'px',
	'--pfc-divider-pr:' . absint( $attributes['dividerSpacingRight'] ?? 0 ) . 'px',
	'--pfc-divider-pb:' . absint( $attributes['dividerSpacingBottom'] ?? 18 ) . 'px',
	'--pfc-divider-pl:' . absint( $attributes['dividerSpacingLeft'] ?? 0 ) . 'px',
	'--pfc-expand-label-color:' . esc_attr( $attributes['expandLabelColor'] ?? '#f6f2ea' ),
	'--pfc-expand-label-size:' . absint( $attributes['expandLabelFontSize'] ?? 16 ) . 'px',
	'--pfc-expand-label-weight:' . esc_attr( $attributes['expandLabelFontWeight'] ?? '700' ),
	'--pfc-expand-icon-color:' . esc_attr( $attributes['expandIconColor'] ?? '#f6f2ea' ),
	'--pfc-expand-icon-size:' . absint( $attributes['expandIconSize'] ?? 20 ) . 'px',
	'--pfc-expand-pt:' . absint( $attributes['expandRowPaddingTop'] ?? 6 ) . 'px',
	'--pfc-expand-pr:' . absint( $attributes['expandRowPaddingRight'] ?? 0 ) . 'px',
	'--pfc-expand-pb:' . absint( $attributes['expandRowPaddingBottom'] ?? 6 ) . 'px',
	'--pfc-expand-pl:' . absint( $attributes['expandRowPaddingLeft'] ?? 0 ) . 'px',
	'--pfc-expanded-color:' . esc_attr( $attributes['expandedContentColor'] ?? '#f6f2ea' ),
	'--pfc-expanded-font-size:' . absint( $attributes['expandedContentFontSize'] ?? 15 ) . 'px',
	'--pfc-expanded-line-height:' . esc_attr( $attributes['expandedContentLineHeight'] ?? 1.55 ),
	'--pfc-expanded-mt:' . absint( $attributes['expandedContentSpacingTop'] ?? 12 ) . 'px',
	'--pfc-expanded-mb:' . absint( $attributes['expandedContentSpacingBottom'] ?? 0 ) . 'px',
	'--pfc-expanded-max-height:' . absint( $attributes['expandedContentMaxHeight'] ?? 160 ) . 'px',
	'--pfc-transition-duration:' . absint( $attributes['transitionDuration'] ?? 260 ) . 'ms',
];

$wrapper_attributes = get_block_wrapper_attributes(
	[
		'class' => 'product-feature-cards',
		'style' => implode( ';', $css_vars ),
		'data-allow-multiple' => $allow_multiple ? 'true' : 'false',
	]
);
?>

<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<div class="pfc__inner">
		<?php if ( ! empty( $attributes['sectionHeading'] ) || ! empty( $attributes['sectionIntro'] ) ) : ?>
			<header class="pfc__header">
				<?php if ( ! empty( $attributes['sectionHeading'] ) ) : ?>
					<h2 class="pfc__section-heading"><?php echo esc_html( $attributes['sectionHeading'] ); ?></h2>
				<?php endif; ?>
				<?php if ( ! empty( $attributes['sectionIntro'] ) ) : ?>
					<p class="pfc__section-intro"><?php echo esc_html( $attributes['sectionIntro'] ); ?></p>
				<?php endif; ?>
			</header>
		<?php endif; ?>

		<div class="pfc__row">
			<?php if ( empty( $posts ) ) : ?>
				<div class="pfc__empty"><?php esc_html_e( 'No products matched this selection.', 'zenctuary' ); ?></div>
			<?php else : ?>
				<?php foreach ( $posts as $index => $post ) : ?>
					<?php
					$product          = wc_get_product( $post->ID );
					$session_time     = (string) get_post_meta( $post->ID, '_session_time', true );
					$ideal_for        = zenctuary_pfc_ideal_for( $post->ID );
					$what_to_expect   = zenctuary_pfc_expect_content( $post->ID );
					$zencoin_value    = zenctuary_pfc_zencoin_value( $post->ID );
					$image_url        = get_the_post_thumbnail_url( $post, 'large' );
					$expanded_default = 'expanded' === $preview_state && 0 === $index;
					$panel_id         = 'pfc-expect-' . $post->ID . '-' . wp_unique_id();

					if ( ! $product ) {
						continue;
					}
					?>
					<article class="pfc__card<?php echo $expanded_default ? ' is-expanded' : ''; ?>">
						<div class="pfc__card-top">
							<div class="pfc__zencoin">
								<span class="pfc__zencoin-label"><?php echo esc_html( $attributes['zencoinLabel'] ?? 'ZENCOINS:' ); ?></span>
								<?php if ( '' !== trim( $zencoin_value ) ) : ?>
									<span class="pfc__zencoin-badge">
										<span class="pfc__zencoin-badge-ring" aria-hidden="true"></span>
										<span class="pfc__zencoin-badge-value"><?php echo esc_html( $zencoin_value ); ?></span>
									</span>
								<?php endif; ?>
							</div>
						</div>

						<div class="pfc__card-body">
							<?php if ( $image_url ) : ?>
								<img class="pfc__image" src="<?php echo esc_url( $image_url ); ?>" alt="<?php echo esc_attr( get_the_title( $post ) ); ?>" loading="lazy" />
							<?php endif; ?>
							<div class="pfc__overlay" aria-hidden="true"></div>

							<div class="pfc__content">
								<h3 class="pfc__title"><?php echo esc_html( get_the_title( $post ) ); ?></h3>

								<?php if ( $session_time ) : ?>
									<div class="pfc__session-row">
										<?php if ( ! empty( $attributes['showSessionIcon'] ) ) : ?>
											<span class="pfc__session-icon" aria-hidden="true"><?php echo zenctuary_pfc_clock_icon(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
										<?php endif; ?>
										<span class="pfc__session-text"><?php echo esc_html( $session_time ); ?></span>
									</div>
								<?php endif; ?>

								<?php if ( $ideal_for ) : ?>
									<div class="pfc__ideal-for"><?php echo wp_kses_post( wpautop( esc_html( $ideal_for ) ) ); ?></div>
								<?php endif; ?>

								<a class="pfc__button<?php echo ! empty( $attributes['buttonShowIcon'] ) && 'left' === ( $attributes['buttonIconPosition'] ?? 'right' ) ? ' is-icon-left' : ''; ?>" href="<?php echo esc_url( get_permalink( $post ) ); ?>">
									<span class="pfc__button-label"><?php echo esc_html( $attributes['buttonLabel'] ?? __( 'Book Now', 'zenctuary' ) ); ?></span>
									<?php if ( ! empty( $attributes['buttonShowIcon'] ) ) : ?>
										<span class="pfc__button-icon" aria-hidden="true"><?php echo zenctuary_pfc_arrow_icon(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
									<?php endif; ?>
								</a>

								<div class="pfc__divider-wrap" aria-hidden="true">
									<div class="pfc__divider"></div>
								</div>

								<div class="pfc__expect">
									<button
										type="button"
										class="pfc__expect-toggle"
										aria-expanded="<?php echo $expanded_default ? 'true' : 'false'; ?>"
										aria-controls="<?php echo esc_attr( $panel_id ); ?>"
									>
										<span class="pfc__expect-label"><?php echo esc_html( $attributes['expandLabel'] ?? __( 'What to expect', 'zenctuary' ) ); ?></span>
										<span class="pfc__expect-icon" aria-hidden="true">
											<span class="pfc__expect-plus">+</span>
											<span class="pfc__expect-minus">-</span>
										</span>
									</button>

									<div
										id="<?php echo esc_attr( $panel_id ); ?>"
										class="pfc__expect-panel"
										<?php echo $expanded_default ? '' : 'hidden'; ?>
									>
										<div class="pfc__expect-panel-inner">
											<?php if ( $what_to_expect ) : ?>
												<?php echo wp_kses_post( $what_to_expect ); ?>
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
</section>

<?php
wp_reset_postdata();
