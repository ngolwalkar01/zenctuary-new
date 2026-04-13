import { RichText, useBlockProps } from '@wordpress/block-editor';

const DEFAULT_SPACING = { top: '0px', right: '0px', bottom: '0px', left: '0px' };
const normSpacing = ( value = {} ) => ( { ...DEFAULT_SPACING, ...value } );
const spacingStyle = ( value = {}, property ) => {
	const spacing = normSpacing( value );
	return {
		[ `${ property }Top` ]: spacing.top,
		[ `${ property }Right` ]: spacing.right,
		[ `${ property }Bottom` ]: spacing.bottom,
		[ `${ property }Left` ]: spacing.left,
	};
};

function ArrowIcon() {
	return (
		<svg className="zen-our-spaces__arrow-svg" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
			<path d="M11.1 3.6 17.5 10l-6.4 6.4-1.5-1.5 3.9-3.9H2.5V8.9h11L9.6 5z" />
		</svg>
	);
}

export default function save( { attributes } ) {
	const cards = Array.isArray( attributes.cards ) ? attributes.cards : [];
	const blockProps = useBlockProps.save( {
		className: 'zen-our-spaces',
		style: {
			...spacingStyle( attributes.sectionPadding, 'padding' ),
			...spacingStyle( attributes.sectionMargin, 'margin' ),
		},
	} );

	return (
		<section { ...blockProps }>
			<div className="zen-our-spaces__content">
				<div className="zen-our-spaces__left">
					<RichText.Content
						tagName="h2"
						className="zen-our-spaces__heading"
						value={ attributes.heading }
						style={ {
							color: attributes.headingColor,
							fontSize: `${ attributes.headingFontSize }px`,
							fontWeight: attributes.headingFontWeight,
							textTransform: 'uppercase',
							...spacingStyle( attributes.headingPadding, 'padding' ),
							...spacingStyle( attributes.headingMargin, 'margin' ),
						} }
					/>
				</div>
				<div className="zen-our-spaces__right" style={ { gap: attributes.cardsGap } }>
					{ cards.map( ( card, index ) => {
						const buttonStyle = {
							color: card.buttonTextColor,
							backgroundColor: card.buttonBackgroundColor,
							borderColor: card.buttonBorderColor,
							borderWidth: `${ card.buttonBorderWidth }px`,
							borderRadius: `${ card.buttonBorderRadius }px`,
						};

						return (
							<article
								className="zen-our-spaces__card"
								key={ card.id || index }
								style={ {
									width: card.cardWidth,
									height: card.cardHeight,
									backgroundImage: card.backgroundImage?.url ? `url(${ card.backgroundImage.url })` : 'none',
									backgroundSize: card.backgroundSize,
								} }
							>
								<div className="zen-our-spaces__card-overlay" />
								<div className="zen-our-spaces__card-inner">
									<div className="zen-our-spaces__card-icon-col">
										<div className="zen-our-spaces__icon-wrap">
											{ card.iconImage?.url && (
												<img
													className="zen-our-spaces__icon-image"
													src={ card.iconImage.url }
													alt={ card.iconImage.alt || '' }
													style={ { width: `${ card.iconWidth }px`, height: `${ card.iconHeight }px` } }
												/>
											) }
										</div>
									</div>
									<div className="zen-our-spaces__card-content-col">
										<RichText.Content
											tagName="h3"
											className="zen-our-spaces__card-title"
											value={ card.title }
											style={ {
												color: card.titleColor,
												fontSize: `${ card.titleFontSize }px`,
												fontWeight: card.titleFontWeight,
												letterSpacing: card.titleLetterSpacing,
												textTransform: 'uppercase',
											} }
										/>
										<RichText.Content
											tagName="p"
											className="zen-our-spaces__card-paragraph"
											value={ card.paragraph }
											style={ {
												color: card.paragraphColor,
												fontSize: `${ card.paragraphFontSize }px`,
												fontWeight: card.paragraphFontWeight,
												...spacingStyle( card.paragraphMargin, 'margin' ),
											} }
										/>
										<div className={ `zen-our-spaces__button zen-our-spaces__button--${ card.arrowPosition || 'right' }` } style={ buttonStyle }>
											{ card.showArrow && <ArrowIcon /> }
											<RichText.Content tagName="span" className="zen-our-spaces__button-text" value={ card.buttonText } />
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
