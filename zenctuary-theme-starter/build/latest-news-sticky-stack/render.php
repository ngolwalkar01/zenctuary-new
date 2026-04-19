<?php
/**
 * Render callback for Latest News Sticky Stack.
 *
 * @package Zenctuary
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! function_exists( 'zenctuary_latest_news_csv_ids' ) ) {
	function zenctuary_latest_news_csv_ids( $value ): array {
		if ( ! is_string( $value ) || '' === trim( $value ) ) {
			return [];
		}

		return array_values(
			array_filter(
				array_map( 'absint', preg_split( '/\s*,\s*/', $value ) )
			)
		);
	}
}

if ( ! function_exists( 'zenctuary_latest_news_hover_content' ) ) {
	function zenctuary_latest_news_hover_content( int $post_id, string $fallback, int $excerpt_length ): string {
		$content = get_post_meta( $post_id, 'news_hover_content', true );

		if ( ! empty( $content ) ) {
			return wpautop( wp_kses_post( $content ) );
		}

		$excerpt = has_excerpt( $post_id )
			? get_the_excerpt( $post_id )
			: wp_trim_words( wp_strip_all_tags( get_post_field( 'post_content', $post_id ) ), $excerpt_length );

		if ( empty( $excerpt ) ) {
			$excerpt = $fallback;
		}

		return wpautop( esc_html( $excerpt ) );
	}
}

if ( ! function_exists( 'zenctuary_latest_news_meta_text' ) ) {
	function zenctuary_latest_news_meta_text( WP_Post $post, string $source, string $taxonomy, string $custom_meta_key ): string {
		if ( 'none' === $source ) {
			return '';
		}

		if ( 'date' === $source ) {
			return get_the_date( 'd.m.Y', $post );
		}

		if ( 'term' === $source ) {
			$terms = get_the_terms( $post, $taxonomy );
			if ( ! empty( $terms ) && ! is_wp_error( $terms ) ) {
				return $terms[0]->name;
			}

			$categories = get_the_terms( $post, 'category' );
			if ( ! empty( $categories ) && ! is_wp_error( $categories ) ) {
				return $categories[0]->name;
			}
		}

		if ( 'custom' === $source && $custom_meta_key ) {
			$value = get_post_meta( $post->ID, $custom_meta_key, true );
			if ( is_scalar( $value ) && '' !== (string) $value ) {
				return (string) $value;
			}
		}

		return '';
	}
}

if ( ! function_exists( 'zenctuary_latest_news_arrow_icon' ) ) {
	function zenctuary_latest_news_arrow_icon(): string {
		return '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M10.8 4.1 15.7 9l-4.9 4.9-1.1-1.1 3.2-3.2H3.8V8.4h9.1L9.7 5.2z" fill="currentColor"/></svg>';
	}
}

if ( ! function_exists( 'zenctuary_latest_news_close_icon' ) ) {
	function zenctuary_latest_news_close_icon(): string {
		return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6.7 6.7 17.3 17.3M17.3 6.7 6.7 17.3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="1.8"/></svg>';
	}
}

