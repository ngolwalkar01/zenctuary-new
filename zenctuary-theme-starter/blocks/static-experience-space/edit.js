import { __ } from '@wordpress/i18n';
import { InspectorControls, MediaUpload, MediaUploadCheck, RichText, useBlockProps } from '@wordpress/block-editor';
import { Button, ColorPalette, PanelBody, RangeControl, SelectControl, TextControl, TextareaControl, ToggleControl, __experimentalUnitControl as UnitControl } from '@wordpress/components';
import { useMemo, useState } from '@wordpress/element';

const COLORS = [
	{ name: 'Gold', color: '#d8b354' },
	{ name: 'Charcoal', color: '#3f3d3d' },
	{ name: 'Cream', color: '#f6f2ea' },
	{ name: 'White', color: '#ffffff' },
	{ name: 'Black', color: '#000000' },
];
const FONTS = [
	{ label: 'Montserrat', value: 'var(--wp--preset--font-family--montserrat)' },
	{ label: 'DM Sans', value: 'var(--wp--preset--font-family--dm-sans)' },
	{ label: 'Theme default', value: '' },
];
const WEIGHTS = [ '300', '400', '500', '600', '700', '800', '900' ].map( ( value ) => ( { label: value, value } ) );
const TYPE_OPTIONS = [ { label: 'Experience 1', value: 'experience-1' }, { label: 'Experience 2', value: 'experience-2' } ];
const id = ( prefix ) => `${ prefix }-${ Date.now() }-${ Math.floor( Math.random() * 9999 ) }`;
const clone = ( value ) => JSON.parse( JSON.stringify( value ) );

const newCard = ( type = 'experience-1' ) => ( {
	id: id( 'class' ), type, hidden: false, imageId: 0, imageUrl: '', imageAlt: '', zencoins: '5',
	title: 'NEW CLASS', difficulty: 'Beginner Friendly', time: '60 min', description: 'Add class description here.', whatToExpect: 'Add what to expect content here.',
	buttonText: 'Book now', buttonUrl: '#', buttonOpenInNewTab: false,
} );
const newActivity = () => ( { id: id( 'activity' ), title: 'NEW ACTIVITY', cards: [ newCard() ] } );
const newSpace = () => ( { id: id( 'space' ), title: 'NEW SPACE', iconId: 0, iconUrl: '', iconAlt: '', description: 'Add space description here.', activities: [ newActivity() ] } );
const normSpaces = ( spaces ) => Array.isArray( spaces ) && spaces.length ? spaces : [ newSpace() ];
const allCards = ( spaces ) => normSpaces( spaces ).flatMap( ( space, spaceIndex ) => ( space.activities || [] ).flatMap( ( activity, activityIndex ) => ( activity.cards || [] ).map( ( card, cardIndex ) => ( { card, spaceIndex, activityIndex, cardIndex } ) ) ) );
const textStyle = ( a, p ) => ( { fontFamily: a[ `${ p }FontFamily` ] || undefined, fontSize: a[ `${ p }FontSize` ] || undefined, fontWeight: a[ `${ p }FontWeight` ] || undefined, lineHeight: a[ `${ p }LineHeight` ] || undefined, letterSpacing: a[ `${ p }LetterSpacing` ] || undefined, color: a[ `${ p }Color` ] || undefined } );

