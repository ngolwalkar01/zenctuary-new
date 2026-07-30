import { __ } from '@wordpress/i18n';
import { InspectorControls, MediaUpload, MediaUploadCheck, RichText, useBlockProps } from '@wordpress/block-editor';
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

const FONT_FAMILIES = [
	{ label: 'Montserrat', value: 'var(--wp--preset--font-family--montserrat)' },
	{ label: 'DM Sans', value: 'var(--wp--preset--font-family--dm-sans)' },
	{ label: 'Theme default', value: '' },
];
const WEIGHTS = [ '300', '400', '500', '600', '700', '800', '900' ].map( ( value ) => ( { label: value, value } ) );
const COLORS = [
	{ name: 'Gold', color: '#d8b354' },
	{ name: 'Dark grey', color: '#3f3d3d' },
	{ name: 'Beige', color: '#f1eee7' },
	{ name: 'White', color: '#ffffff' },
	{ name: 'Black', color: '#000000' },
];

const createCard = () => ( {
	id: `dropin-${ Date.now() }`,
	imageId: 0,
	imageUrl: '',
	imageAlt: '',
	zencoins: '5',
	price: '25 €',
	feature: 'For all Courses and Fire & Ice Zone',
	validity: 'Valid for 3 Months beginning with the date of purchase',
	note: '',
	buttonText: 'Book now',
	buttonUrl: '#',
	buttonOpenInNewTab: false,
} );

function ColorControl( { label, value, onChange } ) {
	return (
		<div className="zen-static-dropins-control">
			<p className="components-base-control__label">{ label }</p>
			<ColorPalette colors={ COLORS } value={ value } onChange={ onChange } enableAlpha />
		</div>
	);
}

function TypographyControls( { title, prefix, attributes, setAttributes, colorDefault } ) {
	const set = ( key, value ) => setAttributes( { [ `${ prefix }${ key }` ]: value } );
	return (
		<PanelBody title={ title } initialOpen={ false }>
			<SelectControl label={ __( 'Font family', 'zenctuary' ) } value={ attributes[ `${ prefix }FontFamily` ] } options={ FONT_FAMILIES } onChange={ ( value ) => set( 'FontFamily', value ) } />
			<UnitControl label={ __( 'Font size', 'zenctuary' ) } value={ attributes[ `${ prefix }FontSize` ] } onChange={ ( value ) => set( 'FontSize', value || '' ) } />
			<SelectControl label={ __( 'Font weight', 'zenctuary' ) } value={ attributes[ `${ prefix }FontWeight` ] } options={ WEIGHTS } onChange={ ( value ) => set( 'FontWeight', value ) } />
			<TextControl label={ __( 'Line height', 'zenctuary' ) } value={ attributes[ `${ prefix }LineHeight` ] || '' } onChange={ ( value ) => set( 'LineHeight', value ) } />
			<UnitControl label={ __( 'Letter spacing', 'zenctuary' ) } value={ attributes[ `${ prefix }LetterSpacing` ] || '' } onChange={ ( value ) => set( 'LetterSpacing', value || '' ) } />
			<ColorControl label={ __( 'Color', 'zenctuary' ) } value={ attributes[ `${ prefix }Color` ] } onChange={ ( value ) => set( 'Color', value || colorDefault ) } />
		</PanelBody>
	);
}

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