$post_type               = sanitize_key( $attributes['postType'] ?? 'post' );
$taxonomy                = sanitize_key( $attributes['taxonomy'] ?? 'category' );
$term_ids                = array_values( array_filter( array_map( 'absint', (array) ( $attributes['termIds'] ?? [] ) ) ) );
$query_mode              = sanitize_key( $attributes['queryMode'] ?? 'auto' );
$manual_post_ids         = zenctuary_latest_news_csv_ids( $attributes['manualPostIds'] ?? '' );
$posts_to_show           = max( 1, absint( $attributes['postsToShow'] ?? 6 ) );
$offset                  = max( 0, absint( $attributes['offset'] ?? 0 ) );
$include_ids             = zenctuary_latest_news_csv_ids( $attributes['includeIds'] ?? '' );
$exclude_ids             = zenctuary_latest_news_csv_ids( $attributes['excludeIds'] ?? '' );
$only_featured           = ! empty( $attributes['onlyWithFeaturedImage'] );
$exclude_current         = ! empty( $attributes['excludeCurrentPost'] );
$order_by                = sanitize_key( $attributes['orderBy'] ?? 'date' );
$order                   = 'ASC' === strtoupper( (string) ( $attributes['order'] ?? 'DESC' ) ) ? 'ASC' : 'DESC';
$enable_sticky           = ! empty( $attributes['enableSticky'] );
$sticky_full_width       = ! empty( $attributes['stickyStripFullWidth'] );
$sticky_shadow           = ! empty( $attributes['stickyStripShadow'] );
$show_meta               = ! empty( $attributes['showMeta'] );
$show_meta_icon          = ! empty( $attributes['showMetaIcon'] );
$meta_source             = sanitize_key( $attributes['metaSource'] ?? 'date' );
$custom_meta_key         = sanitize_key( $attributes['customMetaKey'] ?? '' );
$cta_show_icon           = ! empty( $attributes['ctaShowIcon'] );
$cta_icon_position       = sanitize_key( $attributes['ctaIconPosition'] ?? 'right' );
$mobile_interaction      = sanitize_key( $attributes['mobileInteraction'] ?? 'tap-expand' );
$preview_state           = sanitize_key( $attributes['previewState'] ?? 'resting' );
$is_editor_preview       = ( defined( 'REST_REQUEST' ) && REST_REQUEST && isset( $_REQUEST['context'] ) && 'edit' === sanitize_text_field( wp_unslash( $_REQUEST['context'] ) ) );

$query_args = [
	'post_type'           => post_type_exists( $post_type ) ? $post_type : 'post',
	'post_status'         => 'publish',
	'posts_per_page'      => $posts_to_show,
	'ignore_sticky_posts' => true,
	'offset'              => $offset,
	'orderby'             => in_array( $order_by, [ 'date', 'modified', 'title', 'rand', 'menu_order' ], true ) ? $order_by : 'date',
	'order'               => $order,
];

if ( 'manual' === $query_mode && ! empty( $manual_post_ids ) ) {
	$query_args['post__in'] = $manual_post_ids;
	$query_args['orderby']  = 'post__in';
	$query_args['posts_per_page'] = count( $manual_post_ids );
} else {
	if ( ! empty( $include_ids ) ) {
		$query_args['post__in'] = $include_ids;
	}

	if ( ! empty( $exclude_ids ) ) {
		$query_args['post__not_in'] = $exclude_ids;
	}

	if ( $exclude_current && is_singular( $post_type ) ) {
		$query_args['post__not_in'][] = get_the_ID();
	}

	if ( taxonomy_exists( $taxonomy ) && ! empty( $term_ids ) ) {
		$query_args['tax_query'] = [
			[
				'taxonomy' => $taxonomy,
				'field'    => 'term_id',
				'terms'    => $term_ids,
			],
		];
	}
}

if ( $only_featured ) {
	$query_args['meta_query'] = [
		[
			'key'     => '_thumbnail_id',
			'compare' => 'EXISTS',
		],
	];
}

$query = new WP_Query( $query_args );

