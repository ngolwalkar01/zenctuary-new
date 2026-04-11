import { __ } from '@wordpress/i18n';
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
	TextControl,
	ToggleControl,
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';

const FONT_WEIGHT_OPTIONS = [
	{ label: 'Regular', value: '400' },
	{ label: 'Medium', value: '500' },
	{ label: 'Semi Bold', value: '600' },
	{ label: 'Bold', value: '700' },
	{ label: 'Extra Bold', value: '800' },
];

const ARROW_POSITION_OPTIONS = [
	{ label: 'Left', value: 'left' },
	{ label: 'Right', value: 'right' },
	{ label: 'Top', value: 'top' },
	{ label: 'Bottom', value: 'bottom' },
];

const spacingStyle = ( value = {}, property ) => ( {
	[ `${ property }Top` ]: value.top || '0px',
	[ `${ property }Right` ]: value.right || '0px',
	[ `${ property }Bottom` ]: value.bottom || '0px',
	[ `${ property }Left` ]: value.left || '0px',
} );

function SpacingControls( { label, value = {}, onChange } ) {
	const nextValue = {
		top: value.top || '0px',
		right: value.right || '0px',
		bottom: value.bottom || '0px',
		left: value.left || '0px',
	};

	const updateSide = ( side, sideValue ) => {
		onChange( {
			...nextValue,
			[ side ]: sideValue || '0px',
		} );
	};

	return (
		<div className="zen-split-showcase-control-grid">
			<p className="components-base-control__label">{ label }</p>
			<UnitControl label={ __( 'Top', 'zenctuary' ) } value={ nextValue.top } onChange={ ( newValue ) => updateSide( 'top', newValue ) } />
			<UnitControl label={ __( 'Right', 'zenctuary' ) } value={ nextValue.right } onChange={ ( newValue ) => updateSide( 'right', newValue ) } />
			<UnitControl label={ __( 'Bottom', 'zenctuary' ) } value={ nextValue.bottom } onChange={ ( newValue ) => updateSide( 'bottom', newValue ) } />
			<UnitControl label={ __( 'Left', 'zenctuary' ) } value={ nextValue.left } onChange={ ( newValue ) => updateSide( 'left', newValue ) } />
		</div>
	);
}

function CheckIcon() {
	return (
		<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
			<path d="M6.4 11.4 2.9 7.9l1.4-1.4 2.1 2.1 5.3-5.4 1.4 1.5z" />
		</svg>
	);
}

