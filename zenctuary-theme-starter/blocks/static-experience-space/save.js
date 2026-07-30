import { RichText, useBlockProps } from '@wordpress/block-editor';

const normSpaces = ( spaces ) => Array.isArray( spaces ) && spaces.length ? spaces : [];
const allCards = ( spaces ) => normSpaces( spaces ).flatMap( ( space, spaceIndex ) => ( space.activities || [] ).flatMap( ( activity, activityIndex ) => ( activity.cards || [] ).map( ( card, cardIndex ) => ( { card, spaceIndex, activityIndex, cardIndex } ) ) ) );
const textStyle = ( a, p ) => ( { fontFamily: a[ `${ p }FontFamily` ] || undefined, fontSize: a[ `${ p }FontSize` ] || undefined, fontWeight: a[ `${ p }FontWeight` ] || undefined, lineHeight: a[ `${ p }LineHeight` ] || undefined, letterSpacing: a[ `${ p }LetterSpacing` ] || undefined, color: a[ `${ p }Color` ] || undefined } );
function ArrowIcon() { return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10.8 4.1 15.7 9l-4.9 4.9-1.1-1.1 3.2-3.2H3.8V8.4h9.1L9.7 5.2z" /></svg>; }
function CheckIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.55 16.15 5.75 12.35 7.15 10.95 9.55 13.35 16.85 6.05 18.25 7.45z" /></svg>; }
function ClockIcon() { return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.2a7.8 7.8 0 1 0 0 15.6 7.8 7.8 0 0 0 0-15.6Zm-.8 3.9h1.6v4.1l3 1.8-.8 1.4-3.8-2.2z" /></svg>; }
function Coin( { value } ) { return <span className="zen-zencoins-badge" aria-hidden="true"><span className="zen-zencoins-badge__ring" /><span className="zen-zencoins-badge__value">{ value }</span></span>; }
function linkAttrs( card ) { return { target: card.buttonOpenInNewTab ? '_blank' : undefined, rel: card.buttonOpenInNewTab ? 'noopener noreferrer' : undefined }; }

function ExperienceOneCard( { card, attributes } ) {
	const attrs = linkAttrs( card );
	return <article className="zen-class-card">
		<div className="zen-class-card__image-wrap">
			{ card.imageUrl ? <img className="zen-class-card__image" src={ card.imageUrl } alt={ card.imageAlt || '' } loading="lazy" /> : <div className="zen-class-card__image zen-class-card__image--placeholder" /> }
			{ attributes.showZencoins !== false && <div className="zen-class-card__zencoins"><div className="zen-class-card__zencoins-inner"><RichText.Content tagName="span" className="zen-zencoins-label" value={ attributes.zencoinLabel } style={ textStyle( attributes, 'zencoinLabel' ) } /><Coin value={ card.zencoins } /></div></div> }
		</div>
		<div className="zen-class-card__body">
			<RichText.Content tagName="h3" className="zen-class-card__title" value={ card.title } style={ { ...textStyle( attributes, 'cardTitle' ), whiteSpace: attributes.cardTitleWrap ? 'normal' : 'nowrap' } } />
			{ attributes.showDifficulty !== false && card.difficulty && <div className="zen-class-card__difficulty" style={ textStyle( attributes, 'difficulty' ) }><span className="zen-difficulty-icon"><CheckIcon /></span><RichText.Content tagName="span" value={ card.difficulty } /></div> }
			<RichText.Content tagName="p" className="zen-class-card__desc" value={ card.description } style={ textStyle( attributes, 'cardDesc' ) } />
			{ attributes.showBookButton !== false && <a className="zen-btn zen-btn--primary zen-class-card__btn" href={ card.buttonUrl || '#' } { ...attrs } style={ textStyle( attributes, 'button' ) }><RichText.Content tagName="span" value={ card.buttonText } /></a> }
		</div>
	</article>;
}
function ExperienceTwoCard( { card, attributes } ) {
	const attrs = linkAttrs( card );
	return <article className="pfc__card zen-static-experience-pfc">
		<div className="pfc__card-top"><div className="pfc__zencoin"><RichText.Content tagName="span" className="pfc__zencoin-label" value={ attributes.zencoinLabel } style={ textStyle( attributes, 'pfcZencoinLabel' ) } /><span className="pfc__zencoin-badge"><span className="pfc__zencoin-badge-ring" /><span className="pfc__zencoin-badge-value">{ card.zencoins }</span></span></div></div>
		<div className="pfc__card-body">
			{ card.imageUrl ? <img className="pfc__image" src={ card.imageUrl } alt={ card.imageAlt || '' } loading="lazy" /> : <div className="pfc__image pfc__image--placeholder" /> }
			<span className="pfc__overlay" />
			<div className="pfc__content">
				<RichText.Content tagName="h3" className="pfc__title" value={ card.title } style={ { ...textStyle( attributes, 'pfcTitle' ), whiteSpace: attributes.pfcTitleWrap ? 'normal' : 'nowrap' } } />
				{ card.time && <div className="pfc__session-row" style={ textStyle( attributes, 'pfcTime' ) }><span className="pfc__session-icon"><ClockIcon /></span><RichText.Content tagName="span" value={ card.time } /></div> }
				<RichText.Content tagName="div" className="pfc__ideal-for" value={ card.description } style={ textStyle( attributes, 'pfcDescription' ) } />
				{ attributes.showBookButton !== false && <a className="pfc__button" href={ card.buttonUrl || '#' } { ...attrs } style={ textStyle( attributes, 'pfcButton' ) }><RichText.Content tagName="span" value={ card.buttonText } /><ArrowIcon /></a> }
				<div className="pfc__divider" />
				<button className="pfc__expect-toggle" type="button" aria-expanded="false"><span style={ textStyle( attributes, 'pfcExpectLabel' ) }>{ attributes.pfcExpectLabel || 'What to expect' }</span><span className="pfc__expect-plus">+</span><span className="pfc__expect-minus">-</span></button>
				{ card.whatToExpect && <RichText.Content tagName="div" className="pfc__expect-content" value={ card.whatToExpect } style={ textStyle( attributes, 'pfcExpectContent' ) } /> }
			</div>
		</div>
	</article>;
}
function ClassCard( props ) { return props.card.type === 'experience-2' ? <ExperienceTwoCard {...props} /> : <ExperienceOneCard {...props} />; }
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
export default function save( { attributes } ) {
	const spaces = normSpaces( attributes.spaces );
	const visible = allCards( spaces ).filter( ( item ) => ! item.card.hidden );
	const blockProps = useBlockProps.save( { className: 'zen-experience-space-block zen-static-experience-space', style: blockStyle( attributes ) } );
	return <div { ...blockProps }><div className="zen-static-experience-space__inner">
		{ attributes.hierarchyEnabled !== false ? spaces.map( ( space, spaceIndex ) => <section className="zen-space-section" key={ space.id || spaceIndex }>
			<header className="zen-space-header">{ space.iconUrl && <img className="zen-space-icon" src={ space.iconUrl } alt={ space.iconAlt || '' } loading="lazy" /> }<RichText.Content tagName="h2" className="zen-space-title" value={ space.title } style={ { ...textStyle( attributes, 'heading' ), whiteSpace: attributes.headingWrap ? 'normal' : 'nowrap' } } /></header>
			<RichText.Content tagName="p" className="zen-space-description" value={ space.description } style={ textStyle( attributes, 'desc' ) } />
			<div className="zen-accordion-wrapper">{ ( space.activities || [] ).map( ( activity, activityIndex ) => {
				const isOpen = attributes.accordionFirstOpen !== false && activityIndex === 0;
				const cards = ( activity.cards || [] ).filter( ( card ) => ! card.hidden );
				return <div className={ `zen-accordion-item${ isOpen ? ' zen-accordion-item--open' : '' }` } key={ activity.id || activityIndex }>
					<button type="button" className="zen-accordion-header" aria-expanded={ isOpen ? 'true' : 'false' }><RichText.Content tagName="span" className="zen-accordion-title" value={ activity.title } style={ { ...textStyle( attributes, 'activity' ), whiteSpace: attributes.activityWrap ? 'normal' : 'nowrap' } } /><span className="zen-accordion-icon" aria-hidden="true"><span className="zen-accordion-icon--minus">-</span><span className="zen-accordion-icon--plus">+</span></span></button>
					<div className="zen-accordion-panel" hidden={ ! isOpen }><div className="zen-class-cards-grid">{ cards.map( ( card ) => <ClassCard key={ card.id } card={ card } attributes={ attributes } /> ) }</div></div>
				</div>;
			} ) }</div>
		</section> ) : <div className="zen-class-cards-grid zen-class-cards-grid--flat">{ visible.map( ( item ) => <ClassCard key={ item.card.id } card={ item.card } attributes={ attributes } /> ) }</div> }
	</div></div>;
}
