import { RichText, useBlockProps } from '@wordpress/block-editor';

function getSpacingStyle( value = {}, property ) {
	return {
		[ `${ property }Top` ]: value.top || '0px',
		[ `${ property }Right` ]: value.right || '0px',
		[ `${ property }Bottom` ]: value.bottom || '0px',
		[ `${ property }Left` ]: value.left || '0px',
	};
}

function normalizeTabs( tabs ) {
	if ( ! Array.isArray( tabs ) || ! tabs.length ) {
		return [ { id: 'default', label: 'All' } ];
	}

	return tabs
		.map( ( tab, index ) => ( {
			id: tab?.id || `tab-${ index + 1 }`,
			label: tab?.label || `Tab ${ index + 1 }`,
		} ) )
		.filter( ( tab ) => tab.label );
}

function normalizeCards( cards, tabs ) {
	if ( ! Array.isArray( cards ) || ! cards.length ) {
		return [];
	}

	const defaultTabId = tabs[ 0 ]?.id || 'default';
	return cards.map( ( card ) => ( {
		imageId: card?.imageId || 0,
		imageUrl: card?.imageUrl || '',
		showOverlay: card?.showOverlay !== false,
		overlayColor: card?.overlayColor || '#1f1d1a',
		overlayOpacity: typeof card?.overlayOpacity === 'number' ? card.overlayOpacity : 0.48,
		title: card?.title || '',
		items: Array.isArray( card?.items ) ? card.items.filter( Boolean ) : [],
		showDots: !! card?.showDots,
		dotsText: card?.dotsText || '...',
		buttonText: card?.buttonText || '',
		buttonUrl: card?.buttonUrl || '',
		openInNewTab: !! card?.openInNewTab,
		tabId: card?.tabId || defaultTabId,
		tabIds: Array.isArray( card?.tabIds ) && card.tabIds.length
			? card.tabIds.filter( Boolean )
			: [ card?.tabId || defaultTabId ],
	} ) );
}

function arrowIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M3.5 12H18.5M18.5 12L13.5 7M18.5 12L13.5 17" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

function navigationIcon( iconSet = 'line-arrow', direction = 'next' ) {
	const isNext = direction === 'next';

	if ( iconSet === 'dashicons-arrow-alt2' ) {
		return <span className={ `premium-tabs-carousel__arrow-icon dashicons ${ isNext ? 'dashicons-arrow-right-alt2' : 'dashicons-arrow-left-alt2' }` } aria-hidden="true" />;
	}

	if ( iconSet === 'dashicons-controls' ) {
		return <span className={ `premium-tabs-carousel__arrow-icon dashicons ${ isNext ? 'dashicons-controls-forward' : 'dashicons-controls-back' }` } aria-hidden="true" />;
	}

	if ( iconSet === 'chevron' ) {
		return (
			<svg className="premium-tabs-carousel__arrow-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
				<path d={ isNext ? 'M9 5L16 12L9 19' : 'M15 5L8 12L15 19' } stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		);
	}

	if ( iconSet === 'caret' ) {
		return (
			<svg className="premium-tabs-carousel__arrow-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
				<path d={ isNext ? 'M10 7L15 12L10 17' : 'M14 7L9 12L14 17' } stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		);
	}

	return <span className="premium-tabs-carousel__arrow-icon" aria-hidden="true">{ isNext ? '\u2192' : '\u2190' }</span>;
}

