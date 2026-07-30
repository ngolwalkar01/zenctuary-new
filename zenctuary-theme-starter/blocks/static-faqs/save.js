import { RichText, useBlockProps } from '@wordpress/block-editor';

const textStyle = ( attributes, prefix ) => ( {
	fontFamily: attributes[ `${ prefix }FontFamily` ] || undefined,
	fontSize: attributes[ `${ prefix }FontSize` ],
	fontWeight: attributes[ `${ prefix }FontWeight` ],
	lineHeight: attributes[ `${ prefix }LineHeight` ],
	letterSpacing: attributes[ `${ prefix }LetterSpacing` ],
	color: attributes[ `${ prefix }Color` ],
} );

function getVisibleTabs( tabs, faqs ) {
	return tabs.filter( ( tab ) => faqs.some( ( faq ) => faq.tabId === tab.id ) );
}

function FaqItem( { faq, attributes, index, panelId } ) {
	const open = !! faq.defaultOpen;
	const buttonId = `${ panelId }-faq-${ index }-button`;
	const contentId = `${ panelId }-faq-${ index }-content`;

	return (
		<article className={ `zen-static-faqs__item${ open ? ' is-open' : '' }` } data-faq-item>
			<button id={ buttonId } type="button" className="zen-static-faqs__question-row" aria-expanded={ open ? 'true' : 'false' } aria-controls={ contentId } data-faq-toggle>
				<RichText.Content tagName="span" className="zen-static-faqs__question" value={ faq.question } style={ textStyle( attributes, 'faqQuestion' ) } />
				<span className="zen-static-faqs__icon" aria-hidden="true"><span className="zen-static-faqs__icon-plus">+</span><span className="zen-static-faqs__icon-minus">-</span></span>
			</button>
			<div id={ contentId } className="zen-static-faqs__answer-wrap" role="region" aria-labelledby={ buttonId } hidden={ ! open } data-faq-content>
				<RichText.Content tagName="div" className="zen-static-faqs__answer" value={ faq.answer } style={ textStyle( attributes, 'faqAnswer' ) } />
			</div>
		</article>
	);
}

export default function save( { attributes } ) {
	const tabs = Array.isArray( attributes.tabs ) ? attributes.tabs : [];
	const faqs = Array.isArray( attributes.faqs ) ? attributes.faqs : [];
	const visibleTabs = getVisibleTabs( tabs, faqs );
	const hasTabs = !! attributes.enableTabs && visibleTabs.length > 0;
	const blockProps = useBlockProps.save( {
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

	return (
		<section { ...blockProps } data-static-faqs>
			<div className="zen-static-faqs__stage">
				<div className="zen-static-faqs__base" aria-hidden="true">
					<div className="zen-static-faqs__base-left" />
					<div className="zen-static-faqs__base-right">
						{ attributes.rightImageUrl ? <img className="zen-static-faqs__image" src={ attributes.rightImageUrl } alt={ attributes.rightImageAlt || '' } loading="lazy" /> : <div className="zen-static-faqs__image zen-static-faqs__image--placeholder" /> }
						<span className="zen-static-faqs__image-overlay" />
					</div>
				</div>
				<div className="zen-static-faqs__panel-layer">
					<div className="zen-static-faqs__panel">
						<RichText.Content tagName="h2" className="zen-static-faqs__eyebrow" value={ attributes.eyebrow } style={ { ...textStyle( attributes, 'eyebrow' ), whiteSpace: attributes.eyebrowWrap ? 'normal' : 'nowrap' } } />
						{ hasTabs && (
							<div className="zen-static-faqs__tabs" role="tablist" aria-label="FAQ categories">
								{ visibleTabs.map( ( tab, index ) => (
									<button key={ tab.id } id={ `zen-static-faqs-tab-${ tab.id }` } type="button" className={ `zen-static-faqs__tab${ index === 0 ? ' is-active' : '' }` } role="tab" aria-selected={ index === 0 ? 'true' : 'false' } aria-controls={ `zen-static-faqs-panel-${ tab.id }` } data-faq-tab={ tab.id } style={ textStyle( attributes, 'tab' ) }>
										{ tab.label }
									</button>
								) ) }
							</div>
						) }
						{ hasTabs ? visibleTabs.map( ( tab, tabIndex ) => {
							const panelId = `zen-static-faqs-panel-${ tab.id }`;
							const panelFaqs = faqs.filter( ( faq ) => faq.tabId === tab.id );

							return (
								<div key={ tab.id } id={ panelId } className={ `zen-static-faqs__tab-panel${ tabIndex === 0 ? ' is-active' : '' }` } role="tabpanel" aria-labelledby={ `zen-static-faqs-tab-${ tab.id }` } hidden={ tabIndex !== 0 } data-faq-panel={ tab.id }>
									<h3 className="zen-static-faqs__heading" style={ { ...textStyle( attributes, 'faqHeading' ), whiteSpace: attributes.faqHeadingWrap ? 'normal' : 'nowrap' } }>{ tab.label }</h3>
									<div className="zen-static-faqs__items">
										{ panelFaqs.map( ( faq, faqIndex ) => <FaqItem key={ faq.id || faqIndex } faq={ faq } attributes={ attributes } index={ faqIndex } panelId={ panelId } /> ) }
									</div>
								</div>
							);
						} ) : (
							<div className="zen-static-faqs__tab-panel is-active" data-faq-panel="all">
								<RichText.Content tagName="h3" className="zen-static-faqs__heading" value={ attributes.faqHeading } style={ { ...textStyle( attributes, 'faqHeading' ), whiteSpace: attributes.faqHeadingWrap ? 'normal' : 'nowrap' } } />
								<div className="zen-static-faqs__items">
									{ faqs.map( ( faq, faqIndex ) => <FaqItem key={ faq.id || faqIndex } faq={ faq } attributes={ attributes } index={ faqIndex } panelId="zen-static-faqs-panel-all" /> ) }
								</div>
							</div>
						) }
					</div>
				</div>
			</div>
		</section>
	);
}