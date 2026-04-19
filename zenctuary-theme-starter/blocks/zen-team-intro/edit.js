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
	TextControl,
} from '@wordpress/components';

const COLORS = [
	{ name: 'Gold', color: '#d8b354' },
	{ name: 'Charcoal', color: '#3f3d3d' },
	{ name: 'Cream', color: '#f6f2ea' },
	{ name: 'White', color: '#ffffff' },
];

const WEIGHTS = [ '300', '400', '500', '600', '700', '800' ].map( ( value ) => ( {
	label: value,
	value,
} ) );

const FONT_FAMILIES = [
	{
		label: __( 'Montserrat', 'zenctuary' ),
		value: 'var(--wp--preset--font-family--montserrat)',
	},
	{
		label: __( 'DM Sans', 'zenctuary' ),
		value: 'var(--wp--preset--font-family--dm-sans)',
	},
];

const POSITIONS_X = [
	{ label: __( 'Left', 'zenctuary' ), value: 'left' },
	{ label: __( 'Center', 'zenctuary' ), value: 'center' },
	{ label: __( 'Right', 'zenctuary' ), value: 'right' },
];

const POSITIONS_Y = [
	{ label: __( 'Top', 'zenctuary' ), value: 'top' },
	{ label: __( 'Center', 'zenctuary' ), value: 'center' },
	{ label: __( 'Bottom', 'zenctuary' ), value: 'bottom' },
];

const TEXT_ALIGN_OPTIONS = [
	{ label: __( 'Left', 'zenctuary' ), value: 'left' },
	{ label: __( 'Center', 'zenctuary' ), value: 'center' },
	{ label: __( 'Right', 'zenctuary' ), value: 'right' },
];

function ColorControl( { label, value, fallback, onChange } ) {
	return (
		<BaseControl label={ label }>
			<ColorPalette
				colors={ COLORS }
				value={ value }
				onChange={ ( next ) => onChange( next || fallback ) }
			/>
			<TextControl
				value={ value }
				onChange={ ( next ) => onChange( next || fallback ) }
			/>
		</BaseControl>
	);
}

function getOverlayPositionStyle( x, y, offsetX, offsetY ) {
	const style = {};

	if ( x === 'left' ) {
		style.left = '0';
		style.transform = `translate(${ offsetX }px, ${ offsetY }px)`;
		style.textAlign = 'left';
	} else if ( x === 'center' ) {
		style.left = '50%';
		style.transform = `translate(calc(-50% + ${ offsetX }px), ${ offsetY }px)`;
		style.textAlign = 'center';
	} else {
		style.right = '0';
		style.transform = `translate(${ offsetX }px, ${ offsetY }px)`;
		style.textAlign = 'right';
	}

	if ( y === 'top' ) {
		style.top = '0';
	} else if ( y === 'center' ) {
		style.top = '50%';
		style.transform = `${ style.transform } translateY(-50%)`;
	} else {
		style.bottom = '0';
	}

	return style;
}

function getContentPositionStyle( x, y, offsetX, offsetY, width, textAlign ) {
	const style = {
		maxWidth: `${ width }px`,
		textAlign,
	};

	if ( x === 'left' ) {
		style.justifySelf = 'start';
	} else if ( x === 'center' ) {
		style.justifySelf = 'center';
	} else {
		style.justifySelf = 'end';
	}

	if ( y === 'top' ) {
		style.alignSelf = 'start';
	} else if ( y === 'center' ) {
		style.alignSelf = 'center';
	} else {
		style.alignSelf = 'end';
	}

	style.transform = `translate(${ offsetX }px, ${ offsetY }px)`;

	return style;
}

