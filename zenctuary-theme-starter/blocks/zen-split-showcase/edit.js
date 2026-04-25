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

const BUTTON_ACTION_OPTIONS = [
	{ label: 'Link', value: 'link' },
	{ label: 'Image Popup', value: 'popup-image' },
];

const BUTTON_ICON_OPTIONS = [
	{ label: 'Arrow', value: 'arrow' },
	{ label: 'Plus', value: 'plus' },
	{ label: 'External', value: 'external' },
	{ label: 'Custom Upload', value: 'custom' },
];

const DEFAULT_HEADING_COLOR = 'var(--wp--preset--color--primary)';
const DEFAULT_TEXT_COLOR = '#ffffff';
const DEFAULT_PARAGRAPH_FONT_SIZE = 18;
const DEFAULT_PARAGRAPH_FONT_WEIGHT = '400';
const DEFAULT_BUTTON_FONT_SIZE = 16;
const DEFAULT_BUTTON_FONT_WEIGHT = '700';
const DEFAULT_BUTTON_GAP = 14;
const DEFAULT_BUTTON_ICON_SIZE = 18;

const spacingStyle = ( value = {}, property ) => ( {
	[ `${ property }Top` ]: value.top || '0px',
	[ `${ property }Right` ]: value.right || '0px',
	[ `${ property }Bottom` ]: value.bottom || '0px',
	[ `${ property }Left` ]: value.left || '0px',
} );

const normalizeParagraphs = ( paragraphs, legacyParagraph, legacyTypography = {} ) => {
	const fallbackTypography = {
		fontSize: legacyTypography.fontSize || DEFAULT_PARAGRAPH_FONT_SIZE,
		color: legacyTypography.color || DEFAULT_TEXT_COLOR,
		fontWeight: legacyTypography.fontWeight || DEFAULT_PARAGRAPH_FONT_WEIGHT,
	};

	if ( Array.isArray( paragraphs ) && paragraphs.length ) {
		return paragraphs.map( ( item ) => {
			if ( typeof item === 'string' ) {
				return { text: item, ...fallbackTypography };
			}

			return {
				text: item?.text || '',
				fontSize: item?.fontSize || fallbackTypography.fontSize,
				color: item?.color || fallbackTypography.color,
				fontWeight: item?.fontWeight || fallbackTypography.fontWeight,
			};
		} );
	}

	return [ { text: legacyParagraph || '', ...fallbackTypography } ];
};

const getDefaultButton = ( overrides = {} ) => ( {
	text: 'Book your class',
	actionType: 'link',
	url: '#',
	showIcon: true,
	iconType: 'arrow',
	customIconUrl: '',
	customIconId: 0,
	popupImageUrl: '',
	popupImageId: 0,
	...overrides,
} );

const normalizeButtons = ( buttons, legacy = {} ) => {
	if ( Array.isArray( buttons ) && buttons.length ) {
		return buttons.map( ( item ) => getDefaultButton( item ) );
	}

	return [
		getDefaultButton( {
			text: legacy.buttonText || 'Book your class',
			url: legacy.buttonUrl || '#',
			showIcon: legacy.showArrow ?? true,
			iconType: 'arrow',
		} ),
	];
};

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

function PlusIcon() {
	return (
		<svg viewBox="0 0 18 18" aria-hidden="true" focusable="false">
			<path d="M8 3h2v5h5v2h-5v5H8v-5H3V8h5z" />
		</svg>
	);
}

function ExternalIcon() {
	return (
		<svg viewBox="0 0 18 18" aria-hidden="true" focusable="false">
			<path d="M10 3h5v5h-2V6.41l-5.29 5.3-1.42-1.42 5.3-5.29H10V3z" />
			<path d="M4 4h4v2H6v6h6v-2h2v4H4V4z" />
		</svg>
	);
}

