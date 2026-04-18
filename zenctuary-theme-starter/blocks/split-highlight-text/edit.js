import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';
import {
	BaseControl,
	ColorPalette,
	PanelBody,
	RangeControl,
	SelectControl,
	ToggleControl,
} from '@wordpress/components';

const COLORS = [
	{ name: 'Gold', color: '#d8b354' },
	{ name: 'Charcoal', color: '#3f3d3d' },
	{ name: 'Cream', color: '#f6f2ea' },
	{ name: 'White', color: '#ffffff' },
];

const WEIGHTS = [ '400', '500', '600', '700', '800' ].map( ( value ) => ( {
	label: value,
	value,
} ) );

const ALIGN = [
	{ label: __( 'Left', 'zenctuary' ), value: 'left' },
	{ label: __( 'Center', 'zenctuary' ), value: 'center' },
	{ label: __( 'Right', 'zenctuary' ), value: 'right' },
];

const FLEX_ALIGN = [
	{ label: __( 'Start', 'zenctuary' ), value: 'flex-start' },
	{ label: __( 'Center', 'zenctuary' ), value: 'center' },
	{ label: __( 'End', 'zenctuary' ), value: 'flex-end' },
];

const JUSTIFY = [
	{ label: __( 'Space Between', 'zenctuary' ), value: 'space-between' },
	{ label: __( 'Start', 'zenctuary' ), value: 'flex-start' },
	{ label: __( 'Center', 'zenctuary' ), value: 'center' },
	{ label: __( 'End', 'zenctuary' ), value: 'flex-end' },
];

const TEXT_TRANSFORM = [
	{ label: __( 'Uppercase', 'zenctuary' ), value: 'uppercase' },
	{ label: __( 'None', 'zenctuary' ), value: 'none' },
];

function ColorControl( { label, value, fallback, onChange } ) {
	return (
		<BaseControl label={ label }>
			<ColorPalette
				colors={ COLORS }
				value={ value }
				onChange={ ( next ) => onChange( next || fallback ) }
			/>
		</BaseControl>
	);
}

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

