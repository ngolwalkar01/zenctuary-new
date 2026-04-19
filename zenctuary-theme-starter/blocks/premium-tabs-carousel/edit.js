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
	CheckboxControl,
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

function createDefaultTab( index = 0 ) {
	return {
		id: `tab-${ Date.now() }-${ index }`,
		label: __( 'New Tab', 'zenctuary' ),
	};
}

function createDefaultCard( tabId = 'default' ) {
	return {
		tabId,
		tabIds: [ tabId ],
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
		<div className="premium-tabs-carousel__spacing-control">
			<p className="components-base-control__label">{ label }</p>
			<UnitControl label={ __( 'Top', 'zenctuary' ) } value={ nextValue.top } onChange={ ( newValue ) => updateSide( 'top', newValue ) } />
			<UnitControl label={ __( 'Right', 'zenctuary' ) } value={ nextValue.right } onChange={ ( newValue ) => updateSide( 'right', newValue ) } />
			<UnitControl label={ __( 'Bottom', 'zenctuary' ) } value={ nextValue.bottom } onChange={ ( newValue ) => updateSide( 'bottom', newValue ) } />
			<UnitControl label={ __( 'Left', 'zenctuary' ) } value={ nextValue.left } onChange={ ( newValue ) => updateSide( 'left', newValue ) } />
		</div>
	);
}

function normalizeTabs( tabs ) {
	if ( ! Array.isArray( tabs ) || ! tabs.length ) {
		return [ { id: 'default', label: __( 'All', 'zenctuary' ) } ];
	}

	return tabs
		.map( ( tab, index ) => ( {
			id: tab?.id || `tab-${ index + 1 }`,
			label: tab?.label || `${ __( 'Tab', 'zenctuary' ) } ${ index + 1 }`,
		} ) )
		.filter( ( tab ) => tab.label );
}

function normalizeCards( cards, tabs ) {
	const nextCards = Array.isArray( cards ) ? cards.slice() : [];
	const defaultTabId = tabs[ 0 ]?.id || 'default';

	if ( ! nextCards.length ) {
		nextCards.push( createDefaultCard( defaultTabId ) );
	}

	return nextCards.map( ( card ) => ( {
		...createDefaultCard( card?.tabId || defaultTabId ),
		...card,
		tabId: card?.tabId || defaultTabId,
		tabIds: Array.isArray( card?.tabIds ) && card.tabIds.length
			? card.tabIds.filter( Boolean )
			: [ card?.tabId || defaultTabId ],
		showOverlay: card?.showOverlay !== false,
		items: Array.isArray( card?.items ) && card.items.length ? card.items : [ __( 'List item', 'zenctuary' ) ],
	} ) );
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
		return <span className={ `premium-tabs-carousel__arrow-icon dashicons ${ isNext ? 'dashicons-arrow-right-alt2' : 'dashicons-arrow-left-alt2' }` } aria-hidden="true" />;
	}

	if ( iconSet === 'dashicons-controls' ) {
		return <span className={ `premium-tabs-carousel__arrow-icon dashicons ${ isNext ? 'dashicons-controls-forward' : 'dashicons-controls-back' }` } aria-hidden="true" />;
	}

	if ( iconSet === 'chevron' ) {
		return (
			<svg className="premium-tabs-carousel__arrow-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
				<path d={ isNext ? 'M9 5L16 12L9 19' : 'M15 5L8 12L15 19' } stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		);
	}

	if ( iconSet === 'caret' ) {
		return (
			<svg className="premium-tabs-carousel__arrow-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
				<path d={ isNext ? 'M10 7L15 12L10 17' : 'M14 7L9 12L14 17' } stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		);
	}

	return <span className="premium-tabs-carousel__arrow-icon" aria-hidden="true">{ isNext ? '\u2192' : '\u2190' }</span>;
}