function Card( { card, index, attributes, updateCard, selectCard } ) {
	return (
		<article className="zen-static-dropins__card" onClick={ () => selectCard( index ) }>
			<div className="zen-static-dropins__image-wrap">
				{ card.imageUrl ? (
					<img className="zen-static-dropins__image" src={ card.imageUrl } alt={ card.imageAlt || '' } />
				) : (
					<div className="zen-static-dropins__image zen-static-dropins__image--placeholder" />
				) }
				<span className="zen-static-dropins__image-overlay" aria-hidden="true" />
				<div className="zen-static-dropins__zencoins">
					<RichText tagName="span" className="zen-static-dropins__zencoin-label" value={ attributes.zencoinLabel } onChange={ ( zencoinLabel ) => updateCard( index, {}, { zencoinLabel } ) } style={ textStyle( attributes, 'zencoinLabel' ) } allowedFormats={ [ 'core/bold', 'core/italic' ] } />
					<Coin value={ card.zencoins } attributes={ attributes } />
				</div>
			</div>
			<div className="zen-static-dropins__body">
				<RichText tagName="div" className="zen-static-dropins__price" value={ card.price } onChange={ ( price ) => updateCard( index, { price } ) } style={ textStyle( attributes, 'price' ) } allowedFormats={ [ 'core/bold', 'core/italic' ] } />
				<div className="zen-static-dropins__feature" style={ textStyle( attributes, 'feature' ) }>
					{ attributes.showFeatureIcon && <span className="zen-static-dropins__feature-icon"><CheckIcon /></span> }
					<RichText tagName="span" value={ card.feature } onChange={ ( feature ) => updateCard( index, { feature } ) } allowedFormats={ [ 'core/bold', 'core/italic' ] } />
				</div>
				<RichText tagName="p" className="zen-static-dropins__validity" value={ card.validity } onChange={ ( validity ) => updateCard( index, { validity } ) } style={ textStyle( attributes, 'validity' ) } allowedFormats={ [ 'core/bold', 'core/italic', 'core/link' ] } />
				<RichText tagName="p" className="zen-static-dropins__note" value={ card.note } onChange={ ( note ) => updateCard( index, { note } ) } style={ textStyle( attributes, 'note' ) } allowedFormats={ [ 'core/bold', 'core/italic' ] } placeholder={ __( 'Optional note…', 'zenctuary' ) } />
				<a className="zen-static-dropins__button" href={ card.buttonUrl || '#' } onClick={ ( event ) => event.preventDefault() } style={ textStyle( attributes, 'button' ) }>
					<RichText tagName="span" value={ card.buttonText } onChange={ ( buttonText ) => updateCard( index, { buttonText } ) } allowedFormats={ [ 'core/bold', 'core/italic' ] } />
					{ attributes.showButtonIcon && <span className="zen-static-dropins__button-icon"><ArrowIcon /></span> }
				</a>
			</div>
		</article>
	);
}