const getIconMarkup = ( button, iconSize ) => {
	if ( button.iconType === 'custom' && button.customIconUrl ) {
		return <img src={ button.customIconUrl } alt="" style={ { width: `${ iconSize }px`, height: `${ iconSize }px`, objectFit: 'contain' } } />;
	}

	if ( button.iconType === 'plus' ) {
		return <PlusIcon />;
	}

	if ( button.iconType === 'external' ) {
		return <ExternalIcon />;
	}

	return <ArrowIcon />;
};

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
		paragraphs,
		paragraphFontSize,
		paragraphColor,
		paragraphFontWeight,
		buttonText,
		buttonUrl,
		buttons,
		buttonGap,
		buttonTextColor,
		buttonBackgroundColor,
		buttonBorderColor,
		buttonBorderWidth,
		buttonBorderRadius,
		buttonFontSize,
		buttonFontWeight,
		buttonPadding,
		showArrow,
		arrowPosition,
		buttonIconSize,
		images,
		animationSpeed,
		imageWidth,
		imageHeight,
		sectionPadding,
		sectionMargin,
	} = attributes;

	const safeListItems = Array.isArray( listItems ) ? listItems : [];
	const safeParagraphs = normalizeParagraphs( paragraphs, paragraph, {
		fontSize: paragraphFontSize,
		color: paragraphColor,
		fontWeight: paragraphFontWeight,
	} );
	const safeButtons = normalizeButtons( buttons, { buttonText, buttonUrl, showArrow } );
	const safeImages = Array.isArray( images ) ? images : [];
	const [ activeImage, setActiveImage ] = useState( 0 );
	const [ selectedParagraphIndex, setSelectedParagraphIndex ] = useState( 0 );
	const selectedParagraph = safeParagraphs[ selectedParagraphIndex ] || safeParagraphs[ 0 ];

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

	useEffect( () => {
		if ( selectedParagraphIndex > safeParagraphs.length - 1 ) {
			setSelectedParagraphIndex( Math.max( safeParagraphs.length - 1, 0 ) );
		}
	}, [ selectedParagraphIndex, safeParagraphs.length ] );

	useEffect( () => {
		if ( ! Array.isArray( buttons ) || ! buttons.length ) {
			setAttributes( { buttons: safeButtons } );
		}
	}, [] );

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

	const updateParagraph = ( paragraphIndex, value ) => {
		setAttributes( {
			paragraphs: safeParagraphs.map( ( item, index ) => (
				index === paragraphIndex ? { ...item, text: value } : item
			) ),
		} );
	};

	const addParagraph = () => {
		setAttributes( {
			paragraphs: [
				...safeParagraphs,
				{
					text: '',
					fontSize: paragraphFontSize || DEFAULT_PARAGRAPH_FONT_SIZE,
					color: paragraphColor || DEFAULT_TEXT_COLOR,
					fontWeight: paragraphFontWeight || DEFAULT_PARAGRAPH_FONT_WEIGHT,
				},
			],
		} );
		setSelectedParagraphIndex( safeParagraphs.length );
	};

	const removeParagraph = ( paragraphIndex ) => {
		const nextParagraphs = safeParagraphs.filter( ( item, index ) => index !== paragraphIndex );

		setAttributes( {
			paragraphs: nextParagraphs.length ? nextParagraphs : [ { text: '' } ],
		} );
		setSelectedParagraphIndex( Math.max( paragraphIndex - 1, 0 ) );
	};

	const updateParagraphTypography = ( key, value ) => {
		setAttributes( {
			paragraphs: safeParagraphs.map( ( item, index ) => (
				index === selectedParagraphIndex ? { ...item, [ key ]: value } : item
			) ),
		} );
	};

	const updateButton = ( buttonIndex, key, value ) => {
		setAttributes( {
			buttons: safeButtons.map( ( item, index ) => (
				index === buttonIndex ? { ...item, [ key ]: value } : item
			) ),
		} );
	};

	const addButton = () => {
		setAttributes( {
			buttons: [
				...safeButtons,
				getDefaultButton(),
			],
		} );
	};

	const removeButton = ( buttonIndex ) => {
		const nextButtons = safeButtons.filter( ( item, index ) => index !== buttonIndex );
		setAttributes( {
			buttons: nextButtons.length ? nextButtons : [ getDefaultButton() ],
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

	const sharedButtonStyle = {
		color: buttonTextColor,
		backgroundColor: buttonBackgroundColor,
		borderColor: buttonBorderColor,
		borderWidth: `${ buttonBorderWidth }px`,
		borderRadius: `${ buttonBorderRadius }px`,
		...( buttonFontSize ? { fontSize: `${ buttonFontSize }px` } : {} ),
		...( buttonFontWeight ? { fontWeight: buttonFontWeight } : {} ),
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
					<ColorPalette value={ headingColor } onChange={ ( value ) => setAttributes( { headingColor: value || DEFAULT_HEADING_COLOR } ) } />
				</PanelBody>

				<PanelBody title={ __( 'List Typography', 'zenctuary' ) } initialOpen={ false }>
					<RangeControl label={ __( 'Font Size', 'zenctuary' ) } value={ listFontSize } onChange={ ( value ) => setAttributes( { listFontSize: value } ) } min={ 12 } max={ 36 } />
					<RangeControl label={ __( 'Item Spacing', 'zenctuary' ) } value={ listSpacing } onChange={ ( value ) => setAttributes( { listSpacing: value } ) } min={ 0 } max={ 40 } />
					<p className="components-base-control__label">{ __( 'Color', 'zenctuary' ) }</p>
					<ColorPalette value={ listColor } onChange={ ( value ) => setAttributes( { listColor: value || DEFAULT_TEXT_COLOR } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Paragraph Typography', 'zenctuary' ) } initialOpen={ false }>
					<SelectControl
						label={ __( 'Paragraph', 'zenctuary' ) }
						value={ selectedParagraphIndex }
						options={ safeParagraphs.map( ( item, index ) => ( {
							label: `${ __( 'Paragraph', 'zenctuary' ) } ${ index + 1 }`,
							value: index,
						} ) ) }
						onChange={ ( value ) => setSelectedParagraphIndex( Number( value ) ) }
					/>
					<RangeControl label={ __( 'Font Size', 'zenctuary' ) } value={ selectedParagraph?.fontSize || DEFAULT_PARAGRAPH_FONT_SIZE } onChange={ ( value ) => updateParagraphTypography( 'fontSize', value ) } min={ 12 } max={ 40 } />
					<SelectControl label={ __( 'Font Weight', 'zenctuary' ) } value={ selectedParagraph?.fontWeight || DEFAULT_PARAGRAPH_FONT_WEIGHT } options={ FONT_WEIGHT_OPTIONS } onChange={ ( value ) => updateParagraphTypography( 'fontWeight', value ) } />
					<p className="components-base-control__label">{ __( 'Color', 'zenctuary' ) }</p>
					<ColorPalette value={ selectedParagraph?.color || DEFAULT_TEXT_COLOR } onChange={ ( value ) => updateParagraphTypography( 'color', value || DEFAULT_TEXT_COLOR ) } />
				</PanelBody>

				<PanelBody title={ __( 'Buttons', 'zenctuary' ) } initialOpen={ false }>
					<RangeControl
						label={ __( 'Buttons Gap', 'zenctuary' ) }
						value={ buttonGap || DEFAULT_BUTTON_GAP }
						onChange={ ( value ) => setAttributes( { buttonGap: value } ) }
						min={ 0 }
						max={ 40 }
					/>
					<ToggleControl
						label={ __( 'Show Icons', 'zenctuary' ) }
						checked={ showArrow }
						onChange={ ( value ) => {
							setAttributes( { showArrow: value } );
							setAttributes( {
								buttons: safeButtons.map( ( item ) => ( { ...item, showIcon: value } ) ),
							} );
						} }
					/>
					{ showArrow && (
						<>
							<SelectControl label={ __( 'Icon Position', 'zenctuary' ) } value={ arrowPosition } options={ ARROW_POSITION_OPTIONS } onChange={ ( value ) => setAttributes( { arrowPosition: value } ) } />
							<RangeControl
								label={ __( 'Icon Size', 'zenctuary' ) }
								value={ buttonIconSize || DEFAULT_BUTTON_ICON_SIZE }
								onChange={ ( value ) => setAttributes( { buttonIconSize: value } ) }
								min={ 10 }
								max={ 40 }
							/>
						</>
					) }
					<p className="components-base-control__label">{ __( 'Text Color', 'zenctuary' ) }</p>
					<ColorPalette value={ buttonTextColor } onChange={ ( value ) => setAttributes( { buttonTextColor: value || '#ffffff' } ) } />
					<p className="components-base-control__label">{ __( 'Background Color', 'zenctuary' ) }</p>
					<ColorPalette value={ buttonBackgroundColor } onChange={ ( value ) => setAttributes( { buttonBackgroundColor: value || '#3f3d3d' } ) } />
					<p className="components-base-control__label">{ __( 'Border Color', 'zenctuary' ) }</p>
					<ColorPalette value={ buttonBorderColor } onChange={ ( value ) => setAttributes( { buttonBorderColor: value || '#3f3d3d' } ) } />
					<RangeControl label={ __( 'Border Width', 'zenctuary' ) } value={ buttonBorderWidth } onChange={ ( value ) => setAttributes( { buttonBorderWidth: value } ) } min={ 0 } max={ 8 } />
					<RangeControl label={ __( 'Border Radius', 'zenctuary' ) } value={ buttonBorderRadius } onChange={ ( value ) => setAttributes( { buttonBorderRadius: value } ) } min={ 0 } max={ 32 } />
					<p className="components-base-control__label">{ __( 'Typography', 'zenctuary' ) }</p>
					<RangeControl label={ __( 'Font Size', 'zenctuary' ) } value={ buttonFontSize || DEFAULT_BUTTON_FONT_SIZE } onChange={ ( value ) => setAttributes( { buttonFontSize: value } ) } min={ 12 } max={ 32 } />
					<SelectControl label={ __( 'Font Weight', 'zenctuary' ) } value={ buttonFontWeight || DEFAULT_BUTTON_FONT_WEIGHT } options={ FONT_WEIGHT_OPTIONS } onChange={ ( value ) => setAttributes( { buttonFontWeight: value } ) } />
					<SpacingControls label={ __( 'Padding', 'zenctuary' ) } value={ buttonPadding } onChange={ ( value ) => setAttributes( { buttonPadding: value } ) } />

					<div className="zen-split-showcase-image-list">
						{ safeButtons.map( ( button, index ) => (
							<div className="zen-split-showcase-image-list__item zen-split-showcase-image-list__item--button" key={ index }>
								<div style={ { gridColumn: '1 / -1', padding: '12px', border: '1px solid #d9d9d9', borderRadius: '8px' } }>
									<TextControl
										label={ `${ __( 'Button', 'zenctuary' ) } ${ index + 1 } ${ __( 'Text', 'zenctuary' ) }` }
										value={ button.text }
										onChange={ ( value ) => updateButton( index, 'text', value ) }
									/>
									<SelectControl
										label={ __( 'Action', 'zenctuary' ) }
										value={ button.actionType || 'link' }
										options={ BUTTON_ACTION_OPTIONS }
										onChange={ ( value ) => updateButton( index, 'actionType', value ) }
									/>
									{ ( button.actionType || 'link' ) === 'link' ? (
										<TextControl
											label={ __( 'Link URL', 'zenctuary' ) }
											value={ button.url || '' }
											onChange={ ( value ) => updateButton( index, 'url', value ) }
										/>
									) : (
										<div style={ { marginBottom: '12px' } }>
											<MediaUploadCheck>
												<MediaUpload
													onSelect={ ( image ) => updateButton( index, 'popupImageUrl', image?.url || '' ) || updateButton( index, 'popupImageId', image?.id || 0 ) }
													allowedTypes={ [ 'image' ] }
													value={ button.popupImageId || 0 }
													render={ ( { open } ) => (
														<Button variant="secondary" onClick={ open }>
															{ button.popupImageUrl ? __( 'Replace Popup Image', 'zenctuary' ) : __( 'Upload Popup Image', 'zenctuary' ) }
														</Button>
													) }
												/>
											</MediaUploadCheck>
											{ button.popupImageUrl ? (
												<div style={ { marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' } }>
													<img src={ button.popupImageUrl } alt="" style={ { width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px' } } />
													<Button
														variant="tertiary"
														isDestructive
														onClick={ () => {
															updateButton( index, 'popupImageUrl', '' );
															updateButton( index, 'popupImageId', 0 );
														} }
													>
														{ __( 'Remove Popup Image', 'zenctuary' ) }
													</Button>
												</div>
											) : null }
										</div>
									) }
									<ToggleControl
										label={ __( 'Show Icon', 'zenctuary' ) }
										checked={ button.showIcon ?? showArrow ?? true }
										onChange={ ( value ) => updateButton( index, 'showIcon', value ) }
									/>
									{ ( button.showIcon ?? showArrow ?? true ) && (
										<>
											<SelectControl
												label={ __( 'Icon Type', 'zenctuary' ) }
												value={ button.iconType || 'arrow' }
												options={ BUTTON_ICON_OPTIONS }
												onChange={ ( value ) => updateButton( index, 'iconType', value ) }
											/>
											{ ( button.iconType || 'arrow' ) === 'custom' ? (
												<div style={ { marginBottom: '12px' } }>
													<MediaUploadCheck>
														<MediaUpload
															onSelect={ ( image ) => updateButton( index, 'customIconUrl', image?.url || '' ) || updateButton( index, 'customIconId', image?.id || 0 ) }
															allowedTypes={ [ 'image' ] }
															value={ button.customIconId || 0 }
															render={ ( { open } ) => (
																<Button variant="secondary" onClick={ open }>
																	{ button.customIconUrl ? __( 'Replace Custom Icon', 'zenctuary' ) : __( 'Upload Custom Icon', 'zenctuary' ) }
																</Button>
															) }
														/>
													</MediaUploadCheck>
													{ button.customIconUrl ? (
														<div style={ { marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' } }>
															<img src={ button.customIconUrl } alt="" style={ { width: '40px', height: '40px', objectFit: 'contain', borderRadius: '4px' } } />
															<Button
																variant="tertiary"
																isDestructive
																onClick={ () => {
																	updateButton( index, 'customIconUrl', '' );
																	updateButton( index, 'customIconId', 0 );
																} }
															>
																{ __( 'Remove Custom Icon', 'zenctuary' ) }
															</Button>
														</div>
													) : null }
												</div>
											) : null }
										</>
									) }
									<Button variant="tertiary" isDestructive onClick={ () => removeButton( index ) }>
										{ __( 'Remove Button', 'zenctuary' ) }
									</Button>
								</div>
							</div>
						) ) }
					</div>

					<Button variant="secondary" onClick={ addButton }>
						{ __( 'Add Button', 'zenctuary' ) }
					</Button>
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
									color: headingColor || DEFAULT_HEADING_COLOR,
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
											style={ { color: listColor || DEFAULT_TEXT_COLOR, fontSize: `${ listFontSize }px` } }
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

							<div className="zen-split-showcase__paragraphs">
								{ safeParagraphs.map( ( item, index ) => (
									<div className={ `zen-split-showcase__paragraph-row${ index === selectedParagraphIndex ? ' is-selected' : '' }` } key={ index } onClick={ () => setSelectedParagraphIndex( index ) }>
										<RichText
											tagName="p"
											className="zen-split-showcase__paragraph"
											value={ item.text }
											onChange={ ( value ) => updateParagraph( index, value ) }
											onFocus={ () => setSelectedParagraphIndex( index ) }
											placeholder={ __( 'Add supporting paragraph...', 'zenctuary' ) }
											allowedFormats={ [ 'core/bold', 'core/italic', 'core/link' ] }
											style={ {
												color: item.color || DEFAULT_TEXT_COLOR,
												fontSize: `${ item.fontSize || DEFAULT_PARAGRAPH_FONT_SIZE }px`,
												fontWeight: item.fontWeight || DEFAULT_PARAGRAPH_FONT_WEIGHT,
											} }
										/>
										<Button className="zen-split-showcase__remove-paragraph" variant="tertiary" isDestructive onClick={ () => removeParagraph( index ) }>
											{ __( 'Remove', 'zenctuary' ) }
										</Button>
									</div>
								) ) }
								<Button className="zen-split-showcase__add-paragraph" variant="secondary" onClick={ addParagraph }>
									{ __( 'Add Paragraph', 'zenctuary' ) }
								</Button>
							</div>

							<div className="zen-split-showcase__buttons" style={ { gap: `${ buttonGap || DEFAULT_BUTTON_GAP }px` } }>
								{ safeButtons.map( ( button, index ) => {
									const iconEnabled = button.showIcon ?? showArrow ?? true;
									const icon = iconEnabled ? getIconMarkup( button, buttonIconSize || DEFAULT_BUTTON_ICON_SIZE ) : null;

									return (
										<a
											key={ index }
											className={ `zen-split-showcase__button is-arrow-${ arrowPosition }` }
											href={ button.actionType === 'popup-image' ? button.popupImageUrl || '#' : ( button.url || '#' ) }
											style={ sharedButtonStyle }
											onClick={ ( event ) => event.preventDefault() }
										>
											{ iconEnabled && ( arrowPosition === 'left' || arrowPosition === 'top' ) && <span className="zen-split-showcase__button-icon" style={ { width: `${ buttonIconSize || DEFAULT_BUTTON_ICON_SIZE }px`, height: `${ buttonIconSize || DEFAULT_BUTTON_ICON_SIZE }px` } }>{ icon }</span> }
											<RichText
												tagName="span"
												value={ button.text }
												onChange={ ( value ) => updateButton( index, 'text', value ) }
												placeholder={ __( 'Button text', 'zenctuary' ) }
												allowedFormats={ [ 'core/bold', 'core/italic' ] }
											/>
											{ iconEnabled && ( arrowPosition === 'right' || arrowPosition === 'bottom' ) && <span className="zen-split-showcase__button-icon" style={ { width: `${ buttonIconSize || DEFAULT_BUTTON_ICON_SIZE }px`, height: `${ buttonIconSize || DEFAULT_BUTTON_ICON_SIZE }px` } }>{ icon }</span> }
										</a>
									);
								} ) }
							</div>
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
