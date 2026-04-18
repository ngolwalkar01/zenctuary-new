import { RichText, useBlockProps } from '@wordpress/block-editor';

function blockVars( attributes ) {
	return {
		'--sht-section-bg': attributes.sectionBackgroundColor,
		'--sht-text': attributes.sectionTextColor,
		'--sht-max': `${ attributes.sectionMaxWidth }px`,
		'--sht-pt': `${ attributes.sectionPaddingTop }px`,
		'--sht-pr': `${ attributes.sectionPaddingRight }px`,
		'--sht-pb': `${ attributes.sectionPaddingBottom }px`,
		'--sht-pl': `${ attributes.sectionPaddingLeft }px`,
		'--sht-pt-tablet': `${ attributes.sectionPaddingTopTablet }px`,
		'--sht-pr-tablet': `${ attributes.sectionPaddingRightTablet }px`,
		'--sht-pb-tablet': `${ attributes.sectionPaddingBottomTablet }px`,
		'--sht-pl-tablet': `${ attributes.sectionPaddingLeftTablet }px`,
		'--sht-pt-mobile': `${ attributes.sectionPaddingTopMobile }px`,
		'--sht-pr-mobile': `${ attributes.sectionPaddingRightMobile }px`,
		'--sht-pb-mobile': `${ attributes.sectionPaddingBottomMobile }px`,
		'--sht-pl-mobile': `${ attributes.sectionPaddingLeftMobile }px`,
		'--sht-mt': `${ attributes.sectionMarginTop }px`,
		'--sht-mb': `${ attributes.sectionMarginBottom }px`,
		'--sht-gap': `${ attributes.columnGapDesktop }px`,
		'--sht-gap-tablet': `${ attributes.columnGapTablet }px`,
		'--sht-gap-mobile': `${ attributes.columnGapMobile }px`,
		'--sht-left': `${ attributes.leftColumnWidth }fr`,
		'--sht-right': `${ attributes.rightColumnWidth }fr`,
		'--sht-align-y': attributes.verticalAlign,
		'--sht-justify': attributes.horizontalAlign,
		'--sht-stack-gap-tablet': `${ attributes.stackSpacingTablet }px`,
		'--sht-stack-gap-mobile': `${ attributes.stackSpacingMobile }px`,
		'--sht-left-pt': `${ attributes.leftPaddingTop }px`,
		'--sht-left-pr': `${ attributes.leftPaddingRight }px`,
		'--sht-left-pb': `${ attributes.leftPaddingBottom }px`,
		'--sht-left-pl': `${ attributes.leftPaddingLeft }px`,
		'--sht-right-pt': `${ attributes.rightPaddingTop }px`,
		'--sht-right-pr': `${ attributes.rightPaddingRight }px`,
		'--sht-right-pb': `${ attributes.rightPaddingBottom }px`,
		'--sht-right-pl': `${ attributes.rightPaddingLeft }px`,
		'--sht-headline-max': `${ attributes.headlineMaxWidth }px`,
		'--sht-headline-align': attributes.headlineAlignment,
		'--sht-headline-color': attributes.headlineColor,
		'--sht-headline-size': `${ attributes.headlineFontSize }px`,
		'--sht-headline-size-tablet': `${ attributes.headlineFontSizeTablet }px`,
		'--sht-headline-size-mobile': `${ attributes.headlineFontSizeMobile }px`,
		'--sht-headline-weight': attributes.headlineFontWeight,
		'--sht-headline-line': attributes.headlineLineHeight,
		'--sht-headline-ls': `${ attributes.headlineLetterSpacing }px`,
		'--sht-headline-transform': attributes.headlineTextTransform,
		'--sht-body-max': `${ attributes.bodyMaxWidth }px`,
		'--sht-body-align': attributes.bodyAlignment,
		'--sht-body-color': attributes.bodyColor,
		'--sht-body-size': `${ attributes.bodyFontSize }px`,
		'--sht-body-size-tablet': `${ attributes.bodyFontSizeTablet }px`,
		'--sht-body-size-mobile': `${ attributes.bodyFontSizeMobile }px`,
		'--sht-body-weight': attributes.bodyFontWeight,
		'--sht-body-line': attributes.bodyLineHeight,
		'--sht-body-ls': `${ attributes.bodyLetterSpacing }px`,
	};
}

export default function save( { attributes } ) {
	const blockProps = useBlockProps.save( {
		className: `sht${ attributes.stackOnTablet ? ' is-stack-tablet' : '' }${ attributes.stackOnMobile ? ' is-stack-mobile' : '' }${ attributes.reverseOnMobile ? ' is-reverse-mobile' : '' }`,
		style: blockVars( attributes ),
	} );

	return (
		<section { ...blockProps }>
			<div className="sht__inner">
				<div className="sht__grid">
					<div className="sht__col sht__col--headline">
						<RichText.Content tagName="h2" className="sht__headline" value={ attributes.headline } />
					</div>
					<div className="sht__col sht__col--body">
						<RichText.Content tagName="div" className="sht__body" value={ attributes.body } />
					</div>
				</div>
			</div>
		</section>
	);
}