export default function Edit( { attributes, setAttributes } ) {
	const blockProps = useBlockProps( {
		className: `sht-editor${ attributes.stackOnTablet ? ' is-stack-tablet' : '' }${ attributes.stackOnMobile ? ' is-stack-mobile' : '' }${ attributes.reverseOnMobile ? ' is-reverse-mobile' : '' }`,
		style: blockVars( attributes ),
	} );

	return (
		<div { ...blockProps }>
			<InspectorControls>
				<PanelBody title={ __( 'Section', 'zenctuary' ) } initialOpen>
					<ColorControl label={ __( 'Background Color', 'zenctuary' ) } value={ attributes.sectionBackgroundColor } fallback="#3f3d3d" onChange={ ( sectionBackgroundColor ) => setAttributes( { sectionBackgroundColor } ) } />
					<ColorControl label={ __( 'Default Text Color', 'zenctuary' ) } value={ attributes.sectionTextColor } fallback="#f6f2ea" onChange={ ( sectionTextColor ) => setAttributes( { sectionTextColor } ) } />
					<RangeControl label={ __( 'Max Width', 'zenctuary' ) } value={ attributes.sectionMaxWidth } onChange={ ( sectionMaxWidth ) => setAttributes( { sectionMaxWidth } ) } min={ 960 } max={ 1800 } />
					<RangeControl label={ __( 'Margin Top', 'zenctuary' ) } value={ attributes.sectionMarginTop } onChange={ ( sectionMarginTop ) => setAttributes( { sectionMarginTop } ) } min={ 0 } max={ 240 } />
					<RangeControl label={ __( 'Margin Bottom', 'zenctuary' ) } value={ attributes.sectionMarginBottom } onChange={ ( sectionMarginBottom ) => setAttributes( { sectionMarginBottom } ) } min={ 0 } max={ 240 } />
					<RangeControl label={ __( 'Padding Top', 'zenctuary' ) } value={ attributes.sectionPaddingTop } onChange={ ( sectionPaddingTop ) => setAttributes( { sectionPaddingTop } ) } min={ 0 } max={ 240 } />
					<RangeControl label={ __( 'Padding Right', 'zenctuary' ) } value={ attributes.sectionPaddingRight } onChange={ ( sectionPaddingRight ) => setAttributes( { sectionPaddingRight } ) } min={ 0 } max={ 140 } />
					<RangeControl label={ __( 'Padding Bottom', 'zenctuary' ) } value={ attributes.sectionPaddingBottom } onChange={ ( sectionPaddingBottom ) => setAttributes( { sectionPaddingBottom } ) } min={ 0 } max={ 240 } />
					<RangeControl label={ __( 'Padding Left', 'zenctuary' ) } value={ attributes.sectionPaddingLeft } onChange={ ( sectionPaddingLeft ) => setAttributes( { sectionPaddingLeft } ) } min={ 0 } max={ 140 } />
				</PanelBody>

				<PanelBody title={ __( 'Layout', 'zenctuary' ) }>
					<RangeControl label={ __( 'Left Column Width', 'zenctuary' ) } value={ attributes.leftColumnWidth } onChange={ ( leftColumnWidth ) => setAttributes( { leftColumnWidth } ) } min={ 1 } max={ 8 } />
					<RangeControl label={ __( 'Right Column Width', 'zenctuary' ) } value={ attributes.rightColumnWidth } onChange={ ( rightColumnWidth ) => setAttributes( { rightColumnWidth } ) } min={ 1 } max={ 8 } />
					<RangeControl label={ __( 'Column Gap Desktop', 'zenctuary' ) } value={ attributes.columnGapDesktop } onChange={ ( columnGapDesktop ) => setAttributes( { columnGapDesktop } ) } min={ 0 } max={ 160 } />
					<RangeControl label={ __( 'Column Gap Tablet', 'zenctuary' ) } value={ attributes.columnGapTablet } onChange={ ( columnGapTablet ) => setAttributes( { columnGapTablet } ) } min={ 0 } max={ 120 } />
					<RangeControl label={ __( 'Column Gap Mobile', 'zenctuary' ) } value={ attributes.columnGapMobile } onChange={ ( columnGapMobile ) => setAttributes( { columnGapMobile } ) } min={ 0 } max={ 80 } />
					<SelectControl label={ __( 'Vertical Alignment', 'zenctuary' ) } value={ attributes.verticalAlign } options={ FLEX_ALIGN } onChange={ ( verticalAlign ) => setAttributes( { verticalAlign } ) } />
					<SelectControl label={ __( 'Horizontal Alignment', 'zenctuary' ) } value={ attributes.horizontalAlign } options={ JUSTIFY } onChange={ ( horizontalAlign ) => setAttributes( { horizontalAlign } ) } />
					<ToggleControl label={ __( 'Stack On Tablet', 'zenctuary' ) } checked={ attributes.stackOnTablet } onChange={ ( stackOnTablet ) => setAttributes( { stackOnTablet } ) } />
					<ToggleControl label={ __( 'Stack On Mobile', 'zenctuary' ) } checked={ attributes.stackOnMobile } onChange={ ( stackOnMobile ) => setAttributes( { stackOnMobile } ) } />
					<ToggleControl label={ __( 'Reverse On Mobile', 'zenctuary' ) } checked={ attributes.reverseOnMobile } onChange={ ( reverseOnMobile ) => setAttributes( { reverseOnMobile } ) } />
					<RangeControl label={ __( 'Tablet Stack Spacing', 'zenctuary' ) } value={ attributes.stackSpacingTablet } onChange={ ( stackSpacingTablet ) => setAttributes( { stackSpacingTablet } ) } min={ 0 } max={ 120 } />
					<RangeControl label={ __( 'Mobile Stack Spacing', 'zenctuary' ) } value={ attributes.stackSpacingMobile } onChange={ ( stackSpacingMobile ) => setAttributes( { stackSpacingMobile } ) } min={ 0 } max={ 120 } />
				</PanelBody>

				<PanelBody title={ __( 'Headline', 'zenctuary' ) }>
					<ColorControl label={ __( 'Headline Default Color', 'zenctuary' ) } value={ attributes.headlineColor } fallback="#f6f2ea" onChange={ ( headlineColor ) => setAttributes( { headlineColor } ) } />
					<SelectControl label={ __( 'Alignment', 'zenctuary' ) } value={ attributes.headlineAlignment } options={ ALIGN } onChange={ ( headlineAlignment ) => setAttributes( { headlineAlignment } ) } />
					<SelectControl label={ __( 'Weight', 'zenctuary' ) } value={ attributes.headlineFontWeight } options={ WEIGHTS } onChange={ ( headlineFontWeight ) => setAttributes( { headlineFontWeight } ) } />
					<SelectControl label={ __( 'Text Transform', 'zenctuary' ) } value={ attributes.headlineTextTransform } options={ TEXT_TRANSFORM } onChange={ ( headlineTextTransform ) => setAttributes( { headlineTextTransform } ) } />
					<RangeControl label={ __( 'Max Width', 'zenctuary' ) } value={ attributes.headlineMaxWidth } onChange={ ( headlineMaxWidth ) => setAttributes( { headlineMaxWidth } ) } min={ 180 } max={ 900 } />
					<RangeControl label={ __( 'Font Size Desktop', 'zenctuary' ) } value={ attributes.headlineFontSize } onChange={ ( headlineFontSize ) => setAttributes( { headlineFontSize } ) } min={ 24 } max={ 140 } />
					<RangeControl label={ __( 'Font Size Tablet', 'zenctuary' ) } value={ attributes.headlineFontSizeTablet } onChange={ ( headlineFontSizeTablet ) => setAttributes( { headlineFontSizeTablet } ) } min={ 22 } max={ 120 } />
					<RangeControl label={ __( 'Font Size Mobile', 'zenctuary' ) } value={ attributes.headlineFontSizeMobile } onChange={ ( headlineFontSizeMobile ) => setAttributes( { headlineFontSizeMobile } ) } min={ 20 } max={ 90 } />
					<RangeControl label={ __( 'Line Height', 'zenctuary' ) } value={ attributes.headlineLineHeight } onChange={ ( headlineLineHeight ) => setAttributes( { headlineLineHeight } ) } min={ 0.8 } max={ 1.6 } step={ 0.01 } />
					<RangeControl label={ __( 'Letter Spacing', 'zenctuary' ) } value={ attributes.headlineLetterSpacing } onChange={ ( headlineLetterSpacing ) => setAttributes( { headlineLetterSpacing } ) } min={ -2 } max={ 10 } step={ 0.1 } />
				</PanelBody>

				<PanelBody title={ __( 'Body', 'zenctuary' ) }>
					<ColorControl label={ __( 'Body Color', 'zenctuary' ) } value={ attributes.bodyColor } fallback="#f6f2ea" onChange={ ( bodyColor ) => setAttributes( { bodyColor } ) } />
					<SelectControl label={ __( 'Alignment', 'zenctuary' ) } value={ attributes.bodyAlignment } options={ ALIGN } onChange={ ( bodyAlignment ) => setAttributes( { bodyAlignment } ) } />
					<SelectControl label={ __( 'Weight', 'zenctuary' ) } value={ attributes.bodyFontWeight } options={ WEIGHTS } onChange={ ( bodyFontWeight ) => setAttributes( { bodyFontWeight } ) } />
					<RangeControl label={ __( 'Max Width', 'zenctuary' ) } value={ attributes.bodyMaxWidth } onChange={ ( bodyMaxWidth ) => setAttributes( { bodyMaxWidth } ) } min={ 180 } max={ 900 } />
					<RangeControl label={ __( 'Font Size Desktop', 'zenctuary' ) } value={ attributes.bodyFontSize } onChange={ ( bodyFontSize ) => setAttributes( { bodyFontSize } ) } min={ 14 } max={ 42 } />
					<RangeControl label={ __( 'Font Size Tablet', 'zenctuary' ) } value={ attributes.bodyFontSizeTablet } onChange={ ( bodyFontSizeTablet ) => setAttributes( { bodyFontSizeTablet } ) } min={ 14 } max={ 40 } />
					<RangeControl label={ __( 'Font Size Mobile', 'zenctuary' ) } value={ attributes.bodyFontSizeMobile } onChange={ ( bodyFontSizeMobile ) => setAttributes( { bodyFontSizeMobile } ) } min={ 14 } max={ 34 } />
					<RangeControl label={ __( 'Line Height', 'zenctuary' ) } value={ attributes.bodyLineHeight } onChange={ ( bodyLineHeight ) => setAttributes( { bodyLineHeight } ) } min={ 1.1 } max={ 2.4 } step={ 0.05 } />
					<RangeControl label={ __( 'Letter Spacing', 'zenctuary' ) } value={ attributes.bodyLetterSpacing } onChange={ ( bodyLetterSpacing ) => setAttributes( { bodyLetterSpacing } ) } min={ -1 } max={ 6 } step={ 0.1 } />
				</PanelBody>
			</InspectorControls>

			<div className="sht__inner">
				<div className="sht__grid">
					<div className="sht__col sht__col--headline">
						<RichText
							tagName="h2"
							className="sht__headline"
							value={ attributes.headline }
							onChange={ ( headline ) => setAttributes( { headline } ) }
							placeholder={ __( 'Add large highlighted headline…', 'zenctuary' ) }
							allowedFormats={ [ 'core/bold', 'core/italic', 'core/text-color' ] }
						/>
					</div>
					<div className="sht__col sht__col--body">
						<RichText
							tagName="div"
							className="sht__body"
							value={ attributes.body }
							onChange={ ( body ) => setAttributes( { body } ) }
							placeholder={ __( 'Add supporting paragraph copy…', 'zenctuary' ) }
							allowedFormats={ [ 'core/bold', 'core/italic', 'core/link', 'core/text-color' ] }
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
