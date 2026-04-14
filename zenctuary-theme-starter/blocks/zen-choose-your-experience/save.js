import { RichText, useBlockProps } from '@wordpress/block-editor';

const DEFAULT_SPACING = { top: '0px', right: '0px', bottom: '0px', left: '0px' };

const normalizeSpacing = ( value = {} ) => ({ ...DEFAULT_SPACING, ...( value || {} ) });
const spacingStyle = ( value = {}, property = 'margin' ) => {
	const spacing = normalizeSpacing( value );
	return {
		[ `${ property }Top` ]: spacing.top,
		[ `${ property }Right` ]: spacing.right,
		[ `${ property }Bottom` ]: spacing.bottom,
		[ `${ property }Left` ]: spacing.left,
	};
};

function ArrowIcon() {
	return <svg viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d="M9.7 3.3 15.4 9l-5.7 5.7-1.2-1.2 3.7-3.7H2.6V8.2h9.6L8.5 4.5z" /></svg>;
}

function ClockIcon() {
	return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10" /><path d="M12 6.5v5.8h4.2v-1.8H13.8V6.5z" /></svg>;
}

function CoinIcon( { value = '5', size = 44 } ) {
	const fontSize = Math.max( 14, Math.round( size * 0.43 ) );
	return (
		<span className="zen-choose-exp__coin" style={ { width: `${ size }px`, height: `${ size }px`, fontSize: `${ fontSize }px` } }>
			<span className="zen-choose-exp__coin-ring" />
			<span className="zen-choose-exp__coin-value">{ value }</span>
		</span>
	);
}

