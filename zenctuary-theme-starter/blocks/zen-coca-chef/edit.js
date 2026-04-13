import {
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';
import {
	Button,
	ColorPalette,
	PanelBody,
	RangeControl,
	SelectControl,
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';

const DEFAULT_SPACING = { top: '0px', right: '0px', bottom: '0px', left: '0px' };
const WEIGHTS = [ '300', '400', '500', '600', '700', '800', '900' ].map( ( value ) => ( { label: value, value } ) );
const FIT_OPTIONS = [
	{ label: 'Cover', value: 'cover' },
	{ label: 'Contain', value: 'contain' },
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

function SpacingControls( { label, value, onChange } ) {
	const spacing = normSpacing( value );
	const set = ( side, sideValue ) => onChange( { ...spacing, [ side ]: sideValue || '0px' } );
	return (
		<div className="zen-coca-chef-control-grid">
			<p className="components-base-control__label">{ label }</p>
			<UnitControl label="Top" value={ spacing.top } onChange={ ( sideValue ) => set( 'top', sideValue ) } />
			<UnitControl label="Right" value={ spacing.right } onChange={ ( sideValue ) => set( 'right', sideValue ) } />
			<UnitControl label="Bottom" value={ spacing.bottom } onChange={ ( sideValue ) => set( 'bottom', sideValue ) } />
			<UnitControl label="Left" value={ spacing.left } onChange={ ( sideValue ) => set( 'left', sideValue ) } />
		</div>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const blockProps = useBlockProps( {
		className: 'zen-coca-chef',
		style: {
			...spacingStyle( attributes.sectionPadding, 'padding' ),
			...spacingStyle( attributes.sectionMargin, 'margin' ),
		},
	} );

	const imageStyle = {
		backgroundImage: attributes.image?.url ? `url(${ attributes.image.url })` : 'none',
		backgroundSize: attributes.imageFit,
		borderRadius: `${ attributes.imageRadius }px`,
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title="Section Layout" initialOpen>
					<SpacingControls label="Section padding" value={ attributes.sectionPadding } onChange={ ( sectionPadding ) => setAttributes( { sectionPadding } ) } />
					<SpacingControls label="Section margin" value={ attributes.sectionMargin } onChange={ ( sectionMargin ) => setAttributes( { sectionMargin } ) } />
					<UnitControl label="Columns gap" value={ attributes.columnGap } onChange={ ( columnGap ) => setAttributes( { columnGap: columnGap || '0px' } ) } />
				</PanelBody>

				<PanelBody title="Left Image" initialOpen={ false }>
					<MediaUploadCheck>
						<MediaUpload
							onSelect={ ( image ) => setAttributes( { image: { id: image.id, url: image.url, alt: image.alt || image.title || '' } } ) }
							allowedTypes={ [ 'image' ] }
							value={ attributes.image?.id || 0 }
							render={ ( { open } ) => (
								<Button variant="secondary" onClick={ open }>
									{ attributes.image?.url ? 'Change image' : 'Set image' }
								</Button>
							) }
						/>
					</MediaUploadCheck>
					<SelectControl label="Image fit" value={ attributes.imageFit } options={ FIT_OPTIONS } onChange={ ( imageFit ) => setAttributes( { imageFit } ) } />
					<RangeControl label="Border radius" value={ attributes.imageRadius } onChange={ ( imageRadius ) => setAttributes( { imageRadius } ) } min={ 0 } max={ 80 } />
				</PanelBody>

				<PanelBody title="Overlay Top-Left Text (Name)" initialOpen={ false }>
					<RangeControl label="Font size" value={ attributes.nameFontSize } onChange={ ( nameFontSize ) => setAttributes( { nameFontSize } ) } min={ 18 } max={ 120 } />
					<SelectControl label="Font weight" value={ attributes.nameFontWeight } options={ WEIGHTS } onChange={ ( nameFontWeight ) => setAttributes( { nameFontWeight } ) } />
					<UnitControl label="Letter spacing" value={ attributes.nameLetterSpacing } onChange={ ( nameLetterSpacing ) => setAttributes( { nameLetterSpacing: nameLetterSpacing || '0px' } ) } />
					<p className="components-base-control__label">Color</p>
					<ColorPalette value={ attributes.nameColor } onChange={ ( nameColor ) => setAttributes( { nameColor: nameColor || '#f5f3ed' } ) } />
				</PanelBody>

				<PanelBody title="Overlay Bottom-Left Text (Role)" initialOpen={ false }>
					<RangeControl label="Font size" value={ attributes.roleFontSize } onChange={ ( roleFontSize ) => setAttributes( { roleFontSize } ) } min={ 12 } max={ 48 } />
					<SelectControl label="Font weight" value={ attributes.roleFontWeight } options={ WEIGHTS } onChange={ ( roleFontWeight ) => setAttributes( { roleFontWeight } ) } />
					<UnitControl label="Letter spacing" value={ attributes.roleLetterSpacing } onChange={ ( roleLetterSpacing ) => setAttributes( { roleLetterSpacing: roleLetterSpacing || '0px' } ) } />
					<p className="components-base-control__label">Color</p>
					<ColorPalette value={ attributes.roleColor } onChange={ ( roleColor ) => setAttributes( { roleColor: roleColor || '#f5f3ed' } ) } />
				</PanelBody>

				<PanelBody title="Right Heading" initialOpen={ false }>
					<RangeControl label="Font size" value={ attributes.headingFontSize } onChange={ ( headingFontSize ) => setAttributes( { headingFontSize } ) } min={ 20 } max={ 100 } />
					<SelectControl label="Font weight" value={ attributes.headingFontWeight } options={ WEIGHTS } onChange={ ( headingFontWeight ) => setAttributes( { headingFontWeight } ) } />
					<UnitControl label="Letter spacing" value={ attributes.headingLetterSpacing } onChange={ ( headingLetterSpacing ) => setAttributes( { headingLetterSpacing: headingLetterSpacing || '0px' } ) } />
					<SpacingControls label="Heading margin" value={ attributes.headingMargin } onChange={ ( headingMargin ) => setAttributes( { headingMargin } ) } />
					<p className="components-base-control__label">Color</p>
					<ColorPalette value={ attributes.headingColor } onChange={ ( headingColor ) => setAttributes( { headingColor: headingColor || '#d8b354' } ) } />
				</PanelBody>

				<PanelBody title="Paragraph 1" initialOpen={ false }>
					<RangeControl label="Font size" value={ attributes.paragraphOneFontSize } onChange={ ( paragraphOneFontSize ) => setAttributes( { paragraphOneFontSize } ) } min={ 12 } max={ 44 } />
					<SelectControl label="Font weight" value={ attributes.paragraphOneFontWeight } options={ WEIGHTS } onChange={ ( paragraphOneFontWeight ) => setAttributes( { paragraphOneFontWeight } ) } />
					<RangeControl label="Line height" value={ attributes.paragraphOneLineHeight } onChange={ ( paragraphOneLineHeight ) => setAttributes( { paragraphOneLineHeight } ) } min={ 1 } max={ 2.4 } step={ 0.05 } />
					<SpacingControls label="Paragraph 1 margin" value={ attributes.paragraphOneMargin } onChange={ ( paragraphOneMargin ) => setAttributes( { paragraphOneMargin } ) } />
					<p className="components-base-control__label">Color</p>
					<ColorPalette value={ attributes.paragraphOneColor } onChange={ ( paragraphOneColor ) => setAttributes( { paragraphOneColor: paragraphOneColor || '#f2eee4' } ) } />
				</PanelBody>

				<PanelBody title="Paragraph 2" initialOpen={ false }>
					<RangeControl label="Font size" value={ attributes.paragraphTwoFontSize } onChange={ ( paragraphTwoFontSize ) => setAttributes( { paragraphTwoFontSize } ) } min={ 12 } max={ 44 } />
					<SelectControl label="Font weight" value={ attributes.paragraphTwoFontWeight } options={ WEIGHTS } onChange={ ( paragraphTwoFontWeight ) => setAttributes( { paragraphTwoFontWeight } ) } />
					<RangeControl label="Line height" value={ attributes.paragraphTwoLineHeight } onChange={ ( paragraphTwoLineHeight ) => setAttributes( { paragraphTwoLineHeight } ) } min={ 1 } max={ 2.4 } step={ 0.05 } />
					<SpacingControls label="Paragraph 2 margin" value={ attributes.paragraphTwoMargin } onChange={ ( paragraphTwoMargin ) => setAttributes( { paragraphTwoMargin } ) } />
					<p className="components-base-control__label">Color</p>
					<ColorPalette value={ attributes.paragraphTwoColor } onChange={ ( paragraphTwoColor ) => setAttributes( { paragraphTwoColor: paragraphTwoColor || '#f2eee4' } ) } />
				</PanelBody>
			</InspectorControls>

			<section { ...blockProps }>
				<div className="zen-coca-chef__content" style={ { gap: attributes.columnGap } }>
					<div className="zen-coca-chef__left">
						<div className="zen-coca-chef__image" style={ imageStyle }>
							<div className="zen-coca-chef__image-overlay" />
							<RichText
								tagName="div"
								className="zen-coca-chef__name"
								value={ attributes.nameText }
								onChange={ ( nameText ) => setAttributes( { nameText } ) }
								style={ {
									color: attributes.nameColor,
									fontSize: `${ attributes.nameFontSize }px`,
									fontWeight: attributes.nameFontWeight,
									letterSpacing: attributes.nameLetterSpacing,
								} }
								allowedFormats={ [ 'core/bold', 'core/italic' ] }
							/>
							<RichText
								tagName="div"
								className="zen-coca-chef__role"
								value={ attributes.roleText }
								onChange={ ( roleText ) => setAttributes( { roleText } ) }
								style={ {
									color: attributes.roleColor,
									fontSize: `${ attributes.roleFontSize }px`,
									fontWeight: attributes.roleFontWeight,
									letterSpacing: attributes.roleLetterSpacing,
								} }
								allowedFormats={ [ 'core/bold', 'core/italic' ] }
							/>
						</div>
					</div>
					<div className="zen-coca-chef__right">
						<RichText
							tagName="h2"
							className="zen-coca-chef__heading"
							value={ attributes.heading }
							onChange={ ( heading ) => setAttributes( { heading } ) }
							style={ {
								color: attributes.headingColor,
								fontSize: `${ attributes.headingFontSize }px`,
								fontWeight: attributes.headingFontWeight,
								letterSpacing: attributes.headingLetterSpacing,
								textTransform: 'uppercase',
								...spacingStyle( attributes.headingMargin, 'margin' ),
							} }
							allowedFormats={ [ 'core/bold', 'core/italic' ] }
						/>
						<RichText
							tagName="p"
							className="zen-coca-chef__paragraph zen-coca-chef__paragraph--one"
							value={ attributes.paragraphOne }
							onChange={ ( paragraphOne ) => setAttributes( { paragraphOne } ) }
							style={ {
								color: attributes.paragraphOneColor,
								fontSize: `${ attributes.paragraphOneFontSize }px`,
								fontWeight: attributes.paragraphOneFontWeight,
								lineHeight: attributes.paragraphOneLineHeight,
								...spacingStyle( attributes.paragraphOneMargin, 'margin' ),
							} }
							allowedFormats={ [ 'core/bold', 'core/italic', 'core/link' ] }
						/>
						<RichText
							tagName="p"
							className="zen-coca-chef__paragraph zen-coca-chef__paragraph--two"
							value={ attributes.paragraphTwo }
							onChange={ ( paragraphTwo ) => setAttributes( { paragraphTwo } ) }
							style={ {
								color: attributes.paragraphTwoColor,
								fontSize: `${ attributes.paragraphTwoFontSize }px`,
								fontWeight: attributes.paragraphTwoFontWeight,
								lineHeight: attributes.paragraphTwoLineHeight,
								...spacingStyle( attributes.paragraphTwoMargin, 'margin' ),
							} }
							allowedFormats={ [ 'core/bold', 'core/italic', 'core/link' ] }
						/>
					</div>
				</div>
			</section>
		</>
	);
}
