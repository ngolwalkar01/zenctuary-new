import { RichText, useBlockProps } from '@wordpress/block-editor';

function getSpacingStyle( value = {}, property ) {
	return {
		[ `${ property }Top` ]: value.top || '0px',
		[ `${ property }Right` ]: value.right || '0px',
		[ `${ property }Bottom` ]: value.bottom || '0px',
		[ `${ property }Left` ]: value.left || '0px',
	};
}

function getSlidesPerView( cardsPerView, edgePeekPercent ) {
	return Math.max( 1, Number( cardsPerView ) || 1 ) + ( Math.max( 0, Number( edgePeekPercent ) || 0 ) / 100 );
}

function createDefaultCard() {
	return {
		cardType: 'text',
		avatarImageId: 0,
		avatarImageUrl: '',
		imageId: 0,
		imageUrl: '',
		videoId: 0,
		rating: 5,
		quote: '',
		authorName: '',
		videoUrl: '',
		openInNewTab: false,
	};
}

function normalizeCards( cards ) {
	if ( ! Array.isArray( cards ) || ! cards.length ) {
		return [];
	}

	return cards.map( ( card ) => ( {
		...createDefaultCard(),
		...card,
		cardType: card?.cardType === 'video' ? 'video' : 'text',
		rating: Math.max( 0, Math.min( 5, Number( card?.rating ) || 0 ) ),
	} ) );
}

function navigationIcon( iconSet = 'chevron', direction = 'next' ) {
	const isNext = direction === 'next';

	if ( iconSet === 'dashicons-arrow-alt2' ) {
		return <span className={ `premium-testimonial-carousel__arrow-icon dashicons ${ isNext ? 'dashicons-arrow-right-alt2' : 'dashicons-arrow-left-alt2' }` } aria-hidden="true" />;
	}

	if ( iconSet === 'dashicons-controls' ) {
		return <span className={ `premium-testimonial-carousel__arrow-icon dashicons ${ isNext ? 'dashicons-controls-forward' : 'dashicons-controls-back' }` } aria-hidden="true" />;
	}

	if ( iconSet === 'caret' ) {
		return (
			<svg className="premium-testimonial-carousel__arrow-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
				<path d={ isNext ? 'M10 7L15 12L10 17' : 'M14 7L9 12L14 17' } stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		);
	}

	if ( iconSet === 'line-arrow' ) {
		return (
			<svg className="premium-testimonial-carousel__arrow-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
				<path d={ isNext ? 'M3.5 12H18.5M18.5 12L13.5 7M18.5 12L13.5 17' : 'M20.5 12H5.5M5.5 12L10.5 7M5.5 12L10.5 17' } stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		);
	}

	return (
		<svg className="premium-testimonial-carousel__arrow-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
			<path d={ isNext ? 'M9 5L16 12L9 19' : 'M15 5L8 12L15 19' } stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

function renderStars( rating ) {
	return '★'.repeat( Math.max( 0, Math.min( 5, rating ) ) );
}

function playIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
			<path d="M9 7.5V16.5L16 12L9 7.5Z" fill="currentColor" />
		</svg>
	);
}

function pauseIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
			<path d="M8 7H10.75V17H8V7ZM13.25 7H16V17H13.25V7Z" fill="currentColor" />
		</svg>
	);
}

function muteIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
			<path d="M5 10H8L12 6V18L8 14H5V10Z" fill="currentColor" />
			<path d="M15 9.5C15.8333 10.1667 16.25 11 16.25 12C16.25 13 15.8333 13.8333 15 14.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
			<path d="M17 7.5C18.5 8.66667 19.25 10.1667 19.25 12C19.25 13.8333 18.5 15.3333 17 16.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
		</svg>
	);
}

