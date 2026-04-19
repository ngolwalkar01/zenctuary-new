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
	TextareaControl,
	TextControl,
	ToggleControl,
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';
import { useMemo, useState } from '@wordpress/element';

const PRESET_COLORS = [
	{ name: 'Charcoal', color: '#4a4848' },
	{ name: 'Gold', color: '#dbbf58' },
	{ name: 'White', color: '#ffffff' },
	{ name: 'Taupe', color: '#4b4339' },
	{ name: 'Black', color: '#1b1b1b' },
];

function createDefaultCard() {
	return {
		cardType: 'text',
		avatarImageId: 0,
		avatarImageUrl: '',
		imageId: 0,
		imageUrl: '',
		videoId: 0,
		rating: 5,
		quote: __( '"Add testimonial quote"', 'zenctuary' ),
		authorName: __( 'Client Name', 'zenctuary' ),
		videoUrl: '',
		openInNewTab: false,
	};
}

function normalizeCards( cards ) {
	const nextCards = Array.isArray( cards ) ? cards.slice() : [];
	if ( ! nextCards.length ) {
		nextCards.push( createDefaultCard() );
	}
	return nextCards.map( ( card ) => ( {
		...createDefaultCard(),
		...card,
		cardType: card?.cardType === 'video' ? 'video' : 'text',
		rating: Math.max( 0, Math.min( 5, Number( card?.rating ) || 0 ) ),
	} ) );
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
		<div className="premium-testimonial-carousel__spacing-control">
			<p className="components-base-control__label">{ label }</p>
			<UnitControl label={ __( 'Top', 'zenctuary' ) } value={ nextValue.top } onChange={ ( newValue ) => updateSide( 'top', newValue ) } />
			<UnitControl label={ __( 'Right', 'zenctuary' ) } value={ nextValue.right } onChange={ ( newValue ) => updateSide( 'right', newValue ) } />
			<UnitControl label={ __( 'Bottom', 'zenctuary' ) } value={ nextValue.bottom } onChange={ ( newValue ) => updateSide( 'bottom', newValue ) } />
			<UnitControl label={ __( 'Left', 'zenctuary' ) } value={ nextValue.left } onChange={ ( newValue ) => updateSide( 'left', newValue ) } />
		</div>
	);
}

function getSlidesPerView( cardsPerView, edgePeekPercent ) {
	return Math.max( 1, Number( cardsPerView ) || 1 ) + ( Math.max( 0, Number( edgePeekPercent ) || 0 ) / 100 );
}

function navigationIcon( iconSet = 'chevron', direction = 'next' ) {
	const isNext = direction === 'next';

	if ( iconSet === 'dashicons-arrow-alt2' ) {
		return <span className={ `premium-testimonial-carousel__arrow-icon dashicons ${ isNext ? 'dashicons-arrow-right-alt2' : 'dashicons-arrow-left-alt2' }` } aria-hidden="true" />;
	}

	if ( iconSet === 'dashicons-controls' ) {
		return <span className={ `premium-testimonial-carousel__arrow-icon dashicons ${ isNext ? 'dashicons-controls-forward' : 'dashicons-controls-back' }` } aria-hidden="true" />;
	}

	if ( iconSet === 'caret' ) {
		return (
			<svg className="premium-testimonial-carousel__arrow-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
				<path d={ isNext ? 'M10 7L15 12L10 17' : 'M14 7L9 12L14 17' } stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		);
	}

	if ( iconSet === 'line-arrow' ) {
		return (
			<svg className="premium-testimonial-carousel__arrow-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
				<path d={ isNext ? 'M3.5 12H18.5M18.5 12L13.5 7M18.5 12L13.5 17' : 'M20.5 12H5.5M5.5 12L10.5 7M5.5 12L10.5 17' } stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		);
	}

	return (
		<svg className="premium-testimonial-carousel__arrow-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
			<path d={ isNext ? 'M9 5L16 12L9 19' : 'M15 5L8 12L15 19' } stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

function renderStars( rating ) {
	return '★'.repeat( Math.max( 0, Math.min( 5, rating ) ) );
}

function playIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
			<path d="M9 7.5V16.5L16 12L9 7.5Z" fill="currentColor" />
		</svg>
	);
}

function pauseIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
			<path d="M8 7H10.75V17H8V7ZM13.25 7H16V17H13.25V7Z" fill="currentColor" />
		</svg>
	);
}

function muteIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
			<path d="M5 10H8L12 6V18L8 14H5V10Z" fill="currentColor" />
			<path d="M15 9.5C15.8333 10.1667 16.25 11 16.25 12C16.25 13 15.8333 13.8333 15 14.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
			<path d="M17 7.5C18.5 8.66667 19.25 10.1667 19.25 12C19.25 13.8333 18.5 15.3333 17 16.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
		</svg>
	);
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
		updateCards( cards.map( ( card, currentIndex ) => currentIndex === index ? { ...card, ...patch } : card ) );
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

	const blockProps = useBlockProps( {
		className: 'premium-testimonial-carousel is-editor-preview',
		style: {
			backgroundColor: attributes.backgroundColor,
			backgroundImage: attributes.backgroundImageUrl ? `url("${ attributes.backgroundImageUrl }")` : undefined,
			backgroundSize: attributes.backgroundImageUrl ? 'cover' : undefined,
			backgroundPosition: attributes.backgroundImageUrl ? 'center' : undefined,
			...getSpacingStyle( attributes.sectionPadding, 'padding' ),
			'--premium-testimonial-content-max-width': `${ attributes.contentMaxWidth || 1320 }px`,
			'--premium-testimonial-gap': `${ attributes.gap || 36 }px`,
			'--premium-testimonial-card-radius': `${ attributes.cardBorderRadius || 24 }px`,
			'--premium-testimonial-card-padding': `${ attributes.cardContentPadding || 32 }px`,
			'--premium-testimonial-card-height-desktop': `${ attributes.cardHeightDesktop || 640 }px`,
			'--premium-testimonial-card-height-tablet': `${ attributes.cardHeightTablet || 560 }px`,
			'--premium-testimonial-card-height-mobile': `${ attributes.cardHeightMobile || 520 }px`,
			'--premium-testimonial-heading-max-width': `${ attributes.headingMaxWidth || 980 }px`,
			'--premium-testimonial-heading-size': attributes.headingFontSize || 'clamp(2.1rem, 4vw, 4rem)',
			'--premium-testimonial-heading-weight': attributes.headingFontWeight || '700',
			'--premium-testimonial-heading-line-height': attributes.headingLineHeight || '1',
			'--premium-testimonial-heading-color': attributes.headingColor || '#dbbf58',
			'--premium-testimonial-text-card-bg': attributes.textCardBackgroundColor || '#4a4848',
			'--premium-testimonial-quote-size': attributes.quoteFontSize || 'clamp(1.35rem, 1.7vw, 1.65rem)',
			'--premium-testimonial-quote-weight': attributes.quoteFontWeight || '400',
			'--premium-testimonial-quote-line-height': attributes.quoteLineHeight || '1.45',
			'--premium-testimonial-quote-color': attributes.quoteColor || '#f3f0eb',
			'--premium-testimonial-author-size': attributes.authorFontSize || '1.15rem',
			'--premium-testimonial-author-weight': attributes.authorFontWeight || '700',
			'--premium-testimonial-author-line-height': attributes.authorLineHeight || '1.2',
			'--premium-testimonial-author-color': attributes.authorColor || '#ffffff',
			'--premium-testimonial-stars-color': attributes.starsColor || '#dbbf58',
			'--premium-testimonial-stars-size': attributes.starsSize || '1.95rem',
			'--premium-testimonial-stars-spacing': attributes.starsLetterSpacing || '0.14em',
			'--premium-testimonial-avatar-size': `${ attributes.avatarSize || 62 }px`,
			'--premium-testimonial-avatar-border': attributes.avatarBorderColor || 'rgba(255, 255, 255, 0.88)',
			'--premium-testimonial-play-size': `${ attributes.playButtonSize || 82 }px`,
			'--premium-testimonial-play-bg': attributes.playButtonBackgroundColor || '#dbbf58',
			'--premium-testimonial-play-color': attributes.playButtonIconColor || '#3d3937',
			'--premium-testimonial-video-overlay': attributes.videoOverlayColor || 'rgba(0, 0, 0, 0.18)',
			'--premium-testimonial-nav-size': `${ attributes.navButtonSize || 54 }px`,
			'--premium-testimonial-nav-icon-size': `${ attributes.navIconSize || 20 }px`,
			'--premium-testimonial-nav-border-width': `${ attributes.navBorderWidth || 1 }px`,
			'--premium-testimonial-nav-radius': attributes.navBorderRadius || '999px',
			'--premium-testimonial-nav-border-color': attributes.navBorderColor || '#dbbf58',
			'--premium-testimonial-nav-bg': attributes.navBackgroundColor || 'transparent',
			'--premium-testimonial-nav-icon-color': attributes.navIconColor || '#dbbf58',
			'--premium-testimonial-nav-hover-bg': attributes.navHoverBackgroundColor || '#dbbf58',
			'--premium-testimonial-nav-hover-icon-color': attributes.navHoverIconColor || '#3f3932',
			'--premium-testimonial-preview-slides': String( desktopSlides ),
			'--premium-testimonial-desktop-cards': String( attributes.desktopCards || 3 ),
			'--premium-testimonial-tablet-cards': String( attributes.tabletCards || 2 ),
			'--premium-testimonial-mobile-cards': String( attributes.mobileCards || 1 ),
			'--premium-testimonial-desktop-peek': String( attributes.edgePeekDesktop || 20 ),
			'--premium-testimonial-tablet-peek': String( attributes.edgePeekTablet || 20 ),
			'--premium-testimonial-mobile-peek': String( attributes.edgePeekMobile || 20 ),
			'--premium-testimonial-left-start-desktop': `${ attributes.leftStartOffsetDesktop || 80 }px`,
			'--premium-testimonial-left-start-tablet': `${ attributes.leftStartOffsetTablet || 48 }px`,
			'--premium-testimonial-left-start-mobile': `${ attributes.leftStartOffsetMobile || 20 }px`,
			'--premium-testimonial-card-scale-desktop': String( attributes.cardWidthScaleDesktop || 100 ),
			'--premium-testimonial-card-scale-tablet': String( attributes.cardWidthScaleTablet || 100 ),
			'--premium-testimonial-card-scale-mobile': String( attributes.cardWidthScaleMobile || 100 ),
		},
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Section Settings', 'zenctuary' ) } initialOpen>
					<RangeControl label={ __( 'Content Max Width', 'zenctuary' ) } value={ attributes.contentMaxWidth } onChange={ ( value ) => setAttributes( { contentMaxWidth: value } ) } min={ 960 } max={ 1600 } step={ 20 } />
					<SpacingControls label={ __( 'Section Padding', 'zenctuary' ) } value={ attributes.sectionPadding } onChange={ ( value ) => setAttributes( { sectionPadding: value } ) } />
					<p className="components-base-control__label">{ __( 'Background Color', 'zenctuary' ) }</p>
					<ColorPalette colors={ PRESET_COLORS } value={ attributes.backgroundColor } onChange={ ( value ) => setAttributes( { backgroundColor: value || '#4b4339' } ) } />
					<TextControl label={ __( 'Custom Background Color', 'zenctuary' ) } value={ attributes.backgroundColor } onChange={ ( value ) => setAttributes( { backgroundColor: value || '#4b4339' } ) } />
					<MediaUploadCheck>
						<MediaUpload
							onSelect={ ( media ) => setAttributes( { backgroundImageId: media?.id || 0, backgroundImageUrl: media?.url || '' } ) }
							allowedTypes={ [ 'image' ] }
							value={ attributes.backgroundImageId }
							render={ ( { open } ) => <Button variant="secondary" onClick={ open }>{ attributes.backgroundImageUrl ? __( 'Replace Background Image', 'zenctuary' ) : __( 'Choose Background Image', 'zenctuary' ) }</Button> }
						/>
					</MediaUploadCheck>
					{ attributes.backgroundImageUrl && <Button variant="link" isDestructive onClick={ () => setAttributes( { backgroundImageId: 0, backgroundImageUrl: '' } ) }>{ __( 'Remove Background Image', 'zenctuary' ) }</Button> }
				</PanelBody>

				<PanelBody title={ __( 'Main Title', 'zenctuary' ) } initialOpen={ false }>
					<RangeControl label={ __( 'Title Width', 'zenctuary' ) } value={ attributes.headingMaxWidth } onChange={ ( value ) => setAttributes( { headingMaxWidth: value } ) } min={ 240 } max={ 1200 } step={ 10 } />
					<TextControl label={ __( 'Title Font Size', 'zenctuary' ) } value={ attributes.headingFontSize } onChange={ ( value ) => setAttributes( { headingFontSize: value || 'clamp(2.1rem, 4vw, 4rem)' } ) } />
					<TextControl label={ __( 'Title Weight', 'zenctuary' ) } value={ attributes.headingFontWeight } onChange={ ( value ) => setAttributes( { headingFontWeight: value || '700' } ) } />
					<TextControl label={ __( 'Title Line Height', 'zenctuary' ) } value={ attributes.headingLineHeight } onChange={ ( value ) => setAttributes( { headingLineHeight: value || '1' } ) } />
					<p className="components-base-control__label">{ __( 'Title Color', 'zenctuary' ) }</p>
					<ColorPalette colors={ PRESET_COLORS } value={ attributes.headingColor } onChange={ ( value ) => setAttributes( { headingColor: value || '#dbbf58' } ) } />
					<TextControl label={ __( 'Custom Title Color', 'zenctuary' ) } value={ attributes.headingColor } onChange={ ( value ) => setAttributes( { headingColor: value || '#dbbf58' } ) } />
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
					<RangeControl label={ __( 'Card Content Padding', 'zenctuary' ) } value={ attributes.cardContentPadding } onChange={ ( value ) => setAttributes( { cardContentPadding: value } ) } min={ 12 } max={ 48 } />
					<RangeControl label={ __( 'Card Height Desktop', 'zenctuary' ) } value={ attributes.cardHeightDesktop } onChange={ ( value ) => setAttributes( { cardHeightDesktop: value } ) } min={ 320 } max={ 1000 } step={ 10 } />
					<RangeControl label={ __( 'Card Height Tablet', 'zenctuary' ) } value={ attributes.cardHeightTablet } onChange={ ( value ) => setAttributes( { cardHeightTablet: value } ) } min={ 280 } max={ 900 } step={ 10 } />
					<RangeControl label={ __( 'Card Height Mobile', 'zenctuary' ) } value={ attributes.cardHeightMobile } onChange={ ( value ) => setAttributes( { cardHeightMobile: value } ) } min={ 240 } max={ 800 } step={ 10 } />
					<p className="components-base-control__label">{ __( 'Text Card Background', 'zenctuary' ) }</p>
					<ColorPalette colors={ PRESET_COLORS } value={ attributes.textCardBackgroundColor } onChange={ ( value ) => setAttributes( { textCardBackgroundColor: value || '#4a4848' } ) } />
					<TextControl label={ __( 'Custom Text Card Background', 'zenctuary' ) } value={ attributes.textCardBackgroundColor } onChange={ ( value ) => setAttributes( { textCardBackgroundColor: value || '#4a4848' } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Typography', 'zenctuary' ) } initialOpen={ false }>
					<TextControl label={ __( 'Quote Size', 'zenctuary' ) } value={ attributes.quoteFontSize } onChange={ ( value ) => setAttributes( { quoteFontSize: value || 'clamp(1.35rem, 1.7vw, 1.65rem)' } ) } />
					<TextControl label={ __( 'Quote Weight', 'zenctuary' ) } value={ attributes.quoteFontWeight } onChange={ ( value ) => setAttributes( { quoteFontWeight: value || '400' } ) } />
					<TextControl label={ __( 'Quote Line Height', 'zenctuary' ) } value={ attributes.quoteLineHeight } onChange={ ( value ) => setAttributes( { quoteLineHeight: value || '1.45' } ) } />
					<TextControl label={ __( 'Quote Color', 'zenctuary' ) } value={ attributes.quoteColor } onChange={ ( value ) => setAttributes( { quoteColor: value || '#f3f0eb' } ) } />
					<TextControl label={ __( 'Author Size', 'zenctuary' ) } value={ attributes.authorFontSize } onChange={ ( value ) => setAttributes( { authorFontSize: value || '1.15rem' } ) } />
					<TextControl label={ __( 'Author Weight', 'zenctuary' ) } value={ attributes.authorFontWeight } onChange={ ( value ) => setAttributes( { authorFontWeight: value || '700' } ) } />
					<TextControl label={ __( 'Author Line Height', 'zenctuary' ) } value={ attributes.authorLineHeight } onChange={ ( value ) => setAttributes( { authorLineHeight: value || '1.2' } ) } />
					<TextControl label={ __( 'Author Color', 'zenctuary' ) } value={ attributes.authorColor } onChange={ ( value ) => setAttributes( { authorColor: value || '#ffffff' } ) } />
					<TextControl label={ __( 'Stars Size', 'zenctuary' ) } value={ attributes.starsSize } onChange={ ( value ) => setAttributes( { starsSize: value || '1.95rem' } ) } />
					<TextControl label={ __( 'Stars Letter Spacing', 'zenctuary' ) } value={ attributes.starsLetterSpacing } onChange={ ( value ) => setAttributes( { starsLetterSpacing: value || '0.14em' } ) } />
					<TextControl label={ __( 'Stars Color', 'zenctuary' ) } value={ attributes.starsColor } onChange={ ( value ) => setAttributes( { starsColor: value || '#dbbf58' } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Media & Play', 'zenctuary' ) } initialOpen={ false }>
					<RangeControl label={ __( 'Avatar Size', 'zenctuary' ) } value={ attributes.avatarSize } onChange={ ( value ) => setAttributes( { avatarSize: value } ) } min={ 36 } max={ 96 } />
					<TextControl label={ __( 'Avatar Border Color', 'zenctuary' ) } value={ attributes.avatarBorderColor } onChange={ ( value ) => setAttributes( { avatarBorderColor: value || 'rgba(255, 255, 255, 0.88)' } ) } />
					<RangeControl label={ __( 'Play Button Size', 'zenctuary' ) } value={ attributes.playButtonSize } onChange={ ( value ) => setAttributes( { playButtonSize: value } ) } min={ 48 } max={ 120 } />
					<TextControl label={ __( 'Play Button Background', 'zenctuary' ) } value={ attributes.playButtonBackgroundColor } onChange={ ( value ) => setAttributes( { playButtonBackgroundColor: value || '#dbbf58' } ) } />
					<TextControl label={ __( 'Play Icon Color', 'zenctuary' ) } value={ attributes.playButtonIconColor } onChange={ ( value ) => setAttributes( { playButtonIconColor: value || '#3d3937' } ) } />
					<TextControl label={ __( 'Video Overlay', 'zenctuary' ) } value={ attributes.videoOverlayColor } onChange={ ( value ) => setAttributes( { videoOverlayColor: value || 'rgba(0, 0, 0, 0.18)' } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Navigation Style', 'zenctuary' ) } initialOpen={ false }>
					<RangeControl label={ __( 'Navigation Button Size', 'zenctuary' ) } value={ attributes.navButtonSize } onChange={ ( value ) => setAttributes( { navButtonSize: value } ) } min={ 32 } max={ 96 } />
					<RangeControl label={ __( 'Navigation Icon Size', 'zenctuary' ) } value={ attributes.navIconSize } onChange={ ( value ) => setAttributes( { navIconSize: value } ) } min={ 12 } max={ 40 } />
					<RangeControl label={ __( 'Navigation Border Width', 'zenctuary' ) } value={ attributes.navBorderWidth } onChange={ ( value ) => setAttributes( { navBorderWidth: value } ) } min={ 0 } max={ 8 } />
					<TextControl label={ __( 'Navigation Radius', 'zenctuary' ) } value={ attributes.navBorderRadius } onChange={ ( value ) => setAttributes( { navBorderRadius: value || '999px' } ) } />
					<TextControl label={ __( 'Navigation Border Color', 'zenctuary' ) } value={ attributes.navBorderColor } onChange={ ( value ) => setAttributes( { navBorderColor: value || '#dbbf58' } ) } />
					<TextControl label={ __( 'Navigation Background', 'zenctuary' ) } value={ attributes.navBackgroundColor } onChange={ ( value ) => setAttributes( { navBackgroundColor: value || 'transparent' } ) } />
					<TextControl label={ __( 'Navigation Icon Color', 'zenctuary' ) } value={ attributes.navIconColor } onChange={ ( value ) => setAttributes( { navIconColor: value || '#dbbf58' } ) } />
					<TextControl label={ __( 'Navigation Hover Background', 'zenctuary' ) } value={ attributes.navHoverBackgroundColor } onChange={ ( value ) => setAttributes( { navHoverBackgroundColor: value || '#dbbf58' } ) } />
					<TextControl label={ __( 'Navigation Hover Icon Color', 'zenctuary' ) } value={ attributes.navHoverIconColor } onChange={ ( value ) => setAttributes( { navHoverIconColor: value || '#3f3932' } ) } />
					<SelectControl
						label={ __( 'Navigation Icon Set', 'zenctuary' ) }
						value={ attributes.navIconSet }
						options={ [
							{ label: __( 'Chevron', 'zenctuary' ), value: 'chevron' },
							{ label: __( 'Line Arrow', 'zenctuary' ), value: 'line-arrow' },
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
						<SelectControl
							label={ __( 'Card Type', 'zenctuary' ) }
							value={ selectedCard.cardType }
							options={ [
								{ label: __( 'Text Testimonial', 'zenctuary' ), value: 'text' },
								{ label: __( 'Video Testimonial', 'zenctuary' ), value: 'video' },
							] }
							onChange={ ( value ) => updateCard( selectedCardIndex, { cardType: value } ) }
						/>

						<MediaUploadCheck>
							<MediaUpload
								onSelect={ ( media ) => updateCard( selectedCardIndex, { avatarImageId: media?.id || 0, avatarImageUrl: media?.url || '' } ) }
								allowedTypes={ [ 'image' ] }
								value={ selectedCard.avatarImageId }
								render={ ( { open } ) => <Button variant="secondary" onClick={ open }>{ selectedCard.avatarImageUrl ? __( 'Replace Avatar', 'zenctuary' ) : __( 'Choose Avatar', 'zenctuary' ) }</Button> }
							/>
						</MediaUploadCheck>
						{ selectedCard.avatarImageUrl && <Button variant="link" isDestructive onClick={ () => updateCard( selectedCardIndex, { avatarImageId: 0, avatarImageUrl: '' } ) }>{ __( 'Remove Avatar', 'zenctuary' ) }</Button> }

						{ selectedCard.cardType === 'video' && (
							<>
								<MediaUploadCheck>
									<MediaUpload
											onSelect={ ( media ) => updateCard( selectedCardIndex, { imageId: media?.id || 0, imageUrl: media?.url || '' } ) }
										allowedTypes={ [ 'image' ] }
										value={ selectedCard.imageId }
										render={ ( { open } ) => <Button variant="secondary" onClick={ open }>{ selectedCard.imageUrl ? __( 'Replace Video Poster', 'zenctuary' ) : __( 'Choose Video Poster', 'zenctuary' ) }</Button> }
									/>
								</MediaUploadCheck>
								{ selectedCard.imageUrl && <Button variant="link" isDestructive onClick={ () => updateCard( selectedCardIndex, { imageId: 0, imageUrl: '' } ) }>{ __( 'Remove Video Poster', 'zenctuary' ) }</Button> }
								<MediaUploadCheck>
									<MediaUpload
										onSelect={ ( media ) => updateCard( selectedCardIndex, { videoId: media?.id || 0, videoUrl: media?.url || '' } ) }
										allowedTypes={ [ 'video' ] }
										value={ selectedCard.videoId }
										render={ ( { open } ) => <Button variant="secondary" onClick={ open }>{ selectedCard.videoUrl ? __( 'Replace Testimonial Video', 'zenctuary' ) : __( 'Choose Testimonial Video', 'zenctuary' ) }</Button> }
									/>
								</MediaUploadCheck>
								{ selectedCard.videoUrl && <Button variant="link" isDestructive onClick={ () => updateCard( selectedCardIndex, { videoId: 0, videoUrl: '' } ) }>{ __( 'Remove Testimonial Video', 'zenctuary' ) }</Button> }
								<TextControl label={ __( 'Video URL', 'zenctuary' ) } value={ selectedCard.videoUrl } onChange={ ( value ) => updateCard( selectedCardIndex, { videoUrl: value } ) } help={ __( 'Use a direct video file URL if needed.', 'zenctuary' ) } />
							</>
						) }

						<RangeControl label={ __( 'Star Rating', 'zenctuary' ) } value={ selectedCard.rating } onChange={ ( value ) => updateCard( selectedCardIndex, { rating: value } ) } min={ 0 } max={ 5 } />
						<TextareaControl label={ __( 'Quote', 'zenctuary' ) } value={ selectedCard.quote } onChange={ ( value ) => updateCard( selectedCardIndex, { quote: value } ) } help={ __( 'Used on text testimonial cards.', 'zenctuary' ) } />
						<TextControl label={ __( 'Author Name', 'zenctuary' ) } value={ selectedCard.authorName } onChange={ ( value ) => updateCard( selectedCardIndex, { authorName: value } ) } />
					</PanelBody>
				) }
			</InspectorControls>

			<section { ...blockProps }>
				<div className="premium-testimonial-carousel__inner">
					<div className="premium-testimonial-carousel__header">
						<div className="premium-testimonial-carousel__copy">
							<RichText tagName="h2" className="premium-testimonial-carousel__heading" value={ attributes.heading } onChange={ ( value ) => setAttributes( { heading: value } ) } placeholder={ __( 'Add heading', 'zenctuary' ) } />
							<RichText tagName="p" className="premium-testimonial-carousel__subheading" value={ attributes.subheading } onChange={ ( value ) => setAttributes( { subheading: value } ) } placeholder={ __( 'Add subheading', 'zenctuary' ) } />
						</div>
						<div className="premium-testimonial-carousel__nav premium-testimonial-carousel__nav--preview">
							<button type="button" className="premium-testimonial-carousel__arrow" aria-label={ __( 'Previous', 'zenctuary' ) }>{ navigationIcon( attributes.navIconSet, 'prev' ) }</button>
							<button type="button" className="premium-testimonial-carousel__arrow" aria-label={ __( 'Next', 'zenctuary' ) }>{ navigationIcon( attributes.navIconSet, 'next' ) }</button>
						</div>
					</div>
					<div className="premium-testimonial-carousel__stage premium-testimonial-carousel__stage--preview">
						<div className="premium-testimonial-carousel__preview-track">
							{ cards.map( ( card, index ) => (
								<div key={ index } className={ `premium-testimonial-carousel__preview-slide${ index === selectedCardIndex ? ' is-selected' : '' }` } onClick={ () => setSelectedCardIndex( index ) } onKeyDown={ () => {} } role="button" tabIndex={ 0 }>
									<article className={ `premium-testimonial-carousel__card premium-testimonial-carousel__card--${ card.cardType }` } style={ card.cardType === 'video' && card.imageUrl ? { backgroundImage: `url("${ card.imageUrl }")` } : undefined }>
										<div className="premium-testimonial-carousel__card-layer" />
										{ card.cardType === 'video' && card.videoUrl && (
											<video className="premium-testimonial-carousel__video" src={ card.videoUrl } poster={ card.imageUrl || undefined } muted playsInline preload="metadata" />
										) }
										<div className="premium-testimonial-carousel__card-content">
											<div className="premium-testimonial-carousel__card-top-row">
												<div className="premium-testimonial-carousel__avatar-shell">
													{ card.avatarImageUrl ? <img className="premium-testimonial-carousel__avatar" src={ card.avatarImageUrl } alt="" /> : <div className="premium-testimonial-carousel__avatar premium-testimonial-carousel__avatar--placeholder" aria-hidden="true" /> }
												</div>
												<div className="premium-testimonial-carousel__rating" aria-hidden="true">{ renderStars( card.rating ) }</div>
											</div>

											{ card.cardType === 'text' ? (
												<div className="premium-testimonial-carousel__text-stack">
													<p className="premium-testimonial-carousel__quote">{ card.quote }</p>
													<p className="premium-testimonial-carousel__author">{ card.authorName }</p>
												</div>
											) : (
												<>
													<div className="premium-testimonial-carousel__video-center">
														<button type="button" className="premium-testimonial-carousel__play-button is-paused" aria-label={ __( 'Play testimonial video', 'zenctuary' ) } data-action="play-pause">
															<span className="premium-testimonial-carousel__play-icon premium-testimonial-carousel__play-icon--play">{ playIcon() }</span>
															<span className="premium-testimonial-carousel__play-icon premium-testimonial-carousel__play-icon--pause">{ pauseIcon() }</span>
														</button>
													</div>
													<button type="button" className="premium-testimonial-carousel__mute-button is-muted" aria-label={ __( 'Unmute testimonial video', 'zenctuary' ) } data-action="mute-toggle">
														<span className="premium-testimonial-carousel__mute-icon">{ muteIcon() }</span>
													</button>
													<p className="premium-testimonial-carousel__author premium-testimonial-carousel__author--video">{ card.authorName }</p>
												</>
											) }
										</div>
									</article>
								</div>
							) ) }
						</div>
						{ attributes.showPagination && (
							<div className="premium-testimonial-carousel__pagination premium-testimonial-carousel__pagination--preview">
								{ cards.map( ( card, index ) => <span key={ index } className={ `premium-testimonial-carousel__pagination-dot${ index === selectedCardIndex ? ' is-active' : '' }` } /> ) }
							</div>
						) }
					</div>
				</div>
			</section>
		</>
	);
}