export default function save( { attributes } ) {
	const tabs = normalizeTabs( attributes.tabs );
	const cards = normalizeCards( attributes.cards, tabs );
	const activeTab = tabs[ 0 ]?.id || '';
	const blockProps = useBlockProps.save( {
		className: 'premium-tabs-carousel',
		style: {
			backgroundColor: attributes.backgroundColor,
			...getSpacingStyle( attributes.sectionPadding, 'padding' ),
			'--premium-tabs-content-max-width': `${ attributes.contentMaxWidth || 1320 }px`,
			'--premium-tabs-gap': `${ attributes.gap || 24 }px`,
			'--premium-tabs-card-radius': `${ attributes.cardBorderRadius || 20 }px`,
			'--premium-tabs-card-padding': `${ attributes.cardContentPadding || 24 }px`,
			'--premium-tabs-heading-max-width': `${ attributes.headingMaxWidth || 760 }px`,
			'--premium-tabs-heading-size': attributes.headingFontSize || 'clamp(2rem, 4vw, 3.75rem)',
			'--premium-tabs-heading-weight': attributes.headingFontWeight || '700',
			'--premium-tabs-heading-line-height': attributes.headingLineHeight || '0.98',
			'--premium-tabs-heading-color': attributes.headingColor || '#171717',
			'--premium-tabs-heading-tabs-gap': `${ attributes.headingTabsGap || 24 }px`,
			'--premium-tabs-tabs-nav-gap': `${ attributes.tabsNavGap || 28 }px`,
			'--premium-tabs-header-nav-gap': `${ attributes.headerNavGap || 24 }px`,
			'--premium-tabs-card-title-size': attributes.cardTitleFontSize || 'clamp(1.5rem, 2.4vw, 2rem)',
			'--premium-tabs-card-title-weight': attributes.cardTitleFontWeight || '700',
			'--premium-tabs-card-title-line-height': attributes.cardTitleLineHeight || '1.04',
			'--premium-tabs-card-title-color': attributes.cardTitleColor || '#ffffff',
			'--premium-tabs-card-body-size': attributes.cardBodyFontSize || '1rem',
			'--premium-tabs-card-body-weight': attributes.cardBodyFontWeight || '400',
			'--premium-tabs-card-body-line-height': attributes.cardBodyLineHeight || '1.5',
			'--premium-tabs-card-body-color': attributes.cardBodyColor || '#ffffff',
			'--premium-tabs-card-text-transform': attributes.cardTextUppercase ? 'uppercase' : 'none',
			'--premium-tabs-dots-size': attributes.dotsFontSize || '1.35rem',
			'--premium-tabs-dots-spacing': attributes.dotsLetterSpacing || '0.22em',
			'--premium-tabs-dots-color': attributes.dotsColor || 'rgba(255, 255, 255, 0.86)',
			'--premium-tabs-button-size': attributes.buttonFontSize || '0.95rem',
			'--premium-tabs-button-weight': attributes.buttonFontWeight || '600',
			'--premium-tabs-button-line-height': attributes.buttonLineHeight || '1.2',
			'--premium-tabs-button-color': attributes.buttonTextColor || '#ffffff',
			'--premium-tabs-button-bg': attributes.buttonBackgroundColor || 'rgba(255, 255, 255, 0.16)',
			'--premium-tabs-button-border-color': attributes.buttonBorderColor || 'rgba(255, 255, 255, 0.38)',
			'--premium-tabs-button-border-width': `${ attributes.buttonBorderWidth || 1 }px`,
			'--premium-tabs-button-radius': attributes.buttonBorderRadius || '999px',
			'--premium-tabs-button-width': attributes.buttonWidth || 'fit-content',
			'--premium-tabs-button-pad-top': attributes.buttonPadding?.top || '13px',
			'--premium-tabs-button-pad-right': attributes.buttonPadding?.right || '20px',
			'--premium-tabs-button-pad-bottom': attributes.buttonPadding?.bottom || '13px',
			'--premium-tabs-button-pad-left': attributes.buttonPadding?.left || '20px',
			'--premium-tabs-nav-size': `${ attributes.navButtonSize || 54 }px`,
			'--premium-tabs-nav-icon-size': `${ attributes.navIconSize || 20 }px`,
			'--premium-tabs-nav-border-width': `${ attributes.navBorderWidth || 1 }px`,
			'--premium-tabs-nav-radius': attributes.navBorderRadius || '999px',
			'--premium-tabs-nav-border-color': attributes.navBorderColor || 'rgba(23, 23, 23, 0.16)',
			'--premium-tabs-nav-bg': attributes.navBackgroundColor || 'rgba(255, 255, 255, 0.78)',
			'--premium-tabs-nav-icon-color': attributes.navIconColor || '#171717',
			'--premium-tabs-nav-hover-bg': attributes.navHoverBackgroundColor || '#171717',
			'--premium-tabs-nav-hover-icon-color': attributes.navHoverIconColor || '#f4efe7',
			'--premium-tabs-card-scale-desktop': String( attributes.cardWidthScaleDesktop || 100 ),
			'--premium-tabs-card-scale-tablet': String( attributes.cardWidthScaleTablet || 100 ),
			'--premium-tabs-card-scale-mobile': String( attributes.cardWidthScaleMobile || 100 ),
			'--premium-tabs-tab-size': attributes.tabFontSize || '0.95rem',
			'--premium-tabs-tab-weight': attributes.tabFontWeight || '600',
			'--premium-tabs-tab-color': attributes.tabTextColor || 'rgba(23, 23, 23, 0.72)',
			'--premium-tabs-tab-active-color': attributes.tabActiveTextColor || '#171717',
			'--premium-tabs-tab-border-color': attributes.tabBorderColor || 'rgba(23, 23, 23, 0.14)',
			'--premium-tabs-tab-active-border-color': attributes.tabActiveBorderColor || '#171717',
			'--premium-tabs-tab-bg': attributes.tabBackgroundColor || 'rgba(255, 255, 255, 0.82)',
			'--premium-tabs-tab-active-bg': attributes.tabActiveBackgroundColor || '#ffffff',
		},
		'data-gap': String( attributes.gap || 24 ),
		'data-loop': attributes.loop ? 'true' : 'false',
		'data-autoplay': attributes.autoplay ? 'true' : 'false',
		'data-autoplay-delay': String( attributes.autoplayDelay || 4000 ),
		'data-speed': String( attributes.transitionSpeed || 450 ),
		'data-show-pagination': attributes.showPagination ? 'true' : 'false',
		'data-tabs-enabled': attributes.enableTabs ? 'true' : 'false',
		'data-active-tab': activeTab,
	} );

	return (
		<section { ...blockProps }>
			<div className="premium-tabs-carousel__inner">
				<div className="premium-tabs-carousel__header">
					<div className="premium-tabs-carousel__copy">
						{ attributes.heading && <RichText.Content tagName="h2" className="premium-tabs-carousel__heading" value={ attributes.heading } /> }
						{ attributes.subheading && <RichText.Content tagName="p" className="premium-tabs-carousel__subheading" value={ attributes.subheading } /> }
					</div>

					{ attributes.enableTabs && tabs.length > 0 && (
						<div className="premium-tabs-carousel__tabs" role="tablist" aria-label="Carousel tabs">
							{ tabs.map( ( tab, index ) => (
								<button
									key={ tab.id }
									type="button"
									className={ `premium-tabs-carousel__tab${ index === 0 ? ' is-active' : '' }` }
									data-tab-id={ tab.id }
									role="tab"
									aria-pressed={ index === 0 ? 'true' : 'false' }
								>
									{ tab.label }
								</button>
							) ) }
						</div>
					) }

					<div className="premium-tabs-carousel__nav">
						<button type="button" className="premium-tabs-carousel__arrow premium-tabs-carousel__arrow--prev" aria-label="Previous slide">{ navigationIcon( attributes.navIconSet, 'prev' ) }</button>
						<button type="button" className="premium-tabs-carousel__arrow premium-tabs-carousel__arrow--next" aria-label="Next slide">{ navigationIcon( attributes.navIconSet, 'next' ) }</button>
					</div>
				</div>
				<div className="premium-tabs-carousel__stage">
					<div className="premium-tabs-carousel__swiper swiper">
						<div className="swiper-wrapper">
							{ cards.map( ( card, index ) => (
								<div
									key={ index }
									className="swiper-slide premium-tabs-carousel__slide"
									data-tab-id={ card.tabId || activeTab }
									data-tab-ids={ ( card.tabIds || [ card.tabId || activeTab ] ).join( ',' ) }
								>
									<article className="premium-tabs-carousel__card" style={ {
										backgroundImage: card.imageUrl ? `url("${ card.imageUrl }")` : undefined,
										backgroundColor: ! card.imageUrl ? '#c8bfb2' : undefined,
									} }>
										{ card.showOverlay !== false && <div className="premium-tabs-carousel__overlay" style={ { backgroundColor: card.overlayColor, opacity: card.overlayOpacity } } /> }
										<div className="premium-tabs-carousel__card-content">
											<div className="premium-tabs-carousel__card-top">
												{ card.title && <RichText.Content tagName="h3" className="premium-tabs-carousel__card-title" value={ card.title } /> }
											</div>
											<div className="premium-tabs-carousel__card-bottom">
												{ card.items.length > 0 && (
													<ul className="premium-tabs-carousel__card-items">
														{ card.items.map( ( item, itemIndex ) => <li key={ itemIndex }>{ item }</li> ) }
													</ul>
												) }
												{ card.showDots && <div className="premium-tabs-carousel__dots" aria-hidden="true">{ card.dotsText || '...' }</div> }
												{ card.buttonText && (
													<a className={ `premium-tabs-carousel__button premium-tabs-carousel__button--icon-${ attributes.buttonIconPosition || 'right' }` } href={ card.buttonUrl || '#' } target={ card.openInNewTab ? '_blank' : undefined } rel={ card.openInNewTab ? 'noopener noreferrer' : undefined }>
														{ attributes.buttonShowIcon && <span className="premium-tabs-carousel__button-icon" aria-hidden="true">{ arrowIcon() }</span> }
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
					{ attributes.showPagination && <div className="premium-tabs-carousel__pagination" /> }
				</div>
			</div>
		</section>
	);
}
