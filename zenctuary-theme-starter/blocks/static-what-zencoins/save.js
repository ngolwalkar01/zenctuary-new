import { RichText, useBlockProps } from '@wordpress/block-editor';

const numberOrDefault = ( value, fallback ) => Number.isFinite( Number( value ) ) ? Number( value ) : fallback;
const parseCoinValues = ( value = '' ) => String( value ).split( ',' ).map( ( item ) => item.trim() ).filter( Boolean );

function Coin( { value = '', size = 52, className = '', valueFontSize = '', valueFontWeight = '' } ) {
	const hasValue = value !== undefined && value !== null && `${ value }` !== '';
	const safeSize = numberOrDefault( size, 52 );

	return (
		<span className={ `zen-static-zencoins-coin ${ className }` } style={ { width: `${ safeSize }px`, height: `${ safeSize }px`, fontSize: valueFontSize || `${ Math.max( 12, Math.round( safeSize * 0.34 ) ) }px`, fontWeight: valueFontWeight || undefined } }>
			<span className="zen-static-zencoins-coin__ring" />
			{ hasValue && <span className="zen-static-zencoins-coin__value">{ value }</span> }
		</span>
	);
}

function CoinStack( { coins = [], size = 52, overlap = -16, className = '', valueFontSize = '', valueFontWeight = '' } ) {
	return (
		<span className={ `zen-static-zencoins-coin-stack ${ className }` } style={ { '--zen-static-zencoins-overlap': `${ overlap }px` } }>
			{ coins.map( ( coin, index ) => (
				<Coin key={ `${ coin?.value ?? coin }-${ index }` } value={ coin?.value ?? coin ?? '' } size={ size } className="zen-static-zencoins-coin-stack__coin" valueFontSize={ valueFontSize } valueFontWeight={ valueFontWeight } />
			) ) }
		</span>
	);
}

function ArrowIcon() {
	return <svg viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d="M9.7 3.3 15.4 9l-5.7 5.7-1.2-1.2 3.7-3.7H2.6V8.2h9.6L8.5 4.5z" /></svg>;
}

