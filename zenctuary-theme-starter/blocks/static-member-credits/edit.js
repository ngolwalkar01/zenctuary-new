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

const COLOR_CHOICES = [
	{ name: 'Gold', color: '#d8b354' },
	{ name: 'Dark grey', color: '#3f3d3d' },
	{ name: 'Beige', color: '#f1eee7' },
	{ name: 'Muted grey', color: '#b9b9b9' },
	{ name: 'Soft border', color: 'rgba(241, 238, 231, 0.56)' },
	{ name: 'White', color: '#ffffff' },
	{ name: 'Black', color: '#000000' },
];

const createCard = () => ( {
	id: `member-credit-${ Date.now() }`,
	adminLabel: 'New credits card',
	imageId: 0,
	imageUrl: '',
	imageAlt: '',
	sections: [ createSection( 'New experience', 'ZENCOINS:', '5' ) ],
} );

const createSection = ( leftText = 'New experience', rightLabel = 'ZENCOINS:', rightValue = '5' ) => ( {
	id: `row-${ Date.now() }-${ Math.floor( Math.random() * 1000 ) }`,
	leftText,
	rightLabel,
	rightValue,
} );

function ColorControl( { label, value, onChange } ) {
	return (
		<div className="zen-static-member-credits-control">
			<p className="components-base-control__label">{ label }</p>
			<ColorPalette colors={ COLOR_CHOICES } value={ value } onChange={ onChange } enableAlpha />
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

function Coin( { value, attributes } ) {
	return (
		<span className="zen-static-member-credits-coin" style={ { width: `${ attributes.coinSize }px`, height: `${ attributes.coinSize }px`, fontSize: attributes.coinValueFontSize, fontWeight: attributes.coinValueFontWeight } }>
			<span className="zen-static-member-credits-coin__ring" />
			<span className="zen-static-member-credits-coin__value">{ value }</span>
		</span>
	);
}

function Card( { card, cardIndex, attributes, updateCard, updateSection, selectCard, selectSection } ) {
	const sections = Array.isArray( card.sections ) ? card.sections : [];

	return (
		<article className="zen-static-member-credits__card" onClick={ () => selectCard( cardIndex ) }>
			<div className="zen-static-member-credits__image-wrap">
				{ card.imageUrl ? (
					<img className="zen-static-member-credits__image" src={ card.imageUrl } alt={ card.imageAlt || '' } />
				) : (
					<div className="zen-static-member-credits__image zen-static-member-credits__image--placeholder" />
				) }
				<span className="zen-static-member-credits__image-overlay" aria-hidden="true" />
			</div>
			<div className="zen-static-member-credits__rows">
				{ sections.map( ( section, sectionIndex ) => (
					<div className="zen-static-member-credits__row" key={ section.id || sectionIndex } onClick={ ( event ) => { event.stopPropagation(); selectCard( cardIndex ); selectSection( sectionIndex ); } }>
						<RichText
							tagName="div"
							className="zen-static-member-credits__left"
							value={ section.leftText }
							onChange={ ( leftText ) => updateSection( cardIndex, sectionIndex, { leftText } ) }
							style={ { ...textStyle( attributes, 'left' ), whiteSpace: attributes.leftWrap ? 'normal' : 'nowrap' } }
							allowedFormats={ [ 'core/bold', 'core/italic' ] }
						/>
						<div className="zen-static-member-credits__right">
							<RichText
								tagName="span"
								className="zen-static-member-credits__right-label"
								value={ section.rightLabel || attributes.rightLabel }
								onChange={ ( rightLabel ) => updateSection( cardIndex, sectionIndex, { rightLabel } ) }
								style={ textStyle( attributes, 'rightLabel' ) }
								allowedFormats={ [ 'core/bold', 'core/italic' ] }
							/>
							<Coin value={ section.rightValue } attributes={ attributes } />
						</div>
					</div>
				) ) }
			</div>
		</article>
	);
}

function BlockView( { attributes, setAttributes, selectCard, selectSection } ) {
	const cards = Array.isArray( attributes.cards ) ? attributes.cards : [];
	const blockProps = useBlockProps( {
		className: 'zen-static-member-credits',
		style: {
			'--zen-static-member-credits-bg': attributes.backgroundColor,
			'--zen-static-member-credits-content-width': attributes.contentMaxWidth,
			'--zen-static-member-credits-header-width': attributes.headerMaxWidth,
			'--zen-static-member-credits-header-bottom': `${ attributes.headerBottomSpacing }px`,
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

	const updateCard = ( index, patch ) => setAttributes( {
		cards: cards.map( ( card, cardIndex ) => cardIndex === index ? { ...card, ...patch } : card ),
	} );
	const updateSection = ( cardIndex, sectionIndex, patch ) => setAttributes( {
		cards: cards.map( ( card, index ) => {
			if ( index !== cardIndex ) return card;
			const sections = Array.isArray( card.sections ) ? card.sections : [];
			return { ...card, sections: sections.map( ( section, rowIndex ) => rowIndex === sectionIndex ? { ...section, ...patch } : section ) };
		} ),
	} );

	return (
		<section { ...blockProps }>
			<div className="zen-static-member-credits__inner">
				<header className="zen-static-member-credits__header">
					<RichText tagName="h2" className="zen-static-member-credits__heading" value={ attributes.heading } onChange={ ( heading ) => setAttributes( { heading } ) } style={ { ...textStyle( attributes, 'heading' ), whiteSpace: attributes.headingWrap ? 'normal' : 'nowrap' } } allowedFormats={ [ 'core/bold', 'core/italic' ] } />
					<RichText tagName="p" className="zen-static-member-credits__intro" value={ attributes.intro } onChange={ ( intro ) => setAttributes( { intro } ) } style={ textStyle( attributes, 'intro' ) } allowedFormats={ [ 'core/bold', 'core/italic', 'core/link' ] } />
				</header>
				<div className="zen-static-member-credits__grid">
					{ cards.map( ( card, cardIndex ) => (
						<Card key={ card.id || cardIndex } card={ card } cardIndex={ cardIndex } attributes={ attributes } updateCard={ updateCard } updateSection={ updateSection } selectCard={ selectCard } selectSection={ selectSection } />
					) ) }
				</div>
			</div>
		</section>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const [ selectedCardIndex, setSelectedCardIndex ] = useState( 0 );
	const [ selectedSectionIndex, setSelectedSectionIndex ] = useState( 0 );
	const cards = Array.isArray( attributes.cards ) ? attributes.cards : [];
	const selectedCard = cards[ selectedCardIndex ];
	const sections = selectedCard && Array.isArray( selectedCard.sections ) ? selectedCard.sections : [];
	const selectedSection = sections[ selectedSectionIndex ];

	const updateCard = ( index, patch ) => setAttributes( {
		cards: cards.map( ( card, cardIndex ) => cardIndex === index ? { ...card, ...patch } : card ),
	} );
	const updateSection = ( cardIndex, sectionIndex, patch ) => setAttributes( {
		cards: cards.map( ( card, index ) => {
			if ( index !== cardIndex ) return card;
			const nextSections = Array.isArray( card.sections ) ? card.sections : [];
			return { ...card, sections: nextSections.map( ( section, rowIndex ) => rowIndex === sectionIndex ? { ...section, ...patch } : section ) };
		} ),
	} );
	const moveCard = ( amount ) => {
		const nextIndex = selectedCardIndex + amount;
		if ( nextIndex < 0 || nextIndex >= cards.length ) return;
		const nextCards = [ ...cards ];
		const [ card ] = nextCards.splice( selectedCardIndex, 1 );
		nextCards.splice( nextIndex, 0, card );
		setAttributes( { cards: nextCards } );
		setSelectedCardIndex( nextIndex );
	};
	const moveSection = ( amount ) => {
		const nextIndex = selectedSectionIndex + amount;
		if ( ! selectedCard || nextIndex < 0 || nextIndex >= sections.length ) return;
		const nextSections = [ ...sections ];
		const [ section ] = nextSections.splice( selectedSectionIndex, 1 );
		nextSections.splice( nextIndex, 0, section );
		updateCard( selectedCardIndex, { sections: nextSections } );
		setSelectedSectionIndex( nextIndex );
	};

	useEffect( () => {
		if ( selectedCardIndex > cards.length - 1 ) {
			setSelectedCardIndex( Math.max( cards.length - 1, 0 ) );
		}
	}, [ cards.length, selectedCardIndex ] );

	useEffect( () => {
		if ( selectedSectionIndex > sections.length - 1 ) {
			setSelectedSectionIndex( Math.max( sections.length - 1, 0 ) );
		}
	}, [ sections.length, selectedSectionIndex ] );

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
					<UnitControl label={ __( 'Header max width', 'zenctuary' ) } value={ attributes.headerMaxWidth } onChange={ ( headerMaxWidth ) => setAttributes( { headerMaxWidth: headerMaxWidth || '820px' } ) } />
					<RangeControl label={ __( 'Header bottom spacing', 'zenctuary' ) } value={ attributes.headerBottomSpacing } onChange={ ( headerBottomSpacing ) => setAttributes( { headerBottomSpacing } ) } min={ 0 } max={ 160 } />
				</PanelBody>
				<TypographyControls title={ __( 'Main title typography', 'zenctuary' ) } prefix="heading" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#d8b354" />
				<PanelBody title={ __( 'Main title layout', 'zenctuary' ) } initialOpen={ false }>
					<ToggleControl label={ __( 'Allow title to wrap', 'zenctuary' ) } checked={ !! attributes.headingWrap } onChange={ ( headingWrap ) => setAttributes( { headingWrap } ) } />
				</PanelBody>
				<TypographyControls title={ __( 'Sub text typography', 'zenctuary' ) } prefix="intro" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#f1eee7" />
				<PanelBody title={ __( 'Cards layout', 'zenctuary' ) } initialOpen>
					<RangeControl label={ __( 'Cards per row - desktop', 'zenctuary' ) } value={ attributes.cardsPerRowDesktop } onChange={ ( cardsPerRowDesktop ) => setAttributes( { cardsPerRowDesktop } ) } min={ 1 } max={ 4 } />
					<RangeControl label={ __( 'Cards per row - tablet', 'zenctuary' ) } value={ attributes.cardsPerRowTablet } onChange={ ( cardsPerRowTablet ) => setAttributes( { cardsPerRowTablet } ) } min={ 1 } max={ 3 } />
					<RangeControl label={ __( 'Cards per row - mobile', 'zenctuary' ) } value={ attributes.cardsPerRowMobile } onChange={ ( cardsPerRowMobile ) => setAttributes( { cardsPerRowMobile } ) } min={ 1 } max={ 2 } />
					<RangeControl label={ __( 'Cards gap', 'zenctuary' ) } value={ attributes.cardsGap } onChange={ ( cardsGap ) => setAttributes( { cardsGap } ) } min={ 8 } max={ 120 } />
				</PanelBody>
				<PanelBody title={ __( 'Cards', 'zenctuary' ) } initialOpen>
					<SelectControl label={ __( 'Selected card', 'zenctuary' ) } value={ selectedCardIndex } options={ cards.map( ( card, index ) => ( { label: `${ index + 1 }. ${ card.adminLabel || 'Credits card' }`, value: index } ) ) } onChange={ ( value ) => { setSelectedCardIndex( Number( value ) ); setSelectedSectionIndex( 0 ); } } />
					{ selectedCard && (
						<>
							<TextControl label={ __( 'Admin label', 'zenctuary' ) } value={ selectedCard.adminLabel || '' } onChange={ ( adminLabel ) => updateCard( selectedCardIndex, { adminLabel } ) } />
							<MediaUploadCheck>
								<MediaUpload allowedTypes={ [ 'image' ] } value={ selectedCard.imageId || 0 } onSelect={ ( media ) => updateCard( selectedCardIndex, { imageId: media?.id || 0, imageUrl: media?.url || '', imageAlt: media?.alt || media?.title || '' } ) } render={ ( { open } ) => <Button variant="secondary" onClick={ open }>{ selectedCard.imageUrl ? __( 'Replace card image', 'zenctuary' ) : __( 'Select card image', 'zenctuary' ) }</Button> } />
							</MediaUploadCheck>
							{ selectedCard.imageUrl && (
								<>
									<TextControl label={ __( 'Image alt text', 'zenctuary' ) } value={ selectedCard.imageAlt || '' } onChange={ ( imageAlt ) => updateCard( selectedCardIndex, { imageAlt } ) } />
									<Button variant="link" isDestructive onClick={ () => updateCard( selectedCardIndex, { imageId: 0, imageUrl: '', imageAlt: '' } ) }>{ __( 'Remove image', 'zenctuary' ) }</Button>
								</>
							) }
						</>
					) }
					<div className="zen-static-member-credits-actions">
						<Button variant="secondary" onClick={ () => moveCard( -1 ) } disabled={ selectedCardIndex <= 0 }>{ __( 'Move up', 'zenctuary' ) }</Button>
						<Button variant="secondary" onClick={ () => moveCard( 1 ) } disabled={ selectedCardIndex >= cards.length - 1 }>{ __( 'Move down', 'zenctuary' ) }</Button>
						<Button variant="tertiary" isDestructive onClick={ () => { if ( cards.length <= 1 ) return; setAttributes( { cards: cards.filter( ( card, index ) => index !== selectedCardIndex ) } ); setSelectedCardIndex( Math.max( selectedCardIndex - 1, 0 ) ); setSelectedSectionIndex( 0 ); } } disabled={ cards.length <= 1 }>{ __( 'Remove', 'zenctuary' ) }</Button>
					</div>
					<Button variant="primary" onClick={ () => { setAttributes( { cards: [ ...cards, createCard() ] } ); setSelectedCardIndex( cards.length ); setSelectedSectionIndex( 0 ); } }>{ __( 'Add card', 'zenctuary' ) }</Button>
				</PanelBody>
				<PanelBody title={ __( 'Selected card sections', 'zenctuary' ) } initialOpen>
					{ selectedCard && <SelectControl label={ __( 'Selected section', 'zenctuary' ) } value={ selectedSectionIndex } options={ sections.map( ( section, index ) => ( { label: `${ index + 1 }. ${ section.leftText || 'Section' }`, value: index } ) ) } onChange={ ( value ) => setSelectedSectionIndex( Number( value ) ) } /> }
					{ selectedCard && selectedSection && (
						<>
							<TextControl label={ __( 'Left text', 'zenctuary' ) } value={ selectedSection.leftText || '' } onChange={ ( leftText ) => updateSection( selectedCardIndex, selectedSectionIndex, { leftText } ) } />
							<TextControl label={ __( 'Right label', 'zenctuary' ) } value={ selectedSection.rightLabel || '' } onChange={ ( rightLabel ) => updateSection( selectedCardIndex, selectedSectionIndex, { rightLabel } ) } />
							<TextControl label={ __( 'Right value', 'zenctuary' ) } value={ selectedSection.rightValue || '' } onChange={ ( rightValue ) => updateSection( selectedCardIndex, selectedSectionIndex, { rightValue } ) } />
						</>
					) }
					<div className="zen-static-member-credits-actions">
						<Button variant="secondary" onClick={ () => moveSection( -1 ) } disabled={ selectedSectionIndex <= 0 }>{ __( 'Move up', 'zenctuary' ) }</Button>
						<Button variant="secondary" onClick={ () => moveSection( 1 ) } disabled={ selectedSectionIndex >= sections.length - 1 }>{ __( 'Move down', 'zenctuary' ) }</Button>
						<Button variant="tertiary" isDestructive onClick={ () => { if ( ! selectedCard || sections.length <= 1 ) return; updateCard( selectedCardIndex, { sections: sections.filter( ( section, index ) => index !== selectedSectionIndex ) } ); setSelectedSectionIndex( Math.max( selectedSectionIndex - 1, 0 ) ); } } disabled={ ! selectedCard || sections.length <= 1 }>{ __( 'Remove', 'zenctuary' ) }</Button>
					</div>
					<Button variant="primary" onClick={ () => { if ( ! selectedCard ) return; updateCard( selectedCardIndex, { sections: [ ...sections, createSection() ] } ); setSelectedSectionIndex( sections.length ); } } disabled={ ! selectedCard }>{ __( 'Add section', 'zenctuary' ) }</Button>
				</PanelBody>
				<PanelBody title={ __( 'Card border and spacing', 'zenctuary' ) } initialOpen={ false }>
					<ColorControl label={ __( 'Card background', 'zenctuary' ) } value={ attributes.cardBackgroundColor } onChange={ ( cardBackgroundColor ) => setAttributes( { cardBackgroundColor: cardBackgroundColor || '#3f3d3d' } ) } />
					<ColorControl label={ __( 'Card border', 'zenctuary' ) } value={ attributes.cardBorderColor } onChange={ ( cardBorderColor ) => setAttributes( { cardBorderColor: cardBorderColor || 'rgba(241, 238, 231, 0.56)' } ) } />
					<RangeControl label={ __( 'Card border width', 'zenctuary' ) } value={ attributes.cardBorderWidth } onChange={ ( cardBorderWidth ) => setAttributes( { cardBorderWidth } ) } min={ 0 } max={ 8 } />
					<RangeControl label={ __( 'Card border radius', 'zenctuary' ) } value={ attributes.cardBorderRadius } onChange={ ( cardBorderRadius ) => setAttributes( { cardBorderRadius } ) } min={ 0 } max={ 80 } />
					<UnitControl label={ __( 'Card padding top', 'zenctuary' ) } value={ attributes.cardPaddingTop } onChange={ ( cardPaddingTop ) => setAttributes( { cardPaddingTop: cardPaddingTop || '0px' } ) } />
					<UnitControl label={ __( 'Card padding right', 'zenctuary' ) } value={ attributes.cardPaddingRight } onChange={ ( cardPaddingRight ) => setAttributes( { cardPaddingRight: cardPaddingRight || '0px' } ) } />
					<UnitControl label={ __( 'Card padding bottom', 'zenctuary' ) } value={ attributes.cardPaddingBottom } onChange={ ( cardPaddingBottom ) => setAttributes( { cardPaddingBottom: cardPaddingBottom || '0px' } ) } />
					<UnitControl label={ __( 'Card padding left', 'zenctuary' ) } value={ attributes.cardPaddingLeft } onChange={ ( cardPaddingLeft ) => setAttributes( { cardPaddingLeft: cardPaddingLeft || '0px' } ) } />
				</PanelBody>
				<PanelBody title={ __( 'Top header image', 'zenctuary' ) } initialOpen={ false }>
					<RangeControl label={ __( 'Image height', 'zenctuary' ) } value={ attributes.imageHeight } onChange={ ( imageHeight ) => setAttributes( { imageHeight } ) } min={ 70 } max={ 360 } />
					<RangeControl label={ __( 'Gap below image', 'zenctuary' ) } value={ attributes.imageBottomGap } onChange={ ( imageBottomGap ) => setAttributes( { imageBottomGap } ) } min={ 0 } max={ 90 } />
					<ColorControl label={ __( 'Image border', 'zenctuary' ) } value={ attributes.imageBorderColor } onChange={ ( imageBorderColor ) => setAttributes( { imageBorderColor: imageBorderColor || 'rgba(241, 238, 231, 0.56)' } ) } />
					<RangeControl label={ __( 'Image border width', 'zenctuary' ) } value={ attributes.imageBorderWidth } onChange={ ( imageBorderWidth ) => setAttributes( { imageBorderWidth } ) } min={ 0 } max={ 8 } />
					<RangeControl label={ __( 'Image border radius', 'zenctuary' ) } value={ attributes.imageBorderRadius } onChange={ ( imageBorderRadius ) => setAttributes( { imageBorderRadius } ) } min={ 0 } max={ 80 } />
					<ColorControl label={ __( 'Image overlay color', 'zenctuary' ) } value={ attributes.imageOverlayColor } onChange={ ( imageOverlayColor ) => setAttributes( { imageOverlayColor: imageOverlayColor || '#000000' } ) } />
					<RangeControl label={ __( 'Image overlay opacity', 'zenctuary' ) } value={ attributes.imageOverlayOpacity } onChange={ ( imageOverlayOpacity ) => setAttributes( { imageOverlayOpacity } ) } min={ 0 } max={ 0.85 } step={ 0.05 } />
				</PanelBody>
				<PanelBody title={ __( 'Section rows and separators', 'zenctuary' ) } initialOpen={ false }>
					<UnitControl label={ __( 'Row padding top', 'zenctuary' ) } value={ attributes.rowPaddingTop } onChange={ ( rowPaddingTop ) => setAttributes( { rowPaddingTop: rowPaddingTop || '0px' } ) } />
					<UnitControl label={ __( 'Row padding right', 'zenctuary' ) } value={ attributes.rowPaddingRight } onChange={ ( rowPaddingRight ) => setAttributes( { rowPaddingRight: rowPaddingRight || '0px' } ) } />
					<UnitControl label={ __( 'Row padding bottom', 'zenctuary' ) } value={ attributes.rowPaddingBottom } onChange={ ( rowPaddingBottom ) => setAttributes( { rowPaddingBottom: rowPaddingBottom || '0px' } ) } />
					<UnitControl label={ __( 'Row padding left', 'zenctuary' ) } value={ attributes.rowPaddingLeft } onChange={ ( rowPaddingLeft ) => setAttributes( { rowPaddingLeft: rowPaddingLeft || '0px' } ) } />
					<RangeControl label={ __( 'Left/right gap', 'zenctuary' ) } value={ attributes.rowGap } onChange={ ( rowGap ) => setAttributes( { rowGap } ) } min={ 0 } max={ 80 } />
					<ColorControl label={ __( 'Separator color', 'zenctuary' ) } value={ attributes.separatorColor } onChange={ ( separatorColor ) => setAttributes( { separatorColor: separatorColor || 'rgba(241, 238, 231, 0.48)' } ) } />
					<RangeControl label={ __( 'Separator width', 'zenctuary' ) } value={ attributes.separatorWidth } onChange={ ( separatorWidth ) => setAttributes( { separatorWidth } ) } min={ 0 } max={ 8 } />
				</PanelBody>
				<TypographyControls title={ __( 'Left section typography', 'zenctuary' ) } prefix="left" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#f1eee7" />
				<PanelBody title={ __( 'Left section layout', 'zenctuary' ) } initialOpen={ false }>
					<ToggleControl label={ __( 'Allow left text to wrap', 'zenctuary' ) } checked={ !! attributes.leftWrap } onChange={ ( leftWrap ) => setAttributes( { leftWrap } ) } />
				</PanelBody>
				<TypographyControls title={ __( 'Right section label typography', 'zenctuary' ) } prefix="rightLabel" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#d8b354" />
				<PanelBody title={ __( 'Right section and coin', 'zenctuary' ) } initialOpen={ false }>
					<TextControl label={ __( 'Default right label', 'zenctuary' ) } value={ attributes.rightLabel } onChange={ ( rightLabel ) => setAttributes( { rightLabel } ) } />
					<RangeControl label={ __( 'Label/coin gap', 'zenctuary' ) } value={ attributes.rightGap } onChange={ ( rightGap ) => setAttributes( { rightGap } ) } min={ 0 } max={ 50 } />
					<RangeControl label={ __( 'Coin size', 'zenctuary' ) } value={ attributes.coinSize } onChange={ ( coinSize ) => setAttributes( { coinSize } ) } min={ 24 } max={ 90 } />
					<ColorControl label={ __( 'Coin background', 'zenctuary' ) } value={ attributes.coinBackgroundColor } onChange={ ( coinBackgroundColor ) => setAttributes( { coinBackgroundColor: coinBackgroundColor || '#d8b354' } ) } />
					<ColorControl label={ __( 'Coin ring/border', 'zenctuary' ) } value={ attributes.coinBorderColor } onChange={ ( coinBorderColor ) => setAttributes( { coinBorderColor: coinBorderColor || '#3f3d3d' } ) } />
					<ColorControl label={ __( 'Coin text', 'zenctuary' ) } value={ attributes.coinTextColor } onChange={ ( coinTextColor ) => setAttributes( { coinTextColor: coinTextColor || '#3f3d3d' } ) } />
					<RangeControl label={ __( 'Coin border width', 'zenctuary' ) } value={ attributes.coinBorderWidth } onChange={ ( coinBorderWidth ) => setAttributes( { coinBorderWidth } ) } min={ 1 } max={ 8 } />
					<RangeControl label={ __( 'Inner ring inset', 'zenctuary' ) } value={ attributes.coinRingInset } onChange={ ( coinRingInset ) => setAttributes( { coinRingInset } ) } min={ 2 } max={ 14 } />
					<UnitControl label={ __( 'Coin value font size', 'zenctuary' ) } value={ attributes.coinValueFontSize } onChange={ ( coinValueFontSize ) => setAttributes( { coinValueFontSize: coinValueFontSize || '' } ) } />
					<SelectControl label={ __( 'Coin value font weight', 'zenctuary' ) } value={ attributes.coinValueFontWeight } options={ WEIGHTS } onChange={ ( coinValueFontWeight ) => setAttributes( { coinValueFontWeight } ) } />
				</PanelBody>
			</InspectorControls>
			<BlockView attributes={ attributes } setAttributes={ setAttributes } selectCard={ setSelectedCardIndex } selectSection={ setSelectedSectionIndex } />
		</>
	);
}