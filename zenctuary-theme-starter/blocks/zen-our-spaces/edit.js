import {
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';
import {
	Button,
	ColorPalette,
	PanelBody,
	RangeControl,
	SelectControl,
	TextControl,
	ToggleControl,
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';

const DEFAULT_SPACING = { top: '0px', right: '0px', bottom: '0px', left: '0px' };
const DEFAULT_CARD = {
	backgroundImage: { id: 0, url: '', alt: '' },
	backgroundSize: 'cover',
	cardWidth: '100%',
	cardHeight: '320px',
	iconImage: { id: 0, url: '', alt: '' },
	iconWidth: 74,
	iconHeight: 74,
	title: 'SOUL KITCHEN',
	titleColor: '#f6f2e9',
	titleFontSize: 32,
	titleFontWeight: '800',
	titleLetterSpacing: '0.06em',
	paragraph: 'Add a short description for this space.',
	paragraphColor: '#f2eee4',
	paragraphFontSize: 17,
	paragraphFontWeight: '400',
	paragraphMargin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
	buttonText: 'Explore space',
	buttonBackgroundColor: 'rgba(216, 179, 84, 0.15)',
	buttonTextColor: '#f6f2e9',
	buttonBorderColor: '#d8b354',
	buttonBorderWidth: 1,
	buttonBorderRadius: 999,
	showArrow: true,
	arrowPosition: 'right',
};

const WEIGHTS = [ '300', '400', '500', '600', '700', '800', '900' ].map( ( value ) => ( { label: value, value } ) );
const BG_FIT_OPTIONS = [
	{ label: 'Cover', value: 'cover' },
	{ label: 'Contain', value: 'contain' },
];
const ARROW_POSITION_OPTIONS = [
	{ label: 'Left', value: 'left' },
	{ label: 'Right', value: 'right' },
	{ label: 'Top', value: 'top' },
	{ label: 'Bottom', value: 'bottom' },
];

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
const normalizeCard = ( card = {} ) => ( {
	...DEFAULT_CARD,
	...card,
	paragraphMargin: normSpacing( card.paragraphMargin || DEFAULT_CARD.paragraphMargin ),
	backgroundImage: { ...DEFAULT_CARD.backgroundImage, ...( card.backgroundImage || {} ) },
	iconImage: { ...DEFAULT_CARD.iconImage, ...( card.iconImage || {} ) },
} );

function ArrowIcon() {
	return (
		<svg className="zen-our-spaces__arrow-svg" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
			<path d="M11.1 3.6 17.5 10l-6.4 6.4-1.5-1.5 3.9-3.9H2.5V8.9h11L9.6 5z" />
		</svg>
	);
}

function SpacingControls( { label, value, onChange } ) {
	const spacing = normSpacing( value );
	const set = ( side, sideValue ) => onChange( { ...spacing, [ side ]: sideValue || '0px' } );

	return (
		<div className="zen-our-spaces-control-grid">
			<p className="components-base-control__label">{ label }</p>
			<UnitControl label="Top" value={ spacing.top } onChange={ ( sideValue ) => set( 'top', sideValue ) } />
			<UnitControl label="Right" value={ spacing.right } onChange={ ( sideValue ) => set( 'right', sideValue ) } />
			<UnitControl label="Bottom" value={ spacing.bottom } onChange={ ( sideValue ) => set( 'bottom', sideValue ) } />
			<UnitControl label="Left" value={ spacing.left } onChange={ ( sideValue ) => set( 'left', sideValue ) } />
		</div>
	);
}

function InlineMediaButton( { className, media, label, onSelect, onRemove } ) {
	return (
		<div className={ className }>
			<MediaUploadCheck>
				<MediaUpload
					onSelect={ ( image ) => onSelect( { id: image.id, url: image.url, alt: image.alt || image.title || '' } ) }
					allowedTypes={ [ 'image' ] }
					value={ media?.id || 0 }
					render={ ( { open } ) => (
						<Button className="zen-our-spaces__upload-btn" variant="secondary" onClick={ open }>
							{ media?.url ? `Change ${ label }` : `Set ${ label }` }
						</Button>
					) }
				/>
			</MediaUploadCheck>
			{ media?.url && (
				<Button className="zen-our-spaces__upload-remove" variant="link" isDestructive onClick={ onRemove }>
					Remove
				</Button>
			) }
		</div>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const [ selectedCardIndex, setSelectedCardIndex ] = useState( 0 );
	const cards = Array.isArray( attributes.cards ) ? attributes.cards.map( normalizeCard ) : [];
	const selectedCard = cards[ selectedCardIndex ];

	useEffect( () => {
		if ( selectedCardIndex > cards.length - 1 ) {
			setSelectedCardIndex( Math.max( cards.length - 1, 0 ) );
		}
	}, [ cards.length, selectedCardIndex ] );

	const blockProps = useBlockProps( {
		className: 'zen-our-spaces',
		style: {
			...spacingStyle( attributes.sectionPadding, 'padding' ),
			...spacingStyle( attributes.sectionMargin, 'margin' ),
		},
	} );

	const updateCard = ( index, patch ) => {
		setAttributes( {
			cards: cards.map( ( card, cardIndex ) => cardIndex === index ? normalizeCard( { ...card, ...patch } ) : card ),
		} );
	};
	const addCard = () => {
		const next = [ ...cards, { ...DEFAULT_CARD, id: `card-${ Date.now() }` } ];
		setAttributes( { cards: next } );
		setSelectedCardIndex( next.length - 1 );
	};
	const removeCard = () => {
		const next = cards.filter( ( card, index ) => index !== selectedCardIndex );
		setAttributes( { cards: next.length ? next : [ { ...DEFAULT_CARD, id: `card-${ Date.now() }` } ] } );
		setSelectedCardIndex( Math.max( selectedCardIndex - 1, 0 ) );
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title="Section Settings" initialOpen>
					<SpacingControls label="Section padding" value={ attributes.sectionPadding } onChange={ ( sectionPadding ) => setAttributes( { sectionPadding } ) } />
					<SpacingControls label="Section margin" value={ attributes.sectionMargin } onChange={ ( sectionMargin ) => setAttributes( { sectionMargin } ) } />
					<UnitControl label="Space between cards" value={ attributes.cardsGap } onChange={ ( cardsGap ) => setAttributes( { cardsGap: cardsGap || '0px' } ) } />
				</PanelBody>
				<PanelBody title="Left Heading" initialOpen={ false }>
					<RangeControl label="Font size" value={ attributes.headingFontSize } onChange={ ( headingFontSize ) => setAttributes( { headingFontSize } ) } min={ 18 } max={ 110 } />
					<SelectControl label="Font weight" value={ attributes.headingFontWeight } options={ WEIGHTS } onChange={ ( headingFontWeight ) => setAttributes( { headingFontWeight } ) } />
					<p className="components-base-control__label">Color</p>
					<ColorPalette value={ attributes.headingColor } onChange={ ( headingColor ) => setAttributes( { headingColor: headingColor || '#d8b354' } ) } />
					<SpacingControls label="Heading padding" value={ attributes.headingPadding } onChange={ ( headingPadding ) => setAttributes( { headingPadding } ) } />
					<SpacingControls label="Heading margin" value={ attributes.headingMargin } onChange={ ( headingMargin ) => setAttributes( { headingMargin } ) } />
				</PanelBody>
				<PanelBody title="Image Big Cards" initialOpen>
					{ cards.length > 0 && (
						<SelectControl
							label="Selected card"
							value={ selectedCardIndex }
							options={ cards.map( ( card, index ) => ( { label: `${ index + 1 }. ${ card.title || 'Card' }`, value: index } ) ) }
							onChange={ ( value ) => setSelectedCardIndex( Number( value ) ) }
						/>
					) }
					{ selectedCard && (
						<>
							<p className="components-base-control__label">Background image</p>
							<InlineMediaButton
								className="zen-our-spaces-control-upload"
								label="background image"
								media={ selectedCard.backgroundImage }
								onSelect={ ( backgroundImage ) => updateCard( selectedCardIndex, { backgroundImage } ) }
								onRemove={ () => updateCard( selectedCardIndex, { backgroundImage: { id: 0, url: '', alt: '' } } ) }
							/>
							<SelectControl label="Image fit" value={ selectedCard.backgroundSize } options={ BG_FIT_OPTIONS } onChange={ ( backgroundSize ) => updateCard( selectedCardIndex, { backgroundSize } ) } />
							<UnitControl label="Card width" value={ selectedCard.cardWidth } onChange={ ( cardWidth ) => updateCard( selectedCardIndex, { cardWidth: cardWidth || '100%' } ) } />
							<UnitControl label="Card height" value={ selectedCard.cardHeight } onChange={ ( cardHeight ) => updateCard( selectedCardIndex, { cardHeight: cardHeight || '320px' } ) } />

							<p className="components-base-control__label">Icon image</p>
							<InlineMediaButton
								className="zen-our-spaces-control-upload"
								label="icon image"
								media={ selectedCard.iconImage }
								onSelect={ ( iconImage ) => updateCard( selectedCardIndex, { iconImage } ) }
								onRemove={ () => updateCard( selectedCardIndex, { iconImage: { id: 0, url: '', alt: '' } } ) }
							/>
							<RangeControl label="Icon width" value={ selectedCard.iconWidth } onChange={ ( iconWidth ) => updateCard( selectedCardIndex, { iconWidth } ) } min={ 24 } max={ 220 } />
							<RangeControl label="Icon height" value={ selectedCard.iconHeight } onChange={ ( iconHeight ) => updateCard( selectedCardIndex, { iconHeight } ) } min={ 24 } max={ 220 } />

							<TextControl label="Heading text" value={ selectedCard.title } onChange={ ( title ) => updateCard( selectedCardIndex, { title } ) } />
							<RangeControl label="Heading font size" value={ selectedCard.titleFontSize } onChange={ ( titleFontSize ) => updateCard( selectedCardIndex, { titleFontSize } ) } min={ 14 } max={ 90 } />
							<SelectControl label="Heading font weight" value={ selectedCard.titleFontWeight } options={ WEIGHTS } onChange={ ( titleFontWeight ) => updateCard( selectedCardIndex, { titleFontWeight } ) } />
							<UnitControl label="Heading letter spacing" value={ selectedCard.titleLetterSpacing } onChange={ ( titleLetterSpacing ) => updateCard( selectedCardIndex, { titleLetterSpacing: titleLetterSpacing || '0px' } ) } />
							<p className="components-base-control__label">Heading color</p>
							<ColorPalette value={ selectedCard.titleColor } onChange={ ( titleColor ) => updateCard( selectedCardIndex, { titleColor: titleColor || '#f6f2e9' } ) } />

							<TextControl label="Paragraph text" value={ selectedCard.paragraph } onChange={ ( paragraph ) => updateCard( selectedCardIndex, { paragraph } ) } />
							<RangeControl label="Paragraph font size" value={ selectedCard.paragraphFontSize } onChange={ ( paragraphFontSize ) => updateCard( selectedCardIndex, { paragraphFontSize } ) } min={ 12 } max={ 42 } />
							<SelectControl label="Paragraph font weight" value={ selectedCard.paragraphFontWeight } options={ WEIGHTS } onChange={ ( paragraphFontWeight ) => updateCard( selectedCardIndex, { paragraphFontWeight } ) } />
							<p className="components-base-control__label">Paragraph color</p>
							<ColorPalette value={ selectedCard.paragraphColor } onChange={ ( paragraphColor ) => updateCard( selectedCardIndex, { paragraphColor: paragraphColor || '#f2eee4' } ) } />
							<SpacingControls label="Paragraph margin" value={ selectedCard.paragraphMargin } onChange={ ( paragraphMargin ) => updateCard( selectedCardIndex, { paragraphMargin } ) } />

							<TextControl label="Button text" value={ selectedCard.buttonText } onChange={ ( buttonText ) => updateCard( selectedCardIndex, { buttonText } ) } />
							<p className="components-base-control__label">Button background</p>
							<ColorPalette value={ selectedCard.buttonBackgroundColor } onChange={ ( buttonBackgroundColor ) => updateCard( selectedCardIndex, { buttonBackgroundColor: buttonBackgroundColor || 'transparent' } ) } />
							<p className="components-base-control__label">Button text color</p>
							<ColorPalette value={ selectedCard.buttonTextColor } onChange={ ( buttonTextColor ) => updateCard( selectedCardIndex, { buttonTextColor: buttonTextColor || '#f6f2e9' } ) } />
							<p className="components-base-control__label">Button border color</p>
							<ColorPalette value={ selectedCard.buttonBorderColor } onChange={ ( buttonBorderColor ) => updateCard( selectedCardIndex, { buttonBorderColor: buttonBorderColor || '#d8b354' } ) } />
							<RangeControl label="Button border width" value={ selectedCard.buttonBorderWidth } onChange={ ( buttonBorderWidth ) => updateCard( selectedCardIndex, { buttonBorderWidth } ) } min={ 0 } max={ 8 } />
							<RangeControl label="Button border radius" value={ selectedCard.buttonBorderRadius } onChange={ ( buttonBorderRadius ) => updateCard( selectedCardIndex, { buttonBorderRadius } ) } min={ 0 } max={ 999 } />
							<ToggleControl label="Show arrow icon" checked={ selectedCard.showArrow } onChange={ ( showArrow ) => updateCard( selectedCardIndex, { showArrow } ) } />
							<SelectControl label="Arrow position" value={ selectedCard.arrowPosition } options={ ARROW_POSITION_OPTIONS } onChange={ ( arrowPosition ) => updateCard( selectedCardIndex, { arrowPosition } ) } />
						</>
					) }
					<div className="zen-our-spaces-actions">
						<Button variant="tertiary" isDestructive onClick={ removeCard }>
							Remove selected card
						</Button>
						<Button variant="primary" onClick={ addCard }>
							Add card
						</Button>
					</div>
				</PanelBody>
			</InspectorControls>

			<section { ...blockProps }>
				<div className="zen-our-spaces__content">
					<div className="zen-our-spaces__left">
						<RichText
							tagName="h2"
							className="zen-our-spaces__heading"
							value={ attributes.heading }
							onChange={ ( heading ) => setAttributes( { heading } ) }
							style={ {
								color: attributes.headingColor,
								fontSize: `${ attributes.headingFontSize }px`,
								fontWeight: attributes.headingFontWeight,
								textTransform: 'uppercase',
								...spacingStyle( attributes.headingPadding, 'padding' ),
								...spacingStyle( attributes.headingMargin, 'margin' ),
							} }
							allowedFormats={ [ 'core/bold', 'core/italic' ] }
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
									className={ `zen-our-spaces__card${ selectedCardIndex === index ? ' is-selected' : '' }` }
									key={ card.id || index }
									onClick={ () => setSelectedCardIndex( index ) }
									style={ {
										width: card.cardWidth,
										height: card.cardHeight,
										backgroundImage: card.backgroundImage?.url ? `url(${ card.backgroundImage.url })` : 'none',
										backgroundSize: card.backgroundSize,
									} }
								>
									<InlineMediaButton
										className="zen-our-spaces__bg-upload"
										label="background"
										media={ card.backgroundImage }
										onSelect={ ( backgroundImage ) => updateCard( index, { backgroundImage } ) }
										onRemove={ () => updateCard( index, { backgroundImage: { id: 0, url: '', alt: '' } } ) }
									/>
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
												<InlineMediaButton
													className="zen-our-spaces__icon-upload"
													label="icon"
													media={ card.iconImage }
													onSelect={ ( iconImage ) => updateCard( index, { iconImage } ) }
													onRemove={ () => updateCard( index, { iconImage: { id: 0, url: '', alt: '' } } ) }
												/>
											</div>
										</div>
										<div className="zen-our-spaces__card-content-col">
											<RichText
												tagName="h3"
												className="zen-our-spaces__card-title"
												value={ card.title }
												onChange={ ( title ) => updateCard( index, { title } ) }
												style={ {
													color: card.titleColor,
													fontSize: `${ card.titleFontSize }px`,
													fontWeight: card.titleFontWeight,
													letterSpacing: card.titleLetterSpacing,
													textTransform: 'uppercase',
												} }
												allowedFormats={ [ 'core/bold', 'core/italic' ] }
											/>
											<RichText
												tagName="p"
												className="zen-our-spaces__card-paragraph"
												value={ card.paragraph }
												onChange={ ( paragraph ) => updateCard( index, { paragraph } ) }
												style={ {
													color: card.paragraphColor,
													fontSize: `${ card.paragraphFontSize }px`,
													fontWeight: card.paragraphFontWeight,
													...spacingStyle( card.paragraphMargin, 'margin' ),
												} }
												allowedFormats={ [ 'core/bold', 'core/italic', 'core/link' ] }
											/>
											<div className={ `zen-our-spaces__button zen-our-spaces__button--${ card.arrowPosition }` } style={ buttonStyle }>
												{ card.showArrow && <ArrowIcon /> }
												<RichText
													tagName="span"
													className="zen-our-spaces__button-text"
													value={ card.buttonText }
													onChange={ ( buttonText ) => updateCard( index, { buttonText } ) }
													allowedFormats={ [ 'core/bold', 'core/italic' ] }
												/>
											</div>
										</div>
									</div>
								</article>
							);
						} ) }
					</div>
				</div>
			</section>
		</>
	);
}