function BlockView( { attributes, setAttributes, selectCard } ) {
	const cards = Array.isArray( attributes.cards ) ? attributes.cards : [];
	const updateCard = ( index, patch, rootPatch = {} ) => setAttributes( {
		...rootPatch,
		cards: cards.map( ( card, cardIndex ) => cardIndex === index ? { ...card, ...patch } : card ),
	} );
	const blockProps = useBlockProps( {
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
					<RichText tagName="h2" className="zen-static-dropins__heading" value={ attributes.heading } onChange={ ( heading ) => setAttributes( { heading } ) } style={ { ...textStyle( attributes, 'heading' ), whiteSpace: attributes.headingWrap ? 'normal' : 'nowrap' } } allowedFormats={ [ 'core/bold', 'core/italic' ] } />
					<RichText tagName="p" className="zen-static-dropins__intro" value={ attributes.intro } onChange={ ( intro ) => setAttributes( { intro } ) } style={ textStyle( attributes, 'intro' ) } allowedFormats={ [ 'core/bold', 'core/italic', 'core/link' ] } />
				</header>
				<div className="zen-static-dropins__grid">
					{ cards.map( ( card, index ) => <Card key={ card.id || index } card={ card } index={ index } attributes={ attributes } updateCard={ updateCard } selectCard={ selectCard } /> ) }
				</div>
			</div>
		</section>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const [ selectedCardIndex, setSelectedCardIndex ] = useState( 0 );
	const cards = Array.isArray( attributes.cards ) ? attributes.cards : [];
	const selectedCard = cards[ selectedCardIndex ];
	const updateCard = ( index, patch ) => setAttributes( {
		cards: cards.map( ( card, cardIndex ) => cardIndex === index ? { ...card, ...patch } : card ),
	} );
	const addCard = () => {
		setAttributes( { cards: [ ...cards, createCard() ] } );
		setSelectedCardIndex( cards.length );
	};
	const removeCard = () => {
		if ( cards.length <= 1 ) return;
		setAttributes( { cards: cards.filter( ( card, index ) => index !== selectedCardIndex ) } );
		setSelectedCardIndex( Math.max( selectedCardIndex - 1, 0 ) );
	};
	const moveCard = ( amount ) => {
		const nextIndex = selectedCardIndex + amount;
		if ( nextIndex < 0 || nextIndex >= cards.length ) return;
		const nextCards = [ ...cards ];
		const [ card ] = nextCards.splice( selectedCardIndex, 1 );
		nextCards.splice( nextIndex, 0, card );
		setAttributes( { cards: nextCards } );
		setSelectedCardIndex( nextIndex );
	};

	useEffect( () => {
		if ( selectedCardIndex > cards.length - 1 ) {
			setSelectedCardIndex( Math.max( cards.length - 1, 0 ) );
		}
	}, [ cards.length, selectedCardIndex ] );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Layout', 'zenctuary' ) } initialOpen>
					<ColorControl label={ __( 'Section background', 'zenctuary' ) } value={ attributes.backgroundColor } onChange={ ( backgroundColor ) => setAttributes( { backgroundColor: backgroundColor || '#3f3d3d' } ) } />
					<UnitControl label={ __( 'Top padding', 'zenctuary' ) } value={ attributes.sectionPaddingTop } onChange={ ( sectionPaddingTop ) => setAttributes( { sectionPaddingTop: sectionPaddingTop || '0px' } ) } />
					<UnitControl label={ __( 'Right padding', 'zenctuary' ) } value={ attributes.sectionPaddingRight } onChange={ ( sectionPaddingRight ) => setAttributes( { sectionPaddingRight: sectionPaddingRight || '0px' } ) } />
					<UnitControl label={ __( 'Bottom padding', 'zenctuary' ) } value={ attributes.sectionPaddingBottom } onChange={ ( sectionPaddingBottom ) => setAttributes( { sectionPaddingBottom: sectionPaddingBottom || '0px' } ) } />
					<UnitControl label={ __( 'Left padding', 'zenctuary' ) } value={ attributes.sectionPaddingLeft } onChange={ ( sectionPaddingLeft ) => setAttributes( { sectionPaddingLeft: sectionPaddingLeft || '0px' } ) } />
					<UnitControl label={ __( 'Content max width', 'zenctuary' ) } value={ attributes.contentMaxWidth } onChange={ ( contentMaxWidth ) => setAttributes( { contentMaxWidth: contentMaxWidth || '1240px' } ) } />
					<UnitControl label={ __( 'Header max width', 'zenctuary' ) } value={ attributes.headerMaxWidth } onChange={ ( headerMaxWidth ) => setAttributes( { headerMaxWidth: headerMaxWidth || '1480px' } ) } />
					<RangeControl label={ __( 'Header bottom spacing', 'zenctuary' ) } value={ attributes.headerBottomSpacing } onChange={ ( headerBottomSpacing ) => setAttributes( { headerBottomSpacing } ) } min={ 0 } max={ 140 } />
					<RangeControl label={ __( 'Cards gap', 'zenctuary' ) } value={ attributes.cardsGap } onChange={ ( cardsGap ) => setAttributes( { cardsGap } ) } min={ 8 } max={ 120 } />
				</PanelBody>
				<TypographyControls title={ __( 'Heading typography', 'zenctuary' ) } prefix="heading" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#d8b354" />
				<PanelBody title={ __( 'Heading layout', 'zenctuary' ) } initialOpen={ false }>
					<ToggleControl label={ __( 'Allow heading to wrap', 'zenctuary' ) } checked={ !! attributes.headingWrap } onChange={ ( headingWrap ) => setAttributes( { headingWrap } ) } />
				</PanelBody>
				<TypographyControls title={ __( 'Intro typography', 'zenctuary' ) } prefix="intro" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#f1eee7" />
				<PanelBody title={ __( 'Cards', 'zenctuary' ) } initialOpen>
					<SelectControl label={ __( 'Selected card', 'zenctuary' ) } value={ selectedCardIndex } options={ cards.map( ( card, index ) => ( { label: `${ index + 1 }. ${ card.price || 'Untitled drop-in' }`, value: index } ) ) } onChange={ ( value ) => setSelectedCardIndex( Number( value ) ) } />
					{ selectedCard && (
						<>
							<TextControl label={ __( 'Zencoins value', 'zenctuary' ) } value={ selectedCard.zencoins || '' } onChange={ ( zencoins ) => updateCard( selectedCardIndex, { zencoins } ) } />
							<TextControl label={ __( 'Price', 'zenctuary' ) } value={ selectedCard.price || '' } onChange={ ( price ) => updateCard( selectedCardIndex, { price } ) } />
							<TextControl label={ __( 'Book Now URL', 'zenctuary' ) } value={ selectedCard.buttonUrl || '' } onChange={ ( buttonUrl ) => updateCard( selectedCardIndex, { buttonUrl } ) } />
							<ToggleControl label={ __( 'Open button in new tab', 'zenctuary' ) } checked={ !! selectedCard.buttonOpenInNewTab } onChange={ ( buttonOpenInNewTab ) => updateCard( selectedCardIndex, { buttonOpenInNewTab } ) } />
							<MediaUploadCheck>
								<MediaUpload
									allowedTypes={ [ 'image' ] }
									value={ selectedCard.imageId || 0 }
									onSelect={ ( media ) => updateCard( selectedCardIndex, { imageId: media?.id || 0, imageUrl: media?.url || '', imageAlt: media?.alt || media?.title || '' } ) }
									render={ ( { open } ) => <Button variant="secondary" onClick={ open }>{ selectedCard.imageUrl ? __( 'Replace card image', 'zenctuary' ) : __( 'Select card image', 'zenctuary' ) }</Button> }
								/>
							</MediaUploadCheck>
							{ selectedCard.imageUrl && <Button variant="link" isDestructive onClick={ () => updateCard( selectedCardIndex, { imageId: 0, imageUrl: '', imageAlt: '' } ) }>{ __( 'Remove image', 'zenctuary' ) }</Button> }
						</>
					) }
					<div className="zen-static-dropins-actions">
						<Button variant="secondary" onClick={ () => moveCard( -1 ) } disabled={ selectedCardIndex <= 0 }>{ __( 'Move up', 'zenctuary' ) }</Button>
						<Button variant="secondary" onClick={ () => moveCard( 1 ) } disabled={ selectedCardIndex >= cards.length - 1 }>{ __( 'Move down', 'zenctuary' ) }</Button>
						<Button variant="tertiary" isDestructive onClick={ removeCard } disabled={ cards.length <= 1 }>{ __( 'Remove', 'zenctuary' ) }</Button>
					</div>
					<Button variant="primary" onClick={ addCard }>{ __( 'Add drop-in card', 'zenctuary' ) }</Button>
				</PanelBody>
				<PanelBody title={ __( 'Card style', 'zenctuary' ) } initialOpen={ false }>
					<UnitControl label={ __( 'Card width', 'zenctuary' ) } value={ attributes.cardWidth } onChange={ ( cardWidth ) => setAttributes( { cardWidth: cardWidth || '560px' } ) } />
					<UnitControl label={ __( 'Card min height', 'zenctuary' ) } value={ attributes.cardMinHeight } onChange={ ( cardMinHeight ) => setAttributes( { cardMinHeight: cardMinHeight || '760px' } ) } />
					<ColorControl label={ __( 'Card background', 'zenctuary' ) } value={ attributes.cardBackgroundColor } onChange={ ( cardBackgroundColor ) => setAttributes( { cardBackgroundColor: cardBackgroundColor || '#f1eee7' } ) } />
					<ColorControl label={ __( 'Card border', 'zenctuary' ) } value={ attributes.cardBorderColor } onChange={ ( cardBorderColor ) => setAttributes( { cardBorderColor: cardBorderColor || '#d8b354' } ) } />
					<RangeControl label={ __( 'Border width', 'zenctuary' ) } value={ attributes.cardBorderWidth } onChange={ ( cardBorderWidth ) => setAttributes( { cardBorderWidth } ) } min={ 0 } max={ 8 } />
					<RangeControl label={ __( 'Border radius', 'zenctuary' ) } value={ attributes.cardBorderRadius } onChange={ ( cardBorderRadius ) => setAttributes( { cardBorderRadius } ) } min={ 0 } max={ 70 } />
					<RangeControl label={ __( 'Image height', 'zenctuary' ) } value={ attributes.imageHeight } onChange={ ( imageHeight ) => setAttributes( { imageHeight } ) } min={ 80 } max={ 360 } />
					<ColorControl label={ __( 'Image overlay color', 'zenctuary' ) } value={ attributes.imageOverlayColor } onChange={ ( imageOverlayColor ) => setAttributes( { imageOverlayColor: imageOverlayColor || '#000000' } ) } />
					<RangeControl label={ __( 'Image overlay opacity', 'zenctuary' ) } value={ attributes.imageOverlayOpacity } onChange={ ( imageOverlayOpacity ) => setAttributes( { imageOverlayOpacity } ) } min={ 0 } max={ 0.85 } step={ 0.05 } />
				</PanelBody>
				<TypographyControls title={ __( 'Zencoin label typography', 'zenctuary' ) } prefix="zencoinLabel" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#d8b354" />
				<PanelBody title={ __( 'Coin style', 'zenctuary' ) } initialOpen={ false }>
					<RangeControl label={ __( 'Coin size', 'zenctuary' ) } value={ attributes.coinSize } onChange={ ( coinSize ) => setAttributes( { coinSize } ) } min={ 24 } max={ 100 } />
					<ColorControl label={ __( 'Coin background', 'zenctuary' ) } value={ attributes.coinBackgroundColor } onChange={ ( coinBackgroundColor ) => setAttributes( { coinBackgroundColor: coinBackgroundColor || '#d8b354' } ) } />
					<ColorControl label={ __( 'Coin ring/border', 'zenctuary' ) } value={ attributes.coinBorderColor } onChange={ ( coinBorderColor ) => setAttributes( { coinBorderColor: coinBorderColor || '#3f3d3d' } ) } />
					<ColorControl label={ __( 'Coin text', 'zenctuary' ) } value={ attributes.coinTextColor } onChange={ ( coinTextColor ) => setAttributes( { coinTextColor: coinTextColor || '#3f3d3d' } ) } />
					<RangeControl label={ __( 'Coin border width', 'zenctuary' ) } value={ attributes.coinBorderWidth } onChange={ ( coinBorderWidth ) => setAttributes( { coinBorderWidth } ) } min={ 1 } max={ 8 } />
					<RangeControl label={ __( 'Inner ring inset', 'zenctuary' ) } value={ attributes.coinRingInset } onChange={ ( coinRingInset ) => setAttributes( { coinRingInset } ) } min={ 2 } max={ 16 } />
				</PanelBody>
				<TypographyControls title={ __( 'Price typography', 'zenctuary' ) } prefix="price" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#3f3d3d" />
				<TypographyControls title={ __( 'Feature typography', 'zenctuary' ) } prefix="feature" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#3f3d3d" />
				<PanelBody title={ __( 'Feature icon', 'zenctuary' ) } initialOpen={ false }>
					<ToggleControl label={ __( 'Show check icon', 'zenctuary' ) } checked={ !! attributes.showFeatureIcon } onChange={ ( showFeatureIcon ) => setAttributes( { showFeatureIcon } ) } />
					<RangeControl label={ __( 'Icon size', 'zenctuary' ) } value={ attributes.featureIconSize } onChange={ ( featureIconSize ) => setAttributes( { featureIconSize } ) } min={ 12 } max={ 64 } />
					<RangeControl label={ __( 'Icon gap', 'zenctuary' ) } value={ attributes.featureIconGap } onChange={ ( featureIconGap ) => setAttributes( { featureIconGap } ) } min={ 0 } max={ 40 } />
					<ColorControl label={ __( 'Icon background', 'zenctuary' ) } value={ attributes.featureIconBackgroundColor } onChange={ ( featureIconBackgroundColor ) => setAttributes( { featureIconBackgroundColor: featureIconBackgroundColor || '#3f3d3d' } ) } />
					<ColorControl label={ __( 'Icon color', 'zenctuary' ) } value={ attributes.featureIconColor } onChange={ ( featureIconColor ) => setAttributes( { featureIconColor: featureIconColor || '#d8b354' } ) } />
				</PanelBody>
				<TypographyControls title={ __( 'Validity typography', 'zenctuary' ) } prefix="validity" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#3f3d3d" />
				<TypographyControls title={ __( 'Note typography', 'zenctuary' ) } prefix="note" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#3f3d3d" />
				<TypographyControls title={ __( 'Button typography', 'zenctuary' ) } prefix="button" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#d8b354" />
				<PanelBody title={ __( 'Button style', 'zenctuary' ) } initialOpen={ false }>
					<ColorControl label={ __( 'Button background', 'zenctuary' ) } value={ attributes.buttonBackgroundColor } onChange={ ( buttonBackgroundColor ) => setAttributes( { buttonBackgroundColor: buttonBackgroundColor || '#3f3d3d' } ) } />
					<ColorControl label={ __( 'Button border', 'zenctuary' ) } value={ attributes.buttonBorderColor } onChange={ ( buttonBorderColor ) => setAttributes( { buttonBorderColor: buttonBorderColor || '#d8b354' } ) } />
					<RangeControl label={ __( 'Border width', 'zenctuary' ) } value={ attributes.buttonBorderWidth } onChange={ ( buttonBorderWidth ) => setAttributes( { buttonBorderWidth } ) } min={ 0 } max={ 8 } />
					<UnitControl label={ __( 'Border radius', 'zenctuary' ) } value={ attributes.buttonBorderRadius } onChange={ ( buttonBorderRadius ) => setAttributes( { buttonBorderRadius: buttonBorderRadius || '0px' } ) } />
					<UnitControl label={ __( 'Top margin', 'zenctuary' ) } value={ attributes.buttonMarginTop } onChange={ ( buttonMarginTop ) => setAttributes( { buttonMarginTop: buttonMarginTop || '0px' } ) } />
					<ToggleControl label={ __( 'Show arrow icon', 'zenctuary' ) } checked={ !! attributes.showButtonIcon } onChange={ ( showButtonIcon ) => setAttributes( { showButtonIcon } ) } />
				</PanelBody>
			</InspectorControls>
			<BlockView attributes={ attributes } setAttributes={ setAttributes } selectCard={ setSelectedCardIndex } />
		</>
	);
}
