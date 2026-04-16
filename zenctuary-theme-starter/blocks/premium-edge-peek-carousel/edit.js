import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';
import {
	BaseControl,
	Button,
	ColorPalette,
	PanelBody,
	RangeControl,
	TextControl,
	ToggleControl,
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';
import { useMemo, useState } from '@wordpress/element';

const PRESET_COLORS = [
	{ name: 'Sand', color: '#f4efe7' },
	{ name: 'Ink', color: '#1b1b1b' },
	{ name: 'White', color: '#ffffff' },
	{ name: 'Clay', color: '#7a5d4b' },
	{ name: 'Olive', color: '#4d5a47' },
];

function createDefaultCard() {
	return {
		imageId: 0,
		imageUrl: '',
		overlayColor: '#1f1d1a',
		overlayOpacity: 0.48,
		title: __( 'New Card', 'zenctuary' ),
		items: [ __( 'List item', 'zenctuary' ) ],
		showDots: true,
		dotsText: '...',
		buttonText: __( 'Learn More', 'zenctuary' ),
		buttonUrl: '#',
		openInNewTab: false,
	};
}

function getSpacingStyle( value = {}, property ) {
	return {
		[ `${ property }Top` ]: value.top || '0px',
		[ `${ property }Right` ]: value.right || '0px',
		[ `${ property }Bottom` ]: value.bottom || '0px',
		[ `${ property }Left` ]: value.left || '0px',
	};
}

function SpacingControls( { label, value = {}, onChange } ) {
	const nextValue = {
		top: value.top || '0px',
		right: value.right || '0px',
		bottom: value.bottom || '0px',
		left: value.left || '0px',
	};

	function updateSide( side, sideValue ) {
		onChange( {
			...nextValue,
			[ side ]: sideValue || '0px',
		} );
	}

	return (
		<div className="premium-edge-peek-carousel__spacing-control">
			<p className="components-base-control__label">{ label }</p>
			<UnitControl label={ __( 'Top', 'zenctuary' ) } value={ nextValue.top } onChange={ ( newValue ) => updateSide( 'top', newValue ) } />
			<UnitControl label={ __( 'Right', 'zenctuary' ) } value={ nextValue.right } onChange={ ( newValue ) => updateSide( 'right', newValue ) } />
			<UnitControl label={ __( 'Bottom', 'zenctuary' ) } value={ nextValue.bottom } onChange={ ( newValue ) => updateSide( 'bottom', newValue ) } />
			<UnitControl label={ __( 'Left', 'zenctuary' ) } value={ nextValue.left } onChange={ ( newValue ) => updateSide( 'left', newValue ) } />
		</div>
	);
}

function normalizeCards( cards ) {
	const nextCards = Array.isArray( cards ) ? cards.slice() : [];
	if ( ! nextCards.length ) {
		nextCards.push( createDefaultCard() );
	}
	return nextCards.map( ( card ) => ( {
		...createDefaultCard(),
		...card,
		items: Array.isArray( card?.items ) && card.items.length ? card.items : [ __( 'List item', 'zenctuary' ) ],
	} ) );
}

function getSlidesPerView( cardsPerView, edgePeekPercent ) {
	return Math.max( 1, Number( cardsPerView ) || 1 ) + ( Math.max( 0, Number( edgePeekPercent ) || 0 ) / 100 );
}

export default function Edit( { attributes, setAttributes } ) {
	const [ selectedCardIndex, setSelectedCardIndex ] = useState( 0 );
	const cards = useMemo( () => normalizeCards( attributes.cards ), [ attributes.cards ] );
	const selectedCard = cards[ selectedCardIndex ] || cards[ 0 ];
	const desktopSlides = getSlidesPerView( attributes.desktopCards, attributes.edgePeekDesktop );

	function updateCards( nextCards ) {
		setAttributes( { cards: nextCards } );
	}

	function updateCard( index, patch ) {
		const nextCards = cards.map( ( card, currentIndex ) => currentIndex === index ? { ...card, ...patch } : card );
		updateCards( nextCards );
	}

	function addCard() {
		const nextCards = [ ...cards, createDefaultCard() ];
		updateCards( nextCards );
		setSelectedCardIndex( nextCards.length - 1 );
	}

	function removeCard( index ) {
		if ( cards.length === 1 ) {
			return;
		}
		const nextCards = cards.filter( ( card, currentIndex ) => currentIndex !== index );
		updateCards( nextCards );
		setSelectedCardIndex( Math.max( 0, Math.min( selectedCardIndex, nextCards.length - 1 ) ) );
	}

	function updateListItem( itemIndex, value ) {
		updateCard( selectedCardIndex, {
			items: selectedCard.items.map( ( item, currentIndex ) => currentIndex === itemIndex ? value : item ),
		} );
	}

	function addListItem() {
		updateCard( selectedCardIndex, {
			items: [ ...selectedCard.items, __( 'New item', 'zenctuary' ) ],
		} );
	}

	function removeListItem( itemIndex ) {
		const nextItems = selectedCard.items.filter( ( item, currentIndex ) => currentIndex !== itemIndex );
		updateCard( selectedCardIndex, {
			items: nextItems.length ? nextItems : [ __( 'List item', 'zenctuary' ) ],
		} );
	}

	const blockProps = useBlockProps( {
		className: 'premium-edge-peek-carousel is-editor-preview',
		style: {
			backgroundColor: attributes.backgroundColor,
			...getSpacingStyle( attributes.sectionPadding, 'padding' ),
			'--premium-edge-peek-content-max-width': `${ attributes.contentMaxWidth || 1320 }px`,
			'--premium-edge-peek-gap': `${ attributes.gap || 24 }px`,
			'--premium-edge-peek-card-radius': `${ attributes.cardBorderRadius || 20 }px`,
			'--premium-edge-peek-card-padding': `${ attributes.cardContentPadding || 24 }px`,
			'--premium-edge-peek-preview-slides': String( desktopSlides ),
			'--premium-edge-peek-pad-left': attributes.sectionPadding?.left || '24px',
			'--premium-edge-peek-pad-right': attributes.sectionPadding?.right || '24px',
		},
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Section Settings', 'zenctuary' ) } initialOpen>
					<RangeControl label={ __( 'Content Max Width', 'zenctuary' ) } value={ attributes.contentMaxWidth } onChange={ ( value ) => setAttributes( { contentMaxWidth: value } ) } min={ 960 } max={ 1600 } step={ 20 } />
					<SpacingControls label={ __( 'Section Padding', 'zenctuary' ) } value={ attributes.sectionPadding } onChange={ ( value ) => setAttributes( { sectionPadding: value } ) } />
					<p className="components-base-control__label">{ __( 'Background Color', 'zenctuary' ) }</p>
					<ColorPalette colors={ PRESET_COLORS } value={ attributes.backgroundColor } onChange={ ( value ) => setAttributes( { backgroundColor: value || '#f4efe7' } ) } />
					<TextControl label={ __( 'Custom Background Color', 'zenctuary' ) } value={ attributes.backgroundColor } onChange={ ( value ) => setAttributes( { backgroundColor: value || '#f4efe7' } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Carousel Settings', 'zenctuary' ) } initialOpen={ false }>
					<RangeControl label={ __( 'Gap Between Cards', 'zenctuary' ) } value={ attributes.gap } onChange={ ( value ) => setAttributes( { gap: value } ) } min={ 0 } max={ 60 } />
					<RangeControl label={ __( 'Desktop Full Cards', 'zenctuary' ) } value={ attributes.desktopCards } onChange={ ( value ) => setAttributes( { desktopCards: value } ) } min={ 1 } max={ 4 } />
					<RangeControl label={ __( 'Desktop Edge Peek (%)', 'zenctuary' ) } value={ attributes.edgePeekDesktop } onChange={ ( value ) => setAttributes( { edgePeekDesktop: value } ) } min={ 0 } max={ 45 } />
					<RangeControl label={ __( 'Tablet Full Cards', 'zenctuary' ) } value={ attributes.tabletCards } onChange={ ( value ) => setAttributes( { tabletCards: value } ) } min={ 1 } max={ 3 } />
					<RangeControl label={ __( 'Tablet Edge Peek (%)', 'zenctuary' ) } value={ attributes.edgePeekTablet } onChange={ ( value ) => setAttributes( { edgePeekTablet: value } ) } min={ 0 } max={ 45 } />
					<RangeControl label={ __( 'Mobile Full Cards', 'zenctuary' ) } value={ attributes.mobileCards } onChange={ ( value ) => setAttributes( { mobileCards: value } ) } min={ 1 } max={ 2 } />
					<RangeControl label={ __( 'Mobile Edge Peek (%)', 'zenctuary' ) } value={ attributes.edgePeekMobile } onChange={ ( value ) => setAttributes( { edgePeekMobile: value } ) } min={ 0 } max={ 45 } />
					<RangeControl label={ __( 'Transition Speed (ms)', 'zenctuary' ) } value={ attributes.transitionSpeed } onChange={ ( value ) => setAttributes( { transitionSpeed: value } ) } min={ 300 } max={ 600 } />
					<ToggleControl label={ __( 'Loop Slides', 'zenctuary' ) } checked={ attributes.loop } onChange={ ( value ) => setAttributes( { loop: value } ) } />
					<ToggleControl label={ __( 'Autoplay', 'zenctuary' ) } checked={ attributes.autoplay } onChange={ ( value ) => setAttributes( { autoplay: value } ) } />
					{ attributes.autoplay && <RangeControl label={ __( 'Autoplay Delay (ms)', 'zenctuary' ) } value={ attributes.autoplayDelay } onChange={ ( value ) => setAttributes( { autoplayDelay: value } ) } min={ 1500 } max={ 10000 } step={ 100 } /> }
					<ToggleControl label={ __( 'Show Pagination Dots', 'zenctuary' ) } checked={ attributes.showPagination } onChange={ ( value ) => setAttributes( { showPagination: value } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Card Style', 'zenctuary' ) } initialOpen={ false }>
					<RangeControl label={ __( 'Card Border Radius', 'zenctuary' ) } value={ attributes.cardBorderRadius } onChange={ ( value ) => setAttributes( { cardBorderRadius: value } ) } min={ 0 } max={ 40 } />
					<RangeControl label={ __( 'Card Content Padding', 'zenctuary' ) } value={ attributes.cardContentPadding } onChange={ ( value ) => setAttributes( { cardContentPadding: value } ) } min={ 12 } max={ 40 } />
				</PanelBody>

				<PanelBody title={ __( 'Cards', 'zenctuary' ) } initialOpen={ false }>
					<RangeControl label={ __( 'Selected Card', 'zenctuary' ) } value={ selectedCardIndex + 1 } onChange={ ( value ) => setSelectedCardIndex( Math.max( 0, value - 1 ) ) } min={ 1 } max={ cards.length } />
					<Button variant="primary" onClick={ addCard }>{ __( 'Add Card', 'zenctuary' ) }</Button>
					{ cards.length > 1 && <Button variant="tertiary" isDestructive onClick={ () => removeCard( selectedCardIndex ) } style={ { marginLeft: '8px' } }>{ __( 'Remove Selected Card', 'zenctuary' ) }</Button> }
				</PanelBody>

				{ selectedCard && (
					<PanelBody title={ __( 'Selected Card Content', 'zenctuary' ) } initialOpen={ false }>
						<MediaUploadCheck>
							<MediaUpload
								onSelect={ ( media ) => updateCard( selectedCardIndex, { imageId: media?.id || 0, imageUrl: media?.url || '' } ) }
								allowedTypes={ [ 'image' ] }
								value={ selectedCard.imageId }
								render={ ( { open } ) => <Button variant="secondary" onClick={ open }>{ selectedCard.imageUrl ? __( 'Replace Card Image', 'zenctuary' ) : __( 'Choose Card Image', 'zenctuary' ) }</Button> }
							/>
						</MediaUploadCheck>
						{ selectedCard.imageUrl && (
							<div style={ { marginTop: '12px', marginBottom: '12px' } }>
								<img src={ selectedCard.imageUrl } alt="" style={ { display: 'block', width: '100%', borderRadius: '12px' } } />
								<Button variant="link" isDestructive onClick={ () => updateCard( selectedCardIndex, { imageId: 0, imageUrl: '' } ) }>{ __( 'Remove Image', 'zenctuary' ) }</Button>
							</div>
						) }
						<TextControl label={ __( 'Title', 'zenctuary' ) } value={ selectedCard.title } onChange={ ( value ) => updateCard( selectedCardIndex, { title: value } ) } />
						<p className="components-base-control__label">{ __( 'Overlay Color', 'zenctuary' ) }</p>
						<ColorPalette colors={ PRESET_COLORS } value={ selectedCard.overlayColor } onChange={ ( value ) => updateCard( selectedCardIndex, { overlayColor: value || '#1f1d1a' } ) } />
						<TextControl label={ __( 'Custom Overlay Color', 'zenctuary' ) } value={ selectedCard.overlayColor } onChange={ ( value ) => updateCard( selectedCardIndex, { overlayColor: value || '#1f1d1a' } ) } />
						<RangeControl label={ __( 'Overlay Opacity', 'zenctuary' ) } value={ selectedCard.overlayOpacity } onChange={ ( value ) => updateCard( selectedCardIndex, { overlayOpacity: value } ) } min={ 0 } max={ 1 } step={ 0.05 } />
						<BaseControl label={ __( 'List Items', 'zenctuary' ) }>
							{ selectedCard.items.map( ( item, itemIndex ) => (
								<div key={ itemIndex } style={ { marginBottom: '12px' } }>
									<TextControl label={ `${ __( 'Item', 'zenctuary' ) } ${ itemIndex + 1 }` } value={ item } onChange={ ( value ) => updateListItem( itemIndex, value ) } />
									<Button variant="tertiary" isDestructive onClick={ () => removeListItem( itemIndex ) } disabled={ selectedCard.items.length === 1 }>{ __( 'Remove Item', 'zenctuary' ) }</Button>
								</div>
							) ) }
							<Button variant="secondary" onClick={ addListItem }>{ __( 'Add List Item', 'zenctuary' ) }</Button>
						</BaseControl>
						<ToggleControl label={ __( 'Show Dots Separator', 'zenctuary' ) } checked={ selectedCard.showDots } onChange={ ( value ) => updateCard( selectedCardIndex, { showDots: value } ) } />
						{ selectedCard.showDots && <TextControl label={ __( 'Dots Text', 'zenctuary' ) } value={ selectedCard.dotsText } onChange={ ( value ) => updateCard( selectedCardIndex, { dotsText: value } ) } /> }
						<TextControl label={ __( 'Button Text', 'zenctuary' ) } value={ selectedCard.buttonText } onChange={ ( value ) => updateCard( selectedCardIndex, { buttonText: value } ) } />
						<TextControl label={ __( 'Button URL', 'zenctuary' ) } value={ selectedCard.buttonUrl } onChange={ ( value ) => updateCard( selectedCardIndex, { buttonUrl: value } ) } />
						<ToggleControl label={ __( 'Open In New Tab', 'zenctuary' ) } checked={ selectedCard.openInNewTab } onChange={ ( value ) => updateCard( selectedCardIndex, { openInNewTab: value } ) } />
					</PanelBody>
				) }
			</InspectorControls>

			<section { ...blockProps }>
				<div className="premium-edge-peek-carousel__inner">
					<div className="premium-edge-peek-carousel__header">
						<div className="premium-edge-peek-carousel__copy">
							<RichText tagName="h2" className="premium-edge-peek-carousel__heading" value={ attributes.heading } onChange={ ( value ) => setAttributes( { heading: value } ) } placeholder={ __( 'Add heading', 'zenctuary' ) } />
							<RichText tagName="p" className="premium-edge-peek-carousel__subheading" value={ attributes.subheading } onChange={ ( value ) => setAttributes( { subheading: value } ) } placeholder={ __( 'Add subheading', 'zenctuary' ) } />
						</div>
						<div className="premium-edge-peek-carousel__nav premium-edge-peek-carousel__nav--preview">
							<button type="button" className="premium-edge-peek-carousel__arrow" aria-label={ __( 'Previous', 'zenctuary' ) }><span aria-hidden="true">&#8592;</span></button>
							<button type="button" className="premium-edge-peek-carousel__arrow" aria-label={ __( 'Next', 'zenctuary' ) }><span aria-hidden="true">&#8594;</span></button>
						</div>
					</div>
					<div className="premium-edge-peek-carousel__stage premium-edge-peek-carousel__stage--preview">
						<div className="premium-edge-peek-carousel__preview-track">
							{ cards.map( ( card, index ) => (
								<div key={ index } className={ `premium-edge-peek-carousel__preview-slide${ index === selectedCardIndex ? ' is-selected' : '' }` } onClick={ () => setSelectedCardIndex( index ) } onKeyDown={ () => {} } role="button" tabIndex={ 0 }>
									<article className="premium-edge-peek-carousel__card" style={ {
										backgroundImage: card.imageUrl ? `linear-gradient(180deg, rgba(0, 0, 0, 0.08) 0%, rgba(0, 0, 0, 0.68) 100%), url("${ card.imageUrl }")` : undefined,
										backgroundColor: ! card.imageUrl ? '#c8bfb2' : undefined,
									} }>
										<div className="premium-edge-peek-carousel__overlay" style={ { backgroundColor: card.overlayColor, opacity: card.overlayOpacity } } />
										<div className="premium-edge-peek-carousel__card-content">
											<RichText tagName="h3" className="premium-edge-peek-carousel__card-title" value={ card.title } onChange={ ( value ) => updateCard( index, { title: value } ) } placeholder={ __( 'Card title', 'zenctuary' ) } />
											<ul className="premium-edge-peek-carousel__card-items">
												{ card.items.filter( Boolean ).map( ( item, itemIndex ) => <li key={ itemIndex }>{ item }</li> ) }
											</ul>
											{ card.showDots && <div className="premium-edge-peek-carousel__dots" aria-hidden="true">{ card.dotsText || '...' }</div> }
											<div className="premium-edge-peek-carousel__button">{ card.buttonText || __( 'Learn More', 'zenctuary' ) }</div>
										</div>
									</article>
								</div>
							) ) }
						</div>
						{ attributes.showPagination && (
							<div className="premium-edge-peek-carousel__pagination premium-edge-peek-carousel__pagination--preview">
								{ cards.map( ( card, index ) => <span key={ index } className={ `premium-edge-peek-carousel__pagination-dot${ index === selectedCardIndex ? ' is-active' : '' }` } /> ) }
							</div>
						) }
					</div>
				</div>
			</section>
		</>
	);
}
