import { InspectorControls, RichText, useBlockProps } from '@wordpress/block-editor';
import { Button, ColorPalette, PanelBody, RangeControl, SelectControl, TextControl, __experimentalUnitControl as UnitControl } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';

const DEFAULT_SPACING = { top: '0px', right: '0px', bottom: '0px', left: '0px' };
const DEFAULT_BOX = {
	topText: '99%',
	bottomText: 'Customer satisfaction',
	topColor: '#d8b354',
	topFontSize: 54,
	percentFontSize: 30,
	topFontWeight: '800',
	bottomColor: '#f1eee7',
	bottomFontSize: 17,
	bottomFontWeight: '500',
	contentGap: '18px',
	padding: { top: '44px', right: '34px', bottom: '42px', left: '34px' },
	borderColor: '#d8b354',
	borderWidth: 2,
	borderRadius: 22,
	backgroundColor: 'transparent',
};
const WEIGHTS = [ '300', '400', '500', '600', '700', '800', '900' ].map( ( value ) => ( { label: value, value } ) );
const WIDTH_OPTIONS = [
	{ label: 'Full width', value: 'full' },
	{ label: 'Custom width', value: 'custom' },
];

const normSpacing = ( value = {} ) => ( { ...DEFAULT_SPACING, ...value } );
const spacingStyle = ( value = {}, prop ) => {
	const spacing = normSpacing( value );
	return {
		[ `${ prop }Top` ]: spacing.top,
		[ `${ prop }Right` ]: spacing.right,
		[ `${ prop }Bottom` ]: spacing.bottom,
		[ `${ prop }Left` ]: spacing.left,
	};
};
const normalizeBox = ( box = {} ) => ( { ...DEFAULT_BOX, ...box, padding: normSpacing( box.padding || DEFAULT_BOX.padding ) } );
const getPlainText = ( value = '' ) => String( value ).replace( /<[^>]+>/g, '' ).replace( /&nbsp;/g, ' ' ).trim();
const parsePercentValue = ( value = '' ) => {
	const plainValue = getPlainText( value );
	const match = plainValue.match( /^(.*?)(%)$/ );

	if ( ! match ) {
		return null;
	}

	return { numberPart: match[ 1 ].trimEnd(), percentPart: match[ 2 ] };
};