$wrapper_attributes = get_block_wrapper_attributes(
	[
		'class' => 'latest-news-sticky-stack' . ( $is_editor_preview ? ' is-editor-preview' : '' ),
		'style' => sprintf(
			'--lnss-section-bg:%1$s;--lnss-section-text:%2$s;--lnss-max-width:%3$dpx;--lnss-pad-top:%4$dpx;--lnss-pad-bottom:%5$dpx;--lnss-pad-x:%6$dpx;--lnss-header-cards-gap:%7$dpx;--lnss-sticky-z:%8$d;--lnss-sticky-top:%9$dpx;--lnss-sticky-top-tablet:%10$dpx;--lnss-sticky-top-mobile:%11$dpx;--lnss-sticky-bg:%12$s;--lnss-sticky-pad-top:%13$dpx;--lnss-sticky-pad-right:%14$dpx;--lnss-sticky-pad-bottom:%15$dpx;--lnss-sticky-pad-left:%16$dpx;--lnss-sticky-border-width:%17$dpx;--lnss-sticky-border-color:%18$s;--lnss-heading-color:%19$s;--lnss-heading-size:%20$dpx;--lnss-heading-weight:%21$s;--lnss-heading-line:%22$s;--lnss-heading-transform:%23$s;--lnss-header-button-color:%24$s;--lnss-header-button-bg:%25$s;--lnss-header-button-border:%26$s;--lnss-header-button-size:%27$dpx;--lnss-header-button-weight:%28$s;--lnss-header-button-pad-y:%29$dpx;--lnss-header-button-pad-x:%30$dpx;--lnss-header-button-radius:%31$dpx;--lnss-header-button-border-width:%32$dpx;--lnss-card-width:%33$dpx;--lnss-card-height:%34$dpx;--lnss-card-max-width:%35$dpx;--lnss-card-width-tablet:%36$d%%;--lnss-card-height-tablet:%37$dpx;--lnss-card-width-mobile:%38$d%%;--lnss-card-height-mobile:%39$dpx;--lnss-card-radius:%40$dpx;--lnss-card-gap:%41$dpx;--lnss-rest-overlay:%42$s;--lnss-rest-overlay-op:%43$s;--lnss-hover-overlay:%44$s;--lnss-hover-overlay-op:%45$s;--lnss-hover-border:%46$s;--lnss-hover-border-width:%47$dpx;--lnss-card-padding:%48$dpx;--lnss-card-padding-tablet:%49$dpx;--lnss-card-padding-mobile:%50$dpx;--lnss-hover-max-width:%51$dpx;--lnss-rest-title-size:%52$dpx;--lnss-rest-title-size-tablet:%53$dpx;--lnss-rest-title-size-mobile:%54$dpx;--lnss-rest-title-weight:%55$s;--lnss-rest-title-color:%56$s;--lnss-rest-title-max:%57$dpx;--lnss-rest-title-transform:%58$s;--lnss-rest-justify:%59$s;--lnss-rest-offset-x:%60$dpx;--lnss-rest-offset-y:%61$dpx;--lnss-rest-excerpt-size:%62$dpx;--lnss-rest-excerpt-size-tablet:%63$dpx;--lnss-rest-excerpt-size-mobile:%64$dpx;--lnss-rest-excerpt-line:%65$s;--lnss-rest-excerpt-color:%66$s;--lnss-rest-excerpt-max:%67$dpx;--lnss-rest-gap:%68$dpx;--lnss-hover-justify:%69$s;--lnss-hover-offset-x:%70$dpx;--lnss-hover-offset-y:%71$dpx;--lnss-hover-title-size:%72$dpx;--lnss-hover-title-weight:%73$s;--lnss-hover-title-color:%74$s;--lnss-hover-body-size:%75$dpx;--lnss-hover-body-size-tablet:%76$dpx;--lnss-hover-body-size-mobile:%77$dpx;--lnss-hover-body-line:%78$s;--lnss-hover-body-color:%79$s;--lnss-hover-title-gap:%80$dpx;--lnss-hover-button-gap:%81$dpx;--lnss-meta-size:%82$dpx;--lnss-meta-weight:%83$s;--lnss-meta-color:%84$s;--lnss-meta-gap:%85$dpx;--lnss-cta-label:%86$s;--lnss-cta-size:%87$dpx;--lnss-cta-weight:%88$s;--lnss-cta-color:%89$s;--lnss-cta-bg:%90$s;--lnss-cta-border:%91$s;--lnss-cta-pad-y:%92$dpx;--lnss-cta-pad-x:%93$dpx;--lnss-cta-radius:%94$dpx;--lnss-cta-border-width:%95$dpx;--lnss-header-gap:%96$dpx;--lnss-hover-cta-justify:%97$s;--lnss-hover-cta-top:%98$s;--lnss-hover-cta-right:%99$s;--lnss-hover-cta-bottom:%100$s;--lnss-hover-cta-left:%101$s;--lnss-hover-cta-offset-x:%102$dpx;--lnss-hover-cta-offset-y:%103$dpx;',
			esc_attr( $attributes['sectionBackgroundColor'] ?? '#3f3d3d' ),
			esc_attr( $attributes['sectionTextColor'] ?? '#f1eee7' ),
			absint( $attributes['sectionMaxWidth'] ?? 1600 ),
			absint( $attributes['sectionPaddingTop'] ?? 56 ),
			absint( $attributes['sectionPaddingBottom'] ?? 96 ),
			absint( $attributes['sectionPaddingHorizontal'] ?? 32 ),
			absint( $attributes['headerToCardsGap'] ?? 64 ),
			absint( $attributes['stickyZIndex'] ?? 25 ),
			absint( $attributes['stickyTopOffset'] ?? 24 ),
			absint( $attributes['stickyTopOffsetTablet'] ?? 16 ),
			absint( $attributes['stickyTopOffsetMobile'] ?? 12 ),
			esc_attr( $attributes['stickyStripBackgroundColor'] ?? '#3f3d3d' ),
			absint( $attributes['stickyStripPaddingTop'] ?? 12 ),
			absint( $attributes['stickyStripPaddingRight'] ?? 0 ),
			absint( $attributes['stickyStripPaddingBottom'] ?? 12 ),
			absint( $attributes['stickyStripPaddingLeft'] ?? 0 ),
			absint( $attributes['stickyStripBorderWidth'] ?? 0 ),
			esc_attr( $attributes['stickyStripBorderColor'] ?? '#6b6038' ),
			esc_attr( $attributes['headingColor'] ?? '#d8b354' ),
			absint( $attributes['headingFontSize'] ?? 36 ),
			esc_attr( $attributes['headingFontWeight'] ?? '700' ),
			esc_attr( $attributes['headingLineHeight'] ?? 1.1 ),
			esc_attr( $attributes['headingTextTransform'] ?? 'uppercase' ),
			esc_attr( $attributes['buttonTextColor'] ?? '#3f3d3d' ),
			esc_attr( $attributes['buttonBackgroundColor'] ?? '#d8b354' ),
			esc_attr( $attributes['buttonBorderColor'] ?? '#d8b354' ),
			absint( $attributes['buttonFontSize'] ?? 18 ),
			esc_attr( $attributes['buttonFontWeight'] ?? '700' ),
			absint( $attributes['buttonPaddingY'] ?? 18 ),
			absint( $attributes['buttonPaddingX'] ?? 30 ),
			absint( $attributes['buttonRadius'] ?? 999 ),
			absint( $attributes['buttonBorderWidth'] ?? 1 ),
			absint( $attributes['cardWidth'] ?? 818 ),
			absint( $attributes['cardHeight'] ?? 467 ),
			absint( $attributes['cardMaxWidth'] ?? 1000 ),
			absint( $attributes['cardWidthTablet'] ?? 100 ),
			absint( $attributes['cardHeightTablet'] ?? 420 ),
			absint( $attributes['cardWidthMobile'] ?? 100 ),
			absint( $attributes['cardHeightMobile'] ?? 360 ),
			absint( $attributes['cardBorderRadius'] ?? 24 ),
			absint( $attributes['cardVerticalGap'] ?? 64 ),
			esc_attr( $attributes['restingOverlayColor'] ?? '#1f1c18' ),
			esc_attr( $attributes['restingOverlayOpacity'] ?? 0.46 ),
			esc_attr( $attributes['hoverOverlayColor'] ?? '#3f3d3d' ),
			esc_attr( $attributes['hoverOverlayOpacity'] ?? 0.94 ),
			esc_attr( $attributes['hoverBorderColor'] ?? '#d8b354' ),
			absint( $attributes['hoverBorderWidth'] ?? 2 ),
			absint( $attributes['cardPadding'] ?? 40 ),
			absint( $attributes['cardPaddingTablet'] ?? 28 ),
			absint( $attributes['cardPaddingMobile'] ?? 20 ),
			absint( $attributes['hoverContentMaxWidth'] ?? 760 ),
			absint( $attributes['restingTitleFontSize'] ?? 36 ),
			absint( $attributes['restingTitleFontSizeTablet'] ?? 30 ),
			absint( $attributes['restingTitleFontSizeMobile'] ?? 24 ),
			esc_attr( $attributes['restingTitleFontWeight'] ?? '400' ),
			esc_attr( $attributes['restingTitleColor'] ?? '#f6f2ea' ),
			absint( $attributes['restingTitleMaxWidth'] ?? 680 ),
			! empty( $attributes['restingTitleUppercase'] ) ? 'uppercase' : 'none',
			'start' === ( $attributes['restingContentVerticalAlign'] ?? 'center' ) ? 'flex-start' : ( 'end' === ( $attributes['restingContentVerticalAlign'] ?? 'center' ) ? 'flex-end' : 'center' ),
			absint( $attributes['restingContentOffsetX'] ?? 0 ),
			absint( $attributes['restingContentOffsetY'] ?? 0 ),
			absint( $attributes['restingExcerptFontSize'] ?? 18 ),
			absint( $attributes['restingExcerptFontSizeTablet'] ?? 16 ),
			absint( $attributes['restingExcerptFontSizeMobile'] ?? 15 ),
			esc_attr( $attributes['restingExcerptLineHeight'] ?? 1.5 ),
			esc_attr( $attributes['restingExcerptColor'] ?? '#f6f2ea' ),
			absint( $attributes['restingExcerptMaxWidth'] ?? 620 ),
			absint( $attributes['restingTitleExcerptGap'] ?? 16 ),
			'start' === ( $attributes['hoverContentVerticalAlign'] ?? 'start' ) ? 'flex-start' : ( 'end' === ( $attributes['hoverContentVerticalAlign'] ?? 'start' ) ? 'flex-end' : 'center' ),
			absint( $attributes['hoverContentOffsetX'] ?? 0 ),
			absint( $attributes['hoverContentOffsetY'] ?? 0 ),
			absint( $attributes['hoverTitleFontSize'] ?? 32 ),
			esc_attr( $attributes['hoverTitleFontWeight'] ?? '700' ),
			esc_attr( $attributes['hoverTitleColor'] ?? '#d8b354' ),
			absint( $attributes['hoverBodyFontSize'] ?? 18 ),
			absint( $attributes['hoverBodyFontSizeTablet'] ?? 16 ),
			absint( $attributes['hoverBodyFontSizeMobile'] ?? 15 ),
			esc_attr( $attributes['hoverBodyLineHeight'] ?? 1.55 ),
			esc_attr( $attributes['hoverBodyColor'] ?? '#f1eee7' ),
			absint( $attributes['hoverTitleBodyGap'] ?? 24 ),
			absint( $attributes['hoverBodyButtonGap'] ?? 28 ),
			absint( $attributes['metaFontSize'] ?? 18 ),
			esc_attr( $attributes['metaFontWeight'] ?? '700' ),
			esc_attr( $attributes['metaColor'] ?? '#d8b354' ),
			absint( $attributes['metaGap'] ?? 10 ),
			esc_attr( wp_json_encode( $attributes['ctaLabel'] ?? 'Read More' ) ),
			absint( $attributes['ctaFontSize'] ?? 16 ),
			esc_attr( $attributes['ctaFontWeight'] ?? '700' ),
			esc_attr( $attributes['ctaTextColor'] ?? '#d8b354' ),
			esc_attr( $attributes['ctaBackgroundColor'] ?? '#3f3d3d' ),
			esc_attr( $attributes['ctaBorderColor'] ?? '#d8b354' ),
			absint( $attributes['ctaPaddingY'] ?? 18 ),
			absint( $attributes['ctaPaddingX'] ?? 28 ),
			absint( $attributes['ctaRadius'] ?? 999 ),
			absint( $attributes['ctaBorderWidth'] ?? 2 ),
			absint( $attributes['headerGap'] ?? 28 ),
			'start' === ( $attributes['hoverCtaHorizontalAlign'] ?? 'end' ) ? 'flex-start' : ( 'center' === ( $attributes['hoverCtaHorizontalAlign'] ?? 'end' ) ? 'center' : 'flex-end' ),
			'start' === ( $attributes['hoverCtaVerticalAlign'] ?? 'end' ) ? '0' : ( 'center' === ( $attributes['hoverCtaVerticalAlign'] ?? 'end' ) ? '50%' : 'auto' ),
			'start' === ( $attributes['hoverCtaHorizontalAlign'] ?? 'end' ) ? 'auto' : ( 'center' === ( $attributes['hoverCtaHorizontalAlign'] ?? 'end' ) ? 'auto' : '0' ),
			'start' === ( $attributes['hoverCtaVerticalAlign'] ?? 'end' ) ? 'auto' : ( 'center' === ( $attributes['hoverCtaVerticalAlign'] ?? 'end' ) ? 'auto' : '0' ),
			'start' === ( $attributes['hoverCtaHorizontalAlign'] ?? 'end' ) ? '0' : ( 'center' === ( $attributes['hoverCtaHorizontalAlign'] ?? 'end' ) ? '50%' : 'auto' ),
			absint( $attributes['hoverCtaOffsetX'] ?? 0 ),
			absint( $attributes['hoverCtaOffsetY'] ?? 0 )
		),
	]
);