function ArrowIcon() {
	return (
		<svg viewBox="0 0 18 18" aria-hidden="true" focusable="false">
			<path d="M9.7 3.3 15.4 9l-5.7 5.7-1.2-1.2 3.7-3.7H2.6V8.2h9.6L8.5 4.5z" />
		</svg>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const {
		reverseLayout,
		heading,
		headingFontSize,
		headingColor,
		headingFontWeight,
		listItems,
		listFontSize,
		listColor,
		listSpacing,
		paragraph,
		paragraphFontSize,
		paragraphColor,
		paragraphFontWeight,
		buttonText,
		buttonUrl,
		buttonTextColor,
		buttonBackgroundColor,
		buttonBorderColor,
		buttonBorderWidth,
		buttonBorderRadius,
		buttonPadding,
		showArrow,
		arrowPosition,
		images,
		animationSpeed,
		imageWidth,
		imageHeight,
		sectionPadding,
		sectionMargin,
	} = attributes;

	const safeListItems = Array.isArray( listItems ) ? listItems : [];
	const safeImages = Array.isArray( images ) ? images : [];
	const [ activeImage, setActiveImage ] = useState( 0 );

	useEffect( () => {
		if ( safeImages.length < 2 ) {
			setActiveImage( 0 );
			return undefined;
		}

		const interval = window.setInterval( () => {
			setActiveImage( ( current ) => ( current + 1 ) % safeImages.length );
		}, Math.max( animationSpeed, 1 ) * 1000 );

		return () => window.clearInterval( interval );
	}, [ safeImages.length, animationSpeed ] );

	const blockProps = useBlockProps( {
		className: `zen-split-showcase${ reverseLayout ? ' is-reversed' : '' }`,
		style: {
			...spacingStyle( sectionPadding, 'padding' ),
			...spacingStyle( sectionMargin, 'margin' ),
		},
	} );

	const updateListItem = ( itemIndex, value ) => {
		setAttributes( {
			listItems: safeListItems.map( ( item, index ) => ( index === itemIndex ? value : item ) ),
		} );
	};

	const addListItem = () => {
		setAttributes( {
			listItems: [ ...safeListItems, __( 'Add a new benefit.', 'zenctuary' ) ],
		} );
	};

	const removeListItem = ( itemIndex ) => {
		setAttributes( {
			listItems: safeListItems.filter( ( item, index ) => index !== itemIndex ),
		} );
	};

	const selectImages = ( selectedImages ) => {
		const normalizedImages = ( Array.isArray( selectedImages ) ? selectedImages : [ selectedImages ] )
			.filter( Boolean )
			.map( ( image ) => ( {
				id: image.id,
				url: image.url,
				alt: image.alt || image.title || '',
			} ) );

		setAttributes( { images: normalizedImages } );
	};

	const removeImage = ( imageIndex ) => {
		setAttributes( {
			images: safeImages.filter( ( image, index ) => index !== imageIndex ),
		} );
	};

	const buttonStyle = {
		color: buttonTextColor,
		backgroundColor: buttonBackgroundColor,
		borderColor: buttonBorderColor,
		borderWidth: `${ buttonBorderWidth }px`,
		borderRadius: `${ buttonBorderRadius }px`,
		...spacingStyle( buttonPadding, 'padding' ),
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Layout', 'zenctuary' ) }>
					<ToggleControl
						label={ __( 'Reverse Layout', 'zenctuary' ) }
						checked={ reverseLayout }
						onChange={ ( value ) => setAttributes( { reverseLayout: value } ) }
					/>
					<SpacingControls
						label={ __( 'Section Padding', 'zenctuary' ) }
						value={ sectionPadding }
						onChange={ ( value ) => setAttributes( { sectionPadding: value } ) }
					/>
					<SpacingControls
						label={ __( 'Section Margin', 'zenctuary' ) }
						value={ sectionMargin }
						onChange={ ( value ) => setAttributes( { sectionMargin: value } ) }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Heading Typography', 'zenctuary' ) } initialOpen={ false }>
					<RangeControl label={ __( 'Font Size', 'zenctuary' ) } value={ headingFontSize } onChange={ ( value ) => setAttributes( { headingFontSize: value } ) } min={ 18 } max={ 84 } />
					<SelectControl label={ __( 'Font Weight', 'zenctuary' ) } value={ headingFontWeight } options={ FONT_WEIGHT_OPTIONS } onChange={ ( value ) => setAttributes( { headingFontWeight: value } ) } />
					<p className="components-base-control__label">{ __( 'Color', 'zenctuary' ) }</p>
					<ColorPalette value={ headingColor } onChange={ ( value ) => setAttributes( { headingColor: value || '#3f3d3d' } ) } />
				</PanelBody>

				<PanelBody title={ __( 'List Typography', 'zenctuary' ) } initialOpen={ false }>
					<RangeControl label={ __( 'Font Size', 'zenctuary' ) } value={ listFontSize } onChange={ ( value ) => setAttributes( { listFontSize: value } ) } min={ 12 } max={ 36 } />
					<RangeControl label={ __( 'Item Spacing', 'zenctuary' ) } value={ listSpacing } onChange={ ( value ) => setAttributes( { listSpacing: value } ) } min={ 0 } max={ 40 } />
					<p className="components-base-control__label">{ __( 'Color', 'zenctuary' ) }</p>
					<ColorPalette value={ listColor } onChange={ ( value ) => setAttributes( { listColor: value || '#3f3d3d' } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Paragraph Typography', 'zenctuary' ) } initialOpen={ false }>
					<RangeControl label={ __( 'Font Size', 'zenctuary' ) } value={ paragraphFontSize } onChange={ ( value ) => setAttributes( { paragraphFontSize: value } ) } min={ 12 } max={ 40 } />
					<SelectControl label={ __( 'Font Weight', 'zenctuary' ) } value={ paragraphFontWeight } options={ FONT_WEIGHT_OPTIONS } onChange={ ( value ) => setAttributes( { paragraphFontWeight: value } ) } />
					<p className="components-base-control__label">{ __( 'Color', 'zenctuary' ) }</p>
					<ColorPalette value={ paragraphColor } onChange={ ( value ) => setAttributes( { paragraphColor: value || '#3f3d3d' } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Button', 'zenctuary' ) } initialOpen={ false }>
					<TextControl label={ __( 'Button URL', 'zenctuary' ) } value={ buttonUrl } onChange={ ( value ) => setAttributes( { buttonUrl: value } ) } />
					<ToggleControl label={ __( 'Show Arrow Icon', 'zenctuary' ) } checked={ showArrow } onChange={ ( value ) => setAttributes( { showArrow: value } ) } />
					{ showArrow && (
						<SelectControl label={ __( 'Arrow Position', 'zenctuary' ) } value={ arrowPosition } options={ ARROW_POSITION_OPTIONS } onChange={ ( value ) => setAttributes( { arrowPosition: value } ) } />
					) }
					<p className="components-base-control__label">{ __( 'Text Color', 'zenctuary' ) }</p>
					<ColorPalette value={ buttonTextColor } onChange={ ( value ) => setAttributes( { buttonTextColor: value || '#ffffff' } ) } />
					<p className="components-base-control__label">{ __( 'Background Color', 'zenctuary' ) }</p>
					<ColorPalette value={ buttonBackgroundColor } onChange={ ( value ) => setAttributes( { buttonBackgroundColor: value || '#3f3d3d' } ) } />
					<p className="components-base-control__label">{ __( 'Border Color', 'zenctuary' ) }</p>
					<ColorPalette value={ buttonBorderColor } onChange={ ( value ) => setAttributes( { buttonBorderColor: value || '#3f3d3d' } ) } />
					<RangeControl label={ __( 'Border Width', 'zenctuary' ) } value={ buttonBorderWidth } onChange={ ( value ) => setAttributes( { buttonBorderWidth: value } ) } min={ 0 } max={ 8 } />
					<RangeControl label={ __( 'Border Radius', 'zenctuary' ) } value={ buttonBorderRadius } onChange={ ( value ) => setAttributes( { buttonBorderRadius: value } ) } min={ 0 } max={ 32 } />
					<SpacingControls label={ __( 'Padding', 'zenctuary' ) } value={ buttonPadding } onChange={ ( value ) => setAttributes( { buttonPadding: value } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Images', 'zenctuary' ) } initialOpen={ false }>
					<MediaUploadCheck>
						<MediaUpload
							onSelect={ selectImages }
							allowedTypes={ [ 'image' ] }
							multiple
							gallery
							value={ safeImages.map( ( image ) => image.id ) }
							render={ ( { open } ) => (
								<Button variant="primary" onClick={ open }>
									{ safeImages.length ? __( 'Edit Images', 'zenctuary' ) : __( 'Add Images', 'zenctuary' ) }
								</Button>
							) }
						/>
					</MediaUploadCheck>
					<div className="zen-split-showcase-image-list">
						{ safeImages.map( ( image, index ) => (
							<div className="zen-split-showcase-image-list__item" key={ image.id || image.url }>
								<img src={ image.url } alt={ image.alt || '' } />
								<Button variant="tertiary" isDestructive onClick={ () => removeImage( index ) }>
									{ __( 'Remove', 'zenctuary' ) }
								</Button>
							</div>
						) ) }
					</div>
					<RangeControl label={ __( 'Animation Speed (seconds)', 'zenctuary' ) } value={ animationSpeed } onChange={ ( value ) => setAttributes( { animationSpeed: value } ) } min={ 1 } max={ 12 } />
					<RangeControl label={ __( 'Image Width', 'zenctuary' ) } value={ imageWidth } onChange={ ( value ) => setAttributes( { imageWidth: value } ) } min={ 240 } max={ 1200 } />
					<RangeControl label={ __( 'Image Height', 'zenctuary' ) } value={ imageHeight } onChange={ ( value ) => setAttributes( { imageHeight: value } ) } min={ 240 } max={ 1200 } />
				</PanelBody>
			</InspectorControls>

			<section { ...blockProps }>
				<div className="zen-split-showcase__inner">
					<div className="zen-split-showcase__column zen-split-showcase__content-column">
						<div className="zen-split-showcase__content">
							<RichText
								tagName="h2"
								className="zen-split-showcase__heading"
								value={ heading }
								onChange={ ( value ) => setAttributes( { heading: value } ) }
								placeholder={ __( 'ABOUT ZENCTUARY', 'zenctuary' ) }
								allowedFormats={ [ 'core/bold', 'core/italic' ] }
								style={ {
									fontSize: `${ headingFontSize }px`,
									color: headingColor,
									fontWeight: headingFontWeight,
								} }
							/>

							<div className="zen-split-showcase__list" style={ { gap: `${ listSpacing }px` } }>
								{ safeListItems.map( ( item, index ) => (
									<div className="zen-split-showcase__list-row" key={ index }>
										<span className="zen-split-showcase__tick"><CheckIcon /></span>
										<RichText
											tagName="span"
											className="zen-split-showcase__list-text"
											value={ item }
											onChange={ ( value ) => updateListItem( index, value ) }
											placeholder={ __( 'List item', 'zenctuary' ) }
											allowedFormats={ [ 'core/bold', 'core/italic' ] }
											style={ { color: listColor, fontSize: `${ listFontSize }px` } }
										/>
										<Button className="zen-split-showcase__remove-item" variant="tertiary" isDestructive onClick={ () => removeListItem( index ) }>
											{ __( 'Remove', 'zenctuary' ) }
										</Button>
									</div>
								) ) }
								<Button className="zen-split-showcase__add-item" variant="secondary" onClick={ addListItem }>
									{ __( 'Add List Item', 'zenctuary' ) }
								</Button>
							</div>

							<RichText
								tagName="p"
								className="zen-split-showcase__paragraph"
								value={ paragraph }
								onChange={ ( value ) => setAttributes( { paragraph: value } ) }
								placeholder={ __( 'Add supporting paragraph...', 'zenctuary' ) }
								allowedFormats={ [ 'core/bold', 'core/italic', 'core/link' ] }
								style={ {
									color: paragraphColor,
									fontSize: `${ paragraphFontSize }px`,
									fontWeight: paragraphFontWeight,
								} }
							/>

							<a className={ `zen-split-showcase__button is-arrow-${ arrowPosition }` } href={ buttonUrl || '#' } style={ buttonStyle } onClick={ ( event ) => event.preventDefault() }>
								{ showArrow && ( arrowPosition === 'left' || arrowPosition === 'top' ) && <span className="zen-split-showcase__button-icon"><ArrowIcon /></span> }
								<RichText
									tagName="span"
									value={ buttonText }
									onChange={ ( value ) => setAttributes( { buttonText: value } ) }
									placeholder={ __( 'Button text', 'zenctuary' ) }
									allowedFormats={ [ 'core/bold', 'core/italic' ] }
								/>
								{ showArrow && ( arrowPosition === 'right' || arrowPosition === 'bottom' ) && <span className="zen-split-showcase__button-icon"><ArrowIcon /></span> }
							</a>
						</div>
					</div>

					<div className="zen-split-showcase__column zen-split-showcase__image-column">
						<div className="zen-split-showcase__media" style={ { maxWidth: `${ imageWidth }px`, aspectRatio: `${ imageWidth } / ${ imageHeight }` } }>
							{ safeImages.length ? (
								safeImages.map( ( image, index ) => (
									<img
										className={ `zen-split-showcase__image${ index === activeImage ? ' is-active' : '' }` }
										key={ image.id || image.url }
										src={ image.url }
										alt={ image.alt || '' }
									/>
								) )
							) : (
								<div className="zen-split-showcase__media-placeholder">
									{ __( 'Add images from the block settings.', 'zenctuary' ) }
								</div>
							) }
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