export default function Edit( { attributes, setAttributes } ) {
	const blockProps = useBlockProps( {
		className: 'zti',
		style: {
			'--zti-section-bg': attributes.sectionBackgroundColor,
			'--zti-section-text': attributes.sectionTextColor,
			'--zti-section-max-width': `${ attributes.sectionMaxWidth }px`,
			'--zti-pt': `${ attributes.sectionPaddingTop }px`,
			'--zti-pr': `${ attributes.sectionPaddingRight }px`,
			'--zti-pb': `${ attributes.sectionPaddingBottom }px`,
			'--zti-pl': `${ attributes.sectionPaddingLeft }px`,
			'--zti-gap': `${ attributes.columnGap }px`,
			'--zti-image-width': `${ attributes.imageWidth }px`,
			'--zti-image-min-height': `${ attributes.imageMinHeight }px`,
			'--zti-image-radius': `${ attributes.imageBorderRadius }px`,
			'--zti-overlay-pt': `${ attributes.imageOverlayPaddingTop }px`,
			'--zti-overlay-pr': `${ attributes.imageOverlayPaddingRight }px`,
			'--zti-overlay-pb': `${ attributes.imageOverlayPaddingBottom }px`,
			'--zti-overlay-pl': `${ attributes.imageOverlayPaddingLeft }px`,
			'--zti-name-color': attributes.nameColor,
			'--zti-name-family': attributes.nameFontFamily,
			'--zti-name-size': `${ attributes.nameFontSize }px`,
			'--zti-name-weight': attributes.nameFontWeight,
			'--zti-name-line': attributes.nameLineHeight,
			'--zti-name-ls': `${ attributes.nameLetterSpacing }px`,
			'--zti-name-transform': attributes.nameTextTransform,
			'--zti-name-max': `${ attributes.nameMaxWidth }px`,
			'--zti-role-color': attributes.roleColor,
			'--zti-role-family': attributes.roleFontFamily,
			'--zti-role-size': `${ attributes.roleFontSize }px`,
			'--zti-role-weight': attributes.roleFontWeight,
			'--zti-role-line': attributes.roleLineHeight,
			'--zti-role-ls': `${ attributes.roleLetterSpacing }px`,
			'--zti-role-transform': attributes.roleTextTransform,
			'--zti-role-max': `${ attributes.roleMaxWidth }px`,
			'--zti-content-title-color': attributes.contentTitleColor,
			'--zti-content-title-family': attributes.contentTitleFontFamily,
			'--zti-content-title-size': `${ attributes.contentTitleFontSize }px`,
			'--zti-content-title-weight': attributes.contentTitleFontWeight,
			'--zti-content-title-line': attributes.contentTitleLineHeight,
			'--zti-content-title-ls': `${ attributes.contentTitleLetterSpacing }px`,
			'--zti-content-title-transform': attributes.contentTitleTextTransform,
			'--zti-content-title-bottom': `${ attributes.contentTitleBottomSpacing }px`,
			'--zti-body-color': attributes.contentBodyColor,
			'--zti-body-family': attributes.contentBodyFontFamily,
			'--zti-body-size': `${ attributes.contentBodyFontSize }px`,
			'--zti-body-weight': attributes.contentBodyFontWeight,
			'--zti-body-line': attributes.contentBodyLineHeight,
			'--zti-body-ls': `${ attributes.contentBodyLetterSpacing }px`,
			'--zti-body-max': `${ attributes.contentBodyMaxWidth }px`,
			'--zti-content-max': `${ attributes.contentWidth }px`,
		},
	} );

	const namePositionStyle = getOverlayPositionStyle(
		attributes.nameHorizontal,
		attributes.nameVertical,
		attributes.nameOffsetX,
		attributes.nameOffsetY
	);

	const rolePositionStyle = getOverlayPositionStyle(
		attributes.roleHorizontal,
		attributes.roleVertical,
		attributes.roleOffsetX,
		attributes.roleOffsetY
	);

	const contentPositionStyle = getContentPositionStyle(
		attributes.contentHorizontal,
		attributes.contentVertical,
		attributes.contentOffsetX,
		attributes.contentOffsetY,
		attributes.contentWidth,
		attributes.contentTextAlign
	);

	return (
		<div { ...blockProps }>
			<InspectorControls>
				<PanelBody title={ __( 'Layout', 'zenctuary' ) } initialOpen>
					<ColorControl
						label={ __( 'Section Background', 'zenctuary' ) }
						value={ attributes.sectionBackgroundColor }
						fallback="#3f3d3d"
						onChange={ ( sectionBackgroundColor ) => setAttributes( { sectionBackgroundColor } ) }
					/>
					<ColorControl
						label={ __( 'Section Text', 'zenctuary' ) }
						value={ attributes.sectionTextColor }
						fallback="#f6f2ea"
						onChange={ ( sectionTextColor ) => setAttributes( { sectionTextColor } ) }
					/>
					<RangeControl label={ __( 'Max Width', 'zenctuary' ) } value={ attributes.sectionMaxWidth } onChange={ ( sectionMaxWidth ) => setAttributes( { sectionMaxWidth } ) } min={ 900 } max={ 1800 } />
					<RangeControl label={ __( 'Column Gap', 'zenctuary' ) } value={ attributes.columnGap } onChange={ ( columnGap ) => setAttributes( { columnGap } ) } min={ 0 } max={ 160 } />
					<RangeControl label={ __( 'Padding Top', 'zenctuary' ) } value={ attributes.sectionPaddingTop } onChange={ ( sectionPaddingTop ) => setAttributes( { sectionPaddingTop } ) } min={ 0 } max={ 180 } />
					<RangeControl label={ __( 'Padding Right', 'zenctuary' ) } value={ attributes.sectionPaddingRight } onChange={ ( sectionPaddingRight ) => setAttributes( { sectionPaddingRight } ) } min={ 0 } max={ 120 } />
					<RangeControl label={ __( 'Padding Bottom', 'zenctuary' ) } value={ attributes.sectionPaddingBottom } onChange={ ( sectionPaddingBottom ) => setAttributes( { sectionPaddingBottom } ) } min={ 0 } max={ 180 } />
					<RangeControl label={ __( 'Padding Left', 'zenctuary' ) } value={ attributes.sectionPaddingLeft } onChange={ ( sectionPaddingLeft ) => setAttributes( { sectionPaddingLeft } ) } min={ 0 } max={ 120 } />
				</PanelBody>

				<PanelBody title={ __( 'Image', 'zenctuary' ) }>
					<BaseControl label={ __( 'Profile Image', 'zenctuary' ) }>
						<MediaUploadCheck>
							<MediaUpload
								onSelect={ ( media ) =>
									setAttributes( {
										imageId: media.id,
										imageUrl: media.url,
										imageAlt: media.alt || '',
									} )
								}
								allowedTypes={ [ 'image' ] }
								value={ attributes.imageId }
								render={ ( { open } ) => (
									<div className="zti__media-actions">
										<Button variant="secondary" onClick={ open }>
											{ attributes.imageUrl
												? __( 'Replace Image', 'zenctuary' )
												: __( 'Select Image', 'zenctuary' ) }
										</Button>
										{ attributes.imageUrl && (
											<Button
												variant="tertiary"
												onClick={ () =>
													setAttributes( {
														imageId: undefined,
														imageUrl: '',
														imageAlt: '',
													} )
												}
											>
												{ __( 'Remove Image', 'zenctuary' ) }
											</Button>
										) }
									</div>
								) }
							/>
						</MediaUploadCheck>
					</BaseControl>
					<RangeControl label={ __( 'Image Width', 'zenctuary' ) } value={ attributes.imageWidth } onChange={ ( imageWidth ) => setAttributes( { imageWidth } ) } min={ 280 } max={ 900 } />
					<RangeControl label={ __( 'Image Min Height', 'zenctuary' ) } value={ attributes.imageMinHeight } onChange={ ( imageMinHeight ) => setAttributes( { imageMinHeight } ) } min={ 360 } max={ 1100 } />
					<RangeControl label={ __( 'Image Border Radius', 'zenctuary' ) } value={ attributes.imageBorderRadius } onChange={ ( imageBorderRadius ) => setAttributes( { imageBorderRadius } ) } min={ 0 } max={ 80 } />
				</PanelBody>

				<PanelBody title={ __( 'Left Overlay Name', 'zenctuary' ) }>
					<SelectControl label={ __( 'Font Family', 'zenctuary' ) } value={ attributes.nameFontFamily } options={ FONT_FAMILIES } onChange={ ( nameFontFamily ) => setAttributes( { nameFontFamily } ) } />
					<SelectControl label={ __( 'Horizontal Position', 'zenctuary' ) } value={ attributes.nameHorizontal } options={ POSITIONS_X } onChange={ ( nameHorizontal ) => setAttributes( { nameHorizontal } ) } />
					<SelectControl label={ __( 'Vertical Position', 'zenctuary' ) } value={ attributes.nameVertical } options={ POSITIONS_Y } onChange={ ( nameVertical ) => setAttributes( { nameVertical } ) } />
					<RangeControl label={ __( 'Horizontal Offset', 'zenctuary' ) } value={ attributes.nameOffsetX } onChange={ ( nameOffsetX ) => setAttributes( { nameOffsetX } ) } min={ -200 } max={ 200 } />
					<RangeControl label={ __( 'Vertical Offset', 'zenctuary' ) } value={ attributes.nameOffsetY } onChange={ ( nameOffsetY ) => setAttributes( { nameOffsetY } ) } min={ -200 } max={ 200 } />
					<RangeControl label={ __( 'Text Width', 'zenctuary' ) } value={ attributes.nameMaxWidth } onChange={ ( nameMaxWidth ) => setAttributes( { nameMaxWidth } ) } min={ 80 } max={ 500 } />
					<ColorControl label={ __( 'Color', 'zenctuary' ) } value={ attributes.nameColor } fallback="#ffffff" onChange={ ( nameColor ) => setAttributes( { nameColor } ) } />
					<RangeControl label={ __( 'Font Size', 'zenctuary' ) } value={ attributes.nameFontSize } onChange={ ( nameFontSize ) => setAttributes( { nameFontSize } ) } min={ 16 } max={ 110 } />
					<SelectControl label={ __( 'Weight', 'zenctuary' ) } value={ attributes.nameFontWeight } options={ WEIGHTS } onChange={ ( nameFontWeight ) => setAttributes( { nameFontWeight } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Left Overlay Job Title', 'zenctuary' ) }>
					<SelectControl label={ __( 'Font Family', 'zenctuary' ) } value={ attributes.roleFontFamily } options={ FONT_FAMILIES } onChange={ ( roleFontFamily ) => setAttributes( { roleFontFamily } ) } />
					<BaseControl label={ __( 'Job Title Position', 'zenctuary' ) } />
					<SelectControl label={ __( 'Horizontal Position', 'zenctuary' ) } value={ attributes.roleHorizontal } options={ POSITIONS_X } onChange={ ( roleHorizontal ) => setAttributes( { roleHorizontal } ) } />
					<SelectControl label={ __( 'Vertical Position', 'zenctuary' ) } value={ attributes.roleVertical } options={ POSITIONS_Y } onChange={ ( roleVertical ) => setAttributes( { roleVertical } ) } />
					<RangeControl label={ __( 'Horizontal Offset', 'zenctuary' ) } value={ attributes.roleOffsetX } onChange={ ( roleOffsetX ) => setAttributes( { roleOffsetX } ) } min={ -200 } max={ 200 } />
					<RangeControl label={ __( 'Vertical Offset', 'zenctuary' ) } value={ attributes.roleOffsetY } onChange={ ( roleOffsetY ) => setAttributes( { roleOffsetY } ) } min={ -200 } max={ 200 } />
					<RangeControl label={ __( 'Text Width', 'zenctuary' ) } value={ attributes.roleMaxWidth } onChange={ ( roleMaxWidth ) => setAttributes( { roleMaxWidth } ) } min={ 80 } max={ 500 } />
					<ColorControl label={ __( 'Color', 'zenctuary' ) } value={ attributes.roleColor } fallback="#ffffff" onChange={ ( roleColor ) => setAttributes( { roleColor } ) } />
					<RangeControl label={ __( 'Font Size', 'zenctuary' ) } value={ attributes.roleFontSize } onChange={ ( roleFontSize ) => setAttributes( { roleFontSize } ) } min={ 12 } max={ 72 } />
					<SelectControl label={ __( 'Weight', 'zenctuary' ) } value={ attributes.roleFontWeight } options={ WEIGHTS } onChange={ ( roleFontWeight ) => setAttributes( { roleFontWeight } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Right Content', 'zenctuary' ) }>
					<SelectControl label={ __( 'Title Font Family', 'zenctuary' ) } value={ attributes.contentTitleFontFamily } options={ FONT_FAMILIES } onChange={ ( contentTitleFontFamily ) => setAttributes( { contentTitleFontFamily } ) } />
					<SelectControl label={ __( 'Horizontal Position', 'zenctuary' ) } value={ attributes.contentHorizontal } options={ POSITIONS_X } onChange={ ( contentHorizontal ) => setAttributes( { contentHorizontal } ) } />
					<SelectControl label={ __( 'Vertical Position', 'zenctuary' ) } value={ attributes.contentVertical } options={ POSITIONS_Y } onChange={ ( contentVertical ) => setAttributes( { contentVertical } ) } />
					<RangeControl label={ __( 'Horizontal Offset', 'zenctuary' ) } value={ attributes.contentOffsetX } onChange={ ( contentOffsetX ) => setAttributes( { contentOffsetX } ) } min={ -300 } max={ 300 } />
					<RangeControl label={ __( 'Vertical Offset', 'zenctuary' ) } value={ attributes.contentOffsetY } onChange={ ( contentOffsetY ) => setAttributes( { contentOffsetY } ) } min={ -300 } max={ 300 } />
					<RangeControl label={ __( 'Content Width', 'zenctuary' ) } value={ attributes.contentWidth } onChange={ ( contentWidth ) => setAttributes( { contentWidth } ) } min={ 240 } max={ 1000 } />
					<SelectControl label={ __( 'Text Align', 'zenctuary' ) } value={ attributes.contentTextAlign } options={ TEXT_ALIGN_OPTIONS } onChange={ ( contentTextAlign ) => setAttributes( { contentTextAlign } ) } />
					<ColorControl label={ __( 'Title Color', 'zenctuary' ) } value={ attributes.contentTitleColor } fallback="#d8b354" onChange={ ( contentTitleColor ) => setAttributes( { contentTitleColor } ) } />
					<RangeControl label={ __( 'Title Font Size', 'zenctuary' ) } value={ attributes.contentTitleFontSize } onChange={ ( contentTitleFontSize ) => setAttributes( { contentTitleFontSize } ) } min={ 18 } max={ 110 } />
					<SelectControl label={ __( 'Title Weight', 'zenctuary' ) } value={ attributes.contentTitleFontWeight } options={ WEIGHTS } onChange={ ( contentTitleFontWeight ) => setAttributes( { contentTitleFontWeight } ) } />
					<RangeControl label={ __( 'Space Below Title', 'zenctuary' ) } value={ attributes.contentTitleBottomSpacing } onChange={ ( contentTitleBottomSpacing ) => setAttributes( { contentTitleBottomSpacing } ) } min={ 0 } max={ 100 } />
					<ColorControl label={ __( 'Body Color', 'zenctuary' ) } value={ attributes.contentBodyColor } fallback="#f6f2ea" onChange={ ( contentBodyColor ) => setAttributes( { contentBodyColor } ) } />
					<SelectControl label={ __( 'Body Font Family', 'zenctuary' ) } value={ attributes.contentBodyFontFamily } options={ FONT_FAMILIES } onChange={ ( contentBodyFontFamily ) => setAttributes( { contentBodyFontFamily } ) } />
					<RangeControl label={ __( 'Body Font Size', 'zenctuary' ) } value={ attributes.contentBodyFontSize } onChange={ ( contentBodyFontSize ) => setAttributes( { contentBodyFontSize } ) } min={ 12 } max={ 40 } />
					<SelectControl label={ __( 'Body Weight', 'zenctuary' ) } value={ attributes.contentBodyFontWeight } options={ WEIGHTS } onChange={ ( contentBodyFontWeight ) => setAttributes( { contentBodyFontWeight } ) } />
					<RangeControl label={ __( 'Body Max Width', 'zenctuary' ) } value={ attributes.contentBodyMaxWidth } onChange={ ( contentBodyMaxWidth ) => setAttributes( { contentBodyMaxWidth } ) } min={ 280 } max={ 1000 } />
				</PanelBody>
			</InspectorControls>

			<div className="zti__inner">
				<div className="zti__media">
					<MediaUploadCheck>
						<MediaUpload
							onSelect={ ( media ) =>
								setAttributes( {
									imageId: media.id,
									imageUrl: media.url,
									imageAlt: media.alt || '',
								} )
							}
							allowedTypes={ [ 'image' ] }
							value={ attributes.imageId }
							render={ ( { open } ) => (
								<Button
									className={ `zti__image-button${ attributes.imageUrl ? ' has-image' : '' }` }
									onClick={ open }
								>
									{ attributes.imageUrl ? (
										<img src={ attributes.imageUrl } alt={ attributes.imageAlt || '' } />
									) : (
										<span>{ __( 'Select image', 'zenctuary' ) }</span>
									) }
								</Button>
							) }
						/>
					</MediaUploadCheck>

					<div className="zti__overlay">
						<RichText
							tagName="div"
							className="zti__name"
							value={ attributes.nameText }
							onChange={ ( nameText ) => setAttributes( { nameText } ) }
							style={ namePositionStyle }
							allowedFormats={ [ 'core/bold', 'core/italic' ] }
							placeholder={ __( 'Name', 'zenctuary' ) }
						/>
						<RichText
							tagName="div"
							className="zti__role"
							value={ attributes.roleText }
							onChange={ ( roleText ) => setAttributes( { roleText } ) }
							style={ rolePositionStyle }
							allowedFormats={ [ 'core/bold', 'core/italic' ] }
							placeholder={ __( 'Job title', 'zenctuary' ) }
						/>
					</div>
				</div>

				<div className="zti__content" style={ contentPositionStyle }>
					<RichText
						tagName="h2"
						className="zti__content-title"
						value={ attributes.contentTitle }
						onChange={ ( contentTitle ) => setAttributes( { contentTitle } ) }
						allowedFormats={ [ 'core/bold', 'core/italic' ] }
						placeholder={ __( 'Right title', 'zenctuary' ) }
					/>
					<RichText
						tagName="div"
						className="zti__content-body"
						value={ attributes.contentBody }
						onChange={ ( contentBody ) => setAttributes( { contentBody } ) }
						allowedFormats={ [ 'core/bold', 'core/italic', 'core/link' ] }
						multiline="p"
						placeholder={ __( 'Paragraphs...', 'zenctuary' ) }
					/>
				</div>
			</div>
		</div>
	);
}