$header_align_class = 'is-align-' . sanitize_html_class( $attributes['headerAlignment'] ?? 'start' );
$card_align_class   = 'is-card-align-' . sanitize_html_class( $attributes['cardAlignment'] ?? 'center' );
$preview_class      = $is_editor_preview ? 'is-preview-' . sanitize_html_class( $preview_state ) : '';
$sticky_class       = $enable_sticky ? 'has-sticky-header' : '';
$full_width_class   = $sticky_full_width ? 'has-full-width-sticky' : '';
$shadow_class       = $sticky_shadow ? 'has-sticky-shadow' : '';

?>
<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?> data-mobile-interaction="<?php echo esc_attr( $mobile_interaction ); ?>">
	<div class="latest-news-sticky-stack__inner <?php echo esc_attr( $header_align_class . ' ' . $card_align_class . ' ' . $sticky_class . ' ' . $full_width_class . ' ' . $shadow_class . ' ' . $preview_class ); ?>">
		<div class="latest-news-sticky-stack__sticky-shell">
			<div class="latest-news-sticky-stack__sticky-strip">
				<div class="latest-news-sticky-stack__header">
					<a class="latest-news-sticky-stack__header-button" href="<?php echo esc_url( $attributes['buttonUrl'] ?? '#' ); ?>">
						<span><?php echo esc_html( $attributes['buttonText'] ?? 'View Schedule' ); ?></span>
						<span class="latest-news-sticky-stack__cta-icon" aria-hidden="true"><?php echo zenctuary_latest_news_arrow_icon(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
					</a>
					<h2 class="latest-news-sticky-stack__heading"><?php echo esc_html( $attributes['headingText'] ?? 'LATEST NEWS & OFFERS' ); ?></h2>
				</div>
			</div>
		</div>

		<div class="latest-news-sticky-stack__cards">
			<?php if ( $query->have_posts() ) : ?>
				<?php while ( $query->have_posts() ) : $query->the_post(); ?>
					<?php
					$post_id      = get_the_ID();
					$title        = get_the_title();
					$permalink    = get_permalink();
					$featured     = get_the_post_thumbnail_url( $post_id, 'large' );
					$excerpt      = has_excerpt( $post_id )
						? get_the_excerpt( $post_id )
						: wp_trim_words( wp_strip_all_tags( get_post_field( 'post_content', $post_id ) ), max( 6, absint( $attributes['excerptLength'] ?? 28 ) ) );
					$excerpt      = wp_strip_all_tags( $excerpt );
					$hover_body   = zenctuary_latest_news_hover_content( $post_id, (string) ( $attributes['hoverFallbackText'] ?? '' ), max( 6, absint( $attributes['excerptLength'] ?? 28 ) ) );
					$meta_text    = $show_meta ? zenctuary_latest_news_meta_text( get_post(), $meta_source, $taxonomy, $custom_meta_key ) : '';
					$card_classes = 'latest-news-sticky-stack__card';
					?>
					<article class="<?php echo esc_attr( $card_classes ); ?>">
						<div class="latest-news-sticky-stack__card-media">
							<?php if ( $featured ) : ?>
								<img class="latest-news-sticky-stack__card-image" src="<?php echo esc_url( $featured ); ?>" alt="" loading="lazy" decoding="async" />
							<?php endif; ?>
							<div class="latest-news-sticky-stack__rest-overlay"></div>
							<div class="latest-news-sticky-stack__hover-overlay"></div>
						</div>
						<div class="latest-news-sticky-stack__card-inner">
							<div class="latest-news-sticky-stack__resting-state">
								<h3 class="latest-news-sticky-stack__resting-title"><?php echo esc_html( $title ); ?></h3>
								<?php if ( ! empty( $excerpt ) ) : ?>
									<div class="latest-news-sticky-stack__resting-excerpt"><?php echo esc_html( $excerpt ); ?></div>
								<?php endif; ?>
							</div>

							<div class="latest-news-sticky-stack__hover-state">
								<div class="latest-news-sticky-stack__hover-panel">
									<button class="latest-news-sticky-stack__mobile-close" type="button" aria-label="<?php esc_attr_e( 'Close details', 'zenctuary' ); ?>">
										<span class="latest-news-sticky-stack__mobile-close-icon" aria-hidden="true"><?php echo zenctuary_latest_news_close_icon(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
									</button>
									<div class="latest-news-sticky-stack__hover-content-scroll">
								<div class="latest-news-sticky-stack__hover-top">
									<h3 class="latest-news-sticky-stack__hover-title"><?php echo esc_html( $title ); ?></h3>
									<?php if ( $show_meta && ! empty( $meta_text ) ) : ?>
										<div class="latest-news-sticky-stack__meta">
											<?php if ( $show_meta_icon ) : ?>
												<span class="latest-news-sticky-stack__meta-icon" aria-hidden="true">●</span>
											<?php endif; ?>
											<span><?php echo esc_html( $meta_text ); ?></span>
										</div>
									<?php endif; ?>
								</div>
								<div class="latest-news-sticky-stack__hover-body"><?php echo wp_kses_post( $hover_body ); ?></div>
									</div>
								<div class="latest-news-sticky-stack__hover-cta-wrap">
									<a class="latest-news-sticky-stack__cta latest-news-sticky-stack__cta--icon-<?php echo esc_attr( $cta_icon_position ); ?>" href="<?php echo esc_url( $permalink ); ?>">
										<?php if ( $cta_show_icon ) : ?>
											<span class="latest-news-sticky-stack__cta-icon" aria-hidden="true"><?php echo zenctuary_latest_news_arrow_icon(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
										<?php endif; ?>
										<span><?php echo esc_html( $attributes['ctaLabel'] ?? 'Read More' ); ?></span>
									</a>
								</div>
								</div>
							</div>
						</div>
					</article>
				<?php endwhile; ?>
				<?php wp_reset_postdata(); ?>
			<?php else : ?>
				<div class="latest-news-sticky-stack__empty">
					<?php esc_html_e( 'No posts matched the current query.', 'zenctuary' ); ?>
				</div>
			<?php endif; ?>
		</div>
	</div>
</section>