export default function save( { attributes } ) {
	const headingCoins = Array.isArray( attributes.headingCoins ) ? attributes.headingCoins : [];
	const sections = Array.isArray( attributes.sections ) ? attributes.sections : [];
	const textStyle = ( prefix ) => ( {
		fontFamily: attributes[ `${ prefix }FontFamily` ] || undefined,
		fontSize: attributes[ `${ prefix }FontSize` ],
		fontWeight: attributes[ `${ prefix }FontWeight` ],
		lineHeight: attributes[ `${ prefix }LineHeight` ],
		letterSpacing: attributes[ `${ prefix }LetterSpacing` ],
		color: attributes[ `${ prefix }Color` ],
	} );
	const buttonStyle = {
		...textStyle( 'button' ),
		backgroundColor: attributes.buttonBackgroundColor,
		borderColor: attributes.buttonBorderColor,
		borderWidth: `${ attributes.buttonBorderWidth }px`,
		borderRadius: attributes.buttonBorderRadius,
		paddingTop: attributes.buttonPaddingTop,
		paddingRight: attributes.buttonPaddingRight,
		paddingBottom: attributes.buttonPaddingBottom,
		paddingLeft: attributes.buttonPaddingLeft,
		marginTop: attributes.buttonMarginTop,
		width: attributes.buttonWidth,
		'--zen-static-zencoins-button-icon-size': `${ attributes.buttonIconSize }px`,
		'--zen-static-zencoins-button-icon-gap': `${ attributes.buttonIconGap }px`,
		'--zen-static-zencoins-button-icon-color': attributes.buttonIconColor,
	};
	const buttonRel = attributes.buttonOpenInNewTab ? 'noopener noreferrer' : undefined;
	const renderButtonIcon = () => <span className="zen-static-zencoins__button-icon"><ArrowIcon /></span>;

	const blockProps = useBlockProps.save( {
		className: 'zen-static-zencoins',
		style: {
			'--zen-static-zencoins-bg': attributes.backgroundColor,
			'--zen-static-zencoins-max-width': attributes.contentMaxWidth,
			'--zen-static-zencoins-column-gap': `${ attributes.columnGap }px`,
			'--zen-static-zencoins-panel-border-color': attributes.panelBorderColor,
			'--zen-static-zencoins-panel-bg': attributes.panelBackgroundColor,
			'--zen-static-zencoins-panel-border-width': `${ attributes.panelBorderWidth }px`,
			'--zen-static-zencoins-panel-radius': `${ attributes.panelBorderRadius }px`,
			'--zen-static-zencoins-coin-bg': attributes.coinBackgroundColor,
			'--zen-static-zencoins-coin-border': attributes.coinBorderColor,
			'--zen-static-zencoins-coin-text': attributes.coinTextColor,
			'--zen-static-zencoins-coin-ring-inset': `${ attributes.coinRingInset }px`,
			'--zen-static-zencoins-coin-border-width': `${ attributes.coinBorderWidth }px`,
			'--zen-static-zencoins-divider-color': attributes.dividerColor,
			'--zen-static-zencoins-divider-thickness': `${ attributes.dividerThickness }px`,
			'--zen-static-zencoins-divider-spacing': `${ attributes.dividerSpacing }px`,
			paddingTop: attributes.sectionPaddingTop,
			paddingRight: attributes.sectionPaddingRight,
			paddingBottom: attributes.sectionPaddingBottom,
			paddingLeft: attributes.sectionPaddingLeft,
		},
	} );

	return (
		<section { ...blockProps }>
			<div className="zen-static-zencoins__inner">
				<div className="zen-static-zencoins__left">
					<div className="zen-static-zencoins__heading-row">
						<RichText.Content tagName="h2" className="zen-static-zencoins__heading" value={ attributes.heading } style={ { ...textStyle( 'heading' ), whiteSpace: attributes.headingWrap ? 'normal' : 'nowrap' } } />
						<CoinStack coins={ headingCoins } size={ attributes.headingCoinSize } overlap={ attributes.headingCoinOverlap } />
					</div>
					<RichText.Content tagName="p" className="zen-static-zencoins__intro" value={ attributes.introText } style={ textStyle( 'intro' ) } />
					{ attributes.showButton && (
						<a
							className={ `zen-static-zencoins__button is-icon-${ attributes.buttonIconPosition || 'right' }` }
							href={ attributes.buttonUrl || '#' }
							style={ buttonStyle }
							target={ attributes.buttonOpenInNewTab ? '_blank' : undefined }
							rel={ buttonRel }
						>
							{ attributes.showButtonIcon && attributes.buttonIconPosition === 'left' && renderButtonIcon() }
							<RichText.Content tagName="span" value={ attributes.buttonText } />
							{ attributes.showButtonIcon && attributes.buttonIconPosition !== 'left' && renderButtonIcon() }
						</a>
					) }
				</div>
				<div className="zen-static-zencoins__right">
					<div
						className="zen-static-zencoins__panel"
						style={ {
							paddingTop: attributes.panelPaddingTop,
							paddingRight: attributes.panelPaddingRight,
							paddingBottom: attributes.panelPaddingBottom,
							paddingLeft: attributes.panelPaddingLeft,
						} }
					>
						<div className="zen-static-zencoins__conversion">
							<Coin value={ attributes.conversionCoinValue } size={ attributes.conversionCoinSize } />
							<RichText.Content tagName="span" className="zen-static-zencoins__conversion-label" value={ attributes.conversionLabel } style={ textStyle( 'conversionLabel' ) } />
							<RichText.Content tagName="span" className="zen-static-zencoins__conversion-value" value={ attributes.conversionValue } style={ textStyle( 'conversionValue' ) } />
						</div>
						<span className="zen-static-zencoins__divider" aria-hidden="true" />
						<div className="zen-static-zencoins__sections">
							{ sections.map( ( section, index ) => (
								<div className="zen-static-zencoins__section" key={ section.id || index }>
									<div className="zen-static-zencoins__section-top">
										<RichText.Content tagName="h3" className="zen-static-zencoins__section-title" value={ section.title } style={ textStyle( 'sectionTitle' ) } />
										<div className="zen-static-zencoins__price">
											<span className="zen-static-zencoins__price-label" style={ textStyle( 'zencoinLabel' ) }>ZENCOINS:</span>
											<CoinStack coins={ parseCoinValues( section.coinValues ) } size={ attributes.sectionCoinSize } overlap={ attributes.sectionCoinOverlap } valueFontSize={ attributes.zencoinValueFontSize } valueFontWeight={ attributes.zencoinValueFontWeight } />
										</div>
									</div>
									<RichText.Content tagName="p" className="zen-static-zencoins__description" value={ section.description } style={ textStyle( 'description' ) } />
									{ index < sections.length - 1 && <span className="zen-static-zencoins__divider" aria-hidden="true" /> }
								</div>
							) ) }
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