export default function save( { attributes } ) {
	const {
		sectionPadding,
		sectionMargin,
		headingText,
		headingColor,
		headingFontSize,
		headingFontWeight,
		headingLetterSpacing,
		headingPadding,
		headingMargin,
		paragraphText,
		paragraphColor,
		paragraphFontSize,
		paragraphFontWeight,
		paragraphLineHeight,
		paragraphPadding,
		paragraphMargin,
		cardGap,
		cards,
	} = attributes;

	const safeCards = Array.isArray( cards ) && cards.length ? cards : [];

	const blockProps = useBlockProps.save( {
		className: 'zen-choose-exp',
		style: {
			...spacingStyle( sectionPadding, 'padding' ),
			...spacingStyle( sectionMargin, 'margin' ),
			'--zen-choose-exp-card-gap': `${ cardGap }px`,
		},
	} );

	return (
		<section { ...blockProps }>
			<div className="zen-choose-exp__inner">
				<RichText.Content tagName="h2" className="zen-choose-exp__heading" value={ headingText } style={ { color: headingColor, fontSize: `${ headingFontSize }px`, fontWeight: headingFontWeight, letterSpacing: `${ headingLetterSpacing }px`, ...spacingStyle( headingPadding, 'padding' ), ...spacingStyle( headingMargin, 'margin' ) } } />
				<RichText.Content tagName="p" className="zen-choose-exp__paragraph" value={ paragraphText } style={ { color: paragraphColor, fontSize: `${ paragraphFontSize }px`, fontWeight: paragraphFontWeight, lineHeight: paragraphLineHeight, ...spacingStyle( paragraphPadding, 'padding' ), ...spacingStyle( paragraphMargin, 'margin' ) } } />
				<div className="zen-choose-exp__cards">
					{ safeCards.map( ( card, cardIndex ) => {
						const features = Array.isArray( card.featureRows ) ? card.featureRows : [];
						const cardButtonClass = `zen-choose-exp__button is-arrow-${ card.buttonArrowPosition || 'right' }`;
						return (
							<article className="zen-choose-exp__card" key={ card.id || cardIndex }>
								<div className="zen-choose-exp__card-top" style={ { backgroundColor: card.topBarBg } }>
									<div className="zen-choose-exp__coin-row" style={ { color: card.topBarTextColor, fontSize: `${ card.topBarFontSize }px`, fontWeight: card.topBarFontWeight } }>
										<RichText.Content tagName="span" className="zen-choose-exp__coin-label" value={ card.coinLabel || '' } />
										<CoinIcon value={ card.coinValue || '' } size={ card.coinSize || 44 } />
									</div>
								</div>
								<div className="zen-choose-exp__separator zen-choose-exp__separator--top" style={ { width: `${ card.topSeparatorWidth || 100 }%`, borderTopColor: card.topSeparatorColor, borderTopWidth: `${ card.topSeparatorThickness || 1 }px` } } />
								<div className="zen-choose-exp__media" style={ { backgroundImage: card.imageUrl ? `url(${ card.imageUrl })` : 'none', backgroundSize: card.imageFit || 'cover', backgroundPosition: card.imagePosition || 'center center' } }>
									<div className="zen-choose-exp__overlay">
										<RichText.Content tagName="h3" className="zen-choose-exp__card-heading" value={ card.overlayHeading || '' } style={ { color: card.overlayHeadingColor, fontSize: `${ card.overlayHeadingSize }px`, fontWeight: card.overlayHeadingWeight, letterSpacing: `${ card.overlayHeadingLetterSpacing || 0 }px`, ...spacingStyle( card.overlayHeadingPadding, 'padding' ) } } />
										<div className="zen-choose-exp__time-row" style={ { color: card.timeTextColor, gap: `${ card.timeGap || 12 }px` } }>
											<span className="zen-choose-exp__clock" style={ { width: `${ card.clockIconSize || 20 }px`, height: `${ card.clockIconSize || 20 }px` } }><ClockIcon /></span>
											<RichText.Content tagName="span" className="zen-choose-exp__time-text" value={ card.timeText || '' } style={ { fontSize: `${ card.timeTextSize || 18 }px`, fontWeight: card.timeTextWeight || '500' } } />
										</div>
										<RichText.Content tagName="p" className="zen-choose-exp__description" value={ card.description || '' } style={ { color: card.descriptionColor, fontSize: `${ card.descriptionSize || 18 }px`, fontWeight: card.descriptionWeight || '400', lineHeight: card.descriptionLineHeight || 1.45 } } />
										<div className="zen-choose-exp__feature-list">
											{ features.map( ( row, rowIndex ) => (
												<div className="zen-choose-exp__feature-row" key={ row.id || rowIndex }>
													<RichText.Content tagName="strong" className="zen-choose-exp__feature-label" value={ row.label || '' } style={ { color: card.featureBoldColor, fontSize: `${ card.featureBoldSize || 17 }px`, fontWeight: card.featureBoldWeight || '700' } } />
													<RichText.Content tagName="span" className="zen-choose-exp__feature-text" value={ row.text || '' } style={ { color: card.featureTextColor, fontSize: `${ card.featureTextSize || 17 }px`, fontWeight: card.featureTextWeight || '400' } } />
												</div>
											) ) }
										</div>
										<div className={ cardButtonClass } style={ { backgroundColor: card.buttonBg, color: card.buttonTextColor, borderColor: card.buttonBorderColor, borderWidth: `${ card.buttonBorderWidth || 2 }px`, borderRadius: `${ card.buttonBorderRadius || 999 }px` } }>
											{ card.buttonShowArrow && [ 'left', 'top' ].includes( card.buttonArrowPosition ) && <span className="zen-choose-exp__button-icon"><ArrowIcon /></span> }
											<RichText.Content tagName="span" value={ card.buttonText || '' } />
											{ card.buttonShowArrow && [ 'right', 'bottom' ].includes( card.buttonArrowPosition ) && <span className="zen-choose-exp__button-icon"><ArrowIcon /></span> }
										</div>
										<div className="zen-choose-exp__separator zen-choose-exp__separator--bottom" style={ { width: `${ card.bottomSeparatorWidth || 100 }%`, borderTopColor: card.bottomSeparatorColor, borderTopWidth: `${ card.bottomSeparatorThickness || 1 }px` } } />
										<div className="zen-choose-exp__footer-row">
											<RichText.Content tagName="span" className="zen-choose-exp__footer-text" value={ card.footerText || '' } style={ { color: card.footerTextColor, fontSize: `${ card.footerTextSize || 17 }px`, fontWeight: card.footerTextWeight || '700' } } />
											<span className="zen-choose-exp__footer-plus" style={ { color: card.footerPlusColor, fontSize: `${ card.footerPlusSize || 46 }px` } }>+</span>
										</div>
									</div>
								</div>
							</article>
						);
					} ) }
				</div>
			</div>
		</section>
	);
}
