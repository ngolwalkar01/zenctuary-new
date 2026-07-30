import { RichText, useBlockProps } from '@wordpress/block-editor';

const textStyle = ( attributes, prefix ) => ( {
	fontFamily: attributes[ `${ prefix }FontFamily` ] || undefined,
	fontSize: attributes[ `${ prefix }FontSize` ],
	fontWeight: attributes[ `${ prefix }FontWeight` ],
	lineHeight: attributes[ `${ prefix }LineHeight` ],
	letterSpacing: attributes[ `${ prefix }LetterSpacing` ],
	color: attributes[ `${ prefix }Color` ],
} );

function ArrowIcon() {
	return <svg viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d="M9.7 3.3 15.4 9l-5.7 5.7-1.2-1.2 3.7-3.7H2.6V8.2h9.6L8.5 4.5z" /></svg>;
}

function CheckIcon() {
	return <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M6.3 11.8 2.7 8.2l1.4-1.4 2.2 2.2 5.6-5.6 1.4 1.4z" /></svg>;
}

function Coin( { value, attributes } ) {
	return (
		<span className="zen-static-dropins-coin" style={ { width: `${ attributes.coinSize }px`, height: `${ attributes.coinSize }px`, fontSize: attributes.coinValueFontSize, fontWeight: attributes.coinValueFontWeight } }>
			<span className="zen-static-dropins-coin__ring" />
			<span className="zen-static-dropins-coin__value">{ value }</span>
		</span>
	);
}

