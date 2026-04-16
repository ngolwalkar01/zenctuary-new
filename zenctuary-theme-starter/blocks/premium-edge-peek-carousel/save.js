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

function normalizeCards( cards ) {
	if ( ! Array.isArray( cards ) || ! cards.length ) {
		return [];
	}
	return cards.map( ( card ) => ( {
		imageId: card?.imageId || 0,
		imageUrl: card?.imageUrl || '',
		overlayColor: card?.overlayColor || '#1f1d1a',
		overlayOpacity: typeof card?.overlayOpacity === 'number' ? card.overlayOpacity : 0.48,
		title: card?.title || '',
		items: Array.isArray( card?.items ) ? card.items.filter( Boolean ) : [],
		showDots: !! card?.showDots,
		dotsText: card?.dotsText || '...',
		buttonText: card?.buttonText || '',
		buttonUrl: card?.buttonUrl || '',
		openInNewTab: !! card?.openInNewTab,
	} ) );
}

function arrowIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M3.5 12H18.5M18.5 12L13.5 7M18.5 12L13.5 17" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

export default function save( { attributes } ) {
	const cards = normalizeCards( attributes.cards );
	const blockProps = useBlockProps.save( {
		className: 'premium-edge-peek-carousel',
		style: {
			backgroundColor: attributes.backgroundColor,
			...getSpacingStyle( attributes.sectionPadding, 'padding' ),
			'--premium-edge-peek-content-max-width': `${ attributes.contentMaxWidth || 1320 }px`,
			'--premium-edge-peek-gap': `${ attributes.gap || 24 }px`,
			'--premium-edge-peek-card-radius': `${ attributes.cardBorderRadius || 20 }px`,
			'--premium-edge-peek-card-padding': `${ attributes.cardContentPadding || 24 }px`,
			'--premium-edge-peek-heading-max-width': `${ attributes.headingMaxWidth || 760 }px`,
			'--premium-edge-peek-heading-size': attributes.headingFontSize || 'clamp(2rem, 4vw, 3.75rem)',
			'--premium-edge-peek-heading-weight': attributes.headingFontWeight || '700',
			'--premium-edge-peek-heading-line-height': attributes.headingLineHeight || '0.98',
			'--premium-edge-peek-heading-color': attributes.headingColor || '#171717',
			'--premium-edge-peek-card-title-size': attributes.cardTitleFontSize || 'clamp(1.5rem, 2.4vw, 2rem)',
			'--premium-edge-peek-card-title-weight': attributes.cardTitleFontWeight || '700',
			'--premium-edge-peek-card-title-line-height': attributes.cardTitleLineHeight || '1.04',
			'--premium-edge-peek-card-title-color': attributes.cardTitleColor || '#ffffff',
			'--premium-edge-peek-card-body-size': attributes.cardBodyFontSize || '1rem',
			'--premium-edge-peek-card-body-weight': attributes.cardBodyFontWeight || '400',
			'--premium-edge-peek-card-body-line-height': attributes.cardBodyLineHeight || '1.5',
			'--premium-edge-peek-card-body-color': attributes.cardBodyColor || '#ffffff',
			'--premium-edge-peek-dots-size': attributes.dotsFontSize || '1.35rem',
			'--premium-edge-peek-dots-spacing': attributes.dotsLetterSpacing || '0.22em',
			'--premium-edge-peek-dots-color': attributes.dotsColor || 'rgba(255, 255, 255, 0.86)',
			'--premium-edge-peek-button-size': attributes.buttonFontSize || '0.95rem',
			'--premium-edge-peek-button-weight': attributes.buttonFontWeight || '600',
			'--premium-edge-peek-button-line-height': attributes.buttonLineHeight || '1.2',
			'--premium-edge-peek-button-color': attributes.buttonTextColor || '#ffffff',
			'--premium-edge-peek-button-bg': attributes.buttonBackgroundColor || 'rgba(255, 255, 255, 0.16)',
			'--premium-edge-peek-button-border-color': attributes.buttonBorderColor || 'rgba(255, 255, 255, 0.38)',
			'--premium-edge-peek-button-border-width': `${ attributes.buttonBorderWidth || 1 }px`,
			'--premium-edge-peek-button-radius': attributes.buttonBorderRadius || '999px',
			'--premium-edge-peek-button-width': attributes.buttonWidth || 'fit-content',
			'--premium-edge-peek-button-pad-top': attributes.buttonPadding?.top || '13px',
			'--premium-edge-peek-button-pad-right': attributes.buttonPadding?.right || '20px',
			'--premium-edge-peek-button-pad-bottom': attributes.buttonPadding?.bottom || '13px',
			'--premium-edge-peek-button-pad-left': attributes.buttonPadding?.left || '20px',
			'--premium-edge-peek-desktop-cards': String( attributes.desktopCards || 3 ),
			'--premium-edge-peek-tablet-cards': String( attributes.tabletCards || 2 ),
			'--premium-edge-peek-mobile-cards': String( attributes.mobileCards || 1 ),
			'--premium-edge-peek-desktop-peek': String( attributes.edgePeekDesktop || 20 ),
			'--premium-edge-peek-tablet-peek': String( attributes.edgePeekTablet || 20 ),
			'--premium-edge-peek-mobile-peek': String( attributes.edgePeekMobile || 20 ),
			'--premium-edge-peek-left-start-desktop': `${ attributes.leftStartOffsetDesktop || 80 }px`,
			'--premium-edge-peek-left-start-tablet': `${ attributes.leftStartOffsetTablet || 48 }px`,
			'--premium-edge-peek-left-start-mobile': `${ attributes.leftStartOffsetMobile || 20 }px`,
			'--premium-edge-peek-card-scale-desktop': String( attributes.cardWidthScaleDesktop || 100 ),
			'--premium-edge-peek-card-scale-tablet': String( attributes.cardWidthScaleTablet || 100 ),
			'--premium-edge-peek-card-scale-mobile': String( attributes.cardWidthScaleMobile || 100 ),
		},
		'data-desktop-slides': String( getSlidesPerView( attributes.desktopCards, attributes.edgePeekDesktop ) ),
		'data-tablet-slides': String( getSlidesPerView( attributes.tabletCards, attributes.edgePeekTablet ) ),
		'data-mobile-slides': String( getSlidesPerView( attributes.mobileCards, attributes.edgePeekMobile ) ),
		'data-left-start-desktop': String( attributes.leftStartOffsetDesktop || 80 ),
		'data-left-start-tablet': String( attributes.leftStartOffsetTablet || 48 ),
		'data-left-start-mobile': String( attributes.leftStartOffsetMobile || 20 ),
		'data-gap': String( attributes.gap || 24 ),
		'data-loop': attributes.loop ? 'true' : 'false',
		'data-autoplay': attributes.autoplay ? 'true' : 'false',
		'data-autoplay-delay': String( attributes.autoplayDelay || 4000 ),
		'data-speed': String( attributes.transitionSpeed || 450 ),
		'data-show-pagination': attributes.showPagination ? 'true' : 'false',
	} );

	return (
		<section { ...blockProps }>
			<div className="premium-edge-peek-carousel__inner">
				<div className="premium-edge-peek-carousel__header">
					<div className="premium-edge-peek-carousel__copy">
						{ attributes.heading && <RichText.Content tagName="h2" className="premium-edge-peek-carousel__heading" value={ attributes.heading } /> }
						{ attributes.subheading && <RichText.Content tagName="p" className="premium-edge-peek-carousel__subheading" value={ attributes.subheading } /> }
					</div>
					<div className="premium-edge-peek-carousel__nav">
						<button type="button" className="premium-edge-peek-carousel__arrow premium-edge-peek-carousel__arrow--prev" aria-label="Previous slide"><span aria-hidden="true">&#8592;</span></button>
						<button type="button" className="premium-edge-peek-carousel__arrow premium-edge-peek-carousel__arrow--next" aria-label="Next slide"><span aria-hidden="true">&#8594;</span></button>
					</div>
				</div>
				<div className="premium-edge-peek-carousel__stage">
					<div className="premium-edge-peek-carousel__swiper swiper">
						<div className="swiper-wrapper">
							{ cards.map( ( card, index ) => (
								<div key={ index } className="swiper-slide premium-edge-peek-carousel__slide">
									<article className="premium-edge-peek-carousel__card" style={ {
										backgroundImage: card.imageUrl ? `linear-gradient(180deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.68) 100%), url("${ card.imageUrl }")` : undefined,
										backgroundColor: ! card.imageUrl ? '#c8bfb2' : undefined,
									} }>
										<div className="premium-edge-peek-carousel__overlay" style={ { backgroundColor: card.overlayColor, opacity: card.overlayOpacity } } />
										<div className="premium-edge-peek-carousel__card-content">
											<div className="premium-edge-peek-carousel__card-top">
												{ card.title && <RichText.Content tagName="h3" className="premium-edge-peek-carousel__card-title" value={ card.title } /> }
											</div>
											<div className="premium-edge-peek-carousel__card-bottom">
												{ card.items.length > 0 && (
													<ul className="premium-edge-peek-carousel__card-items">
														{ card.items.map( ( item, itemIndex ) => <li key={ itemIndex }>{ item }</li> ) }
													</ul>
												) }
												{ card.showDots && <div className="premium-edge-peek-carousel__dots" aria-hidden="true">{ card.dotsText || '...' }</div> }
												{ card.buttonText && (
													<a className={ `premium-edge-peek-carousel__button premium-edge-peek-carousel__button--icon-${ attributes.buttonIconPosition || 'right' }` } href={ card.buttonUrl || '#' } target={ card.openInNewTab ? '_blank' : undefined } rel={ card.openInNewTab ? 'noopener noreferrer' : undefined }>
														{ attributes.buttonShowIcon && <span className="premium-edge-peek-carousel__button-icon" aria-hidden="true">{ arrowIcon() }</span> }
														<span>{ card.buttonText }</span>
													</a>
												) }
											</div>
										</div>
									</article>
								</div>
							) ) }
						</div>
					</div>
					{ attributes.showPagination && <div className="premium-edge-peek-carousel__pagination" /> }
				</div>
			</div>
		</section>
	);
}
