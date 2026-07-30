<?php
/**
 * Dynamic render for the Teacher Tabs Carousel block.
 *
 * @package Zenctuary
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$parse_bool = static function ( $value ): string {
	return ! empty( $value ) ? 'true' : 'false';
};

$spacing_style = static function ( $value, string $property ): array {
	$value = is_array( $value ) ? $value : array();

	return array(
		$property . '-top:' . ( $value['top'] ?? '0px' ),
		$property . '-right:' . ( $value['right'] ?? '0px' ),
		$property . '-bottom:' . ( $value['bottom'] ?? '0px' ),
		$property . '-left:' . ( $value['left'] ?? '0px' ),
	);
};

$arrow_icon = static function (): string {
	return '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3.5 12H18.5M18.5 12L13.5 7M18.5 12L13.5 17" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" /></svg>';
};

$navigation_icon = static function ( string $icon_set = 'line-arrow', string $direction = 'next' ): string {
	$is_next = 'next' === $direction;

	if ( 'dashicons-arrow-alt2' === $icon_set ) {
		return '<span class="premium-tabs-carousel__arrow-icon dashicons ' . esc_attr( $is_next ? 'dashicons-arrow-right-alt2' : 'dashicons-arrow-left-alt2' ) . '" aria-hidden="true"></span>';
	}

	if ( 'dashicons-controls' === $icon_set ) {
		return '<span class="premium-tabs-carousel__arrow-icon dashicons ' . esc_attr( $is_next ? 'dashicons-controls-forward' : 'dashicons-controls-back' ) . '" aria-hidden="true"></span>';
	}

	if ( 'chevron' === $icon_set ) {
		$path = $is_next ? 'M9 5L16 12L9 19' : 'M15 5L8 12L15 19';
		return '<svg class="premium-tabs-carousel__arrow-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="' . esc_attr( $path ) . '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>';
	}

	if ( 'caret' === $icon_set ) {
		$path = $is_next ? 'M10 7L15 12L10 17' : 'M14 7L9 12L14 17';
		return '<svg class="premium-tabs-carousel__arrow-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="' . esc_attr( $path ) . '" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" /></svg>';
	}

	return '<span class="premium-tabs-carousel__arrow-icon" aria-hidden="true">' . ( $is_next ? '&rarr;' : '&larr;' ) . '</span>';
};

$get_teacher_products = static function ( int $teacher_id ): array {
	$meta_query = array(
		'relation' => 'OR',
		array(
			'key'     => '_zts_teacher_id',
			'value'   => $teacher_id,
			'compare' => '=',
			'type'    => 'NUMERIC',
		),
	);

	$teacher_name = trim( wp_strip_all_tags( get_the_title( $teacher_id ) ) );
	if ( '' !== $teacher_name ) {
		$meta_query[] = array(
			'key'     => '_zen_instructor_name',
			'value'   => $teacher_name,
			'compare' => '=',
		);
	}

	$query = new WP_Query(
		array(
			'post_type'              => 'product',
			'post_status'            => 'publish',
			'posts_per_page'         => 24,
			'no_found_rows'          => true,
			'ignore_sticky_posts'    => true,
			'update_post_meta_cache' => false,
			'update_post_term_cache' => true,
			'meta_query'             => $meta_query,
			'orderby'                => array(
				'menu_order' => 'ASC',
				'title'      => 'ASC',
			),
		)
	);

	return $query->posts;
};

$get_teacher_activity_terms = static function ( int $teacher_id ) use ( $get_teacher_products ): array {
	if ( ! taxonomy_exists( 'activity_type' ) ) {
		return array();
	}

	$products = $get_teacher_products( $teacher_id );
	if ( empty( $products ) ) {
		return array();
	}

	$product_ids = wp_list_pluck( $products, 'ID' );
	$terms       = wp_get_object_terms(
		$product_ids,
		'activity_type',
		array(
			'orderby' => 'name',
			'order'   => 'ASC',
		)
	);

	if ( is_wp_error( $terms ) || empty( $terms ) ) {
		return array();
	}

	$activity_terms = array();
	foreach ( $terms as $term ) {
		$activity_terms[ $term->slug ] = $term->name;
	}

	return $activity_terms;
};

if ( ! post_type_exists( 'teacher' ) ) {
	return '';
}

$excluded_teacher_ids = array_filter( array_map( 'absint', (array) ( $attributes['excludedTeacherIds'] ?? array() ) ) );
$teachers_query       = new WP_Query(
	array(
		'post_type'              => 'teacher',
		'post_status'            => 'publish',
		'posts_per_page'         => -1,
		'no_found_rows'          => true,
		'ignore_sticky_posts'    => true,
		'update_post_meta_cache' => false,
		'update_post_term_cache' => false,
		'post__not_in'           => $excluded_teacher_ids,
		'orderby'                => 'title',
		'order'                  => 'ASC',
	)
);

$teachers = $teachers_query->posts;
if ( empty( $teachers ) ) {
	return '';
}

$teacher_terms = array();
$tabs          = array(
	'all' => __( 'All', 'zenctuary' ),
);

foreach ( $teachers as $teacher ) {
	$terms = $get_teacher_activity_terms( (int) $teacher->ID );
	$teacher_terms[ $teacher->ID ] = $terms;

	foreach ( $terms as $slug => $label ) {
		$tabs[ $slug ] = $label;
	}
}

$tabs_enabled = ! empty( $attributes['enableTabs'] ) && count( $tabs ) > 1;
$icon_set     = sanitize_text_field( $attributes['navIconSet'] ?? 'line-arrow' );
$button_text  = sanitize_text_field( $attributes['teacherButtonText'] ?? __( 'To Teacher', 'zenctuary' ) );
$open_new_tab = ! empty( $attributes['teacherButtonOpenInNewTab'] );
$padding      = is_array( $attributes['sectionPadding'] ?? null ) ? $attributes['sectionPadding'] : array();
$button_pad   = is_array( $attributes['buttonPadding'] ?? null ) ? $attributes['buttonPadding'] : array();

$style_parts = array_merge(
	array(
		'background-color:' . ( $attributes['backgroundColor'] ?? '#f4efe7' ),
		'--premium-tabs-content-max-width:' . absint( $attributes['contentMaxWidth'] ?? 1320 ) . 'px',
		'--premium-tabs-gap:' . absint( $attributes['gap'] ?? 24 ) . 'px',
		'--premium-tabs-card-radius:' . absint( $attributes['cardBorderRadius'] ?? 20 ) . 'px',
		'--premium-tabs-card-padding:' . absint( $attributes['cardContentPadding'] ?? 24 ) . 'px',
		'--premium-tabs-heading-max-width:' . absint( $attributes['headingMaxWidth'] ?? 760 ) . 'px',
		'--premium-tabs-heading-family:' . ( $attributes['headingFontFamily'] ?? 'var(--wp--preset--font-family--montserrat)' ),
		'--premium-tabs-heading-size:' . ( $attributes['headingFontSize'] ?? 'clamp(2rem, 4vw, 3.75rem)' ),
		'--premium-tabs-heading-weight:' . ( $attributes['headingFontWeight'] ?? '700' ),
		'--premium-tabs-heading-line-height:' . ( $attributes['headingLineHeight'] ?? '0.98' ),
		'--premium-tabs-heading-color:' . ( $attributes['headingColor'] ?? '#171717' ),
		'--premium-tabs-subheading-family:' . ( $attributes['subheadingFontFamily'] ?? 'var(--wp--preset--font-family--dm-sans)' ),
		'--premium-tabs-subheading-size:' . ( $attributes['subheadingFontSize'] ?? '1rem' ),
		'--premium-tabs-subheading-weight:' . ( $attributes['subheadingFontWeight'] ?? '400' ),
		'--premium-tabs-subheading-line-height:' . ( $attributes['subheadingLineHeight'] ?? '1.6' ),
		'--premium-tabs-subheading-color:' . ( $attributes['subheadingColor'] ?? 'rgba(23, 23, 23, 0.72)' ),
		'--premium-tabs-heading-tabs-gap:' . absint( $attributes['headingTabsGap'] ?? 24 ) . 'px',
		'--premium-tabs-tabs-nav-gap:' . absint( $attributes['tabsNavGap'] ?? 28 ) . 'px',
		'--premium-tabs-header-nav-gap:' . absint( $attributes['headerNavGap'] ?? 24 ) . 'px',
		'--premium-tabs-card-title-family:' . ( $attributes['cardTitleFontFamily'] ?? 'var(--wp--preset--font-family--montserrat)' ),
		'--premium-tabs-card-title-size:' . ( $attributes['cardTitleFontSize'] ?? 'clamp(1.5rem, 2.4vw, 2rem)' ),
		'--premium-tabs-card-title-weight:' . ( $attributes['cardTitleFontWeight'] ?? '700' ),
		'--premium-tabs-card-title-line-height:' . ( $attributes['cardTitleLineHeight'] ?? '1.04' ),
		'--premium-tabs-card-title-color:' . ( $attributes['cardTitleColor'] ?? '#ffffff' ),
		'--premium-tabs-card-body-family:' . ( $attributes['cardBodyFontFamily'] ?? 'var(--wp--preset--font-family--dm-sans)' ),
		'--premium-tabs-card-body-size:' . ( $attributes['cardBodyFontSize'] ?? '1rem' ),
		'--premium-tabs-card-body-weight:' . ( $attributes['cardBodyFontWeight'] ?? '400' ),
		'--premium-tabs-card-body-line-height:' . ( $attributes['cardBodyLineHeight'] ?? '1.5' ),
		'--premium-tabs-card-body-color:' . ( $attributes['cardBodyColor'] ?? '#ffffff' ),
		'--premium-tabs-card-text-transform:' . ( ! empty( $attributes['cardTextUppercase'] ) ? 'uppercase' : 'none' ),
		'--premium-tabs-button-family:' . ( $attributes['buttonFontFamily'] ?? 'var(--wp--preset--font-family--montserrat)' ),
		'--premium-tabs-button-size:' . ( $attributes['buttonFontSize'] ?? '0.95rem' ),
		'--premium-tabs-button-weight:' . ( $attributes['buttonFontWeight'] ?? '600' ),
		'--premium-tabs-button-line-height:' . ( $attributes['buttonLineHeight'] ?? '1.2' ),
		'--premium-tabs-button-color:' . ( $attributes['buttonTextColor'] ?? '#ffffff' ),
		'--premium-tabs-button-bg:' . ( $attributes['buttonBackgroundColor'] ?? 'rgba(255, 255, 255, 0.16)' ),
		'--premium-tabs-button-border-color:' . ( $attributes['buttonBorderColor'] ?? 'rgba(255, 255, 255, 0.38)' ),
		'--premium-tabs-button-border-width:' . absint( $attributes['buttonBorderWidth'] ?? 1 ) . 'px',
		'--premium-tabs-button-radius:' . ( $attributes['buttonBorderRadius'] ?? '999px' ),
		'--premium-tabs-button-width:' . ( $attributes['buttonWidth'] ?? 'fit-content' ),
		'--premium-tabs-button-pad-top:' . ( $button_pad['top'] ?? '13px' ),
		'--premium-tabs-button-pad-right:' . ( $button_pad['right'] ?? '20px' ),
		'--premium-tabs-button-pad-bottom:' . ( $button_pad['bottom'] ?? '13px' ),
		'--premium-tabs-button-pad-left:' . ( $button_pad['left'] ?? '20px' ),
		'--premium-tabs-nav-size:' . absint( $attributes['navButtonSize'] ?? 54 ) . 'px',
		'--premium-tabs-nav-icon-size:' . absint( $attributes['navIconSize'] ?? 20 ) . 'px',
		'--premium-tabs-nav-border-width:' . absint( $attributes['navBorderWidth'] ?? 1 ) . 'px',
		'--premium-tabs-nav-radius:' . ( $attributes['navBorderRadius'] ?? '999px' ),
		'--premium-tabs-nav-border-color:' . ( $attributes['navBorderColor'] ?? 'rgba(23, 23, 23, 0.16)' ),
		'--premium-tabs-nav-bg:' . ( $attributes['navBackgroundColor'] ?? 'rgba(255, 255, 255, 0.78)' ),
		'--premium-tabs-nav-icon-color:' . ( $attributes['navIconColor'] ?? '#171717' ),
		'--premium-tabs-nav-hover-bg:' . ( $attributes['navHoverBackgroundColor'] ?? '#171717' ),
		'--premium-tabs-nav-hover-icon-color:' . ( $attributes['navHoverIconColor'] ?? '#f4efe7' ),
		'--premium-tabs-card-scale-desktop:' . ( $attributes['cardWidthScaleDesktop'] ?? 100 ),
		'--premium-tabs-card-scale-tablet:' . ( $attributes['cardWidthScaleTablet'] ?? 100 ),
		'--premium-tabs-card-scale-mobile:' . ( $attributes['cardWidthScaleMobile'] ?? 100 ),
		'--premium-tabs-tab-family:' . ( $attributes['tabFontFamily'] ?? 'var(--wp--preset--font-family--montserrat)' ),
		'--premium-tabs-tab-size:' . ( $attributes['tabFontSize'] ?? '0.95rem' ),
		'--premium-tabs-tab-weight:' . ( $attributes['tabFontWeight'] ?? '600' ),
		'--premium-tabs-tab-color:' . ( $attributes['tabTextColor'] ?? 'rgba(23, 23, 23, 0.72)' ),
		'--premium-tabs-tab-active-color:' . ( $attributes['tabActiveTextColor'] ?? '#171717' ),
		'--premium-tabs-tab-border-color:' . ( $attributes['tabBorderColor'] ?? 'rgba(23, 23, 23, 0.14)' ),
		'--premium-tabs-tab-active-border-color:' . ( $attributes['tabActiveBorderColor'] ?? '#171717' ),
		'--premium-tabs-tab-bg:' . ( $attributes['tabBackgroundColor'] ?? 'rgba(255, 255, 255, 0.82)' ),
		'--premium-tabs-tab-active-bg:' . ( $attributes['tabActiveBackgroundColor'] ?? '#ffffff' ),
	),
	$spacing_style( $padding, 'padding' )
);

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class'               => 'premium-tabs-carousel',
		'style'               => implode( ';', array_map( 'esc_attr', $style_parts ) ),
		'data-gap'            => absint( $attributes['gap'] ?? 24 ),
		'data-loop'           => $parse_bool( $attributes['loop'] ?? false ),
		'data-autoplay'       => $parse_bool( $attributes['autoplay'] ?? false ),
		'data-autoplay-delay' => absint( $attributes['autoplayDelay'] ?? 4000 ),
		'data-speed'          => absint( $attributes['transitionSpeed'] ?? 450 ),
		'data-show-pagination' => $parse_bool( $attributes['showPagination'] ?? true ),
		'data-tabs-enabled'   => $parse_bool( $tabs_enabled ),
		'data-active-tab'     => 'all',
	)
);
?>
<section <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<div class="premium-tabs-carousel__inner">
		<div class="premium-tabs-carousel__header">
			<div class="premium-tabs-carousel__copy">
				<?php if ( ! empty( $attributes['heading'] ) ) : ?>
					<h2 class="premium-tabs-carousel__heading"><?php echo wp_kses_post( $attributes['heading'] ); ?></h2>
				<?php endif; ?>
				<?php if ( ! empty( $attributes['subheading'] ) ) : ?>
					<p class="premium-tabs-carousel__subheading"><?php echo wp_kses_post( $attributes['subheading'] ); ?></p>
				<?php endif; ?>
			</div>

			<?php if ( $tabs_enabled ) : ?>
				<div class="premium-tabs-carousel__tabs" role="tablist" aria-label="<?php esc_attr_e( 'Teacher activity tabs', 'zenctuary' ); ?>">
					<?php $tab_index = 0; ?>
					<?php foreach ( $tabs as $slug => $label ) : ?>
						<button type="button" class="premium-tabs-carousel__tab<?php echo 0 === $tab_index ? ' is-active' : ''; ?>" data-tab-id="<?php echo esc_attr( $slug ); ?>" aria-pressed="<?php echo 0 === $tab_index ? 'true' : 'false'; ?>">
							<?php echo esc_html( $label ); ?>
						</button>
						<?php ++$tab_index; ?>
					<?php endforeach; ?>
				</div>
			<?php endif; ?>

			<div class="premium-tabs-carousel__nav">
				<button type="button" class="premium-tabs-carousel__arrow premium-tabs-carousel__arrow--prev" aria-label="<?php esc_attr_e( 'Previous slide', 'zenctuary' ); ?>"><?php echo $navigation_icon( $icon_set, 'prev' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></button>
				<button type="button" class="premium-tabs-carousel__arrow premium-tabs-carousel__arrow--next" aria-label="<?php esc_attr_e( 'Next slide', 'zenctuary' ); ?>"><?php echo $navigation_icon( $icon_set, 'next' ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></button>
			</div>
		</div>

		<div class="premium-tabs-carousel__stage">
			<div class="premium-tabs-carousel__swiper swiper">
				<div class="swiper-wrapper">
					<?php foreach ( $teachers as $teacher ) : ?>
						<?php
						$teacher_id   = (int) $teacher->ID;
						$image_url    = get_the_post_thumbnail_url( $teacher_id, 'large' );
						$terms        = $teacher_terms[ $teacher_id ] ?? array();
						$term_slugs   = array_keys( $terms );
						$slide_tabs   = array_unique( array_merge( array( 'all' ), $term_slugs ) );
						$permalink    = get_permalink( $teacher_id );
						$link_target  = $open_new_tab ? '_blank' : '';
						$link_rel     = $open_new_tab ? 'noopener noreferrer' : '';
						?>
						<div class="swiper-slide premium-tabs-carousel__slide" data-tab-id="all" data-tab-ids="<?php echo esc_attr( implode( ',', $slide_tabs ) ); ?>">
							<article class="premium-tabs-carousel__card" style="<?php echo esc_attr( $image_url ? 'background-image:url(' . esc_url_raw( $image_url ) . ')' : 'background-color:#c8bfb2' ); ?>">
								<div class="premium-tabs-carousel__overlay" style="background-color:#1f1d1a;opacity:0.48"></div>
								<div class="premium-tabs-carousel__card-content">
									<div class="premium-tabs-carousel__card-top">
										<h3 class="premium-tabs-carousel__card-title"><?php echo esc_html( get_the_title( $teacher_id ) ); ?></h3>
									</div>
									<div class="premium-tabs-carousel__card-bottom">
										<?php if ( count( $terms ) > 1 ) : ?>
											<ul class="premium-tabs-carousel__card-items">
												<?php foreach ( $terms as $label ) : ?>
													<li><?php echo esc_html( $label ); ?></li>
												<?php endforeach; ?>
											</ul>
										<?php elseif ( 1 === count( $terms ) ) : ?>
											<p class="premium-tabs-carousel__card-items"><?php echo esc_html( reset( $terms ) ); ?></p>
										<?php endif; ?>

										<?php if ( $button_text && $permalink ) : ?>
											<a class="premium-tabs-carousel__button premium-tabs-carousel__button--icon-<?php echo esc_attr( $attributes['buttonIconPosition'] ?? 'right' ); ?>" href="<?php echo esc_url( $permalink ); ?>" <?php echo $link_target ? 'target="' . esc_attr( $link_target ) . '"' : ''; ?> <?php echo $link_rel ? 'rel="' . esc_attr( $link_rel ) . '"' : ''; ?>>
												<?php if ( ! empty( $attributes['buttonShowIcon'] ) ) : ?>
													<span class="premium-tabs-carousel__button-icon" aria-hidden="true"><?php echo $arrow_icon(); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
												<?php endif; ?>
												<span><?php echo esc_html( $button_text ); ?></span>
											</a>
										<?php endif; ?>
									</div>
								</div>
							</article>
						</div>
					<?php endforeach; ?>
				</div>
			</div>
			<?php if ( ! empty( $attributes['showPagination'] ) ) : ?>
				<div class="premium-tabs-carousel__pagination"></div>
			<?php endif; ?>
		</div>
	</div>
</section>