export default function Edit( { attributes, setAttributes } ) {
	const [ selectedCardIndex, setSelectedCardIndex ] = useState( 0 );
	const [ selectedTabId, setSelectedTabId ] = useState( '' );
	const tabs = useMemo( () => normalizeTabs( attributes.tabs ), [ attributes.tabs ] );
	const cards = useMemo( () => normalizeCards( attributes.cards, tabs ), [ attributes.cards, tabs ] );
	const activeTabId = selectedTabId || tabs[ 0 ]?.id || 'default';
	const visibleCards = cards
		.map( ( card, index ) => ( { card, index } ) )
		.filter(
			( entry ) =>
				! attributes.enableTabs ||
				( Array.isArray( entry.card.tabIds ) && entry.card.tabIds.includes( activeTabId ) )
		);
	const selectedCard = cards[ selectedCardIndex ] || cards[ 0 ];

	function updateCards( nextCards ) {
		setAttributes( { cards: nextCards } );
	}

	function updateCard( index, patch ) {
		updateCards(
			cards.map( ( card, currentIndex ) => ( currentIndex === index ? { ...card, ...patch } : card ) )
		);
	}

	function addCard() {
		const nextCards = [ ...cards, createDefaultCard( activeTabId ) ];
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
			items: selectedCard.items.map( ( item, currentIndex ) => ( currentIndex === itemIndex ? value : item ) ),
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

	function updateTabs( nextTabs ) {
		const normalizedTabs = normalizeTabs( nextTabs );
		const validIds = normalizedTabs.map( ( tab ) => tab.id );
		const fallbackTabId = normalizedTabs[ 0 ]?.id || 'default';
		setAttributes( {
			tabs: normalizedTabs,
			cards: cards.map( ( card ) => {
				const nextTabIds = ( Array.isArray( card.tabIds ) && card.tabIds.length
					? card.tabIds
					: [ card.tabId || fallbackTabId ] ).filter( ( id ) => validIds.includes( id ) );
				const safeTabIds = nextTabIds.length ? nextTabIds : [ fallbackTabId ];

				return {
					...card,
					tabId: safeTabIds[ 0 ],
					tabIds: safeTabIds,
				};
			} ),
		} );
		setSelectedTabId( fallbackTabId );
	}

	function toggleCardTab( tabId, checked ) {
		const currentTabIds = Array.isArray( selectedCard?.tabIds ) && selectedCard.tabIds.length
			? selectedCard.tabIds
			: [ selectedCard?.tabId || activeTabId ];
		const nextTabIds = checked
			? Array.from( new Set( [ ...currentTabIds, tabId ] ) )
			: currentTabIds.filter( ( id ) => id !== tabId );
		const safeTabIds = nextTabIds.length ? nextTabIds : [ tabs[ 0 ]?.id || 'default' ];

		updateCard( selectedCardIndex, {
			tabId: safeTabIds[ 0 ],
			tabIds: safeTabIds,
		} );
	}

	function addTab() {
		updateTabs( [ ...tabs, createDefaultTab( tabs.length ) ] );
	}

	function removeTab( index ) {
		if ( tabs.length === 1 ) {
			return;
		}

		updateTabs( tabs.filter( ( tab, currentIndex ) => currentIndex !== index ) );
	}

	const blockProps = useBlockProps( {
		className: 'premium-tabs-carousel is-editor-preview',
		style: {
			backgroundColor: attributes.backgroundColor,
			...getSpacingStyle( attributes.sectionPadding, 'padding' ),
			'--premium-tabs-content-max-width': `${ attributes.contentMaxWidth || 1320 }px`,
			'--premium-tabs-gap': `${ attributes.gap || 24 }px`,
			'--premium-tabs-card-radius': `${ attributes.cardBorderRadius || 20 }px`,
			'--premium-tabs-card-padding': `${ attributes.cardContentPadding || 24 }px`,
			'--premium-tabs-heading-max-width': `${ attributes.headingMaxWidth || 760 }px`,
			'--premium-tabs-heading-size': attributes.headingFontSize || 'clamp(2rem, 4vw, 3.75rem)',
			'--premium-tabs-heading-weight': attributes.headingFontWeight || '700',
			'--premium-tabs-heading-line-height': attributes.headingLineHeight || '0.98',
			'--premium-tabs-heading-color': attributes.headingColor || '#171717',
			'--premium-tabs-heading-tabs-gap': `${ attributes.headingTabsGap || 24 }px`,
			'--premium-tabs-tabs-nav-gap': `${ attributes.tabsNavGap || 28 }px`,
			'--premium-tabs-header-nav-gap': `${ attributes.headerNavGap || 24 }px`,
			'--premium-tabs-card-title-size': attributes.cardTitleFontSize || 'clamp(1.5rem, 2.4vw, 2rem)',
			'--premium-tabs-card-title-weight': attributes.cardTitleFontWeight || '700',
			'--premium-tabs-card-title-line-height': attributes.cardTitleLineHeight || '1.04',
			'--premium-tabs-card-title-color': attributes.cardTitleColor || '#ffffff',
			'--premium-tabs-card-body-size': attributes.cardBodyFontSize || '1rem',
			'--premium-tabs-card-body-weight': attributes.cardBodyFontWeight || '400',
			'--premium-tabs-card-body-line-height': attributes.cardBodyLineHeight || '1.5',
			'--premium-tabs-card-body-color': attributes.cardBodyColor || '#ffffff',
			'--premium-tabs-card-text-transform': attributes.cardTextUppercase ? 'uppercase' : 'none',
			'--premium-tabs-dots-size': attributes.dotsFontSize || '1.35rem',
			'--premium-tabs-dots-spacing': attributes.dotsLetterSpacing || '0.22em',
			'--premium-tabs-dots-color': attributes.dotsColor || 'rgba(255, 255, 255, 0.86)',
			'--premium-tabs-button-size': attributes.buttonFontSize || '0.95rem',
			'--premium-tabs-button-weight': attributes.buttonFontWeight || '600',
			'--premium-tabs-button-line-height': attributes.buttonLineHeight || '1.2',
			'--premium-tabs-button-color': attributes.buttonTextColor || '#ffffff',
			'--premium-tabs-button-bg': attributes.buttonBackgroundColor || 'rgba(255, 255, 255, 0.16)',
			'--premium-tabs-button-border-color': attributes.buttonBorderColor || 'rgba(255, 255, 255, 0.38)',
			'--premium-tabs-button-border-width': `${ attributes.buttonBorderWidth || 1 }px`,
			'--premium-tabs-button-radius': attributes.buttonBorderRadius || '999px',
			'--premium-tabs-button-width': attributes.buttonWidth || 'fit-content',
			'--premium-tabs-button-pad-top': attributes.buttonPadding?.top || '13px',
			'--premium-tabs-button-pad-right': attributes.buttonPadding?.right || '20px',
			'--premium-tabs-button-pad-bottom': attributes.buttonPadding?.bottom || '13px',
			'--premium-tabs-button-pad-left': attributes.buttonPadding?.left || '20px',
			'--premium-tabs-nav-size': `${ attributes.navButtonSize || 54 }px`,
			'--premium-tabs-nav-icon-size': `${ attributes.navIconSize || 20 }px`,
			'--premium-tabs-nav-border-width': `${ attributes.navBorderWidth || 1 }px`,
			'--premium-tabs-nav-radius': attributes.navBorderRadius || '999px',
			'--premium-tabs-nav-border-color': attributes.navBorderColor || 'rgba(23, 23, 23, 0.16)',
			'--premium-tabs-nav-bg': attributes.navBackgroundColor || 'rgba(255, 255, 255, 0.78)',
			'--premium-tabs-nav-icon-color': attributes.navIconColor || '#171717',
			'--premium-tabs-nav-hover-bg': attributes.navHoverBackgroundColor || '#171717',
			'--premium-tabs-nav-hover-icon-color': attributes.navHoverIconColor || '#f4efe7',
			'--premium-tabs-card-scale-desktop': String( attributes.cardWidthScaleDesktop || 100 ),
			'--premium-tabs-card-scale-tablet': String( attributes.cardWidthScaleTablet || 100 ),
			'--premium-tabs-card-scale-mobile': String( attributes.cardWidthScaleMobile || 100 ),
			'--premium-tabs-tab-size': attributes.tabFontSize || '0.95rem',
			'--premium-tabs-tab-weight': attributes.tabFontWeight || '600',
			'--premium-tabs-tab-color': attributes.tabTextColor || 'rgba(23, 23, 23, 0.72)',
			'--premium-tabs-tab-active-color': attributes.tabActiveTextColor || '#171717',
			'--premium-tabs-tab-border-color': attributes.tabBorderColor || 'rgba(23, 23, 23, 0.14)',
			'--premium-tabs-tab-active-border-color': attributes.tabActiveBorderColor || '#171717',
			'--premium-tabs-tab-bg': attributes.tabBackgroundColor || 'rgba(255, 255, 255, 0.82)',
			'--premium-tabs-tab-active-bg': attributes.tabActiveBackgroundColor || '#ffffff',
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

				<PanelBody title={ __( 'Main Title', 'zenctuary' ) }>
					<RangeControl label={ __( 'Heading Width', 'zenctuary' ) } value={ attributes.headingMaxWidth } onChange={ ( value ) => setAttributes( { headingMaxWidth: value } ) } min={ 320 } max={ 1200 } step={ 10 } />
					<RangeControl label={ __( 'Heading To Tabs Gap', 'zenctuary' ) } value={ attributes.headingTabsGap } onChange={ ( value ) => setAttributes( { headingTabsGap: value } ) } min={ 0 } max={ 120 } step={ 1 } />
					<RangeControl label={ __( 'Tabs To Navigation Gap', 'zenctuary' ) } value={ attributes.tabsNavGap } onChange={ ( value ) => setAttributes( { tabsNavGap: value } ) } min={ 0 } max={ 120 } step={ 1 } />
					<RangeControl label={ __( 'Navigation Top Gap', 'zenctuary' ) } value={ attributes.headerNavGap } onChange={ ( value ) => setAttributes( { headerNavGap: value } ) } min={ 0 } max={ 120 } step={ 1 } />
					<TextControl label={ __( 'Font Size', 'zenctuary' ) } value={ attributes.headingFontSize } onChange={ ( value ) => setAttributes( { headingFontSize: value } ) } />
					<TextControl label={ __( 'Font Weight', 'zenctuary' ) } value={ attributes.headingFontWeight } onChange={ ( value ) => setAttributes( { headingFontWeight: value } ) } />
					<TextControl label={ __( 'Line Height', 'zenctuary' ) } value={ attributes.headingLineHeight } onChange={ ( value ) => setAttributes( { headingLineHeight: value } ) } />
					<p className="components-base-control__label">{ __( 'Heading Color', 'zenctuary' ) }</p>
					<ColorPalette colors={ PRESET_COLORS } value={ attributes.headingColor } onChange={ ( value ) => setAttributes( { headingColor: value || '#171717' } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Carousel Settings', 'zenctuary' ) }>
					<RangeControl label={ __( 'Gap', 'zenctuary' ) } value={ attributes.gap } onChange={ ( value ) => setAttributes( { gap: value } ) } min={ 0 } max={ 60 } step={ 1 } />
					<RangeControl label={ __( 'Desktop Card Width (%)', 'zenctuary' ) } value={ attributes.cardWidthScaleDesktop } onChange={ ( value ) => setAttributes( { cardWidthScaleDesktop: value } ) } min={ 75 } max={ 100 } step={ 1 } />
					<RangeControl label={ __( 'Tablet Card Width (%)', 'zenctuary' ) } value={ attributes.cardWidthScaleTablet } onChange={ ( value ) => setAttributes( { cardWidthScaleTablet: value } ) } min={ 75 } max={ 100 } step={ 1 } />
					<RangeControl label={ __( 'Mobile Card Width (%)', 'zenctuary' ) } value={ attributes.cardWidthScaleMobile } onChange={ ( value ) => setAttributes( { cardWidthScaleMobile: value } ) } min={ 75 } max={ 100 } step={ 1 } />
					<RangeControl label={ __( 'Transition Speed', 'zenctuary' ) } value={ attributes.transitionSpeed } onChange={ ( value ) => setAttributes( { transitionSpeed: value } ) } min={ 250 } max={ 1200 } step={ 10 } />
					<ToggleControl label={ __( 'Loop Slides', 'zenctuary' ) } checked={ attributes.loop } onChange={ ( value ) => setAttributes( { loop: value } ) } />
					<ToggleControl label={ __( 'Autoplay', 'zenctuary' ) } checked={ attributes.autoplay } onChange={ ( value ) => setAttributes( { autoplay: value } ) } />
					{ attributes.autoplay && <RangeControl label={ __( 'Autoplay Delay', 'zenctuary' ) } value={ attributes.autoplayDelay } onChange={ ( value ) => setAttributes( { autoplayDelay: value } ) } min={ 1500 } max={ 12000 } step={ 100 } /> }
					<ToggleControl label={ __( 'Show Pagination Dots', 'zenctuary' ) } checked={ attributes.showPagination } onChange={ ( value ) => setAttributes( { showPagination: value } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Tabs', 'zenctuary' ) }>
					<ToggleControl label={ __( 'Enable Tabs', 'zenctuary' ) } checked={ attributes.enableTabs } onChange={ ( value ) => setAttributes( { enableTabs: value } ) } />
					<Button variant="secondary" onClick={ addTab }>{ __( 'Add Tab', 'zenctuary' ) }</Button>
					{ tabs.map( ( tab, index ) => (
						<div key={ tab.id } className="premium-tabs-carousel__tab-editor-row">
							<TextControl
								label={ `${ __( 'Tab', 'zenctuary' ) } ${ index + 1 }` }
								value={ tab.label }
								onChange={ ( value ) => updateTabs( tabs.map( ( currentTab, currentIndex ) => currentIndex === index ? { ...currentTab, label: value } : currentTab ) ) }
							/>
							<Button isDestructive onClick={ () => removeTab( index ) } disabled={ tabs.length === 1 }>{ __( 'Remove', 'zenctuary' ) }</Button>
						</div>
					) ) }
					<TextControl label={ __( 'Tab Font Size', 'zenctuary' ) } value={ attributes.tabFontSize } onChange={ ( value ) => setAttributes( { tabFontSize: value } ) } />
					<TextControl label={ __( 'Tab Font Weight', 'zenctuary' ) } value={ attributes.tabFontWeight } onChange={ ( value ) => setAttributes( { tabFontWeight: value } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Card Style', 'zenctuary' ) }>
					<RangeControl label={ __( 'Card Radius', 'zenctuary' ) } value={ attributes.cardBorderRadius } onChange={ ( value ) => setAttributes( { cardBorderRadius: value } ) } min={ 0 } max={ 48 } step={ 1 } />
					<RangeControl label={ __( 'Card Content Padding', 'zenctuary' ) } value={ attributes.cardContentPadding } onChange={ ( value ) => setAttributes( { cardContentPadding: value } ) } min={ 8 } max={ 64 } step={ 1 } />
				</PanelBody>

				<PanelBody title={ __( 'Card Typography', 'zenctuary' ) }>
					<TextControl label={ __( 'Title Font Size', 'zenctuary' ) } value={ attributes.cardTitleFontSize } onChange={ ( value ) => setAttributes( { cardTitleFontSize: value } ) } />
					<TextControl label={ __( 'Title Font Weight', 'zenctuary' ) } value={ attributes.cardTitleFontWeight } onChange={ ( value ) => setAttributes( { cardTitleFontWeight: value } ) } />
					<TextControl label={ __( 'Title Line Height', 'zenctuary' ) } value={ attributes.cardTitleLineHeight } onChange={ ( value ) => setAttributes( { cardTitleLineHeight: value } ) } />
					<TextControl label={ __( 'Body Font Size', 'zenctuary' ) } value={ attributes.cardBodyFontSize } onChange={ ( value ) => setAttributes( { cardBodyFontSize: value } ) } />
					<TextControl label={ __( 'Body Font Weight', 'zenctuary' ) } value={ attributes.cardBodyFontWeight } onChange={ ( value ) => setAttributes( { cardBodyFontWeight: value } ) } />
					<TextControl label={ __( 'Body Line Height', 'zenctuary' ) } value={ attributes.cardBodyLineHeight } onChange={ ( value ) => setAttributes( { cardBodyLineHeight: value } ) } />
					<ToggleControl label={ __( 'Uppercase Card Text', 'zenctuary' ) } checked={ attributes.cardTextUppercase } onChange={ ( value ) => setAttributes( { cardTextUppercase: value } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Button Style', 'zenctuary' ) }>
					<TextControl label={ __( 'Button Font Size', 'zenctuary' ) } value={ attributes.buttonFontSize } onChange={ ( value ) => setAttributes( { buttonFontSize: value } ) } />
					<TextControl label={ __( 'Button Font Weight', 'zenctuary' ) } value={ attributes.buttonFontWeight } onChange={ ( value ) => setAttributes( { buttonFontWeight: value } ) } />
					<TextControl label={ __( 'Button Line Height', 'zenctuary' ) } value={ attributes.buttonLineHeight } onChange={ ( value ) => setAttributes( { buttonLineHeight: value } ) } />
					<TextControl label={ __( 'Button Width', 'zenctuary' ) } value={ attributes.buttonWidth } onChange={ ( value ) => setAttributes( { buttonWidth: value } ) } />
					<p className="components-base-control__label">{ __( 'Button Text Color', 'zenctuary' ) }</p>
					<ColorPalette colors={ PRESET_COLORS } value={ attributes.buttonTextColor } onChange={ ( value ) => setAttributes( { buttonTextColor: value || '#ffffff' } ) } />
					<TextControl label={ __( 'Custom Button Text Color', 'zenctuary' ) } value={ attributes.buttonTextColor } onChange={ ( value ) => setAttributes( { buttonTextColor: value || '#ffffff' } ) } />
					<p className="components-base-control__label">{ __( 'Button Background Color', 'zenctuary' ) }</p>
					<ColorPalette colors={ PRESET_COLORS } value={ attributes.buttonBackgroundColor } onChange={ ( value ) => setAttributes( { buttonBackgroundColor: value || 'rgba(255, 255, 255, 0.16)' } ) } />
					<TextControl label={ __( 'Custom Button Background Color', 'zenctuary' ) } value={ attributes.buttonBackgroundColor } onChange={ ( value ) => setAttributes( { buttonBackgroundColor: value || 'rgba(255, 255, 255, 0.16)' } ) } />
					<p className="components-base-control__label">{ __( 'Button Border Color', 'zenctuary' ) }</p>
					<ColorPalette colors={ PRESET_COLORS } value={ attributes.buttonBorderColor } onChange={ ( value ) => setAttributes( { buttonBorderColor: value || 'rgba(255, 255, 255, 0.38)' } ) } />
					<TextControl label={ __( 'Custom Button Border Color', 'zenctuary' ) } value={ attributes.buttonBorderColor } onChange={ ( value ) => setAttributes( { buttonBorderColor: value || 'rgba(255, 255, 255, 0.38)' } ) } />
					<SpacingControls label={ __( 'Button Padding', 'zenctuary' ) } value={ attributes.buttonPadding } onChange={ ( value ) => setAttributes( { buttonPadding: value } ) } />
					<RangeControl label={ __( 'Button Border Width', 'zenctuary' ) } value={ attributes.buttonBorderWidth } onChange={ ( value ) => setAttributes( { buttonBorderWidth: value } ) } min={ 0 } max={ 10 } step={ 1 } />
					<TextControl label={ __( 'Button Border Radius', 'zenctuary' ) } value={ attributes.buttonBorderRadius } onChange={ ( value ) => setAttributes( { buttonBorderRadius: value } ) } />
					<ToggleControl label={ __( 'Show Button Icon', 'zenctuary' ) } checked={ attributes.buttonShowIcon } onChange={ ( value ) => setAttributes( { buttonShowIcon: value } ) } />
					<SelectControl label={ __( 'Button Icon Position', 'zenctuary' ) } value={ attributes.buttonIconPosition } options={ [ { label: __( 'Right', 'zenctuary' ), value: 'right' }, { label: __( 'Left', 'zenctuary' ), value: 'left' } ] } onChange={ ( value ) => setAttributes( { buttonIconPosition: value } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Navigation Style', 'zenctuary' ) }>
					<RangeControl label={ __( 'Button Size', 'zenctuary' ) } value={ attributes.navButtonSize } onChange={ ( value ) => setAttributes( { navButtonSize: value } ) } min={ 28 } max={ 96 } step={ 1 } />
					<RangeControl label={ __( 'Icon Size', 'zenctuary' ) } value={ attributes.navIconSize } onChange={ ( value ) => setAttributes( { navIconSize: value } ) } min={ 12 } max={ 40 } step={ 1 } />
					<RangeControl label={ __( 'Border Width', 'zenctuary' ) } value={ attributes.navBorderWidth } onChange={ ( value ) => setAttributes( { navBorderWidth: value } ) } min={ 0 } max={ 8 } step={ 1 } />
					<TextControl label={ __( 'Border Radius', 'zenctuary' ) } value={ attributes.navBorderRadius } onChange={ ( value ) => setAttributes( { navBorderRadius: value } ) } />
					<p className="components-base-control__label">{ __( 'Navigation Border Color', 'zenctuary' ) }</p>
					<ColorPalette colors={ PRESET_COLORS } value={ attributes.navBorderColor } onChange={ ( value ) => setAttributes( { navBorderColor: value || 'rgba(23, 23, 23, 0.16)' } ) } />
					<TextControl label={ __( 'Custom Navigation Border Color', 'zenctuary' ) } value={ attributes.navBorderColor } onChange={ ( value ) => setAttributes( { navBorderColor: value || 'rgba(23, 23, 23, 0.16)' } ) } />
					<p className="components-base-control__label">{ __( 'Navigation Background Color', 'zenctuary' ) }</p>
					<ColorPalette colors={ PRESET_COLORS } value={ attributes.navBackgroundColor } onChange={ ( value ) => setAttributes( { navBackgroundColor: value || 'rgba(255, 255, 255, 0.78)' } ) } />
					<TextControl label={ __( 'Custom Navigation Background Color', 'zenctuary' ) } value={ attributes.navBackgroundColor } onChange={ ( value ) => setAttributes( { navBackgroundColor: value || 'rgba(255, 255, 255, 0.78)' } ) } />
					<p className="components-base-control__label">{ __( 'Navigation Icon Color', 'zenctuary' ) }</p>
					<ColorPalette colors={ PRESET_COLORS } value={ attributes.navIconColor } onChange={ ( value ) => setAttributes( { navIconColor: value || '#171717' } ) } />
					<TextControl label={ __( 'Custom Navigation Icon Color', 'zenctuary' ) } value={ attributes.navIconColor } onChange={ ( value ) => setAttributes( { navIconColor: value || '#171717' } ) } />
					<SelectControl label={ __( 'Icon Set', 'zenctuary' ) } value={ attributes.navIconSet } options={ [ { label: __( 'Line Arrow', 'zenctuary' ), value: 'line-arrow' }, { label: __( 'Chevron', 'zenctuary' ), value: 'chevron' }, { label: __( 'Caret', 'zenctuary' ), value: 'caret' }, { label: __( 'Dashicons Arrow Alt2', 'zenctuary' ), value: 'dashicons-arrow-alt2' }, { label: __( 'Dashicons Controls', 'zenctuary' ), value: 'dashicons-controls' } ] } onChange={ ( value ) => setAttributes( { navIconSet: value } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Card Manager', 'zenctuary' ) }>
					<SelectControl
						label={ __( 'Selected Card', 'zenctuary' ) }
						value={ String( selectedCardIndex ) }
						options={ cards.map( ( card, index ) => ( { label: card.title || `${ __( 'Card', 'zenctuary' ) } ${ index + 1 }`, value: String( index ) } ) ) }
						onChange={ ( value ) => setSelectedCardIndex( Number( value ) ) }
					/>
					<div style={ { display: 'flex', gap: '8px' } }>
						<Button variant="secondary" onClick={ addCard }>{ __( 'Add Card', 'zenctuary' ) }</Button>
						<Button isDestructive onClick={ () => removeCard( selectedCardIndex ) } disabled={ cards.length === 1 }>{ __( 'Remove Card', 'zenctuary' ) }</Button>
					</div>
				</PanelBody>

				<PanelBody title={ __( 'Selected Card Content', 'zenctuary' ) }>
					{ attributes.enableTabs && (
						<BaseControl label={ __( 'Assigned Tabs', 'zenctuary' ) }>
							{ tabs.map( ( tab ) => (
								<CheckboxControl
									key={ tab.id }
									label={ tab.label }
									checked={ ( selectedCard?.tabIds || [ selectedCard?.tabId || activeTabId ] ).includes( tab.id ) }
									onChange={ ( checked ) => toggleCardTab( tab.id, checked ) }
								/>
							) ) }
						</BaseControl>
					) }
					<BaseControl label={ __( 'Card Image', 'zenctuary' ) }>
						<MediaUploadCheck>
							<MediaUpload
								onSelect={ ( media ) => updateCard( selectedCardIndex, { imageId: media?.id || 0, imageUrl: media?.url || '' } ) }
								allowedTypes={ [ 'image' ] }
								value={ selectedCard?.imageId }
								render={ ( { open } ) => (
									<Button variant="secondary" onClick={ open }>
										{ selectedCard?.imageUrl ? __( 'Replace Image', 'zenctuary' ) : __( 'Select Image', 'zenctuary' ) }
									</Button>
								) }
							/>
						</MediaUploadCheck>
					</BaseControl>
					<ToggleControl label={ __( 'Show Image Overlay', 'zenctuary' ) } checked={ selectedCard?.showOverlay !== false } onChange={ ( value ) => updateCard( selectedCardIndex, { showOverlay: value } ) } />
					{ selectedCard?.showOverlay !== false && (
						<>
							<TextControl label={ __( 'Overlay Color', 'zenctuary' ) } value={ selectedCard?.overlayColor } onChange={ ( value ) => updateCard( selectedCardIndex, { overlayColor: value } ) } />
							<RangeControl label={ __( 'Overlay Opacity', 'zenctuary' ) } value={ selectedCard?.overlayOpacity } onChange={ ( value ) => updateCard( selectedCardIndex, { overlayOpacity: value } ) } min={ 0 } max={ 1 } step={ 0.01 } />
						</>
					) }
					<RichText
						tagName="h3"
						value={ selectedCard?.title }
						onChange={ ( value ) => updateCard( selectedCardIndex, { title: value } ) }
						placeholder={ __( 'Card title', 'zenctuary' ) }
					/>
					<BaseControl label={ __( 'List Items', 'zenctuary' ) }>
						{ selectedCard?.items?.map( ( item, itemIndex ) => (
							<div key={ itemIndex } style={ { display: 'flex', gap: '8px', marginBottom: '8px' } }>
								<TextControl value={ item } onChange={ ( value ) => updateListItem( itemIndex, value ) } />
								<Button isDestructive onClick={ () => removeListItem( itemIndex ) }>{ __( 'Remove', 'zenctuary' ) }</Button>
							</div>
						) ) }
						<Button variant="secondary" onClick={ addListItem }>{ __( 'Add Item', 'zenctuary' ) }</Button>
					</BaseControl>
					<ToggleControl label={ __( 'Show Dots', 'zenctuary' ) } checked={ selectedCard?.showDots } onChange={ ( value ) => updateCard( selectedCardIndex, { showDots: value } ) } />
					{ selectedCard?.showDots && <TextControl label={ __( 'Dots Text', 'zenctuary' ) } value={ selectedCard?.dotsText } onChange={ ( value ) => updateCard( selectedCardIndex, { dotsText: value } ) } /> }
					<TextControl label={ __( 'Button Text', 'zenctuary' ) } value={ selectedCard?.buttonText } onChange={ ( value ) => updateCard( selectedCardIndex, { buttonText: value } ) } />
					<TextControl label={ __( 'Button URL', 'zenctuary' ) } value={ selectedCard?.buttonUrl } onChange={ ( value ) => updateCard( selectedCardIndex, { buttonUrl: value } ) } />
					<ToggleControl label={ __( 'Open In New Tab', 'zenctuary' ) } checked={ selectedCard?.openInNewTab } onChange={ ( value ) => updateCard( selectedCardIndex, { openInNewTab: value } ) } />
				</PanelBody>
			</InspectorControls>

			<section { ...blockProps }>
				<div className="premium-tabs-carousel__inner">
					<div className="premium-tabs-carousel__header">
						<div className="premium-tabs-carousel__copy">
							<RichText tagName="h2" className="premium-tabs-carousel__heading" value={ attributes.heading } onChange={ ( value ) => setAttributes( { heading: value } ) } placeholder={ __( 'Add heading', 'zenctuary' ) } />
							<RichText tagName="p" className="premium-tabs-carousel__subheading" value={ attributes.subheading } onChange={ ( value ) => setAttributes( { subheading: value } ) } placeholder={ __( 'Add subheading', 'zenctuary' ) } />
						</div>

						{ attributes.enableTabs && tabs.length > 0 && (
							<div className="premium-tabs-carousel__tabs">
								{ tabs.map( ( tab ) => (
									<button key={ tab.id } type="button" className={ `premium-tabs-carousel__tab${ tab.id === activeTabId ? ' is-active' : '' }` } onClick={ () => setSelectedTabId( tab.id ) }>
										{ tab.label }
									</button>
								) ) }
							</div>
						) }

						<div className="premium-tabs-carousel__nav">
							<button type="button" className="premium-tabs-carousel__arrow">{ navigationIcon( attributes.navIconSet, 'prev' ) }</button>
							<button type="button" className="premium-tabs-carousel__arrow">{ navigationIcon( attributes.navIconSet, 'next' ) }</button>
						</div>
					</div>

					<div className="premium-tabs-carousel__stage">
						<div className="premium-tabs-carousel__editor-track">
							{ visibleCards.map( ( { card, index } ) => (
								<div key={ index } className="premium-tabs-carousel__slide">
									<article className="premium-tabs-carousel__card" style={ {
										backgroundImage: card.imageUrl ? `url("${ card.imageUrl }")` : undefined,
										backgroundColor: ! card.imageUrl ? '#c8bfb2' : undefined,
									} }>
										{ card.showOverlay !== false && <div className="premium-tabs-carousel__overlay" style={ { backgroundColor: card.overlayColor, opacity: card.overlayOpacity } } /> }
										<div className="premium-tabs-carousel__card-content">
											<div className="premium-tabs-carousel__card-top">
												<RichText tagName="h3" className="premium-tabs-carousel__card-title" value={ card.title } onChange={ ( value ) => updateCard( index, { title: value } ) } placeholder={ __( 'Card title', 'zenctuary' ) } />
											</div>
											<div className="premium-tabs-carousel__card-bottom">
												<ul className="premium-tabs-carousel__card-items">
													{ card.items.map( ( item, itemIndex ) => <li key={ itemIndex }>{ item }</li> ) }
												</ul>
												{ card.showDots && <div className="premium-tabs-carousel__dots">{ card.dotsText || '...' }</div> }
												{ card.buttonText && (
													<span className={ `premium-tabs-carousel__button premium-tabs-carousel__button--icon-${ attributes.buttonIconPosition || 'right' }` }>
														{ attributes.buttonShowIcon && <span className="premium-tabs-carousel__button-icon">{ arrowIcon() }</span> }
														<span>{ card.buttonText }</span>
													</span>
												) }
											</div>
										</div>
									</article>
								</div>
							) ) }
						</div>
						{ attributes.showPagination && <div className="premium-tabs-carousel__pagination" /> }
					</div>
				</div>
			</section>
		</>
	);
}