function ColorControl( { label, value, onChange } ) { return <div className="zen-static-experience-control"><p className="components-base-control__label">{ label }</p><ColorPalette colors={ COLORS } value={ value } onChange={ onChange } enableAlpha /></div>; }
function TypeControl( { title, prefix, attributes, setAttributes, wrapKey } ) {
	const set = ( key, value ) => setAttributes( { [ `${ prefix }${ key }` ]: value } );
	return <PanelBody title={ title } initialOpen={ false }>
		{ wrapKey && <ToggleControl label={ __( 'Allow wrapping', 'zenctuary' ) } checked={ attributes[ wrapKey ] !== false } onChange={ ( value ) => setAttributes( { [ wrapKey ]: value } ) } /> }
		<SelectControl label={ __( 'Font family', 'zenctuary' ) } value={ attributes[ `${ prefix }FontFamily` ] || '' } options={ FONTS } onChange={ ( value ) => set( 'FontFamily', value ) } />
		<UnitControl label={ __( 'Font size', 'zenctuary' ) } value={ attributes[ `${ prefix }FontSize` ] || '' } onChange={ ( value ) => set( 'FontSize', value || '' ) } />
		<SelectControl label={ __( 'Font weight', 'zenctuary' ) } value={ attributes[ `${ prefix }FontWeight` ] || '400' } options={ WEIGHTS } onChange={ ( value ) => set( 'FontWeight', value ) } />
		<TextControl label={ __( 'Line height', 'zenctuary' ) } value={ attributes[ `${ prefix }LineHeight` ] || '' } onChange={ ( value ) => set( 'LineHeight', value ) } />
		<UnitControl label={ __( 'Letter spacing', 'zenctuary' ) } value={ attributes[ `${ prefix }LetterSpacing` ] || '' } onChange={ ( value ) => set( 'LetterSpacing', value || '' ) } />
		<ColorControl label={ __( 'Color', 'zenctuary' ) } value={ attributes[ `${ prefix }Color` ] } onChange={ ( value ) => set( 'Color', value ) } />
	</PanelBody>;
}
function ArrowIcon() { return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10.8 4.1 15.7 9l-4.9 4.9-1.1-1.1 3.2-3.2H3.8V8.4h9.1L9.7 5.2z" /></svg>; }
function ClockIcon() { return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.2a7.8 7.8 0 1 0 0 15.6 7.8 7.8 0 0 0 0-15.6Zm-.8 3.9h1.6v4.1l3 1.8-.8 1.4-3.8-2.2z" /></svg>; }
function CheckIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.55 16.15 5.75 12.35 7.15 10.95 9.55 13.35 16.85 6.05 18.25 7.45z" /></svg>; }
function Coin( { value } ) { return <span className="zen-zencoins-badge" aria-hidden="true"><span className="zen-zencoins-badge__ring" /><span className="zen-zencoins-badge__value">{ value }</span></span>; }
function ExperienceOneCard( { card, attributes, onChange, onRootChange, onSelect } ) {
	return <article className={ `zen-class-card${ card.hidden ? ' zen-class-card--hidden' : '' }` } onClick={ onSelect }>
		{ card.hidden && <span className="zen-static-experience__hidden-pill">Hidden</span> }
		<div className="zen-class-card__image-wrap">
			{ card.imageUrl ? <img className="zen-class-card__image" src={ card.imageUrl } alt={ card.imageAlt || '' } /> : <div className="zen-class-card__image zen-class-card__image--placeholder" /> }
			{ attributes.showZencoins !== false && <div className="zen-class-card__zencoins"><div className="zen-class-card__zencoins-inner"><RichText tagName="span" className="zen-zencoins-label" value={ attributes.zencoinLabel } onChange={ ( zencoinLabel ) => onRootChange( { zencoinLabel } ) } style={ textStyle( attributes, 'zencoinLabel' ) } allowedFormats={ [ 'core/bold', 'core/italic' ] } /><Coin value={ card.zencoins } /></div></div> }
		</div>
		<div className="zen-class-card__body">
			<RichText tagName="h3" className="zen-class-card__title" value={ card.title } onChange={ ( title ) => onChange( { title } ) } style={ { ...textStyle( attributes, 'cardTitle' ), whiteSpace: attributes.cardTitleWrap ? 'normal' : 'nowrap' } } allowedFormats={ [ 'core/bold', 'core/italic' ] } />
			{ attributes.showDifficulty !== false && <div className="zen-class-card__difficulty" style={ textStyle( attributes, 'difficulty' ) }><span className="zen-difficulty-icon"><CheckIcon /></span><RichText tagName="span" value={ card.difficulty } onChange={ ( difficulty ) => onChange( { difficulty } ) } allowedFormats={ [ 'core/bold', 'core/italic' ] } /></div> }
			<RichText tagName="p" className="zen-class-card__desc" value={ card.description } onChange={ ( description ) => onChange( { description } ) } style={ textStyle( attributes, 'cardDesc' ) } allowedFormats={ [ 'core/bold', 'core/italic', 'core/link' ] } />
			{ attributes.showBookButton !== false && <a className="zen-btn zen-btn--primary zen-class-card__btn" href={ card.buttonUrl || '#' } onClick={ ( event ) => event.preventDefault() } style={ textStyle( attributes, 'button' ) }><RichText tagName="span" value={ card.buttonText } onChange={ ( buttonText ) => onChange( { buttonText } ) } allowedFormats={ [ 'core/bold', 'core/italic' ] } /></a> }
		</div>
	</article>;
}

function ExperienceTwoCard( { card, attributes, onChange, onRootChange, onSelect } ) {
	return <article className={ `pfc__card zen-static-experience-pfc${ card.hidden ? ' zen-class-card--hidden' : '' }` } onClick={ onSelect }>
		{ card.hidden && <span className="zen-static-experience__hidden-pill">Hidden</span> }
		<div className="pfc__card-top">
			<div className="pfc__zencoin"><RichText tagName="span" className="pfc__zencoin-label" value={ attributes.zencoinLabel } onChange={ ( zencoinLabel ) => onRootChange( { zencoinLabel } ) } style={ textStyle( attributes, 'pfcZencoinLabel' ) } allowedFormats={ [ 'core/bold', 'core/italic' ] } /><span className="pfc__zencoin-badge"><span className="pfc__zencoin-badge-ring" /><span className="pfc__zencoin-badge-value">{ card.zencoins }</span></span></div>
		</div>
		<div className="pfc__card-body">
			{ card.imageUrl ? <img className="pfc__image" src={ card.imageUrl } alt={ card.imageAlt || '' } /> : <div className="pfc__image pfc__image--placeholder" /> }
			<span className="pfc__overlay" />
			<div className="pfc__content">
				<RichText tagName="h3" className="pfc__title" value={ card.title } onChange={ ( title ) => onChange( { title } ) } style={ { ...textStyle( attributes, 'pfcTitle' ), whiteSpace: attributes.pfcTitleWrap ? 'normal' : 'nowrap' } } allowedFormats={ [ 'core/bold', 'core/italic' ] } />
				<div className="pfc__session-row" style={ textStyle( attributes, 'pfcTime' ) }><span className="pfc__session-icon"><ClockIcon /></span><RichText tagName="span" value={ card.time } onChange={ ( time ) => onChange( { time } ) } allowedFormats={ [ 'core/bold', 'core/italic' ] } placeholder={ __( 'Time / duration', 'zenctuary' ) } /></div>
				<RichText tagName="div" className="pfc__ideal-for" value={ card.description } onChange={ ( description ) => onChange( { description } ) } style={ textStyle( attributes, 'pfcDescription' ) } allowedFormats={ [ 'core/bold', 'core/italic', 'core/link' ] } />
				{ attributes.showBookButton !== false && <a className="pfc__button" href={ card.buttonUrl || '#' } onClick={ ( event ) => event.preventDefault() } style={ textStyle( attributes, 'pfcButton' ) }><RichText tagName="span" value={ card.buttonText } onChange={ ( buttonText ) => onChange( { buttonText } ) } allowedFormats={ [ 'core/bold', 'core/italic' ] } /><ArrowIcon /></a> }
				<div className="pfc__divider" />
				<button className="pfc__expect-toggle" type="button"><span style={ textStyle( attributes, 'pfcExpectLabel' ) }>{ attributes.pfcExpectLabel || 'What to expect' }</span><span className="pfc__expect-plus">+</span></button>
				<RichText tagName="div" className="pfc__expect-content" value={ card.whatToExpect } onChange={ ( whatToExpect ) => onChange( { whatToExpect } ) } style={ textStyle( attributes, 'pfcExpectContent' ) } allowedFormats={ [ 'core/bold', 'core/italic', 'core/link' ] } />
			</div>
		</div>
	</article>;
}

function ClassCard( props ) {
	return props.card.type === 'experience-2' ? <ExperienceTwoCard {...props} /> : <ExperienceOneCard {...props} />;
}
function BlockPreview( { attributes, setAttributes, selectCard } ) {
	const spaces = normSpaces( attributes.spaces );
	const visible = allCards( spaces ).filter( ( item ) => ! item.card.hidden );
	const updateSpaceAt = ( spaceIndex, patch ) => { const next = clone( spaces ); next[ spaceIndex ] = { ...next[ spaceIndex ], ...patch }; setAttributes( { spaces: next } ); };
	const updateActivityAt = ( spaceIndex, activityIndex, patch ) => { const next = clone( spaces ); next[ spaceIndex ].activities[ activityIndex ] = { ...next[ spaceIndex ].activities[ activityIndex ], ...patch }; setAttributes( { spaces: next } ); };
	const updateCardAt = ( spaceIndex, activityIndex, cardIndex, patch ) => { const next = clone( spaces ); next[ spaceIndex ].activities[ activityIndex ].cards[ cardIndex ] = { ...next[ spaceIndex ].activities[ activityIndex ].cards[ cardIndex ], ...patch }; setAttributes( { spaces: next } ); };
	const rootChange = ( patch ) => setAttributes( patch );
	const blockProps = useBlockProps( { className: 'zen-experience-space-block zen-static-experience-space', style: blockStyle( attributes ) } );

	return <div { ...blockProps }>
		<div className="zen-static-experience-space__inner">
			{ attributes.hierarchyEnabled !== false ? spaces.map( ( space, spaceIndex ) => <section className="zen-space-section" key={ space.id || spaceIndex }>
				<header className="zen-space-header">
					{ space.iconUrl && <img className="zen-space-icon" src={ space.iconUrl } alt={ space.iconAlt || '' } /> }
					<RichText tagName="h2" className="zen-space-title" value={ space.title } onChange={ ( title ) => updateSpaceAt( spaceIndex, { title } ) } style={ { ...textStyle( attributes, 'heading' ), whiteSpace: attributes.headingWrap ? 'normal' : 'nowrap' } } allowedFormats={ [ 'core/bold', 'core/italic' ] } />
				</header>
				<RichText tagName="p" className="zen-space-description" value={ space.description } onChange={ ( description ) => updateSpaceAt( spaceIndex, { description } ) } style={ textStyle( attributes, 'desc' ) } allowedFormats={ [ 'core/bold', 'core/italic', 'core/link' ] } />
				<div className="zen-accordion-wrapper">
					{ ( space.activities || [] ).map( ( activity, activityIndex ) => {
						const isOpen = attributes.accordionFirstOpen !== false && activityIndex === 0;
						return <div className={ `zen-accordion-item${ isOpen ? ' zen-accordion-item--open' : '' }` } key={ activity.id || activityIndex }>
							<button type="button" className="zen-accordion-header" aria-expanded={ isOpen ? 'true' : 'false' }>
								<RichText tagName="span" className="zen-accordion-title" value={ activity.title } onChange={ ( title ) => updateActivityAt( spaceIndex, activityIndex, { title } ) } style={ { ...textStyle( attributes, 'activity' ), whiteSpace: attributes.activityWrap ? 'normal' : 'nowrap' } } allowedFormats={ [ 'core/bold', 'core/italic' ] } />
								<span className="zen-accordion-icon" aria-hidden="true"><span className="zen-accordion-icon--minus">-</span><span className="zen-accordion-icon--plus">+</span></span>
							</button>
							<div className="zen-accordion-panel" hidden={ ! isOpen }><div className="zen-class-cards-grid">
								{ ( activity.cards || [] ).map( ( card, cardIndex ) => <ClassCard key={ card.id || cardIndex } card={ card } attributes={ attributes } onSelect={ () => selectCard( spaceIndex, activityIndex, cardIndex ) } onRootChange={ rootChange } onChange={ ( patch ) => updateCardAt( spaceIndex, activityIndex, cardIndex, patch ) } /> ) }
							</div></div>
						</div>;
					} ) }
				</div>
			</section> ) : <div className="zen-class-cards-grid zen-class-cards-grid--flat">{ visible.map( ( item ) => <ClassCard key={ item.card.id } card={ item.card } attributes={ attributes } onSelect={ () => selectCard( item.spaceIndex, item.activityIndex, item.cardIndex ) } onRootChange={ rootChange } onChange={ ( patch ) => updateCardAt( item.spaceIndex, item.activityIndex, item.cardIndex, patch ) } /> ) }</div> }
		</div>
	</div>;
}

function blockStyle( a ) {
	return {
		'--zen-exp-bg': a.backgroundColor, '--zen-exp-content-width': a.contentMaxWidth, '--zen-exp-space-gap': `${ a.spaceGap }px`, '--zen-exp-cards-gap': `${ a.cardsGap }px`, '--zen-exp-flat-card-min': `${ a.flatCardsMinWidth }px`,
		'--zen-exp-heading-icon-size': `${ a.headingIconSize }px`, '--zen-exp-heading-icon-gap': `${ a.headingIconGap }px`, '--zen-exp-header-bottom-spacing': `${ a.headerBottomSpacing }px`, '--zen-exp-description-bottom-spacing': `${ a.descriptionBottomSpacing }px`, '--zen-exp-desc-max-width': a.descMaxWidth,
		'--zen-exp-accordion-border-width': `${ a.accordionBorderWidth }px`, '--zen-exp-accordion-border-color': a.accordionBorderColor, '--zen-exp-accordion-border-radius': `${ a.accordionBorderRadius }px`, '--zen-exp-accordion-padding-x': `${ a.accordionPaddingX }px`, '--zen-exp-accordion-padding-y': `${ a.accordionPaddingY }px`, '--zen-exp-accordion-gap': `${ a.accordionGap }px`, '--zen-exp-accordion-icon-size': `${ a.accordionIconSize }px`,
		'--zen-exp-card-image-height': `${ a.cardImageHeight }px`, '--zen-exp-card-body-padding': `${ a.cardBodyPadding }px`, '--zen-exp-card-border-radius': `${ a.cardBorderRadius }px`, '--zen-exp-card-bg': a.cardBackgroundColor,
		'--zen-exp-difficulty-icon-size': `${ a.difficultyIconSize }px`, '--zen-exp-difficulty-icon-bg-color': a.difficultyIconBgColor, '--zen-exp-difficulty-tick-color': a.difficultyTickColor,
		'--zen-exp-zencoin-badge-size': `${ a.zencoinBadgeSize }px`, '--zen-exp-zencoin-badge-font-size': a.zencoinBadgeFontSize, '--zen-exp-zencoin-badge-bg-color': a.zencoinBadgeBgColor, '--zen-exp-zencoin-badge-text-color': a.zencoinBadgeTextColor,
		'--zen-exp-btn-bg-color': a.buttonBackgroundColor, '--zen-exp-btn-border-color': a.buttonBorderColor, '--zen-exp-btn-border-width': `${ a.buttonBorderWidth }px`, '--zen-exp-btn-border-radius': a.buttonBorderRadius, '--zen-exp-btn-padding-y': a.buttonPaddingTop, '--zen-exp-btn-padding-x': a.buttonPaddingRight, '--zen-exp-btn-margin-top': a.buttonMarginTop, '--zen-exp-btn-width': a.buttonWidth, '--zen-exp-btn-min-height': a.buttonMinHeight,
		'--pfc-card-width': a.pfcCardWidth, '--pfc-card-height': a.pfcCardHeight, '--pfc-top-bar-height': `${ a.pfcTopBarHeight }px`, '--pfc-top-bar-bg': a.pfcTopBarBackgroundColor, '--pfc-card-bg': a.pfcCardBackgroundColor, '--pfc-card-border-color': a.pfcCardBorderColor, '--pfc-card-border-width': `${ a.pfcCardBorderWidth }px`, '--pfc-card-radius': `${ a.pfcCardBorderRadius }px`, '--pfc-overlay-color': a.pfcOverlayColor, '--pfc-overlay-opacity': a.pfcOverlayOpacity, '--pfc-body-pt': a.pfcBodyPaddingTop, '--pfc-body-pr': a.pfcBodyPaddingRight, '--pfc-body-pb': a.pfcBodyPaddingBottom, '--pfc-body-pl': a.pfcBodyPaddingLeft,
		'--pfc-zencoin-badge-size': `${ a.pfcZencoinBadgeSize }px`, '--pfc-zencoin-badge-bg': a.pfcZencoinBadgeBackgroundColor, '--pfc-zencoin-badge-ring-color': a.pfcZencoinBadgeRingColor, '--pfc-zencoin-badge-text-color': a.pfcZencoinBadgeTextColor,
		'--pfc-button-bg': a.pfcButtonBackgroundColor, '--pfc-button-border-color': a.pfcButtonBorderColor, '--pfc-button-border-width': `${ a.pfcButtonBorderWidth }px`, '--pfc-button-radius': a.pfcButtonBorderRadius, '--pfc-button-py': a.pfcButtonPaddingY, '--pfc-button-px': a.pfcButtonPaddingX,
		paddingTop: a.sectionPaddingTop, paddingRight: a.sectionPaddingRight, paddingBottom: a.sectionPaddingBottom, paddingLeft: a.sectionPaddingLeft,
	};
}
export default function Edit( { attributes, setAttributes } ) {
	const spaces = normSpaces( attributes.spaces );
	const [ selectedSpaceIndex, setSelectedSpaceIndex ] = useState( 0 );
	const [ selectedActivityIndex, setSelectedActivityIndex ] = useState( 0 );
	const [ selectedCardIndex, setSelectedCardIndex ] = useState( 0 );
	const space = spaces[ selectedSpaceIndex ] || spaces[ 0 ];
	const activities = ( space.activities && space.activities.length ) ? space.activities : [ newActivity() ];
	const activity = activities[ selectedActivityIndex ] || activities[ 0 ];
	const cards = activity.cards || [];
	const card = cards[ selectedCardIndex ];
	const flatCards = useMemo( () => allCards( spaces ), [ attributes.spaces ] );
	const setSpaces = ( next ) => setAttributes( { spaces: next } );
	const selectCard = ( s, a, c ) => { setSelectedSpaceIndex( s ); setSelectedActivityIndex( a ); setSelectedCardIndex( c ); };
	const updateSpace = ( patch ) => { const next = clone( spaces ); next[ selectedSpaceIndex ] = { ...next[ selectedSpaceIndex ], ...patch }; setSpaces( next ); };
	const updateActivity = ( patch ) => { const next = clone( spaces ); next[ selectedSpaceIndex ].activities[ selectedActivityIndex ] = { ...next[ selectedSpaceIndex ].activities[ selectedActivityIndex ], ...patch }; setSpaces( next ); };
	const updateCard = ( patch ) => { const next = clone( spaces ); next[ selectedSpaceIndex ].activities[ selectedActivityIndex ].cards[ selectedCardIndex ] = { ...next[ selectedSpaceIndex ].activities[ selectedActivityIndex ].cards[ selectedCardIndex ], ...patch }; setSpaces( next ); };
	const addSpace = () => { const next = [ ...spaces, newSpace() ]; setSpaces( next ); setSelectedSpaceIndex( next.length - 1 ); setSelectedActivityIndex( 0 ); setSelectedCardIndex( 0 ); };
	const removeSpace = () => { if ( spaces.length <= 1 ) return; setSpaces( spaces.filter( ( _, i ) => i !== selectedSpaceIndex ) ); setSelectedSpaceIndex( Math.max( selectedSpaceIndex - 1, 0 ) ); setSelectedActivityIndex( 0 ); setSelectedCardIndex( 0 ); };
	const addActivity = () => { const next = clone( spaces ); next[ selectedSpaceIndex ].activities = [ ...( next[ selectedSpaceIndex ].activities || [] ), newActivity() ]; setSpaces( next ); setSelectedActivityIndex( next[ selectedSpaceIndex ].activities.length - 1 ); setSelectedCardIndex( 0 ); };
	const removeActivity = () => { if ( activities.length <= 1 ) return; const next = clone( spaces ); next[ selectedSpaceIndex ].activities = activities.filter( ( _, i ) => i !== selectedActivityIndex ); setSpaces( next ); setSelectedActivityIndex( Math.max( selectedActivityIndex - 1, 0 ) ); setSelectedCardIndex( 0 ); };
	const addCard = ( type = 'experience-1' ) => { const next = clone( spaces ); next[ selectedSpaceIndex ].activities[ selectedActivityIndex ].cards = [ ...( next[ selectedSpaceIndex ].activities[ selectedActivityIndex ].cards || [] ), newCard( type ) ]; setSpaces( next ); setSelectedCardIndex( next[ selectedSpaceIndex ].activities[ selectedActivityIndex ].cards.length - 1 ); };
	const removeCard = () => { if ( cards.length <= 1 ) return; const next = clone( spaces ); next[ selectedSpaceIndex ].activities[ selectedActivityIndex ].cards = cards.filter( ( _, i ) => i !== selectedCardIndex ); setSpaces( next ); setSelectedCardIndex( Math.max( selectedCardIndex - 1, 0 ) ); };

	return <>
		<InspectorControls>
			<PanelBody title={ __( 'Layout / Behaviour', 'zenctuary' ) } initialOpen>
				<ToggleControl label={ __( 'Show space/activity hierarchy', 'zenctuary' ) } checked={ attributes.hierarchyEnabled !== false } onChange={ ( hierarchyEnabled ) => setAttributes( { hierarchyEnabled } ) } help={ __( 'When off, only visible class cards are shown in one flat list.', 'zenctuary' ) } />
				<ToggleControl label={ __( 'Open first activity by default', 'zenctuary' ) } checked={ attributes.accordionFirstOpen !== false } onChange={ ( accordionFirstOpen ) => setAttributes( { accordionFirstOpen } ) } />
				<ToggleControl label={ __( 'Show zencoins', 'zenctuary' ) } checked={ attributes.showZencoins !== false } onChange={ ( showZencoins ) => setAttributes( { showZencoins } ) } />
				<ToggleControl label={ __( 'Show difficulty', 'zenctuary' ) } checked={ attributes.showDifficulty !== false } onChange={ ( showDifficulty ) => setAttributes( { showDifficulty } ) } />
				<ToggleControl label={ __( 'Show book button', 'zenctuary' ) } checked={ attributes.showBookButton !== false } onChange={ ( showBookButton ) => setAttributes( { showBookButton } ) } />
				<ColorControl label={ __( 'Background', 'zenctuary' ) } value={ attributes.backgroundColor } onChange={ ( backgroundColor ) => setAttributes( { backgroundColor } ) } />
				<UnitControl label={ __( 'Content max width', 'zenctuary' ) } value={ attributes.contentMaxWidth } onChange={ ( contentMaxWidth ) => setAttributes( { contentMaxWidth: contentMaxWidth || '100%' } ) } />
				<RangeControl label={ __( 'Cards gap', 'zenctuary' ) } value={ attributes.cardsGap } onChange={ ( cardsGap ) => setAttributes( { cardsGap } ) } min={ 0 } max={ 100 } />
				<RangeControl label={ __( 'Flat cards min width', 'zenctuary' ) } value={ attributes.flatCardsMinWidth } onChange={ ( flatCardsMinWidth ) => setAttributes( { flatCardsMinWidth } ) } min={ 180 } max={ 600 } />
			</PanelBody>
			<PanelBody title={ __( 'Section Spacing', 'zenctuary' ) } initialOpen={ false }>
				<UnitControl label="Padding top" value={ attributes.sectionPaddingTop } onChange={ ( sectionPaddingTop ) => setAttributes( { sectionPaddingTop } ) } />
				<UnitControl label="Padding right" value={ attributes.sectionPaddingRight } onChange={ ( sectionPaddingRight ) => setAttributes( { sectionPaddingRight } ) } />
				<UnitControl label="Padding bottom" value={ attributes.sectionPaddingBottom } onChange={ ( sectionPaddingBottom ) => setAttributes( { sectionPaddingBottom } ) } />
				<UnitControl label="Padding left" value={ attributes.sectionPaddingLeft } onChange={ ( sectionPaddingLeft ) => setAttributes( { sectionPaddingLeft } ) } />
				<RangeControl label="Header bottom spacing" value={ attributes.headerBottomSpacing } onChange={ ( headerBottomSpacing ) => setAttributes( { headerBottomSpacing } ) } min={ 0 } max={ 120 } />
				<RangeControl label="Description bottom spacing" value={ attributes.descriptionBottomSpacing } onChange={ ( descriptionBottomSpacing ) => setAttributes( { descriptionBottomSpacing } ) } min={ 0 } max={ 160 } />
			</PanelBody>
			<PanelBody title={ __( 'Spaces', 'zenctuary' ) } initialOpen>
				<SelectControl label="Selected space" value={ String( selectedSpaceIndex ) } options={ spaces.map( ( item, index ) => ( { label: item.title || `Space ${ index + 1 }`, value: String( index ) } ) ) } onChange={ ( value ) => { setSelectedSpaceIndex( Number( value ) ); setSelectedActivityIndex( 0 ); setSelectedCardIndex( 0 ); } } />
				<div className="zen-static-experience-actions"><Button variant="secondary" onClick={ addSpace }>Add space</Button><Button variant="secondary" isDestructive disabled={ spaces.length <= 1 } onClick={ removeSpace }>Remove space</Button></div>
				<TextControl label="Space title" value={ space?.title || '' } onChange={ ( title ) => updateSpace( { title } ) } />
				<TextareaControl label="Space description" value={ space?.description || '' } onChange={ ( description ) => updateSpace( { description } ) } />
				<MediaUploadCheck><MediaUpload allowedTypes={ [ 'image' ] } value={ space?.iconId || 0 } onSelect={ ( media ) => updateSpace( { iconId: media.id, iconUrl: media.url, iconAlt: media.alt || media.title || '' } ) } render={ ( { open } ) => <Button variant="secondary" onClick={ open }>{ space?.iconUrl ? 'Replace icon' : 'Upload icon' }</Button> } /></MediaUploadCheck>
				{ space?.iconUrl && <Button variant="link" isDestructive onClick={ () => updateSpace( { iconId: 0, iconUrl: '', iconAlt: '' } ) }>Remove icon</Button> }
			</PanelBody>
			<PanelBody title={ __( 'Activities', 'zenctuary' ) } initialOpen>
				<SelectControl label="Selected activity" value={ String( selectedActivityIndex ) } options={ activities.map( ( item, index ) => ( { label: item.title || `Activity ${ index + 1 }`, value: String( index ) } ) ) } onChange={ ( value ) => { setSelectedActivityIndex( Number( value ) ); setSelectedCardIndex( 0 ); } } />
				<div className="zen-static-experience-actions"><Button variant="secondary" onClick={ addActivity }>Add activity</Button><Button variant="secondary" isDestructive disabled={ activities.length <= 1 } onClick={ removeActivity }>Remove activity</Button></div>
				<TextControl label="Activity title" value={ activity?.title || '' } onChange={ ( title ) => updateActivity( { title } ) } />
			</PanelBody>
			<PanelBody title={ __( 'Class Cards', 'zenctuary' ) } initialOpen>
				<SelectControl label="Selected class" value={ String( selectedCardIndex ) } options={ cards.map( ( item, index ) => ( { label: `${ item.hidden ? '[Hidden] ' : '' }${ item.title || `Class ${ index + 1 }` }`, value: String( index ) } ) ) } onChange={ ( value ) => setSelectedCardIndex( Number( value ) ) } />
				<div className="zen-static-experience-actions"><Button variant="secondary" onClick={ () => addCard( 'experience-1' ) }>Add Experience 1</Button><Button variant="secondary" onClick={ () => addCard( 'experience-2' ) }>Add Experience 2</Button><Button variant="secondary" isDestructive disabled={ cards.length <= 1 } onClick={ removeCard }>Remove class</Button></div>
				{ card && <>
					<SelectControl label="Card type" value={ card.type || 'experience-1' } options={ TYPE_OPTIONS } onChange={ ( type ) => updateCard( { type } ) } />
					<ToggleControl label="Hide this class on frontend" checked={ !! card.hidden } onChange={ ( hidden ) => updateCard( { hidden } ) } />
					<TextControl label="Class title" value={ card.title || '' } onChange={ ( title ) => updateCard( { title } ) } />
					<TextControl label="Zencoins value" value={ card.zencoins || '' } onChange={ ( zencoins ) => updateCard( { zencoins } ) } />
					<TextControl label="Difficulty / feature" value={ card.difficulty || '' } onChange={ ( difficulty ) => updateCard( { difficulty } ) } />
					{ ( card.type || 'experience-1' ) === 'experience-2' && <TextControl label="Time / duration" value={ card.time || '' } onChange={ ( time ) => updateCard( { time } ) } /> }
					<TextareaControl label="Description" value={ card.description || '' } onChange={ ( description ) => updateCard( { description } ) } />
					{ ( card.type || 'experience-1' ) === 'experience-2' && <TextareaControl label="What to expect" value={ card.whatToExpect || '' } onChange={ ( whatToExpect ) => updateCard( { whatToExpect } ) } /> }
					<TextControl label="Button text" value={ card.buttonText || '' } onChange={ ( buttonText ) => updateCard( { buttonText } ) } />
					<TextControl label="Button URL" value={ card.buttonUrl || '' } onChange={ ( buttonUrl ) => updateCard( { buttonUrl } ) } />
					<ToggleControl label="Open button in new tab" checked={ !! card.buttonOpenInNewTab } onChange={ ( buttonOpenInNewTab ) => updateCard( { buttonOpenInNewTab } ) } />
					<MediaUploadCheck><MediaUpload allowedTypes={ [ 'image' ] } value={ card.imageId || 0 } onSelect={ ( media ) => updateCard( { imageId: media.id, imageUrl: media.url, imageAlt: media.alt || media.title || '' } ) } render={ ( { open } ) => <Button variant="secondary" onClick={ open }>{ card.imageUrl ? 'Replace image' : 'Upload image' }</Button> } /></MediaUploadCheck>
					{ card.imageUrl && <Button variant="link" isDestructive onClick={ () => updateCard( { imageId: 0, imageUrl: '', imageAlt: '' } ) }>Remove image</Button> }
				</> }
			</PanelBody>
			{ attributes.hierarchyEnabled === false && <PanelBody title="Flat Mode Visibility" initialOpen={ false }>{ flatCards.map( ( item ) => <ToggleControl key={ item.card.id } label={ item.card.title || 'Untitled class' } checked={ ! item.card.hidden } onChange={ ( checked ) => { const next = clone( spaces ); next[ item.spaceIndex ].activities[ item.activityIndex ].cards[ item.cardIndex ].hidden = ! checked; setSpaces( next ); } } /> ) }</PanelBody> }

			<TypeControl title="Space Heading Typography" prefix="heading" attributes={ attributes } setAttributes={ setAttributes } wrapKey="headingWrap" />
			<TypeControl title="Space Description Typography" prefix="desc" attributes={ attributes } setAttributes={ setAttributes } />
			<TypeControl title="Activity Typography" prefix="activity" attributes={ attributes } setAttributes={ setAttributes } wrapKey="activityWrap" />
			<TypeControl title="Experience 1 Title Typography" prefix="cardTitle" attributes={ attributes } setAttributes={ setAttributes } wrapKey="cardTitleWrap" />
			<TypeControl title="Experience 1 Description Typography" prefix="cardDesc" attributes={ attributes } setAttributes={ setAttributes } />
			<TypeControl title="Experience 1 Difficulty Typography" prefix="difficulty" attributes={ attributes } setAttributes={ setAttributes } />
			<TypeControl title="Experience 1 Zencoins Typography" prefix="zencoinLabel" attributes={ attributes } setAttributes={ setAttributes } />
			<TypeControl title="Experience 1 Button Typography" prefix="button" attributes={ attributes } setAttributes={ setAttributes } />
			<TypeControl title="Experience 2 Title Typography" prefix="pfcTitle" attributes={ attributes } setAttributes={ setAttributes } wrapKey="pfcTitleWrap" />
			<TypeControl title="Experience 2 Time Typography" prefix="pfcTime" attributes={ attributes } setAttributes={ setAttributes } />
			<TypeControl title="Experience 2 Description Typography" prefix="pfcDescription" attributes={ attributes } setAttributes={ setAttributes } />
			<TypeControl title="Experience 2 Zencoins Typography" prefix="pfcZencoinLabel" attributes={ attributes } setAttributes={ setAttributes } />
			<TypeControl title="Experience 2 Button Typography" prefix="pfcButton" attributes={ attributes } setAttributes={ setAttributes } />
			<TypeControl title="Experience 2 Expand Typography" prefix="pfcExpectLabel" attributes={ attributes } setAttributes={ setAttributes } />
			<TypeControl title="Experience 2 Expanded Content Typography" prefix="pfcExpectContent" attributes={ attributes } setAttributes={ setAttributes } />

			<PanelBody title="Experience 1 Card Style" initialOpen={ false }>
				<RangeControl label="Image height" value={ attributes.cardImageHeight } onChange={ ( cardImageHeight ) => setAttributes( { cardImageHeight } ) } min={ 80 } max={ 520 } />
				<RangeControl label="Body padding" value={ attributes.cardBodyPadding } onChange={ ( cardBodyPadding ) => setAttributes( { cardBodyPadding } ) } min={ 0 } max={ 90 } />
				<RangeControl label="Card radius" value={ attributes.cardBorderRadius } onChange={ ( cardBorderRadius ) => setAttributes( { cardBorderRadius } ) } min={ 0 } max={ 80 } />
				<ColorControl label="Card background" value={ attributes.cardBackgroundColor } onChange={ ( cardBackgroundColor ) => setAttributes( { cardBackgroundColor } ) } />
				<RangeControl label="Zencoin badge size" value={ attributes.zencoinBadgeSize } onChange={ ( zencoinBadgeSize ) => setAttributes( { zencoinBadgeSize } ) } min={ 24 } max={ 90 } />
			</PanelBody>
			<PanelBody title="Experience 2 Card Style" initialOpen={ false }>
				<UnitControl label="Card width" value={ attributes.pfcCardWidth } onChange={ ( pfcCardWidth ) => setAttributes( { pfcCardWidth } ) } />
				<UnitControl label="Card height" value={ attributes.pfcCardHeight } onChange={ ( pfcCardHeight ) => setAttributes( { pfcCardHeight } ) } />
				<RangeControl label="Top zencoin area height" value={ attributes.pfcTopBarHeight } onChange={ ( pfcTopBarHeight ) => setAttributes( { pfcTopBarHeight } ) } min={ 40 } max={ 180 } />
				<ColorControl label="Top bar background" value={ attributes.pfcTopBarBackgroundColor } onChange={ ( pfcTopBarBackgroundColor ) => setAttributes( { pfcTopBarBackgroundColor } ) } />
				<ColorControl label="Card background" value={ attributes.pfcCardBackgroundColor } onChange={ ( pfcCardBackgroundColor ) => setAttributes( { pfcCardBackgroundColor } ) } />
				<ColorControl label="Card border" value={ attributes.pfcCardBorderColor } onChange={ ( pfcCardBorderColor ) => setAttributes( { pfcCardBorderColor } ) } />
				<RangeControl label="Card border width" value={ attributes.pfcCardBorderWidth } onChange={ ( pfcCardBorderWidth ) => setAttributes( { pfcCardBorderWidth } ) } min={ 0 } max={ 8 } />
				<RangeControl label="Card radius" value={ attributes.pfcCardBorderRadius } onChange={ ( pfcCardBorderRadius ) => setAttributes( { pfcCardBorderRadius } ) } min={ 0 } max={ 80 } />
				<RangeControl label="Image overlay opacity" value={ attributes.pfcOverlayOpacity } onChange={ ( pfcOverlayOpacity ) => setAttributes( { pfcOverlayOpacity } ) } min={ 0 } max={ 1 } step={ 0.05 } />
				<UnitControl label="Body padding top" value={ attributes.pfcBodyPaddingTop } onChange={ ( pfcBodyPaddingTop ) => setAttributes( { pfcBodyPaddingTop } ) } />
				<UnitControl label="Body padding right" value={ attributes.pfcBodyPaddingRight } onChange={ ( pfcBodyPaddingRight ) => setAttributes( { pfcBodyPaddingRight } ) } />
				<UnitControl label="Body padding bottom" value={ attributes.pfcBodyPaddingBottom } onChange={ ( pfcBodyPaddingBottom ) => setAttributes( { pfcBodyPaddingBottom } ) } />
				<UnitControl label="Body padding left" value={ attributes.pfcBodyPaddingLeft } onChange={ ( pfcBodyPaddingLeft ) => setAttributes( { pfcBodyPaddingLeft } ) } />
			</PanelBody>
			<PanelBody title="Experience 1 Button Style" initialOpen={ false }>
				<ColorControl label="Button background" value={ attributes.buttonBackgroundColor } onChange={ ( buttonBackgroundColor ) => setAttributes( { buttonBackgroundColor } ) } />
				<ColorControl label="Button border" value={ attributes.buttonBorderColor } onChange={ ( buttonBorderColor ) => setAttributes( { buttonBorderColor } ) } />
				<RangeControl label="Button border width" value={ attributes.buttonBorderWidth } onChange={ ( buttonBorderWidth ) => setAttributes( { buttonBorderWidth } ) } min={ 0 } max={ 8 } />
				<UnitControl label="Button padding top" value={ attributes.buttonPaddingTop } onChange={ ( buttonPaddingTop ) => setAttributes( { buttonPaddingTop } ) } />
				<UnitControl label="Button padding right" value={ attributes.buttonPaddingRight } onChange={ ( buttonPaddingRight ) => setAttributes( { buttonPaddingRight } ) } />
				<UnitControl label="Button padding bottom" value={ attributes.buttonPaddingBottom } onChange={ ( buttonPaddingBottom ) => setAttributes( { buttonPaddingBottom } ) } />
				<UnitControl label="Button padding left" value={ attributes.buttonPaddingLeft } onChange={ ( buttonPaddingLeft ) => setAttributes( { buttonPaddingLeft } ) } />
				<UnitControl label="Button width" value={ attributes.buttonWidth } onChange={ ( buttonWidth ) => setAttributes( { buttonWidth } ) } />
				<UnitControl label="Button min height" value={ attributes.buttonMinHeight } onChange={ ( buttonMinHeight ) => setAttributes( { buttonMinHeight } ) } />
			</PanelBody>
			<PanelBody title="Experience 2 Zencoin / Button Style" initialOpen={ false }>
				<RangeControl label="Zencoin badge size" value={ attributes.pfcZencoinBadgeSize } onChange={ ( pfcZencoinBadgeSize ) => setAttributes( { pfcZencoinBadgeSize } ) } min={ 24 } max={ 90 } />
				<ColorControl label="Zencoin badge background" value={ attributes.pfcZencoinBadgeBackgroundColor } onChange={ ( pfcZencoinBadgeBackgroundColor ) => setAttributes( { pfcZencoinBadgeBackgroundColor } ) } />
				<ColorControl label="Zencoin badge ring/text" value={ attributes.pfcZencoinBadgeRingColor } onChange={ ( pfcZencoinBadgeRingColor ) => setAttributes( { pfcZencoinBadgeRingColor, pfcZencoinBadgeTextColor: pfcZencoinBadgeRingColor } ) } />
				<ColorControl label="Button background" value={ attributes.pfcButtonBackgroundColor } onChange={ ( pfcButtonBackgroundColor ) => setAttributes( { pfcButtonBackgroundColor } ) } />
				<ColorControl label="Button border" value={ attributes.pfcButtonBorderColor } onChange={ ( pfcButtonBorderColor ) => setAttributes( { pfcButtonBorderColor } ) } />
				<RangeControl label="Button border width" value={ attributes.pfcButtonBorderWidth } onChange={ ( pfcButtonBorderWidth ) => setAttributes( { pfcButtonBorderWidth } ) } min={ 0 } max={ 8 } />
				<UnitControl label="Button padding Y" value={ attributes.pfcButtonPaddingY } onChange={ ( pfcButtonPaddingY ) => setAttributes( { pfcButtonPaddingY } ) } />
				<UnitControl label="Button padding X" value={ attributes.pfcButtonPaddingX } onChange={ ( pfcButtonPaddingX ) => setAttributes( { pfcButtonPaddingX } ) } />
			</PanelBody>		</InspectorControls>
		<BlockPreview attributes={ attributes } setAttributes={ setAttributes } selectCard={ selectCard } />
	</>;
}
