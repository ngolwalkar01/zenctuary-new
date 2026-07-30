import { RichText, useBlockProps } from '@wordpress/block-editor';

const textStyle = ( attributes, prefix ) => ( {
	fontFamily: attributes[ `${ prefix }FontFamily` ] || undefined,
	fontSize: attributes[ `${ prefix }FontSize` ],
	fontWeight: attributes[ `${ prefix }FontWeight` ],
	lineHeight: attributes[ `${ prefix }LineHeight` ],
	letterSpacing: attributes[ `${ prefix }LetterSpacing` ],
	color: attributes[ `${ prefix }Color` ],
} );

function Coin( { value, attributes } ) {
	return (
		<span className="zen-static-member-credits-coin" style={ { width: `${ attributes.coinSize }px`, height: `${ attributes.coinSize }px`, fontSize: attributes.coinValueFontSize, fontWeight: attributes.coinValueFontWeight } }>
			<span className="zen-static-member-credits-coin__ring" />
			<span className="zen-static-member-credits-coin__value">{ value }</span>
		</span>
	);
}

export default function save( { attributes } ) {
	const cards = Array.isArray( attributes.cards ) ? attributes.cards : [];
	const blockProps = useBlockProps.save( {
		className: 'zen-static-member-credits',
		style: {
			'--zen-static-member-credits-bg': attributes.backgroundColor,
			'--zen-static-member-credits-content-width': attributes.contentMaxWidth,
			'--zen-static-member-credits-header-width': attributes.headerMaxWidth,
			'--zen-static-member-credits-header-bottom': `${ attributes.headerBottomSpacing }px`,
			'--zen-static-member-credits-heading-intro-spacing': `${ attributes.headingIntroSpacing }px`,
			'--zen-static-member-credits-columns-desktop': attributes.cardsPerRowDesktop,
			'--zen-static-member-credits-columns-tablet': attributes.cardsPerRowTablet,
			'--zen-static-member-credits-columns-mobile': attributes.cardsPerRowMobile,
			'--zen-static-member-credits-gap': `${ attributes.cardsGap }px`,
			'--zen-static-member-credits-card-bg': attributes.cardBackgroundColor,
			'--zen-static-member-credits-card-border': attributes.cardBorderColor,
			'--zen-static-member-credits-card-border-width': `${ attributes.cardBorderWidth }px`,
			'--zen-static-member-credits-card-radius': `${ attributes.cardBorderRadius }px`,
			'--zen-static-member-credits-card-pt': attributes.cardPaddingTop,
			'--zen-static-member-credits-card-pr': attributes.cardPaddingRight,
			'--zen-static-member-credits-card-pb': attributes.cardPaddingBottom,
			'--zen-static-member-credits-card-pl': attributes.cardPaddingLeft,
			'--zen-static-member-credits-image-height': `${ attributes.imageHeight }px`,
			'--zen-static-member-credits-image-gap': `${ attributes.imageBottomGap }px`,
			'--zen-static-member-credits-image-border': attributes.imageBorderColor,
			'--zen-static-member-credits-image-border-width': `${ attributes.imageBorderWidth }px`,
			'--zen-static-member-credits-image-radius': `${ attributes.imageBorderRadius }px`,
			'--zen-static-member-credits-image-overlay': attributes.imageOverlayColor,
			'--zen-static-member-credits-image-overlay-opacity': attributes.imageOverlayOpacity,
			'--zen-static-member-credits-row-pt': attributes.rowPaddingTop,
			'--zen-static-member-credits-row-pr': attributes.rowPaddingRight,
			'--zen-static-member-credits-row-pb': attributes.rowPaddingBottom,
			'--zen-static-member-credits-row-pl': attributes.rowPaddingLeft,
			'--zen-static-member-credits-row-gap': `${ attributes.rowGap }px`,
			'--zen-static-member-credits-separator': attributes.separatorColor,
			'--zen-static-member-credits-separator-width': `${ attributes.separatorWidth }px`,
			'--zen-static-member-credits-right-gap': `${ attributes.rightGap }px`,
			'--zen-static-member-credits-coin-bg': attributes.coinBackgroundColor,
			'--zen-static-member-credits-coin-border': attributes.coinBorderColor,
			'--zen-static-member-credits-coin-text': attributes.coinTextColor,
			'--zen-static-member-credits-coin-border-width': `${ attributes.coinBorderWidth }px`,
			'--zen-static-member-credits-coin-ring-inset': `${ attributes.coinRingInset }px`,
			paddingTop: attributes.sectionPaddingTop,
			paddingRight: attributes.sectionPaddingRight,
			paddingBottom: attributes.sectionPaddingBottom,
			paddingLeft: attributes.sectionPaddingLeft,
		},
	} );

	return (
		<section { ...blockProps }>
			<div className="zen-static-member-credits__inner">
				<header className="zen-static-member-credits__header">
					<RichText.Content tagName="h2" className="zen-static-member-credits__heading" value={ attributes.heading } style={ { ...textStyle( attributes, 'heading' ), whiteSpace: attributes.headingWrap ? 'normal' : 'nowrap' } } />
					<RichText.Content tagName="p" className="zen-static-member-credits__intro" value={ attributes.intro } style={ textStyle( attributes, 'intro' ) } />
				</header>
				<div className="zen-static-member-credits__grid">
					{ cards.map( ( card, cardIndex ) => {
						const sections = Array.isArray( card.sections ) ? card.sections : [];

						return (
							<article className="zen-static-member-credits__card" key={ card.id || cardIndex }>
								<div className="zen-static-member-credits__image-wrap">
									{ card.imageUrl ? (
										<img className="zen-static-member-credits__image" src={ card.imageUrl } alt={ card.imageAlt || '' } loading="lazy" />
									) : (
										<div className="zen-static-member-credits__image zen-static-member-credits__image--placeholder" />
									) }
									<span className="zen-static-member-credits__image-overlay" aria-hidden="true" />
								</div>
								<div className="zen-static-member-credits__rows">
									{ sections.map( ( section, sectionIndex ) => (
										<div className="zen-static-member-credits__row" key={ section.id || sectionIndex }>
											<RichText.Content tagName="div" className="zen-static-member-credits__left" value={ section.leftText } style={ { ...textStyle( attributes, 'left' ), whiteSpace: attributes.leftWrap ? 'normal' : 'nowrap' } } />
											<div className="zen-static-member-credits__right">
												<RichText.Content tagName="span" className="zen-static-member-credits__right-label" value={ section.rightLabel || attributes.rightLabel } style={ textStyle( attributes, 'rightLabel' ) } />
												<Coin value={ section.rightValue } attributes={ attributes } />
											</div>
										</div>
									) ) }
								</div>
							</article>
						);
					} ) }
				</div>
			</div>
		</section>
	);
}