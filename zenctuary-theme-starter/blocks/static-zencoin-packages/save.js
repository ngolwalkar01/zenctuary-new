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
		<span className="zen-static-packages-coin" style={ { width: `${ attributes.coinSize }px`, height: `${ attributes.coinSize }px`, fontSize: attributes.coinValueFontSize, fontWeight: attributes.coinValueFontWeight } }>
			<span className="zen-static-packages-coin__ring" />
			<span className="zen-static-packages-coin__value">{ value }</span>
		</span>
	);
}

export default function save( { attributes } ) {
	const packages = Array.isArray( attributes.packages ) ? attributes.packages : [];
	const blockProps = useBlockProps.save( {
		className: 'zen-static-packages',
		style: {
			'--zen-static-packages-bg': attributes.backgroundColor,
			'--zen-static-packages-content-width': attributes.contentMaxWidth,
			'--zen-static-packages-header-width': attributes.headerMaxWidth,
			'--zen-static-packages-header-bottom': `${ attributes.headerBottomSpacing }px`,
			'--zen-static-packages-gap': `${ attributes.cardsGap }px`,
			'--zen-static-packages-card-width': attributes.cardWidth,
			'--zen-static-packages-card-min-height': attributes.cardMinHeight,
			'--zen-static-packages-card-bg': attributes.cardBackgroundColor,
			'--zen-static-packages-card-border': attributes.cardBorderColor,
			'--zen-static-packages-card-border-width': `${ attributes.cardBorderWidth }px`,
			'--zen-static-packages-card-radius': `${ attributes.cardBorderRadius }px`,
			'--zen-static-packages-top-bg': attributes.cardTopBarBackgroundColor,
			'--zen-static-packages-top-border': attributes.cardTopBarBorderColor,
			'--zen-static-packages-top-height': `${ attributes.cardTopBarHeight }px`,
			'--zen-static-packages-body-pt': attributes.cardBodyPaddingTop,
			'--zen-static-packages-body-pr': attributes.cardBodyPaddingRight,
			'--zen-static-packages-body-pb': attributes.cardBodyPaddingBottom,
			'--zen-static-packages-body-pl': attributes.cardBodyPaddingLeft,
			'--zen-static-packages-zencoin-gap': `${ attributes.zencoinGap }px`,
			'--zen-static-packages-coin-bg': attributes.coinBackgroundColor,
			'--zen-static-packages-coin-border': attributes.coinBorderColor,
			'--zen-static-packages-coin-text': attributes.coinTextColor,
			'--zen-static-packages-coin-border-width': `${ attributes.coinBorderWidth }px`,
			'--zen-static-packages-coin-ring-inset': `${ attributes.coinRingInset }px`,
			'--zen-static-packages-feature-icon-size': `${ attributes.featureIconSize }px`,
			'--zen-static-packages-feature-icon-bg': attributes.featureIconBackgroundColor,
			'--zen-static-packages-feature-icon-color': attributes.featureIconColor,
			'--zen-static-packages-feature-icon-gap': `${ attributes.featureIconGap }px`,
			'--zen-static-packages-button-bg': attributes.buttonBackgroundColor,
			'--zen-static-packages-button-border': attributes.buttonBorderColor,
			'--zen-static-packages-button-border-width': `${ attributes.buttonBorderWidth }px`,
			'--zen-static-packages-button-radius': attributes.buttonBorderRadius,
			'--zen-static-packages-button-pt': attributes.buttonPaddingTop,
			'--zen-static-packages-button-pr': attributes.buttonPaddingRight,
			'--zen-static-packages-button-pb': attributes.buttonPaddingBottom,
			'--zen-static-packages-button-pl': attributes.buttonPaddingLeft,
			'--zen-static-packages-button-mt': attributes.buttonMarginTop,
			'--zen-static-packages-button-icon-size': `${ attributes.buttonIconSize }px`,
			'--zen-static-packages-button-icon-gap': `${ attributes.buttonIconGap }px`,
			'--zen-static-packages-button-icon-color': attributes.buttonIconColor,
			paddingTop: attributes.sectionPaddingTop,
			paddingRight: attributes.sectionPaddingRight,
			paddingBottom: attributes.sectionPaddingBottom,
			paddingLeft: attributes.sectionPaddingLeft,
		},
	} );

	return (
		<section { ...blockProps }>
			<div className="zen-static-packages__inner">
				<header className="zen-static-packages__header">
					<RichText.Content tagName="h2" className="zen-static-packages__heading" value={ attributes.heading } style={ { ...textStyle( attributes, 'heading' ), whiteSpace: attributes.headingWrap ? 'normal' : 'nowrap' } } />
					<RichText.Content tagName="p" className="zen-static-packages__intro" value={ attributes.intro } style={ textStyle( attributes, 'intro' ) } />
				</header>
				<div className="zen-static-packages__grid">
					{ packages.map( ( item, index ) => {
						const target = item.buttonOpenInNewTab ? '_blank' : undefined;
						const rel = item.buttonOpenInNewTab ? 'noopener noreferrer' : undefined;

						return (
							<article className="zen-static-packages__card" key={ item.id || index }>
								<div className="zen-static-packages__card-top">
									<div className="zen-static-packages__zencoins">
										<RichText.Content tagName="span" className="zen-static-packages__zencoin-label" value={ attributes.zencoinLabel } style={ textStyle( attributes, 'zencoinLabel' ) } />
										<Coin value={ item.zencoins } attributes={ attributes } />
									</div>
								</div>
								<div className="zen-static-packages__card-body">
									<RichText.Content tagName="h3" className="zen-static-packages__card-title" value={ item.title } style={ { ...textStyle( attributes, 'cardTitle' ), whiteSpace: attributes.cardTitleWrap ? 'normal' : 'nowrap' } } />
									<RichText.Content tagName="div" className="zen-static-packages__price" value={ item.price } style={ textStyle( attributes, 'price' ) } />
									<div className="zen-static-packages__feature" style={ textStyle( attributes, 'feature' ) }>
										{ attributes.showFeatureIcon && <span className="zen-static-packages__feature-icon"><CheckIcon /></span> }
										<RichText.Content tagName="span" value={ item.feature } />
									</div>
									<RichText.Content tagName="p" className="zen-static-packages__validity" value={ item.validity } style={ textStyle( attributes, 'validity' ) } />
									<a className="zen-static-packages__button" href={ item.buttonUrl || '#' } target={ target } rel={ rel } style={ textStyle( attributes, 'button' ) }>
										<RichText.Content tagName="span" value={ item.buttonText } />
										{ attributes.showButtonIcon && <span className="zen-static-packages__button-icon"><ArrowIcon /></span> }
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
