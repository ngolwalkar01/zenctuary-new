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
	SelectControl,
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
		showOverlay: true,
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
		showOverlay: card?.showOverlay !== false,
		items: Array.isArray( card?.items ) && card.items.length ? card.items : [ __( 'List item', 'zenctuary' ) ],
	} ) );
}

function getSlidesPerView( cardsPerView, edgePeekPercent ) {
	return Math.max( 1, Number( cardsPerView ) || 1 ) + ( Math.max( 0, Number( edgePeekPercent ) || 0 ) / 100 );
}

function arrowIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M3.5 12H18.5M18.5 12L13.5 7M18.5 12L13.5 17" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

function navigationIcon( iconSet = 'line-arrow', direction = 'next' ) {
	const isNext = direction === 'next';

	if ( iconSet === 'dashicons-arrow-alt2' ) {
		return <span className={ `premium-edge-peek-carousel__arrow-icon dashicons ${ isNext ? 'dashicons-arrow-right-alt2' : 'dashicons-arrow-left-alt2' }` } aria-hidden="true" />;
	}

	if ( iconSet === 'dashicons-controls' ) {
		return <span className={ `premium-edge-peek-carousel__arrow-icon dashicons ${ isNext ? 'dashicons-controls-forward' : 'dashicons-controls-back' }` } aria-hidden="true" />;
	}

	if ( iconSet === 'chevron' ) {
		return (
			<svg className="premium-edge-peek-carousel__arrow-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
				<path d={ isNext ? 'M9 5L16 12L9 19' : 'M15 5L8 12L15 19' } stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		);
	}

	if ( iconSet === 'caret' ) {
		return (
			<svg className="premium-edge-peek-carousel__arrow-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
				<path d={ isNext ? 'M10 7L15 12L10 17' : 'M14 7L9 12L14 17' } stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		);
	}

	return <span className="premium-edge-peek-carousel__arrow-icon" aria-hidden="true">{ isNext ? '\u2192' : '\u2190' }</span>;
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
			'--premium-edge-peek-heading-max-width': `${ attributes.headingMaxWidth || 760 }px`,
			'--premium-edge-peek-heading-size': attributes.headingFontSize || 'clamp(2rem, 4vw, 3.75rem)',
			'--premium-edge-peek-heading-weight': attributes.headingFontWeight || '700',
			'--premium-edge-peek-heading-line-height': attributes.headingLineHeight || '0.98',
			'--premium-edge-peek-heading-color': attributes.headingColor || '#171717',
			'--premium-edge-peek-card-title-size': attributes.cardTitleFontSize || 'clamp(1.5rem, 2.4vw, 2rem)',
			'--premium-edge-peek-card-title-weight': attributes.cardTitleFontWeight || '700',
			'--premium-edge-peek-card-title-line-height': attributes.cardTitleLineHeight || '1.04',
			'--premium-edge-peek-card-title-color': attributes.cardTitleColor || '#ffffff',
			'--premium-edge-peek-card-body-size': attributes.cardBodyFontSize || '1rem',
			'--premium-edge-peek-card-body-weight': attributes.cardBodyFontWeight || '400',
			'--premium-edge-peek-card-body-line-height': attributes.cardBodyLineHeight || '1.5',
			'--premium-edge-peek-card-body-color': attributes.cardBodyColor || '#ffffff',
			'--premium-edge-peek-card-text-transform': attributes.cardTextUppercase ? 'uppercase' : 'none',
			'--premium-edge-peek-dots-size': attributes.dotsFontSize || '1.35rem',
			'--premium-edge-peek-dots-spacing': attributes.dotsLetterSpacing || '0.22em',
			'--premium-edge-peek-dots-color': attributes.dotsColor || 'rgba(255, 255, 255, 0.86)',
			'--premium-edge-peek-button-size': attributes.buttonFontSize || '0.95rem',
			'--premium-edge-peek-button-weight': attributes.buttonFontWeight || '600',
			'--premium-edge-peek-button-line-height': attributes.buttonLineHeight || '1.2',
			'--premium-edge-peek-button-color': attributes.buttonTextColor || '#ffffff',
			'--premium-edge-peek-button-bg': attributes.buttonBackgroundColor || 'rgba(255, 255, 255, 0.16)',
			'--premium-edge-peek-button-border-color': attributes.buttonBorderColor || 'rgba(255, 255, 255, 0.38)',
			'--premium-edge-peek-button-border-width': `${ attributes.buttonBorderWidth || 1 }px`,
			'--premium-edge-peek-button-radius': attributes.buttonBorderRadius || '999px',
			'--premium-edge-peek-button-width': attributes.buttonWidth || 'fit-content',
			'--premium-edge-peek-button-pad-top': attributes.buttonPadding?.top || '13px',
			'--premium-edge-peek-button-pad-right': attributes.buttonPadding?.right || '20px',
			'--premium-edge-peek-button-pad-bottom': attributes.buttonPadding?.bottom || '13px',
			'--premium-edge-peek-button-pad-left': attributes.buttonPadding?.left || '20px',
			'--premium-edge-peek-nav-size': `${ attributes.navButtonSize || 54 }px`,
			'--premium-edge-peek-nav-icon-size': `${ attributes.navIconSize || 20 }px`,
			'--premium-edge-peek-nav-border-width': `${ attributes.navBorderWidth || 1 }px`,
			'--premium-edge-peek-nav-radius': attributes.navBorderRadius || '999px',
			'--premium-edge-peek-nav-border-color': attributes.navBorderColor || 'rgba(23, 23, 23, 0.16)',
			'--premium-edge-peek-nav-bg': attributes.navBackgroundColor || 'rgba(255, 255, 255, 0.78)',
			'--premium-edge-peek-nav-icon-color': attributes.navIconColor || '#171717',
			'--premium-edge-peek-nav-hover-bg': attributes.navHoverBackgroundColor || '#171717',
			'--premium-edge-peek-nav-hover-icon-color': attributes.navHoverIconColor || '#f4efe7',
			'--premium-edge-peek-preview-slides': String( desktopSlides ),
			'--premium-edge-peek-desktop-cards': String( attributes.desktopCards || 3 ),
			'--premium-edge-peek-tablet-cards': String( attributes.tabletCards || 2 ),
			'--premium-edge-peek-mobile-cards': String( attributes.mobileCards || 1 ),
			'--premium-edge-peek-desktop-peek': String( attributes.edgePeekDesktop || 20 ),
			'--premium-edge-peek-tablet-peek': String( attributes.edgePeekTablet || 20 ),
			'--premium-edge-peek-mobile-peek': String( attributes.edgePeekMobile || 20 ),
			'--premium-edge-peek-left-start-desktop': `${ attributes.leftStartOffsetDesktop || 80 }px`,
			'--premium-edge-peek-left-start-tablet': `${ attributes.leftStartOffsetTablet || 48 }px`,
			'--premium-edge-peek-left-start-mobile': `${ attributes.leftStartOffsetMobile || 20 }px`,
			'--premium-edge-peek-card-scale-desktop': String( attributes.cardWidthScaleDesktop || 100 ),
			'--premium-edge-peek-card-scale-tablet': String( attributes.cardWidthScaleTablet || 100 ),
			'--premium-edge-peek-card-scale-mobile': String( attributes.cardWidthScaleMobile || 100 ),
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

				<PanelBody title={ __( 'Main Title', 'zenctuary' ) } initialOpen={ false }>
					<RangeControl label={ __( 'Title Width', 'zenctuary' ) } value={ attributes.headingMaxWidth } onChange={ ( value ) => setAttributes( { headingMaxWidth: value } ) } min={ 240 } max={ 1200 } step={ 10 } />
					<TextControl label={ __( 'Title Font Size', 'zenctuary' ) } value={ attributes.headingFontSize } onChange={ ( value ) => setAttributes( { headingFontSize: value || 'clamp(2rem, 4vw, 3.75rem)' } ) } />
					<TextControl label={ __( 'Title Weight', 'zenctuary' ) } value={ attributes.headingFontWeight } onChange={ ( value ) => setAttributes( { headingFontWeight: value || '700' } ) } />
					<TextControl label={ __( 'Title Line Height', 'zenctuary' ) } value={ attributes.headingLineHeight } onChange={ ( value ) => setAttributes( { headingLineHeight: value || '0.98' } ) } />
					<p className="components-base-control__label">{ __( 'Title Color', 'zenctuary' ) }</p>
					<ColorPalette colors={ PRESET_COLORS } value={ attributes.headingColor } onChange={ ( value ) => setAttributes( { headingColor: value || '#171717' } ) } />
					<TextControl label={ __( 'Custom Title Color', 'zenctuary' ) } value={ attributes.headingColor } onChange={ ( value ) => setAttributes( { headingColor: value || '#171717' } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Carousel Settings', 'zenctuary' ) } initialOpen={ false }>
					<RangeControl label={ __( 'Gap Between Cards', 'zenctuary' ) } value={ attributes.gap } onChange={ ( value ) => setAttributes( { gap: value } ) } min={ 0 } max={ 60 } />
					<RangeControl label={ __( 'Desktop Full Cards', 'zenctuary' ) } value={ attributes.desktopCards } onChange={ ( value ) => setAttributes( { desktopCards: value } ) } min={ 1 } max={ 4 } />
					<RangeControl label={ __( 'Desktop Edge Peek (%)', 'zenctuary' ) } value={ attributes.edgePeekDesktop } onChange={ ( value ) => setAttributes( { edgePeekDesktop: value } ) } min={ 0 } max={ 45 } />
					<RangeControl label={ __( 'Desktop Left Start Offset', 'zenctuary' ) } value={ attributes.leftStartOffsetDesktop } onChange={ ( value ) => setAttributes( { leftStartOffsetDesktop: value } ) } min={ 0 } max={ 240 } />
					<RangeControl label={ __( 'Desktop Card Width (%)', 'zenctuary' ) } value={ attributes.cardWidthScaleDesktop } onChange={ ( value ) => setAttributes( { cardWidthScaleDesktop: value } ) } min={ 60 } max={ 100 } />
					<RangeControl label={ __( 'Tablet Full Cards', 'zenctuary' ) } value={ attributes.tabletCards } onChange={ ( value ) => setAttributes( { tabletCards: value } ) } min={ 1 } max={ 3 } />
					<RangeControl label={ __( 'Tablet Edge Peek (%)', 'zenctuary' ) } value={ attributes.edgePeekTablet } onChange={ ( value ) => setAttributes( { edgePeekTablet: value } ) } min={ 0 } max={ 45 } />
					<RangeControl label={ __( 'Tablet Left Start Offset', 'zenctuary' ) } value={ attributes.leftStartOffsetTablet } onChange={ ( value ) => setAttributes( { leftStartOffsetTablet: value } ) } min={ 0 } max={ 180 } />
					<RangeControl label={ __( 'Tablet Card Width (%)', 'zenctuary' ) } value={ attributes.cardWidthScaleTablet } onChange={ ( value ) => setAttributes( { cardWidthScaleTablet: value } ) } min={ 60 } max={ 100 } />
					<RangeControl label={ __( 'Mobile Full Cards', 'zenctuary' ) } value={ attributes.mobileCards } onChange={ ( value ) => setAttributes( { mobileCards: value } ) } min={ 1 } max={ 2 } />
					<RangeControl label={ __( 'Mobile Edge Peek (%)', 'zenctuary' ) } value={ attributes.edgePeekMobile } onChange={ ( value ) => setAttributes( { edgePeekMobile: value } ) } min={ 0 } max={ 45 } />
					<RangeControl label={ __( 'Mobile Left Start Offset', 'zenctuary' ) } value={ attributes.leftStartOffsetMobile } onChange={ ( value ) => setAttributes( { leftStartOffsetMobile: value } ) } min={ 0 } max={ 120 } />
					<RangeControl label={ __( 'Mobile Card Width (%)', 'zenctuary' ) } value={ attributes.cardWidthScaleMobile } onChange={ ( value ) => setAttributes( { cardWidthScaleMobile: value } ) } min={ 60 } max={ 100 } />
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

				<PanelBody title={ __( 'Card Typography', 'zenctuary' ) } initialOpen={ false }>
					<TextControl label={ __( 'Card Title Size', 'zenctuary' ) } value={ attributes.cardTitleFontSize } onChange={ ( value ) => setAttributes( { cardTitleFontSize: value || 'clamp(1.5rem, 2.4vw, 2rem)' } ) } />
					<TextControl label={ __( 'Card Title Weight', 'zenctuary' ) } value={ attributes.cardTitleFontWeight } onChange={ ( value ) => setAttributes( { cardTitleFontWeight: value || '700' } ) } />
					<TextControl label={ __( 'Card Title Line Height', 'zenctuary' ) } value={ attributes.cardTitleLineHeight } onChange={ ( value ) => setAttributes( { cardTitleLineHeight: value || '1.04' } ) } />
					<TextControl label={ __( 'Card Title Color', 'zenctuary' ) } value={ attributes.cardTitleColor } onChange={ ( value ) => setAttributes( { cardTitleColor: value || '#ffffff' } ) } />
					<TextControl label={ __( 'Body Text Size', 'zenctuary' ) } value={ attributes.cardBodyFontSize } onChange={ ( value ) => setAttributes( { cardBodyFontSize: value || '1rem' } ) } />
					<TextControl label={ __( 'Body Text Weight', 'zenctuary' ) } value={ attributes.cardBodyFontWeight } onChange={ ( value ) => setAttributes( { cardBodyFontWeight: value || '400' } ) } />
					<TextControl label={ __( 'Body Text Line Height', 'zenctuary' ) } value={ attributes.cardBodyLineHeight } onChange={ ( value ) => setAttributes( { cardBodyLineHeight: value || '1.5' } ) } />
					<TextControl label={ __( 'Body Text Color', 'zenctuary' ) } value={ attributes.cardBodyColor } onChange={ ( value ) => setAttributes( { cardBodyColor: value || '#ffffff' } ) } />
					<ToggleControl label={ __( 'Uppercase Card Text', 'zenctuary' ) } checked={ attributes.cardTextUppercase } onChange={ ( value ) => setAttributes( { cardTextUppercase: value } ) } help={ __( 'Applies to the card title, list text, and dots. Button text is unaffected.', 'zenctuary' ) } />
					<TextControl label={ __( 'Dots Size', 'zenctuary' ) } value={ attributes.dotsFontSize } onChange={ ( value ) => setAttributes( { dotsFontSize: value || '1.35rem' } ) } />
					<TextControl label={ __( 'Dots Letter Spacing', 'zenctuary' ) } value={ attributes.dotsLetterSpacing } onChange={ ( value ) => setAttributes( { dotsLetterSpacing: value || '0.22em' } ) } />
					<TextControl label={ __( 'Dots Color', 'zenctuary' ) } value={ attributes.dotsColor } onChange={ ( value ) => setAttributes( { dotsColor: value || 'rgba(255, 255, 255, 0.86)' } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Button Style', 'zenctuary' ) } initialOpen={ false }>
					<TextControl label={ __( 'Button Font Size', 'zenctuary' ) } value={ attributes.buttonFontSize } onChange={ ( value ) => setAttributes( { buttonFontSize: value || '0.95rem' } ) } />
					<TextControl label={ __( 'Button Font Weight', 'zenctuary' ) } value={ attributes.buttonFontWeight } onChange={ ( value ) => setAttributes( { buttonFontWeight: value || '600' } ) } />
					<TextControl label={ __( 'Button Line Height', 'zenctuary' ) } value={ attributes.buttonLineHeight } onChange={ ( value ) => setAttributes( { buttonLineHeight: value || '1.2' } ) } />
					<TextControl label={ __( 'Button Width', 'zenctuary' ) } value={ attributes.buttonWidth } onChange={ ( value ) => setAttributes( { buttonWidth: value || 'fit-content' } ) } help={ __( 'Examples: fit-content, 100%, 280px', 'zenctuary' ) } />
					<p className="components-base-control__label">{ __( 'Button Text Color', 'zenctuary' ) }</p>
					<ColorPalette colors={ PRESET_COLORS } value={ attributes.buttonTextColor } onChange={ ( value ) => setAttributes( { buttonTextColor: value || '#ffffff' } ) } />
					<TextControl label={ __( 'Custom Button Text Color', 'zenctuary' ) } value={ attributes.buttonTextColor } onChange={ ( value ) => setAttributes( { buttonTextColor: value || '#ffffff' } ) } />
					<p className="components-base-control__label">{ __( 'Button Background', 'zenctuary' ) }</p>
					<ColorPalette colors={ PRESET_COLORS } value={ attributes.buttonBackgroundColor } onChange={ ( value ) => setAttributes( { buttonBackgroundColor: value || 'rgba(255, 255, 255, 0.16)' } ) } />
					<TextControl label={ __( 'Custom Button Background', 'zenctuary' ) } value={ attributes.buttonBackgroundColor } onChange={ ( value ) => setAttributes( { buttonBackgroundColor: value || 'rgba(255, 255, 255, 0.16)' } ) } />
					<p className="components-base-control__label">{ __( 'Button Border Color', 'zenctuary' ) }</p>
					<ColorPalette colors={ PRESET_COLORS } value={ attributes.buttonBorderColor } onChange={ ( value ) => setAttributes( { buttonBorderColor: value || 'rgba(255, 255, 255, 0.38)' } ) } />
					<TextControl label={ __( 'Custom Button Border Color', 'zenctuary' ) } value={ attributes.buttonBorderColor } onChange={ ( value ) => setAttributes( { buttonBorderColor: value || 'rgba(255, 255, 255, 0.38)' } ) } />
					<RangeControl label={ __( 'Button Border Width', 'zenctuary' ) } value={ attributes.buttonBorderWidth } onChange={ ( value ) => setAttributes( { buttonBorderWidth: value } ) } min={ 0 } max={ 8 } />
					<TextControl label={ __( 'Button Radius', 'zenctuary' ) } value={ attributes.buttonBorderRadius } onChange={ ( value ) => setAttributes( { buttonBorderRadius: value || '999px' } ) } />
					<SpacingControls label={ __( 'Button Padding', 'zenctuary' ) } value={ attributes.buttonPadding } onChange={ ( value ) => setAttributes( { buttonPadding: value } ) } />
					<ToggleControl label={ __( 'Show Button Icon', 'zenctuary' ) } checked={ attributes.buttonShowIcon } onChange={ ( value ) => setAttributes( { buttonShowIcon: value } ) } />
					<SelectControl
						label={ __( 'Button Icon Position', 'zenctuary' ) }
						value={ attributes.buttonIconPosition }
						options={ [
							{ label: __( 'Left', 'zenctuary' ), value: 'left' },
							{ label: __( 'Right', 'zenctuary' ), value: 'right' },
						] }
						onChange={ ( value ) => setAttributes( { buttonIconPosition: value } ) }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Navigation Style', 'zenctuary' ) } initialOpen={ false }>
					<RangeControl label={ __( 'Navigation Button Size', 'zenctuary' ) } value={ attributes.navButtonSize } onChange={ ( value ) => setAttributes( { navButtonSize: value } ) } min={ 32 } max={ 96 } />
					<RangeControl label={ __( 'Navigation Icon Size', 'zenctuary' ) } value={ attributes.navIconSize } onChange={ ( value ) => setAttributes( { navIconSize: value } ) } min={ 12 } max={ 40 } />
					<RangeControl label={ __( 'Navigation Border Width', 'zenctuary' ) } value={ attributes.navBorderWidth } onChange={ ( value ) => setAttributes( { navBorderWidth: value } ) } min={ 0 } max={ 8 } />
					<TextControl label={ __( 'Navigation Radius', 'zenctuary' ) } value={ attributes.navBorderRadius } onChange={ ( value ) => setAttributes( { navBorderRadius: value || '999px' } ) } help={ __( 'Use 999px for a circle.', 'zenctuary' ) } />
					<p className="components-base-control__label">{ __( 'Navigation Border Color', 'zenctuary' ) }</p>
					<ColorPalette colors={ PRESET_COLORS } value={ attributes.navBorderColor } onChange={ ( value ) => setAttributes( { navBorderColor: value || 'rgba(23, 23, 23, 0.16)' } ) } />
					<TextControl label={ __( 'Custom Navigation Border Color', 'zenctuary' ) } value={ attributes.navBorderColor } onChange={ ( value ) => setAttributes( { navBorderColor: value || 'rgba(23, 23, 23, 0.16)' } ) } />
					<p className="components-base-control__label">{ __( 'Navigation Background', 'zenctuary' ) }</p>
					<ColorPalette colors={ PRESET_COLORS } value={ attributes.navBackgroundColor } onChange={ ( value ) => setAttributes( { navBackgroundColor: value || 'rgba(255, 255, 255, 0.78)' } ) } />
					<TextControl label={ __( 'Custom Navigation Background', 'zenctuary' ) } value={ attributes.navBackgroundColor } onChange={ ( value ) => setAttributes( { navBackgroundColor: value || 'rgba(255, 255, 255, 0.78)' } ) } />
					<p className="components-base-control__label">{ __( 'Navigation Icon Color', 'zenctuary' ) }</p>
					<ColorPalette colors={ PRESET_COLORS } value={ attributes.navIconColor } onChange={ ( value ) => setAttributes( { navIconColor: value || '#171717' } ) } />
					<TextControl label={ __( 'Custom Navigation Icon Color', 'zenctuary' ) } value={ attributes.navIconColor } onChange={ ( value ) => setAttributes( { navIconColor: value || '#171717' } ) } />
					<p className="components-base-control__label">{ __( 'Navigation Hover Background', 'zenctuary' ) }</p>
					<ColorPalette colors={ PRESET_COLORS } value={ attributes.navHoverBackgroundColor } onChange={ ( value ) => setAttributes( { navHoverBackgroundColor: value || '#171717' } ) } />
					<TextControl label={ __( 'Custom Navigation Hover Background', 'zenctuary' ) } value={ attributes.navHoverBackgroundColor } onChange={ ( value ) => setAttributes( { navHoverBackgroundColor: value || '#171717' } ) } />
					<p className="components-base-control__label">{ __( 'Navigation Hover Icon Color', 'zenctuary' ) }</p>
					<ColorPalette colors={ PRESET_COLORS } value={ attributes.navHoverIconColor } onChange={ ( value ) => setAttributes( { navHoverIconColor: value || '#f4efe7' } ) } />
					<TextControl label={ __( 'Custom Navigation Hover Icon Color', 'zenctuary' ) } value={ attributes.navHoverIconColor } onChange={ ( value ) => setAttributes( { navHoverIconColor: value || '#f4efe7' } ) } />
					<SelectControl
						label={ __( 'Navigation Icon Set', 'zenctuary' ) }
						value={ attributes.navIconSet }
						help={ __( 'Dashicon options use WordPress core Dashicons and need no new dependency.', 'zenctuary' ) }
						options={ [
							{ label: __( 'Line Arrow', 'zenctuary' ), value: 'line-arrow' },
							{ label: __( 'Chevron', 'zenctuary' ), value: 'chevron' },
							{ label: __( 'Caret', 'zenctuary' ), value: 'caret' },
							{ label: __( 'Dashicons Arrow Alt 2', 'zenctuary' ), value: 'dashicons-arrow-alt2' },
							{ label: __( 'Dashicons Controls', 'zenctuary' ), value: 'dashicons-controls' },
						] }
						onChange={ ( value ) => setAttributes( { navIconSet: value } ) }
					/>
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
						<ToggleControl label={ __( 'Show Image Overlay', 'zenctuary' ) } checked={ selectedCard.showOverlay !== false } onChange={ ( value ) => updateCard( selectedCardIndex, { showOverlay: value } ) } />
						<p className="components-base-control__label">{ __( 'Overlay Color', 'zenctuary' ) }</p>
						{ selectedCard.showOverlay !== false && (
							<>
								<ColorPalette colors={ PRESET_COLORS } value={ selectedCard.overlayColor } onChange={ ( value ) => updateCard( selectedCardIndex, { overlayColor: value || '#1f1d1a' } ) } />
								<TextControl label={ __( 'Custom Overlay Color', 'zenctuary' ) } value={ selectedCard.overlayColor } onChange={ ( value ) => updateCard( selectedCardIndex, { overlayColor: value || '#1f1d1a' } ) } />
								<RangeControl label={ __( 'Overlay Opacity', 'zenctuary' ) } value={ selectedCard.overlayOpacity } onChange={ ( value ) => updateCard( selectedCardIndex, { overlayOpacity: value } ) } min={ 0 } max={ 1 } step={ 0.05 } />
							</>
						) }
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
							<button type="button" className="premium-edge-peek-carousel__arrow" aria-label={ __( 'Previous', 'zenctuary' ) }>{ navigationIcon( attributes.navIconSet, 'prev' ) }</button>
							<button type="button" className="premium-edge-peek-carousel__arrow" aria-label={ __( 'Next', 'zenctuary' ) }>{ navigationIcon( attributes.navIconSet, 'next' ) }</button>
						</div>
					</div>
					<div className="premium-edge-peek-carousel__stage premium-edge-peek-carousel__stage--preview">
						<div className="premium-edge-peek-carousel__preview-track">
							{ cards.map( ( card, index ) => (
								<div key={ index } className={ `premium-edge-peek-carousel__preview-slide${ index === selectedCardIndex ? ' is-selected' : '' }` } onClick={ () => setSelectedCardIndex( index ) } onKeyDown={ () => {} } role="button" tabIndex={ 0 }>
									<article className="premium-edge-peek-carousel__card" style={ {
										backgroundImage: card.imageUrl ? `url("${ card.imageUrl }")` : undefined,
										backgroundColor: ! card.imageUrl ? '#c8bfb2' : undefined,
									} }>
										{ card.showOverlay !== false && <div className="premium-edge-peek-carousel__overlay" style={ { backgroundColor: card.overlayColor, opacity: card.overlayOpacity } } /> }
										<div className="premium-edge-peek-carousel__card-content">
											<div className="premium-edge-peek-carousel__card-top">
												<RichText tagName="h3" className="premium-edge-peek-carousel__card-title" value={ card.title } onChange={ ( value ) => updateCard( index, { title: value } ) } placeholder={ __( 'Card title', 'zenctuary' ) } />
											</div>
											<div className="premium-edge-peek-carousel__card-bottom">
												<ul className="premium-edge-peek-carousel__card-items">
													{ card.items.filter( Boolean ).map( ( item, itemIndex ) => <li key={ itemIndex }>{ item }</li> ) }
												</ul>
												{ card.showDots && <div className="premium-edge-peek-carousel__dots" aria-hidden="true">{ card.dotsText || '...' }</div> }
												<div className={ `premium-edge-peek-carousel__button premium-edge-peek-carousel__button--icon-${ attributes.buttonIconPosition || 'right' }` }>
													{ attributes.buttonShowIcon && <span className="premium-edge-peek-carousel__button-icon" aria-hidden="true">{ arrowIcon() }</span> }
													<span>{ card.buttonText || __( 'Learn More', 'zenctuary' ) }</span>
												</div>
											</div>
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
