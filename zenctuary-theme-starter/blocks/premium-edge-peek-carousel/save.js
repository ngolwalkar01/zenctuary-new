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
			'--premium-edge-peek-pad-left': attributes.sectionPadding?.left || '24px',
			'--premium-edge-peek-pad-right': attributes.sectionPadding?.right || '24px',
		},
		'data-desktop-slides': String( getSlidesPerView( attributes.desktopCards, attributes.edgePeekDesktop ) ),
		'data-tablet-slides': String( getSlidesPerView( attributes.tabletCards, attributes.edgePeekTablet ) ),
		'data-mobile-slides': String( getSlidesPerView( attributes.mobileCards, attributes.edgePeekMobile ) ),
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
											{ card.title && <RichText.Content tagName="h3" className="premium-edge-peek-carousel__card-title" value={ card.title } /> }
											{ card.items.length > 0 && (
												<ul className="premium-edge-peek-carousel__card-items">
													{ card.items.map( ( item, itemIndex ) => <li key={ itemIndex }>{ item }</li> ) }
												</ul>
											) }
											{ card.showDots && <div className="premium-edge-peek-carousel__dots" aria-hidden="true">{ card.dotsText || '...' }</div> }
											{ card.buttonText && (
												<a className="premium-edge-peek-carousel__button" href={ card.buttonUrl || '#' } target={ card.openInNewTab ? '_blank' : undefined } rel={ card.openInNewTab ? 'noopener noreferrer' : undefined }>
													{ card.buttonText }
												</a>
											) }
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