export default function save( { attributes } ) {
	const cards = normalizeCards( attributes.cards );
	const blockProps = useBlockProps.save( {
		className: 'premium-testimonial-carousel',
		style: {
			backgroundColor: attributes.backgroundColor,
			backgroundImage: attributes.backgroundImageUrl ? `url("${ attributes.backgroundImageUrl }")` : undefined,
			backgroundSize: attributes.backgroundImageUrl ? 'cover' : undefined,
			backgroundPosition: attributes.backgroundImageUrl ? 'center' : undefined,
			...getSpacingStyle( attributes.sectionPadding, 'padding' ),
			'--premium-testimonial-content-max-width': `${ attributes.contentMaxWidth || 1320 }px`,
			'--premium-testimonial-gap': `${ attributes.gap || 36 }px`,
			'--premium-testimonial-card-radius': `${ attributes.cardBorderRadius || 24 }px`,
			'--premium-testimonial-card-padding': `${ attributes.cardContentPadding || 32 }px`,
			'--premium-testimonial-heading-max-width': `${ attributes.headingMaxWidth || 980 }px`,
			'--premium-testimonial-heading-size': attributes.headingFontSize || 'clamp(2.1rem, 4vw, 4rem)',
			'--premium-testimonial-heading-weight': attributes.headingFontWeight || '700',
			'--premium-testimonial-heading-line-height': attributes.headingLineHeight || '1',
			'--premium-testimonial-heading-color': attributes.headingColor || '#dbbf58',
			'--premium-testimonial-text-card-bg': attributes.textCardBackgroundColor || '#4a4848',
			'--premium-testimonial-quote-size': attributes.quoteFontSize || 'clamp(1.35rem, 1.7vw, 1.65rem)',
			'--premium-testimonial-quote-weight': attributes.quoteFontWeight || '400',
			'--premium-testimonial-quote-line-height': attributes.quoteLineHeight || '1.45',
			'--premium-testimonial-quote-color': attributes.quoteColor || '#f3f0eb',
			'--premium-testimonial-author-size': attributes.authorFontSize || '1.15rem',
			'--premium-testimonial-author-weight': attributes.authorFontWeight || '700',
			'--premium-testimonial-author-line-height': attributes.authorLineHeight || '1.2',
			'--premium-testimonial-author-color': attributes.authorColor || '#ffffff',
			'--premium-testimonial-stars-color': attributes.starsColor || '#dbbf58',
			'--premium-testimonial-stars-size': attributes.starsSize || '1.95rem',
			'--premium-testimonial-stars-spacing': attributes.starsLetterSpacing || '0.14em',
			'--premium-testimonial-avatar-size': `${ attributes.avatarSize || 62 }px`,
			'--premium-testimonial-avatar-border': attributes.avatarBorderColor || 'rgba(255, 255, 255, 0.88)',
			'--premium-testimonial-play-size': `${ attributes.playButtonSize || 82 }px`,
			'--premium-testimonial-play-bg': attributes.playButtonBackgroundColor || '#dbbf58',
			'--premium-testimonial-play-color': attributes.playButtonIconColor || '#3d3937',
			'--premium-testimonial-video-overlay': attributes.videoOverlayColor || 'rgba(0, 0, 0, 0.18)',
			'--premium-testimonial-nav-size': `${ attributes.navButtonSize || 54 }px`,
			'--premium-testimonial-nav-icon-size': `${ attributes.navIconSize || 20 }px`,
			'--premium-testimonial-nav-border-width': `${ attributes.navBorderWidth || 1 }px`,
			'--premium-testimonial-nav-radius': attributes.navBorderRadius || '999px',
			'--premium-testimonial-nav-border-color': attributes.navBorderColor || '#dbbf58',
			'--premium-testimonial-nav-bg': attributes.navBackgroundColor || 'transparent',
			'--premium-testimonial-nav-icon-color': attributes.navIconColor || '#dbbf58',
			'--premium-testimonial-nav-hover-bg': attributes.navHoverBackgroundColor || '#dbbf58',
			'--premium-testimonial-nav-hover-icon-color': attributes.navHoverIconColor || '#3f3932',
			'--premium-testimonial-desktop-cards': String( attributes.desktopCards || 3 ),
			'--premium-testimonial-tablet-cards': String( attributes.tabletCards || 2 ),
			'--premium-testimonial-mobile-cards': String( attributes.mobileCards || 1 ),
			'--premium-testimonial-desktop-peek': String( attributes.edgePeekDesktop || 20 ),
			'--premium-testimonial-tablet-peek': String( attributes.edgePeekTablet || 20 ),
			'--premium-testimonial-mobile-peek': String( attributes.edgePeekMobile || 20 ),
			'--premium-testimonial-left-start-desktop': `${ attributes.leftStartOffsetDesktop || 80 }px`,
			'--premium-testimonial-left-start-tablet': `${ attributes.leftStartOffsetTablet || 48 }px`,
			'--premium-testimonial-left-start-mobile': `${ attributes.leftStartOffsetMobile || 20 }px`,
			'--premium-testimonial-card-scale-desktop': String( attributes.cardWidthScaleDesktop || 100 ),
			'--premium-testimonial-card-scale-tablet': String( attributes.cardWidthScaleTablet || 100 ),
			'--premium-testimonial-card-scale-mobile': String( attributes.cardWidthScaleMobile || 100 ),
		},
		'data-desktop-slides': String( getSlidesPerView( attributes.desktopCards, attributes.edgePeekDesktop ) ),
		'data-tablet-slides': String( getSlidesPerView( attributes.tabletCards, attributes.edgePeekTablet ) ),
		'data-mobile-slides': String( getSlidesPerView( attributes.mobileCards, attributes.edgePeekMobile ) ),
		'data-left-start-desktop': String( attributes.leftStartOffsetDesktop || 80 ),
		'data-left-start-tablet': String( attributes.leftStartOffsetTablet || 48 ),
		'data-left-start-mobile': String( attributes.leftStartOffsetMobile || 20 ),
		'data-gap': String( attributes.gap || 36 ),
		'data-loop': attributes.loop ? 'true' : 'false',
		'data-autoplay': attributes.autoplay ? 'true' : 'false',
		'data-autoplay-delay': String( attributes.autoplayDelay || 4000 ),
		'data-speed': String( attributes.transitionSpeed || 450 ),
		'data-show-pagination': attributes.showPagination ? 'true' : 'false',
	} );

	return (
		<section { ...blockProps }>
			<div className="premium-testimonial-carousel__inner">
				<div className="premium-testimonial-carousel__header">
					<div className="premium-testimonial-carousel__copy">
						{ attributes.heading && <RichText.Content tagName="h2" className="premium-testimonial-carousel__heading" value={ attributes.heading } /> }
						{ attributes.subheading && <RichText.Content tagName="p" className="premium-testimonial-carousel__subheading" value={ attributes.subheading } /> }
					</div>
					<div className="premium-testimonial-carousel__nav">
						<button type="button" className="premium-testimonial-carousel__arrow premium-testimonial-carousel__arrow--prev" aria-label="Previous slide">{ navigationIcon( attributes.navIconSet, 'prev' ) }</button>
						<button type="button" className="premium-testimonial-carousel__arrow premium-testimonial-carousel__arrow--next" aria-label="Next slide">{ navigationIcon( attributes.navIconSet, 'next' ) }</button>
					</div>
				</div>
				<div className="premium-testimonial-carousel__stage">
					<div className="premium-testimonial-carousel__swiper swiper">
						<div className="swiper-wrapper">
							{ cards.map( ( card, index ) => (
								<div key={ index } className="swiper-slide premium-testimonial-carousel__slide">
									<article className={ `premium-testimonial-carousel__card premium-testimonial-carousel__card--${ card.cardType }` } style={ card.cardType === 'video' && card.imageUrl ? { backgroundImage: `url("${ card.imageUrl }")` } : undefined }>
										<div className="premium-testimonial-carousel__card-layer" />
										{ card.cardType === 'video' && card.videoUrl && <video className="premium-testimonial-carousel__video" src={ card.videoUrl } poster={ card.imageUrl || undefined } muted playsInline preload="metadata" /> }
										<div className="premium-testimonial-carousel__card-content">
											<div className="premium-testimonial-carousel__card-top-row">
												<div className="premium-testimonial-carousel__avatar-shell">
													{ card.avatarImageUrl ? <img className="premium-testimonial-carousel__avatar" src={ card.avatarImageUrl } alt="" /> : <div className="premium-testimonial-carousel__avatar premium-testimonial-carousel__avatar--placeholder" aria-hidden="true" /> }
												</div>
												<div className="premium-testimonial-carousel__rating" aria-label={ `${ card.rating } out of 5 stars` }>{ renderStars( card.rating ) }</div>
											</div>

											{ card.cardType === 'text' ? (
												<div className="premium-testimonial-carousel__text-stack">
													{ card.quote && <p className="premium-testimonial-carousel__quote">{ card.quote }</p> }
													{ card.authorName && <p className="premium-testimonial-carousel__author">{ card.authorName }</p> }
												</div>
											) : (
												<>
													<div className="premium-testimonial-carousel__video-center">
														<button type="button" className="premium-testimonial-carousel__play-button is-paused" aria-label={ card.authorName ? `Play testimonial from ${ card.authorName }` : 'Play testimonial' } data-action="play-pause">
															<span className="premium-testimonial-carousel__play-icon premium-testimonial-carousel__play-icon--play">{ playIcon() }</span>
															<span className="premium-testimonial-carousel__play-icon premium-testimonial-carousel__play-icon--pause">{ pauseIcon() }</span>
														</button>
													</div>
													<button type="button" className="premium-testimonial-carousel__mute-button is-muted" aria-label={ card.authorName ? `Unmute testimonial from ${ card.authorName }` : 'Unmute testimonial' } data-action="mute-toggle">
														<span className="premium-testimonial-carousel__mute-icon">{ muteIcon() }</span>
													</button>
													{ card.authorName && <p className="premium-testimonial-carousel__author premium-testimonial-carousel__author--video">{ card.authorName }</p> }
												</>
											) }
										</div>
									</article>
								</div>
							) ) }
						</div>
					</div>
					{ attributes.showPagination && <div className="premium-testimonial-carousel__pagination" /> }
				</div>
			</div>
		</section>
	);
}
