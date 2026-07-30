import { __ } from '@wordpress/i18n';
import { InspectorControls, MediaUpload, MediaUploadCheck, RichText, useBlockProps } from '@wordpress/block-editor';
import {
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
import { useEffect, useMemo, useState } from '@wordpress/element';

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

const makeId = ( prefix ) => `${ prefix }-${ Date.now() }-${ Math.floor( Math.random() * 1000 ) }`;
const createTab = () => ( { id: makeId( 'tab' ), label: 'New Tab' } );
const createFaq = ( tabId = '' ) => ( { id: makeId( 'faq' ), tabId, question: 'New question?', answer: 'Add the answer here.', defaultOpen: false } );

function ColorControl( { label, value, onChange } ) {
	return (
		<div className="zen-static-faqs-control">
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

function PlusIcon( { open } ) {
	return <span className="zen-static-faqs__icon" aria-hidden="true">{ open ? '-' : '+' }</span>;
}

function getVisibleTabs( tabs, faqs ) {
	return tabs.filter( ( tab ) => faqs.some( ( faq ) => faq.tabId === tab.id ) );
}

function BlockView( { attributes, setAttributes, activeTabId, setActiveTabId, selectedFaqId, setSelectedFaqId } ) {
	const tabs = Array.isArray( attributes.tabs ) ? attributes.tabs : [];
	const faqs = Array.isArray( attributes.faqs ) ? attributes.faqs : [];
	const visibleTabs = getVisibleTabs( tabs, faqs );
	const hasTabs = !! attributes.enableTabs && visibleTabs.length > 0;
	const currentTabId = hasTabs ? ( visibleTabs.some( ( tab ) => tab.id === activeTabId ) ? activeTabId : visibleTabs[ 0 ].id ) : '';
	const currentTab = visibleTabs.find( ( tab ) => tab.id === currentTabId );
	const visibleFaqs = hasTabs ? faqs.filter( ( faq ) => faq.tabId === currentTabId ) : faqs;
	const headingText = hasTabs && currentTab ? currentTab.label : attributes.faqHeading;

	const blockProps = useBlockProps( {
		className: 'zen-static-faqs',
		style: {
			'--zen-static-faqs-section-bg': attributes.sectionBackgroundColor,
			'--zen-static-faqs-content-width': attributes.contentMaxWidth,
			'--zen-static-faqs-base-min-height': attributes.baseMinHeight,
			'--zen-static-faqs-left-width': attributes.leftColumnWidth,
			'--zen-static-faqs-left-bg': attributes.leftBackgroundColor,
			'--zen-static-faqs-right-bg': attributes.rightBackgroundColor,
			'--zen-static-faqs-image-position': attributes.rightImagePosition,
			'--zen-static-faqs-image-overlay': attributes.rightImageOverlayColor,
			'--zen-static-faqs-image-overlay-opacity': attributes.rightImageOverlayOpacity,
			'--zen-static-faqs-panel-width': attributes.panelWidth,
			'--zen-static-faqs-panel-top': attributes.panelOffsetTop,
			'--zen-static-faqs-panel-right': attributes.panelOffsetRight,
			'--zen-static-faqs-panel-bottom': attributes.panelOffsetBottom,
			'--zen-static-faqs-panel-left': attributes.panelOffsetLeft,
			'--zen-static-faqs-panel-pt': attributes.panelPaddingTop,
			'--zen-static-faqs-panel-pr': attributes.panelPaddingRight,
			'--zen-static-faqs-panel-pb': attributes.panelPaddingBottom,
			'--zen-static-faqs-panel-pl': attributes.panelPaddingLeft,
			'--zen-static-faqs-eyebrow-mb': attributes.eyebrowMarginBottom,
			'--zen-static-faqs-tabs-gap': `${ attributes.tabsGap }px`,
			'--zen-static-faqs-tabs-mb': attributes.tabsMarginBottom,
			'--zen-static-faqs-tab-bg': attributes.tabBackgroundColor,
			'--zen-static-faqs-tab-active-bg': attributes.tabActiveBackgroundColor,
			'--zen-static-faqs-tab-active-color': attributes.tabActiveColor,
			'--zen-static-faqs-tab-border': attributes.tabBorderColor,
			'--zen-static-faqs-tab-active-border': attributes.tabActiveBorderColor,
			'--zen-static-faqs-tab-border-width': `${ attributes.tabBorderWidth }px`,
			'--zen-static-faqs-tab-radius': attributes.tabBorderRadius,
			'--zen-static-faqs-tab-pt': attributes.tabPaddingTop,
			'--zen-static-faqs-tab-pr': attributes.tabPaddingRight,
			'--zen-static-faqs-tab-pb': attributes.tabPaddingBottom,
			'--zen-static-faqs-tab-pl': attributes.tabPaddingLeft,
			'--zen-static-faqs-faq-heading-mb': attributes.faqHeadingMarginBottom,
			'--zen-static-faqs-gap': `${ attributes.faqGap }px`,
			'--zen-static-faqs-card-bg': attributes.faqBackgroundColor,
			'--zen-static-faqs-card-border': attributes.faqBorderColor,
			'--zen-static-faqs-card-border-width': `${ attributes.faqBorderWidth }px`,
			'--zen-static-faqs-card-radius': attributes.faqBorderRadius,
			'--zen-static-faqs-card-pt': attributes.faqPaddingTop,
			'--zen-static-faqs-card-pr': attributes.faqPaddingRight,
			'--zen-static-faqs-card-pb': attributes.faqPaddingBottom,
			'--zen-static-faqs-card-pl': attributes.faqPaddingLeft,
			'--zen-static-faqs-answer-spacing': attributes.faqAnswerSpacing,
			'--zen-static-faqs-icon-size': `${ attributes.iconSize }px`,
			'--zen-static-faqs-icon-color': attributes.iconColor,
			paddingTop: attributes.sectionPaddingTop,
			paddingRight: attributes.sectionPaddingRight,
			paddingBottom: attributes.sectionPaddingBottom,
			paddingLeft: attributes.sectionPaddingLeft,
		},
	} );

	const updateFaq = ( faqId, patch ) => setAttributes( { faqs: faqs.map( ( faq ) => faq.id === faqId ? { ...faq, ...patch } : faq ) } );

	return (
		<section { ...blockProps }>
			<div className="zen-static-faqs__stage">
				<div className="zen-static-faqs__base" aria-hidden="true">
					<div className="zen-static-faqs__base-left" />
					<div className="zen-static-faqs__base-right">
						{ attributes.rightImageUrl ? <img className="zen-static-faqs__image" src={ attributes.rightImageUrl } alt={ attributes.rightImageAlt || '' } /> : <div className="zen-static-faqs__image zen-static-faqs__image--placeholder" /> }
						<span className="zen-static-faqs__image-overlay" />
					</div>
				</div>
				<div className="zen-static-faqs__panel-layer">
					<div className="zen-static-faqs__panel">
						<RichText tagName="h2" className="zen-static-faqs__eyebrow" value={ attributes.eyebrow } onChange={ ( eyebrow ) => setAttributes( { eyebrow } ) } style={ { ...textStyle( attributes, 'eyebrow' ), whiteSpace: attributes.eyebrowWrap ? 'normal' : 'nowrap' } } allowedFormats={ [ 'core/bold', 'core/italic' ] } />
						{ hasTabs && (
							<div className="zen-static-faqs__tabs" role="tablist" aria-label={ __( 'FAQ categories', 'zenctuary' ) }>
								{ visibleTabs.map( ( tab ) => (
									<button key={ tab.id } type="button" className={ `zen-static-faqs__tab${ tab.id === currentTabId ? ' is-active' : '' }` } onClick={ () => setActiveTabId( tab.id ) } style={ textStyle( attributes, 'tab' ) }>
										{ tab.label }
									</button>
								) ) }
							</div>
						) }
						<RichText tagName="h3" className="zen-static-faqs__heading" value={ headingText } onChange={ ( faqHeading ) => ! hasTabs && setAttributes( { faqHeading } ) } style={ { ...textStyle( attributes, 'faqHeading' ), whiteSpace: attributes.faqHeadingWrap ? 'normal' : 'nowrap' } } allowedFormats={ [ 'core/bold', 'core/italic' ] } />
						<div className="zen-static-faqs__items">
							{ visibleFaqs.map( ( faq ) => {
								const open = !! faq.defaultOpen || selectedFaqId === faq.id;
								return (
									<article key={ faq.id } className={ `zen-static-faqs__item${ open ? ' is-open' : '' }` } onClick={ () => setSelectedFaqId( faq.id ) }>
										<div className="zen-static-faqs__question-row">
											<RichText tagName="div" className="zen-static-faqs__question" value={ faq.question } onChange={ ( question ) => updateFaq( faq.id, { question } ) } style={ textStyle( attributes, 'faqQuestion' ) } allowedFormats={ [ 'core/bold', 'core/italic' ] } />
											<PlusIcon open={ open } />
										</div>
										{ open && <RichText tagName="div" className="zen-static-faqs__answer" value={ faq.answer } onChange={ ( answer ) => updateFaq( faq.id, { answer } ) } style={ textStyle( attributes, 'faqAnswer' ) } allowedFormats={ [ 'core/bold', 'core/italic', 'core/link' ] } /> }
									</article>
								);
							} ) }
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const tabs = Array.isArray( attributes.tabs ) ? attributes.tabs : [];
	const faqs = Array.isArray( attributes.faqs ) ? attributes.faqs : [];
	const visibleTabs = useMemo( () => getVisibleTabs( tabs, faqs ), [ tabs, faqs ] );
	const [ activeTabId, setActiveTabId ] = useState( visibleTabs[ 0 ]?.id || '' );
	const [ selectedTabIndex, setSelectedTabIndex ] = useState( 0 );
	const [ selectedFaqIndex, setSelectedFaqIndex ] = useState( 0 );
	const selectedTab = tabs[ selectedTabIndex ];
	const selectedFaq = faqs[ selectedFaqIndex ];
	const selectedFaqId = selectedFaq?.id || '';
	const tabOptions = tabs.map( ( tab ) => ( { label: tab.label || tab.id, value: tab.id } ) );

	const updateTab = ( index, patch ) => setAttributes( { tabs: tabs.map( ( tab, tabIndex ) => tabIndex === index ? { ...tab, ...patch } : tab ) } );
	const updateFaq = ( index, patch ) => setAttributes( { faqs: faqs.map( ( faq, faqIndex ) => faqIndex === index ? { ...faq, ...patch } : faq ) } );
	const moveTab = ( amount ) => {
		const nextIndex = selectedTabIndex + amount;
		if ( nextIndex < 0 || nextIndex >= tabs.length ) return;
		const nextTabs = [ ...tabs ];
		const [ tab ] = nextTabs.splice( selectedTabIndex, 1 );
		nextTabs.splice( nextIndex, 0, tab );
		setAttributes( { tabs: nextTabs } );
		setSelectedTabIndex( nextIndex );
	};
	const moveFaq = ( amount ) => {
		const nextIndex = selectedFaqIndex + amount;
		if ( nextIndex < 0 || nextIndex >= faqs.length ) return;
		const nextFaqs = [ ...faqs ];
		const [ faq ] = nextFaqs.splice( selectedFaqIndex, 1 );
		nextFaqs.splice( nextIndex, 0, faq );
		setAttributes( { faqs: nextFaqs } );
		setSelectedFaqIndex( nextIndex );
	};

	useEffect( () => {
		if ( visibleTabs.length && ! visibleTabs.some( ( tab ) => tab.id === activeTabId ) ) {
			setActiveTabId( visibleTabs[ 0 ].id );
		}
	}, [ visibleTabs, activeTabId ] );
	useEffect( () => {
		if ( selectedTabIndex > tabs.length - 1 ) setSelectedTabIndex( Math.max( tabs.length - 1, 0 ) );
	}, [ tabs.length, selectedTabIndex ] );
	useEffect( () => {
		if ( selectedFaqIndex > faqs.length - 1 ) setSelectedFaqIndex( Math.max( faqs.length - 1, 0 ) );
	}, [ faqs.length, selectedFaqIndex ] );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Base layout', 'zenctuary' ) } initialOpen>
					<ColorControl label={ __( 'Section background', 'zenctuary' ) } value={ attributes.sectionBackgroundColor } onChange={ ( sectionBackgroundColor ) => setAttributes( { sectionBackgroundColor: sectionBackgroundColor || '#3f3d3d' } ) } />
					<UnitControl label={ __( 'Top padding', 'zenctuary' ) } value={ attributes.sectionPaddingTop } onChange={ ( sectionPaddingTop ) => setAttributes( { sectionPaddingTop: sectionPaddingTop || '0px' } ) } />
					<UnitControl label={ __( 'Right padding', 'zenctuary' ) } value={ attributes.sectionPaddingRight } onChange={ ( sectionPaddingRight ) => setAttributes( { sectionPaddingRight: sectionPaddingRight || '0px' } ) } />
					<UnitControl label={ __( 'Bottom padding', 'zenctuary' ) } value={ attributes.sectionPaddingBottom } onChange={ ( sectionPaddingBottom ) => setAttributes( { sectionPaddingBottom: sectionPaddingBottom || '0px' } ) } />
					<UnitControl label={ __( 'Left padding', 'zenctuary' ) } value={ attributes.sectionPaddingLeft } onChange={ ( sectionPaddingLeft ) => setAttributes( { sectionPaddingLeft: sectionPaddingLeft || '0px' } ) } />
					<UnitControl label={ __( 'Content max width', 'zenctuary' ) } value={ attributes.contentMaxWidth } onChange={ ( contentMaxWidth ) => setAttributes( { contentMaxWidth: contentMaxWidth || '100%' } ) } />
					<UnitControl label={ __( 'Base min height', 'zenctuary' ) } value={ attributes.baseMinHeight } onChange={ ( baseMinHeight ) => setAttributes( { baseMinHeight: baseMinHeight || '0px' } ) } />
					<UnitControl label={ __( 'Left column width', 'zenctuary' ) } value={ attributes.leftColumnWidth } onChange={ ( leftColumnWidth ) => setAttributes( { leftColumnWidth: leftColumnWidth || '50%' } ) } />
					<ColorControl label={ __( 'Left background', 'zenctuary' ) } value={ attributes.leftBackgroundColor } onChange={ ( leftBackgroundColor ) => setAttributes( { leftBackgroundColor: leftBackgroundColor || '#3f3d3d' } ) } />
					<ColorControl label={ __( 'Right background', 'zenctuary' ) } value={ attributes.rightBackgroundColor } onChange={ ( rightBackgroundColor ) => setAttributes( { rightBackgroundColor: rightBackgroundColor || '#2f2f2f' } ) } />
				</PanelBody>
				<PanelBody title={ __( 'Right image', 'zenctuary' ) } initialOpen={ false }>
					<MediaUploadCheck>
						<MediaUpload allowedTypes={ [ 'image' ] } value={ attributes.rightImageId || 0 } onSelect={ ( media ) => setAttributes( { rightImageId: media?.id || 0, rightImageUrl: media?.url || '', rightImageAlt: media?.alt || media?.title || '' } ) } render={ ( { open } ) => <Button variant="secondary" onClick={ open }>{ attributes.rightImageUrl ? __( 'Replace right image', 'zenctuary' ) : __( 'Select right image', 'zenctuary' ) }</Button> } />
					</MediaUploadCheck>
					{ attributes.rightImageUrl && <TextControl label={ __( 'Image alt text', 'zenctuary' ) } value={ attributes.rightImageAlt || '' } onChange={ ( rightImageAlt ) => setAttributes( { rightImageAlt } ) } /> }
					{ attributes.rightImageUrl && <Button variant="link" isDestructive onClick={ () => setAttributes( { rightImageId: 0, rightImageUrl: '', rightImageAlt: '' } ) }>{ __( 'Remove image', 'zenctuary' ) }</Button> }
					<TextControl label={ __( 'Image object position', 'zenctuary' ) } value={ attributes.rightImagePosition } onChange={ ( rightImagePosition ) => setAttributes( { rightImagePosition } ) } help={ __( 'Example: center center, 50% 20%, right center.', 'zenctuary' ) } />
					<ColorControl label={ __( 'Image overlay color', 'zenctuary' ) } value={ attributes.rightImageOverlayColor } onChange={ ( rightImageOverlayColor ) => setAttributes( { rightImageOverlayColor: rightImageOverlayColor || '#000000' } ) } />
					<RangeControl label={ __( 'Image overlay opacity', 'zenctuary' ) } value={ attributes.rightImageOverlayOpacity } onChange={ ( rightImageOverlayOpacity ) => setAttributes( { rightImageOverlayOpacity } ) } min={ 0 } max={ 0.85 } step={ 0.05 } />
				</PanelBody>
				<PanelBody title={ __( 'Overlap panel position', 'zenctuary' ) } initialOpen>
					<UnitControl label={ __( 'Panel width', 'zenctuary' ) } value={ attributes.panelWidth } onChange={ ( panelWidth ) => setAttributes( { panelWidth: panelWidth || '760px' } ) } />
					<UnitControl label={ __( 'Top offset', 'zenctuary' ) } value={ attributes.panelOffsetTop } onChange={ ( panelOffsetTop ) => setAttributes( { panelOffsetTop: panelOffsetTop || '0px' } ) } />
					<UnitControl label={ __( 'Right offset', 'zenctuary' ) } value={ attributes.panelOffsetRight } onChange={ ( panelOffsetRight ) => setAttributes( { panelOffsetRight: panelOffsetRight || 'auto' } ) } />
					<UnitControl label={ __( 'Bottom offset', 'zenctuary' ) } value={ attributes.panelOffsetBottom } onChange={ ( panelOffsetBottom ) => setAttributes( { panelOffsetBottom: panelOffsetBottom || '0px' } ) } />
					<UnitControl label={ __( 'Left offset', 'zenctuary' ) } value={ attributes.panelOffsetLeft } onChange={ ( panelOffsetLeft ) => setAttributes( { panelOffsetLeft: panelOffsetLeft || '0px' } ) } />
					<UnitControl label={ __( 'Panel padding top', 'zenctuary' ) } value={ attributes.panelPaddingTop } onChange={ ( panelPaddingTop ) => setAttributes( { panelPaddingTop: panelPaddingTop || '0px' } ) } />
					<UnitControl label={ __( 'Panel padding right', 'zenctuary' ) } value={ attributes.panelPaddingRight } onChange={ ( panelPaddingRight ) => setAttributes( { panelPaddingRight: panelPaddingRight || '0px' } ) } />
					<UnitControl label={ __( 'Panel padding bottom', 'zenctuary' ) } value={ attributes.panelPaddingBottom } onChange={ ( panelPaddingBottom ) => setAttributes( { panelPaddingBottom: panelPaddingBottom || '0px' } ) } />
					<UnitControl label={ __( 'Panel padding left', 'zenctuary' ) } value={ attributes.panelPaddingLeft } onChange={ ( panelPaddingLeft ) => setAttributes( { panelPaddingLeft: panelPaddingLeft || '0px' } ) } />
				</PanelBody>
				<TypographyControls title={ __( 'FAQ categories heading typography', 'zenctuary' ) } prefix="eyebrow" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#d8b354" />
				<PanelBody title={ __( 'FAQ categories heading layout', 'zenctuary' ) } initialOpen={ false }>
					<ToggleControl label={ __( 'Allow heading to wrap', 'zenctuary' ) } checked={ !! attributes.eyebrowWrap } onChange={ ( eyebrowWrap ) => setAttributes( { eyebrowWrap } ) } />
					<UnitControl label={ __( 'Bottom spacing', 'zenctuary' ) } value={ attributes.eyebrowMarginBottom } onChange={ ( eyebrowMarginBottom ) => setAttributes( { eyebrowMarginBottom: eyebrowMarginBottom || '0px' } ) } />
				</PanelBody>
				<PanelBody title={ __( 'Tabs', 'zenctuary' ) } initialOpen>
					<ToggleControl label={ __( 'Enable tabs/categories', 'zenctuary' ) } checked={ !! attributes.enableTabs } onChange={ ( enableTabs ) => setAttributes( { enableTabs } ) } />
					<SelectControl label={ __( 'Selected tab', 'zenctuary' ) } value={ selectedTabIndex } options={ tabs.map( ( tab, index ) => ( { label: `${ index + 1 }. ${ tab.label || 'Tab' }`, value: index } ) ) } onChange={ ( value ) => setSelectedTabIndex( Number( value ) ) } />
					{ selectedTab && <TextControl label={ __( 'Tab label', 'zenctuary' ) } value={ selectedTab.label || '' } onChange={ ( label ) => updateTab( selectedTabIndex, { label } ) } /> }
					<div className="zen-static-faqs-actions">
						<Button variant="secondary" onClick={ () => moveTab( -1 ) } disabled={ selectedTabIndex <= 0 }>{ __( 'Move up', 'zenctuary' ) }</Button>
						<Button variant="secondary" onClick={ () => moveTab( 1 ) } disabled={ selectedTabIndex >= tabs.length - 1 }>{ __( 'Move down', 'zenctuary' ) }</Button>
						<Button variant="tertiary" isDestructive onClick={ () => { if ( tabs.length <= 1 ) return; const removedId = selectedTab?.id; setAttributes( { tabs: tabs.filter( ( tab, index ) => index !== selectedTabIndex ), faqs: faqs.map( ( faq ) => faq.tabId === removedId ? { ...faq, tabId: '' } : faq ) } ); setSelectedTabIndex( Math.max( selectedTabIndex - 1, 0 ) ); } } disabled={ tabs.length <= 1 }>{ __( 'Remove', 'zenctuary' ) }</Button>
					</div>
					<Button variant="primary" onClick={ () => { setAttributes( { tabs: [ ...tabs, createTab() ] } ); setSelectedTabIndex( tabs.length ); } }>{ __( 'Add tab', 'zenctuary' ) }</Button>
				</PanelBody>
				<TypographyControls title={ __( 'Tab typography', 'zenctuary' ) } prefix="tab" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#f1eee7" />
				<PanelBody title={ __( 'Tab style', 'zenctuary' ) } initialOpen={ false }>
					<ColorControl label={ __( 'Text active color', 'zenctuary' ) } value={ attributes.tabActiveColor } onChange={ ( tabActiveColor ) => setAttributes( { tabActiveColor: tabActiveColor || '#3f3d3d' } ) } />
					<ColorControl label={ __( 'Background', 'zenctuary' ) } value={ attributes.tabBackgroundColor } onChange={ ( tabBackgroundColor ) => setAttributes( { tabBackgroundColor: tabBackgroundColor || 'transparent' } ) } />
					<ColorControl label={ __( 'Active background', 'zenctuary' ) } value={ attributes.tabActiveBackgroundColor } onChange={ ( tabActiveBackgroundColor ) => setAttributes( { tabActiveBackgroundColor: tabActiveBackgroundColor || '#d8b354' } ) } />
					<ColorControl label={ __( 'Border', 'zenctuary' ) } value={ attributes.tabBorderColor } onChange={ ( tabBorderColor ) => setAttributes( { tabBorderColor: tabBorderColor || 'rgba(241, 238, 231, 0.72)' } ) } />
					<ColorControl label={ __( 'Active border', 'zenctuary' ) } value={ attributes.tabActiveBorderColor } onChange={ ( tabActiveBorderColor ) => setAttributes( { tabActiveBorderColor: tabActiveBorderColor || '#d8b354' } ) } />
					<RangeControl label={ __( 'Tabs gap', 'zenctuary' ) } value={ attributes.tabsGap } onChange={ ( tabsGap ) => setAttributes( { tabsGap } ) } min={ 0 } max={ 40 } />
					<UnitControl label={ __( 'Tabs bottom spacing', 'zenctuary' ) } value={ attributes.tabsMarginBottom } onChange={ ( tabsMarginBottom ) => setAttributes( { tabsMarginBottom: tabsMarginBottom || '0px' } ) } />
					<RangeControl label={ __( 'Border width', 'zenctuary' ) } value={ attributes.tabBorderWidth } onChange={ ( tabBorderWidth ) => setAttributes( { tabBorderWidth } ) } min={ 0 } max={ 8 } />
					<UnitControl label={ __( 'Border radius', 'zenctuary' ) } value={ attributes.tabBorderRadius } onChange={ ( tabBorderRadius ) => setAttributes( { tabBorderRadius: tabBorderRadius || '0px' } ) } />
					<UnitControl label={ __( 'Padding top', 'zenctuary' ) } value={ attributes.tabPaddingTop } onChange={ ( tabPaddingTop ) => setAttributes( { tabPaddingTop: tabPaddingTop || '0px' } ) } />
					<UnitControl label={ __( 'Padding right', 'zenctuary' ) } value={ attributes.tabPaddingRight } onChange={ ( tabPaddingRight ) => setAttributes( { tabPaddingRight: tabPaddingRight || '0px' } ) } />
					<UnitControl label={ __( 'Padding bottom', 'zenctuary' ) } value={ attributes.tabPaddingBottom } onChange={ ( tabPaddingBottom ) => setAttributes( { tabPaddingBottom: tabPaddingBottom || '0px' } ) } />
					<UnitControl label={ __( 'Padding left', 'zenctuary' ) } value={ attributes.tabPaddingLeft } onChange={ ( tabPaddingLeft ) => setAttributes( { tabPaddingLeft: tabPaddingLeft || '0px' } ) } />
				</PanelBody>
				<TypographyControls title={ __( 'FAQs heading typography', 'zenctuary' ) } prefix="faqHeading" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#d8b354" />
				<PanelBody title={ __( 'FAQs heading layout', 'zenctuary' ) } initialOpen={ false }>
					<ToggleControl label={ __( 'Allow heading to wrap', 'zenctuary' ) } checked={ !! attributes.faqHeadingWrap } onChange={ ( faqHeadingWrap ) => setAttributes( { faqHeadingWrap } ) } />
					<UnitControl label={ __( 'Bottom spacing', 'zenctuary' ) } value={ attributes.faqHeadingMarginBottom } onChange={ ( faqHeadingMarginBottom ) => setAttributes( { faqHeadingMarginBottom: faqHeadingMarginBottom || '0px' } ) } />
				</PanelBody>
				<PanelBody title={ __( 'FAQs', 'zenctuary' ) } initialOpen>
					<SelectControl label={ __( 'Selected FAQ', 'zenctuary' ) } value={ selectedFaqIndex } options={ faqs.map( ( faq, index ) => ( { label: `${ index + 1 }. ${ faq.question || 'FAQ' }`, value: index } ) ) } onChange={ ( value ) => setSelectedFaqIndex( Number( value ) ) } />
					{ selectedFaq && (
						<>
							{ attributes.enableTabs && tabs.length > 0 && <SelectControl label={ __( 'Assign to tab', 'zenctuary' ) } value={ selectedFaq.tabId || '' } options={ [ { label: __( 'No tab', 'zenctuary' ), value: '' }, ...tabOptions ] } onChange={ ( tabId ) => updateFaq( selectedFaqIndex, { tabId } ) } /> }
							<TextControl label={ __( 'Question', 'zenctuary' ) } value={ selectedFaq.question || '' } onChange={ ( question ) => updateFaq( selectedFaqIndex, { question } ) } />
							<TextareaControl label={ __( 'Answer', 'zenctuary' ) } value={ selectedFaq.answer || '' } onChange={ ( answer ) => updateFaq( selectedFaqIndex, { answer } ) } />
							<ToggleControl label={ __( 'Open by default', 'zenctuary' ) } checked={ !! selectedFaq.defaultOpen } onChange={ ( defaultOpen ) => updateFaq( selectedFaqIndex, { defaultOpen } ) } />
						</>
					) }
					<div className="zen-static-faqs-actions">
						<Button variant="secondary" onClick={ () => moveFaq( -1 ) } disabled={ selectedFaqIndex <= 0 }>{ __( 'Move up', 'zenctuary' ) }</Button>
						<Button variant="secondary" onClick={ () => moveFaq( 1 ) } disabled={ selectedFaqIndex >= faqs.length - 1 }>{ __( 'Move down', 'zenctuary' ) }</Button>
						<Button variant="tertiary" isDestructive onClick={ () => { if ( faqs.length <= 1 ) return; setAttributes( { faqs: faqs.filter( ( faq, index ) => index !== selectedFaqIndex ) } ); setSelectedFaqIndex( Math.max( selectedFaqIndex - 1, 0 ) ); } } disabled={ faqs.length <= 1 }>{ __( 'Remove', 'zenctuary' ) }</Button>
					</div>
					<Button variant="primary" onClick={ () => { const tabId = attributes.enableTabs ? ( activeTabId || tabs[ 0 ]?.id || '' ) : ''; setAttributes( { faqs: [ ...faqs, createFaq( tabId ) ] } ); setSelectedFaqIndex( faqs.length ); } }>{ __( 'Add FAQ', 'zenctuary' ) }</Button>
				</PanelBody>
				<PanelBody title={ __( 'FAQ item style', 'zenctuary' ) } initialOpen={ false }>
					<RangeControl label={ __( 'FAQ gap', 'zenctuary' ) } value={ attributes.faqGap } onChange={ ( faqGap ) => setAttributes( { faqGap } ) } min={ 0 } max={ 60 } />
					<ColorControl label={ __( 'FAQ background', 'zenctuary' ) } value={ attributes.faqBackgroundColor } onChange={ ( faqBackgroundColor ) => setAttributes( { faqBackgroundColor: faqBackgroundColor || '#3f3d3d' } ) } />
					<ColorControl label={ __( 'FAQ border', 'zenctuary' ) } value={ attributes.faqBorderColor } onChange={ ( faqBorderColor ) => setAttributes( { faqBorderColor: faqBorderColor || 'rgba(241, 238, 231, 0.48)' } ) } />
					<RangeControl label={ __( 'Border width', 'zenctuary' ) } value={ attributes.faqBorderWidth } onChange={ ( faqBorderWidth ) => setAttributes( { faqBorderWidth } ) } min={ 0 } max={ 8 } />
					<UnitControl label={ __( 'Border radius', 'zenctuary' ) } value={ attributes.faqBorderRadius } onChange={ ( faqBorderRadius ) => setAttributes( { faqBorderRadius: faqBorderRadius || '0px' } ) } />
					<UnitControl label={ __( 'Padding top', 'zenctuary' ) } value={ attributes.faqPaddingTop } onChange={ ( faqPaddingTop ) => setAttributes( { faqPaddingTop: faqPaddingTop || '0px' } ) } />
					<UnitControl label={ __( 'Padding right', 'zenctuary' ) } value={ attributes.faqPaddingRight } onChange={ ( faqPaddingRight ) => setAttributes( { faqPaddingRight: faqPaddingRight || '0px' } ) } />
					<UnitControl label={ __( 'Padding bottom', 'zenctuary' ) } value={ attributes.faqPaddingBottom } onChange={ ( faqPaddingBottom ) => setAttributes( { faqPaddingBottom: faqPaddingBottom || '0px' } ) } />
					<UnitControl label={ __( 'Padding left', 'zenctuary' ) } value={ attributes.faqPaddingLeft } onChange={ ( faqPaddingLeft ) => setAttributes( { faqPaddingLeft: faqPaddingLeft || '0px' } ) } />
					<UnitControl label={ __( 'Answer top spacing', 'zenctuary' ) } value={ attributes.faqAnswerSpacing } onChange={ ( faqAnswerSpacing ) => setAttributes( { faqAnswerSpacing: faqAnswerSpacing || '0px' } ) } />
				</PanelBody>
				<TypographyControls title={ __( 'FAQ question typography', 'zenctuary' ) } prefix="faqQuestion" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#f1eee7" />
				<TypographyControls title={ __( 'FAQ answer typography', 'zenctuary' ) } prefix="faqAnswer" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#f1eee7" />
				<PanelBody title={ __( 'FAQ icon', 'zenctuary' ) } initialOpen={ false }>
					<RangeControl label={ __( 'Icon size', 'zenctuary' ) } value={ attributes.iconSize } onChange={ ( iconSize ) => setAttributes( { iconSize } ) } min={ 12 } max={ 70 } />
					<ColorControl label={ __( 'Icon color', 'zenctuary' ) } value={ attributes.iconColor } onChange={ ( iconColor ) => setAttributes( { iconColor: iconColor || '#f1eee7' } ) } />
				</PanelBody>
			</InspectorControls>
			<BlockView attributes={ attributes } setAttributes={ setAttributes } activeTabId={ activeTabId } setActiveTabId={ setActiveTabId } selectedFaqId={ selectedFaqId } setSelectedFaqId={ ( faqId ) => { const index = faqs.findIndex( ( faq ) => faq.id === faqId ); setSelectedFaqIndex( Math.max( index, 0 ) ); } } />
		</>
	);
}