function SpacingControls( { label, value, onChange } ) {
	const spacing = normSpacing( value );
	const set = ( side, sideValue ) => onChange( { ...spacing, [ side ]: sideValue || '0px' } );

	return (
		<div className="zen-results-numbers-control-grid">
			<p className="components-base-control__label">{ label }</p>
			<UnitControl label="Top" value={ spacing.top } onChange={ ( value ) => set( 'top', value ) } />
			<UnitControl label="Right" value={ spacing.right } onChange={ ( value ) => set( 'right', value ) } />
			<UnitControl label="Bottom" value={ spacing.bottom } onChange={ ( value ) => set( 'bottom', value ) } />
			<UnitControl label="Left" value={ spacing.left } onChange={ ( value ) => set( 'left', value ) } />
		</div>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const [ selectedBoxIndex, setSelectedBoxIndex ] = useState( 0 );
	const boxes = Array.isArray( attributes.boxes ) ? attributes.boxes.map( normalizeBox ) : [];
	const selectedBox = boxes[ selectedBoxIndex ];

	useEffect( () => {
		if ( selectedBoxIndex > boxes.length - 1 ) {
			setSelectedBoxIndex( Math.max( boxes.length - 1, 0 ) );
		}
	}, [ boxes.length, selectedBoxIndex ] );

	const updateBox = ( index, patch ) => {
		setAttributes( { boxes: boxes.map( ( box, boxIndex ) => boxIndex === index ? normalizeBox( { ...box, ...patch } ) : box ) } );
	};
	const addBox = () => {
		const nextBox = { ...DEFAULT_BOX, id: `box-${ Date.now() }`, topText: '100%', bottomText: 'New metric' };
		setAttributes( { boxes: [ ...boxes, nextBox ] } );
		setSelectedBoxIndex( boxes.length );
	};
	const removeBox = () => {
		setAttributes( { boxes: boxes.filter( ( box, index ) => index !== selectedBoxIndex ) } );
		setSelectedBoxIndex( Math.max( selectedBoxIndex - 1, 0 ) );
	};

	const blockProps = useBlockProps( {
		className: `zen-results-numbers is-width-${ attributes.widthMode || 'full' }`,
		style: {
			backgroundColor: attributes.backgroundColor,
			...spacingStyle( attributes.sectionPadding, 'padding' ),
		},
	} );
	const contentStyle = attributes.widthMode === 'custom' ? { maxWidth: attributes.customWidth || '1200px' } : {};

	const renderBox = ( box, index ) => {
		const parsedTopValue = parsePercentValue( box.topText );

		return (
			<div
			className={ `zen-results-numbers__box${ selectedBoxIndex === index ? ' is-selected' : '' }` }
			key={ box.id || index }
			onClick={ () => setSelectedBoxIndex( index ) }
			style={ {
				...spacingStyle( box.padding, 'padding' ),
				borderColor: box.borderColor,
				borderWidth: `${ box.borderWidth }px`,
				borderRadius: `${ box.borderRadius }px`,
				backgroundColor: box.backgroundColor || 'transparent',
				gap: box.contentGap,
			} }
		>
			<div className="zen-results-numbers__box-top" style={ { color: box.topColor, fontWeight: box.topFontWeight } }>
				{ parsedTopValue ? (
					<span className="zen-results-numbers__box-top-value">
						<span className="zen-results-numbers__box-top-number" style={ { fontSize: `${ box.topFontSize }px` } }>
							{ parsedTopValue.numberPart }
						</span>
						<span className="zen-results-numbers__box-top-percent" style={ { fontSize: `${ box.percentFontSize }px` } }>
							{ parsedTopValue.percentPart }
						</span>
					</span>
				) : (
					<span className="zen-results-numbers__box-top-number" style={ { fontSize: `${ box.topFontSize }px` } }>
						{ getPlainText( box.topText ) }
					</span>
				) }
			</div>
			<RichText
				tagName="div"
				className="zen-results-numbers__box-bottom"
				value={ box.bottomText }
				onChange={ ( bottomText ) => updateBox( index, { bottomText } ) }
				style={ { color: box.bottomColor, fontSize: `${ box.bottomFontSize }px`, fontWeight: box.bottomFontWeight } }
				allowedFormats={ [ 'core/bold', 'core/italic', 'core/link' ] }
			/>
		</div>
		);
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title="Section Settings" initialOpen>
					<SelectControl label="Width" value={ attributes.widthMode } options={ WIDTH_OPTIONS } onChange={ ( widthMode ) => setAttributes( { widthMode } ) } />
					{ attributes.widthMode === 'custom' && <UnitControl label="Custom width" value={ attributes.customWidth } onChange={ ( customWidth ) => setAttributes( { customWidth: customWidth || '1200px' } ) } /> }
					<SpacingControls label="Section padding" value={ attributes.sectionPadding } onChange={ ( sectionPadding ) => setAttributes( { sectionPadding } ) } />
					<UnitControl label="Space after heading row" value={ attributes.rowSpacingHeading } onChange={ ( rowSpacingHeading ) => setAttributes( { rowSpacingHeading: rowSpacingHeading || '0px' } ) } />
					<UnitControl label="Space after paragraph row" value={ attributes.rowSpacingParagraph } onChange={ ( rowSpacingParagraph ) => setAttributes( { rowSpacingParagraph: rowSpacingParagraph || '0px' } ) } />
					<UnitControl label="Spacing between boxes" value={ attributes.boxesGap } onChange={ ( boxesGap ) => setAttributes( { boxesGap: boxesGap || '0px' } ) } />
					<p className="components-base-control__label">Background</p>
					<ColorPalette value={ attributes.backgroundColor } onChange={ ( backgroundColor ) => setAttributes( { backgroundColor: backgroundColor || '#3f3d3d' } ) } />
				</PanelBody>
				<PanelBody title="Heading Row" initialOpen={ false }>
					<RangeControl label="Font size" value={ attributes.headingFontSize } onChange={ ( headingFontSize ) => setAttributes( { headingFontSize } ) } min={ 18 } max={ 84 } />
					<SelectControl label="Font weight" value={ attributes.headingFontWeight } options={ WEIGHTS } onChange={ ( headingFontWeight ) => setAttributes( { headingFontWeight } ) } />
					<UnitControl label="Letter spacing" value={ attributes.headingLetterSpacing } onChange={ ( headingLetterSpacing ) => setAttributes( { headingLetterSpacing: headingLetterSpacing || '0px' } ) } />
					<SpacingControls label="Margin" value={ attributes.headingMargin } onChange={ ( headingMargin ) => setAttributes( { headingMargin } ) } />
					<p className="components-base-control__label">Color</p>
					<ColorPalette value={ attributes.headingColor } onChange={ ( headingColor ) => setAttributes( { headingColor: headingColor || '#d8b354' } ) } />
				</PanelBody>
				<PanelBody title="Paragraph Row" initialOpen={ false }>
					<RangeControl label="Font size" value={ attributes.paragraphFontSize } onChange={ ( paragraphFontSize ) => setAttributes( { paragraphFontSize } ) } min={ 12 } max={ 40 } />
					<SelectControl label="Font weight" value={ attributes.paragraphFontWeight } options={ WEIGHTS } onChange={ ( paragraphFontWeight ) => setAttributes( { paragraphFontWeight } ) } />
					<UnitControl label="Letter spacing" value={ attributes.paragraphLetterSpacing } onChange={ ( paragraphLetterSpacing ) => setAttributes( { paragraphLetterSpacing: paragraphLetterSpacing || '0px' } ) } />
					<SpacingControls label="Margin" value={ attributes.paragraphMargin } onChange={ ( paragraphMargin ) => setAttributes( { paragraphMargin } ) } />
					<p className="components-base-control__label">Color</p>
					<ColorPalette value={ attributes.paragraphColor } onChange={ ( paragraphColor ) => setAttributes( { paragraphColor: paragraphColor || '#f1eee7' } ) } />
				</PanelBody>
				<PanelBody title="Boxes Row" initialOpen>
					<SpacingControls label="Boxes row margin" value={ attributes.boxesMargin } onChange={ ( boxesMargin ) => setAttributes( { boxesMargin } ) } />
					{ boxes.length > 0 && <SelectControl label="Selected box" value={ selectedBoxIndex } options={ boxes.map( ( box, index ) => ( { label: `${ index + 1 }. ${ box.topText || 'Box' }`, value: index } ) ) } onChange={ ( value ) => setSelectedBoxIndex( Number( value ) ) } /> }
					{ selectedBox && <>
						<TextControl label="Top text" value={ selectedBox.topText } onChange={ ( topText ) => updateBox( selectedBoxIndex, { topText } ) } />
						<RangeControl label="Number font size" value={ selectedBox.topFontSize } onChange={ ( topFontSize ) => updateBox( selectedBoxIndex, { topFontSize } ) } min={ 22 } max={ 96 } />
						<RangeControl label="Percent (%) font size" value={ selectedBox.percentFontSize } onChange={ ( percentFontSize ) => updateBox( selectedBoxIndex, { percentFontSize } ) } min={ 12 } max={ 72 } />
						<SelectControl label="Top font weight" value={ selectedBox.topFontWeight } options={ WEIGHTS } onChange={ ( topFontWeight ) => updateBox( selectedBoxIndex, { topFontWeight } ) } />
						<p className="components-base-control__label">Top color</p>
						<ColorPalette value={ selectedBox.topColor } onChange={ ( topColor ) => updateBox( selectedBoxIndex, { topColor: topColor || '#d8b354' } ) } />
						<TextControl label="Bottom text" value={ selectedBox.bottomText } onChange={ ( bottomText ) => updateBox( selectedBoxIndex, { bottomText } ) } />
						<RangeControl label="Bottom font size" value={ selectedBox.bottomFontSize } onChange={ ( bottomFontSize ) => updateBox( selectedBoxIndex, { bottomFontSize } ) } min={ 12 } max={ 36 } />
						<SelectControl label="Bottom font weight" value={ selectedBox.bottomFontWeight } options={ WEIGHTS } onChange={ ( bottomFontWeight ) => updateBox( selectedBoxIndex, { bottomFontWeight } ) } />
						<p className="components-base-control__label">Bottom color</p>
						<ColorPalette value={ selectedBox.bottomColor } onChange={ ( bottomColor ) => updateBox( selectedBoxIndex, { bottomColor: bottomColor || '#f1eee7' } ) } />
						<UnitControl label="Spacing between top and bottom text" value={ selectedBox.contentGap } onChange={ ( contentGap ) => updateBox( selectedBoxIndex, { contentGap: contentGap || '0px' } ) } />
						<SpacingControls label="Box padding" value={ selectedBox.padding } onChange={ ( padding ) => updateBox( selectedBoxIndex, { padding } ) } />
						<RangeControl label="Border width" value={ selectedBox.borderWidth } onChange={ ( borderWidth ) => updateBox( selectedBoxIndex, { borderWidth } ) } min={ 0 } max={ 12 } />
						<RangeControl label="Border radius" value={ selectedBox.borderRadius } onChange={ ( borderRadius ) => updateBox( selectedBoxIndex, { borderRadius } ) } min={ 0 } max={ 60 } />
						<p className="components-base-control__label">Border color</p>
						<ColorPalette value={ selectedBox.borderColor } onChange={ ( borderColor ) => updateBox( selectedBoxIndex, { borderColor: borderColor || '#d8b354' } ) } />
						<TextControl label="Background" value={ selectedBox.backgroundColor } onChange={ ( backgroundColor ) => updateBox( selectedBoxIndex, { backgroundColor: backgroundColor || 'transparent' } ) } help="Use transparent, hex, rgb, or any valid CSS color." />
						<div className="zen-results-numbers-actions">
							<Button variant="tertiary" isDestructive disabled={ boxes.length < 2 } onClick={ removeBox }>Remove box</Button>
						</div>
					</> }
					<div className="zen-results-numbers-actions">
						<Button variant="primary" onClick={ addBox }>Add box</Button>
					</div>
				</PanelBody>
			</InspectorControls>
			<section { ...blockProps }>
				<div className="zen-results-numbers__content" style={ contentStyle }>
					<RichText
						tagName="h2"
						className="zen-results-numbers__heading"
						value={ attributes.heading }
						onChange={ ( heading ) => setAttributes( { heading } ) }
						style={ { color: attributes.headingColor, fontSize: `${ attributes.headingFontSize }px`, fontWeight: attributes.headingFontWeight, letterSpacing: attributes.headingLetterSpacing, marginBottom: attributes.rowSpacingHeading, ...spacingStyle( attributes.headingMargin, 'margin' ) } }
						allowedFormats={ [ 'core/bold', 'core/italic' ] }
					/>
					<RichText
						tagName="p"
						className="zen-results-numbers__paragraph"
						value={ attributes.paragraph }
						onChange={ ( paragraph ) => setAttributes( { paragraph } ) }
						style={ { color: attributes.paragraphColor, fontSize: `${ attributes.paragraphFontSize }px`, fontWeight: attributes.paragraphFontWeight, letterSpacing: attributes.paragraphLetterSpacing, marginBottom: attributes.rowSpacingParagraph, ...spacingStyle( attributes.paragraphMargin, 'margin' ) } }
						allowedFormats={ [ 'core/bold', 'core/italic', 'core/link' ] }
					/>
					<div className="zen-results-numbers__boxes" style={ { gap: attributes.boxesGap, ...spacingStyle( attributes.boxesMargin, 'margin' ) } }>
						{ boxes.map( renderBox ) }
					</div>
				</div>
			</section>
		</>
	);
}