export default function save( { attributes } ) {
	const cards = Array.isArray( attributes.cards ) ? attributes.cards : [];
	const blockProps = useBlockProps.save( {
		className: 'zen-static-dropins',
		style: {
			'--zen-static-dropins-bg': attributes.backgroundColor,
			'--zen-static-dropins-content-width': attributes.contentMaxWidth,
			'--zen-static-dropins-header-width': attributes.headerMaxWidth,
			'--zen-static-dropins-header-bottom': `${ attributes.headerBottomSpacing }px`,
			'--zen-static-dropins-gap': `${ attributes.cardsGap }px`,
			'--zen-static-dropins-card-width': attributes.cardWidth,
			'--zen-static-dropins-card-min-height': attributes.cardMinHeight,
			'--zen-static-dropins-card-bg': attributes.cardBackgroundColor,
			'--zen-static-dropins-card-border': attributes.cardBorderColor,
			'--zen-static-dropins-card-border-width': `${ attributes.cardBorderWidth }px`,
			'--zen-static-dropins-card-radius': `${ attributes.cardBorderRadius }px`,
			'--zen-static-dropins-image-height': `${ attributes.imageHeight }px`,
			'--zen-static-dropins-image-overlay': attributes.imageOverlayColor,
			'--zen-static-dropins-image-overlay-opacity': attributes.imageOverlayOpacity,
			'--zen-static-dropins-body-pt': attributes.bodyPaddingTop,
			'--zen-static-dropins-body-pr': attributes.bodyPaddingRight,
			'--zen-static-dropins-body-pb': attributes.bodyPaddingBottom,
			'--zen-static-dropins-body-pl': attributes.bodyPaddingLeft,
			'--zen-static-dropins-zencoin-gap': `${ attributes.zencoinGap }px`,
			'--zen-static-dropins-coin-bg': attributes.coinBackgroundColor,
			'--zen-static-dropins-coin-border': attributes.coinBorderColor,
			'--zen-static-dropins-coin-text': attributes.coinTextColor,
			'--zen-static-dropins-coin-border-width': `${ attributes.coinBorderWidth }px`,
			'--zen-static-dropins-coin-ring-inset': `${ attributes.coinRingInset }px`,
			'--zen-static-dropins-feature-icon-size': `${ attributes.featureIconSize }px`,
			'--zen-static-dropins-feature-icon-bg': attributes.featureIconBackgroundColor,
			'--zen-static-dropins-feature-icon-color': attributes.featureIconColor,
			'--zen-static-dropins-feature-icon-gap': `${ attributes.featureIconGap }px`,
			'--zen-static-dropins-button-bg': attributes.buttonBackgroundColor,
			'--zen-static-dropins-button-border': attributes.buttonBorderColor,
			'--zen-static-dropins-button-border-width': `${ attributes.buttonBorderWidth }px`,
			'--zen-static-dropins-button-radius': attributes.buttonBorderRadius,
			'--zen-static-dropins-button-pt': attributes.buttonPaddingTop,
			'--zen-static-dropins-button-pr': attributes.buttonPaddingRight,
			'--zen-static-dropins-button-pb': attributes.buttonPaddingBottom,
			'--zen-static-dropins-button-pl': attributes.buttonPaddingLeft,
			'--zen-static-dropins-button-mt': attributes.buttonMarginTop,
			'--zen-static-dropins-button-width': attributes.buttonWidth,
			'--zen-static-dropins-button-min-height': attributes.buttonMinHeight,
			'--zen-static-dropins-button-icon-size': `${ attributes.buttonIconSize }px`,
			'--zen-static-dropins-button-icon-gap': `${ attributes.buttonIconGap }px`,
			'--zen-static-dropins-button-icon-color': attributes.buttonIconColor,
			paddingTop: attributes.sectionPaddingTop,
			paddingRight: attributes.sectionPaddingRight,
			paddingBottom: attributes.sectionPaddingBottom,
			paddingLeft: attributes.sectionPaddingLeft,
		},
	} );

	return (
		<section { ...blockProps }>
			<div className="zen-static-dropins__inner">
				<header className="zen-static-dropins__header">
					<RichText.Content tagName="h2" className="zen-static-dropins__heading" value={ attributes.heading } style={ { ...textStyle( attributes, 'heading' ), whiteSpace: attributes.headingWrap ? 'normal' : 'nowrap' } } />
					<RichText.Content tagName="p" className="zen-static-dropins__intro" value={ attributes.intro } style={ textStyle( attributes, 'intro' ) } />
				</header>
				<div className="zen-static-dropins__grid">
					{ cards.map( ( card, index ) => {
						const target = card.buttonOpenInNewTab ? '_blank' : undefined;
						const rel = card.buttonOpenInNewTab ? 'noopener noreferrer' : undefined;

						return (
							<article className="zen-static-dropins__card" key={ card.id || index }>
								<div className="zen-static-dropins__image-wrap">
									{ card.imageUrl ? <img className="zen-static-dropins__image" src={ card.imageUrl } alt={ card.imageAlt || '' } loading="lazy" /> : <div className="zen-static-dropins__image zen-static-dropins__image--placeholder" /> }
									<span className="zen-static-dropins__image-overlay" aria-hidden="true" />
									<div className="zen-static-dropins__zencoins">
										<RichText.Content tagName="span" className="zen-static-dropins__zencoin-label" value={ attributes.zencoinLabel } style={ textStyle( attributes, 'zencoinLabel' ) } />
										<Coin value={ card.zencoins } attributes={ attributes } />
									</div>
								</div>
								<div className="zen-static-dropins__body">
									<RichText.Content tagName="div" className="zen-static-dropins__price" value={ card.price } style={ textStyle( attributes, 'price' ) } />
									<div className="zen-static-dropins__feature" style={ textStyle( attributes, 'feature' ) }>
										{ attributes.showFeatureIcon && <span className="zen-static-dropins__feature-icon"><CheckIcon /></span> }
										<RichText.Content tagName="span" value={ card.feature } />
									</div>
									<RichText.Content tagName="p" className="zen-static-dropins__validity" value={ card.validity } style={ textStyle( attributes, 'validity' ) } />
									{ card.note && <RichText.Content tagName="p" className="zen-static-dropins__note" value={ card.note } style={ textStyle( attributes, 'note' ) } /> }
									<a className="zen-static-dropins__button" href={ card.buttonUrl || '#' } target={ target } rel={ rel } style={ textStyle( attributes, 'button' ) }>
										<RichText.Content tagName="span" value={ card.buttonText } />
										{ attributes.showButtonIcon && <span className="zen-static-dropins__button-icon"><ArrowIcon /></span> }
									</a>
								</div>
							</article>
						);
					} ) }
				</div>
			</div>
		</section>
	);
}
