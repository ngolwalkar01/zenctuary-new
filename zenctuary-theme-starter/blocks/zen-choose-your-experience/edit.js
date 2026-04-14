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

const DEFAULT_SPACING = { top: '0px', right: '0px', bottom: '0px', left: '0px' };
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
const IMAGE_FIT_OPTIONS = [
	{ label: 'Cover', value: 'cover' },
	{ label: 'Contain', value: 'contain' },
];
const IMAGE_POSITION_OPTIONS = [
	{ label: 'Center', value: 'center center' },
	{ label: 'Top', value: 'center top' },
	{ label: 'Bottom', value: 'center bottom' },
	{ label: 'Left', value: 'left center' },
	{ label: 'Right', value: 'right center' },
];

const createFeatureRow = ( index = 1 ) => ({
	id: `feature-${ Date.now() }-${ index }`,
	label: 'Includes:',
	text: 'Sauna | Ice Bath | Infrared',
});

const createCard = ( index = 1 ) => ({
	id: `card-${ Date.now() }-${ index }`,
	coinLabel: 'ZENCOINS:',
	coinValue: '5',
	coinSize: 44,
	topBarBg: '#434346',
	topBarTextColor: '#d7b24e',
	topBarFontSize: 38,
	topBarFontWeight: '700',
	topSeparatorColor: '#9a9a9a',
	topSeparatorThickness: 1,
	topSeparatorWidth: 100,
	imageId: 0,
	imageUrl: '',
	imageAlt: '',
	imageFit: 'cover',
	imagePosition: 'center center',
	overlayHeading: 'NEW SESSION',
	overlayHeadingColor: '#f2f1ec',
	overlayHeadingSize: 62,
	overlayHeadingWeight: '700',
	overlayHeadingLetterSpacing: 0.5,
	overlayHeadingPadding: { ...DEFAULT_SPACING },
	timeText: '(60 min)',
	timeTextColor: '#f2f1ec',
	timeTextSize: 18,
	timeTextWeight: '500',
	clockIconSize: 20,
	timeGap: 12,
	description: 'Describe this experience.',
	descriptionColor: '#f2f1ec',
	descriptionSize: 18,
	descriptionWeight: '400',
	descriptionLineHeight: 1.45,
	featureRows: [ createFeatureRow( 1 ) ],
	featureBoldColor: '#f2f1ec',
	featureBoldSize: 17,
	featureBoldWeight: '700',
	featureTextColor: '#f2f1ec',
	featureTextSize: 17,
	featureTextWeight: '400',
	buttonText: 'Book Now',
	buttonBg: '#434346',
	buttonTextColor: '#d7b24e',
	buttonBorderColor: '#d7b24e',
	buttonBorderWidth: 2,
	buttonBorderRadius: 999,
	buttonShowArrow: true,
	buttonArrowPosition: 'right',
	bottomSeparatorColor: '#bcbcbc',
	bottomSeparatorThickness: 1,
	bottomSeparatorWidth: 100,
	footerText: 'What to expect',
	footerTextColor: '#f2f1ec',
	footerTextSize: 17,
	footerTextWeight: '700',
	footerPlusSize: 46,
	footerPlusColor: '#f2f1ec',
});

const normalizeSpacing = ( value = {} ) => ({ ...DEFAULT_SPACING, ...( value || {} ) });
const spacingStyle = ( value = {}, property = 'margin' ) => {
	const spacing = normalizeSpacing( value );
	return {
		[ `${ property }Top` ]: spacing.top,
		[ `${ property }Right` ]: spacing.right,
		[ `${ property }Bottom` ]: spacing.bottom,
		[ `${ property }Left` ]: spacing.left,
	};
};

function SpacingControls( { label, value = {}, onChange } ) {
	const spacing = normalizeSpacing( value );
	const updateSide = ( side, nextValue ) => onChange( { ...spacing, [ side ]: nextValue || '0px' } );

	return (
		<div className="zen-choose-exp-control-grid">
			<p className="components-base-control__label">{ label }</p>
			<UnitControl label={ __( 'Top', 'zenctuary' ) } value={ spacing.top } onChange={ ( nextValue ) => updateSide( 'top', nextValue ) } />
			<UnitControl label={ __( 'Right', 'zenctuary' ) } value={ spacing.right } onChange={ ( nextValue ) => updateSide( 'right', nextValue ) } />
			<UnitControl label={ __( 'Bottom', 'zenctuary' ) } value={ spacing.bottom } onChange={ ( nextValue ) => updateSide( 'bottom', nextValue ) } />
			<UnitControl label={ __( 'Left', 'zenctuary' ) } value={ spacing.left } onChange={ ( nextValue ) => updateSide( 'left', nextValue ) } />
		</div>
	);
}

function ArrowIcon() {
	return <svg viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d="M9.7 3.3 15.4 9l-5.7 5.7-1.2-1.2 3.7-3.7H2.6V8.2h9.6L8.5 4.5z" /></svg>;
}

function ClockIcon() {
	return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10" /><path d="M12 6.5v5.8h4.2v-1.8H13.8V6.5z" /></svg>;
}

function CoinIcon( { value = '5', size = 44 } ) {
	const fontSize = Math.max( 14, Math.round( size * 0.43 ) );
	return (
		<span className="zen-choose-exp__coin" style={ { width: `${ size }px`, height: `${ size }px`, fontSize: `${ fontSize }px` } }>
			<span className="zen-choose-exp__coin-ring" />
			<span className="zen-choose-exp__coin-value">{ value }</span>
		</span>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const {
		sectionPadding,
		sectionMargin,
		headingText,
		headingColor,
		headingFontSize,
		headingFontWeight,
		headingLetterSpacing,
		headingPadding,
		headingMargin,
		paragraphText,
		paragraphColor,
		paragraphFontSize,
		paragraphFontWeight,
		paragraphLineHeight,
		paragraphPadding,
		paragraphMargin,
		cardGap,
		cards,
	} = attributes;

	const safeCards = Array.isArray( cards ) && cards.length ? cards : [ createCard() ];
	const [ selectedCardIndex, setSelectedCardIndex ] = useState( 0 );
	const selectedCard = safeCards[ selectedCardIndex ] || safeCards[ 0 ];

	useEffect( () => {
		if ( selectedCardIndex > safeCards.length - 1 ) {
			setSelectedCardIndex( Math.max( 0, safeCards.length - 1 ) );
		}
	}, [ safeCards.length, selectedCardIndex ] );

	const blockProps = useBlockProps( {
		className: 'zen-choose-exp',
		style: {
			...spacingStyle( sectionPadding, 'padding' ),
			...spacingStyle( sectionMargin, 'margin' ),
			'--zen-choose-exp-card-gap': `${ cardGap }px`,
		},
	} );

	const setCards = ( nextCards ) => setAttributes( { cards: nextCards } );
	const updateCard = ( patch ) => setCards( safeCards.map( ( card, index ) => ( index === selectedCardIndex ? { ...card, ...patch } : card ) ) );
	const addCard = () => {
		const nextCards = [ ...safeCards, createCard( safeCards.length + 1 ) ];
		setCards( nextCards );
		setSelectedCardIndex( nextCards.length - 1 );
	};
	const removeCard = () => {
		if ( safeCards.length <= 1 ) return;
		const nextCards = safeCards.filter( ( card, index ) => index !== selectedCardIndex );
		setCards( nextCards );
		setSelectedCardIndex( Math.max( 0, selectedCardIndex - 1 ) );
	};

	const selectCardImage = ( media ) => updateCard( { imageId: media?.id || 0, imageUrl: media?.url || '', imageAlt: media?.alt || media?.title || '' } );
	const removeCardImage = () => updateCard( { imageId: 0, imageUrl: '', imageAlt: '' } );

	const safeFeatureRows = Array.isArray( selectedCard?.featureRows ) ? selectedCard.featureRows : [];
	const updateFeatureRow = ( rowIndex, patch ) => updateCard( { featureRows: safeFeatureRows.map( ( row, index ) => ( index === rowIndex ? { ...row, ...patch } : row ) ) } );
	const addFeatureRow = () => updateCard( { featureRows: [ ...safeFeatureRows, createFeatureRow( safeFeatureRows.length + 1 ) ] } );
	const removeFeatureRow = ( rowIndex ) => updateCard( { featureRows: safeFeatureRows.filter( ( row, index ) => index !== rowIndex ) } );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Section Layout', 'zenctuary' ) }>
					<SpacingControls label={ __( 'Section Padding', 'zenctuary' ) } value={ sectionPadding } onChange={ ( value ) => setAttributes( { sectionPadding: value } ) } />
					<SpacingControls label={ __( 'Section Margin', 'zenctuary' ) } value={ sectionMargin } onChange={ ( value ) => setAttributes( { sectionMargin: value } ) } />
					<RangeControl label={ __( 'Gap Between Cards', 'zenctuary' ) } value={ cardGap } onChange={ ( value ) => setAttributes( { cardGap: value } ) } min={ 0 } max={ 120 } />
				</PanelBody>

				<PanelBody title={ __( 'Heading Row', 'zenctuary' ) } initialOpen={ false }>
					<RangeControl label={ __( 'Font Size', 'zenctuary' ) } value={ headingFontSize } onChange={ ( value ) => setAttributes( { headingFontSize: value } ) } min={ 20 } max={ 90 } />
					<SelectControl label={ __( 'Font Weight', 'zenctuary' ) } value={ headingFontWeight } options={ FONT_WEIGHT_OPTIONS } onChange={ ( value ) => setAttributes( { headingFontWeight: value } ) } />
					<RangeControl label={ __( 'Letter Spacing', 'zenctuary' ) } value={ headingLetterSpacing } onChange={ ( value ) => setAttributes( { headingLetterSpacing: value } ) } min={ 0 } max={ 8 } step={ 0.2 } />
					<p className="components-base-control__label">{ __( 'Text Color', 'zenctuary' ) }</p>
					<ColorPalette value={ headingColor } onChange={ ( value ) => setAttributes( { headingColor: value || '#d7b24e' } ) } />
					<SpacingControls label={ __( 'Padding', 'zenctuary' ) } value={ headingPadding } onChange={ ( value ) => setAttributes( { headingPadding: value } ) } />
					<SpacingControls label={ __( 'Margin', 'zenctuary' ) } value={ headingMargin } onChange={ ( value ) => setAttributes( { headingMargin: value } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Paragraph Row', 'zenctuary' ) } initialOpen={ false }>
					<RangeControl label={ __( 'Font Size', 'zenctuary' ) } value={ paragraphFontSize } onChange={ ( value ) => setAttributes( { paragraphFontSize: value } ) } min={ 12 } max={ 40 } />
					<SelectControl label={ __( 'Font Weight', 'zenctuary' ) } value={ paragraphFontWeight } options={ FONT_WEIGHT_OPTIONS } onChange={ ( value ) => setAttributes( { paragraphFontWeight: value } ) } />
					<RangeControl label={ __( 'Line Height', 'zenctuary' ) } value={ paragraphLineHeight } onChange={ ( value ) => setAttributes( { paragraphLineHeight: value } ) } min={ 1 } max={ 2.2 } step={ 0.05 } />
					<p className="components-base-control__label">{ __( 'Text Color', 'zenctuary' ) }</p>
					<ColorPalette value={ paragraphColor } onChange={ ( value ) => setAttributes( { paragraphColor: value || '#f2f1ec' } ) } />
					<SpacingControls label={ __( 'Padding', 'zenctuary' ) } value={ paragraphPadding } onChange={ ( value ) => setAttributes( { paragraphPadding: value } ) } />
					<SpacingControls label={ __( 'Margin', 'zenctuary' ) } value={ paragraphMargin } onChange={ ( value ) => setAttributes( { paragraphMargin: value } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Cards Manager', 'zenctuary' ) } initialOpen={ false }>
					<SelectControl
						label={ __( 'Selected Card', 'zenctuary' ) }
						value={ selectedCardIndex }
						options={ safeCards.map( ( card, index ) => ( {
							label: `${ __( 'Card', 'zenctuary' ) } ${ index + 1 }`,
							value: index,
						} ) ) }
						onChange={ ( value ) => setSelectedCardIndex( Number( value ) ) }
					/>
					<div className="zen-choose-exp-actions">
						<Button variant="primary" onClick={ addCard }>{ __( 'Add Card', 'zenctuary' ) }</Button>
						<Button variant="tertiary" isDestructive onClick={ removeCard } disabled={ safeCards.length <= 1 }>{ __( 'Remove Card', 'zenctuary' ) }</Button>
					</div>
				</PanelBody>

				{ selectedCard && (
					<>
						<PanelBody title={ __( 'Card Top Bar', 'zenctuary' ) } initialOpen={ false }>
							<TextControl label={ __( 'Coin Label', 'zenctuary' ) } value={ selectedCard.coinLabel || '' } onChange={ ( value ) => updateCard( { coinLabel: value } ) } />
							<TextControl label={ __( 'Coin Value', 'zenctuary' ) } value={ selectedCard.coinValue || '' } onChange={ ( value ) => updateCard( { coinValue: value } ) } />
							<RangeControl label={ __( 'Coin Size', 'zenctuary' ) } value={ selectedCard.coinSize || 44 } onChange={ ( value ) => updateCard( { coinSize: value } ) } min={ 24 } max={ 96 } />
							<RangeControl label={ __( 'Text Size', 'zenctuary' ) } value={ selectedCard.topBarFontSize || 38 } onChange={ ( value ) => updateCard( { topBarFontSize: value } ) } min={ 14 } max={ 64 } />
							<SelectControl label={ __( 'Text Weight', 'zenctuary' ) } value={ selectedCard.topBarFontWeight || '700' } options={ FONT_WEIGHT_OPTIONS } onChange={ ( value ) => updateCard( { topBarFontWeight: value } ) } />
							<p className="components-base-control__label">{ __( 'Background Color', 'zenctuary' ) }</p>
							<ColorPalette value={ selectedCard.topBarBg } onChange={ ( value ) => updateCard( { topBarBg: value || '#434346' } ) } />
							<p className="components-base-control__label">{ __( 'Text Color', 'zenctuary' ) }</p>
							<ColorPalette value={ selectedCard.topBarTextColor } onChange={ ( value ) => updateCard( { topBarTextColor: value || '#d7b24e' } ) } />
						</PanelBody>

						<PanelBody title={ __( 'Top Separator', 'zenctuary' ) } initialOpen={ false }>
							<RangeControl label={ __( 'Thickness', 'zenctuary' ) } value={ selectedCard.topSeparatorThickness || 1 } onChange={ ( value ) => updateCard( { topSeparatorThickness: value } ) } min={ 1 } max={ 10 } />
							<RangeControl label={ __( 'Width (%)', 'zenctuary' ) } value={ selectedCard.topSeparatorWidth || 100 } onChange={ ( value ) => updateCard( { topSeparatorWidth: value } ) } min={ 10 } max={ 100 } />
							<p className="components-base-control__label">{ __( 'Color', 'zenctuary' ) }</p>
							<ColorPalette value={ selectedCard.topSeparatorColor } onChange={ ( value ) => updateCard( { topSeparatorColor: value || '#9a9a9a' } ) } />
						</PanelBody>

						<PanelBody title={ __( 'Image Area', 'zenctuary' ) } initialOpen={ false }>
							<MediaUploadCheck>
								<MediaUpload
									onSelect={ selectCardImage }
									allowedTypes={ [ 'image' ] }
									value={ selectedCard.imageId || 0 }
									render={ ( { open } ) => (
										<Button variant="primary" onClick={ open }>{ selectedCard.imageUrl ? __( 'Change Image', 'zenctuary' ) : __( 'Select Image', 'zenctuary' ) }</Button>
									) }
								/>
							</MediaUploadCheck>
							{ selectedCard.imageUrl && <Button variant="tertiary" isDestructive onClick={ removeCardImage }>{ __( 'Remove Image', 'zenctuary' ) }</Button> }
							<SelectControl label={ __( 'Image Fit', 'zenctuary' ) } value={ selectedCard.imageFit || 'cover' } options={ IMAGE_FIT_OPTIONS } onChange={ ( value ) => updateCard( { imageFit: value } ) } />
							<SelectControl label={ __( 'Image Position', 'zenctuary' ) } value={ selectedCard.imagePosition || 'center center' } options={ IMAGE_POSITION_OPTIONS } onChange={ ( value ) => updateCard( { imagePosition: value } ) } />
						</PanelBody>

						<PanelBody title={ __( 'Overlay Heading', 'zenctuary' ) } initialOpen={ false }>
							<RangeControl label={ __( 'Font Size', 'zenctuary' ) } value={ selectedCard.overlayHeadingSize || 62 } onChange={ ( value ) => updateCard( { overlayHeadingSize: value } ) } min={ 18 } max={ 90 } />
							<SelectControl label={ __( 'Font Weight', 'zenctuary' ) } value={ selectedCard.overlayHeadingWeight || '700' } options={ FONT_WEIGHT_OPTIONS } onChange={ ( value ) => updateCard( { overlayHeadingWeight: value } ) } />
							<RangeControl label={ __( 'Letter Spacing', 'zenctuary' ) } value={ selectedCard.overlayHeadingLetterSpacing || 0.5 } onChange={ ( value ) => updateCard( { overlayHeadingLetterSpacing: value } ) } min={ 0 } max={ 8 } step={ 0.2 } />
							<p className="components-base-control__label">{ __( 'Color', 'zenctuary' ) }</p>
							<ColorPalette value={ selectedCard.overlayHeadingColor } onChange={ ( value ) => updateCard( { overlayHeadingColor: value || '#f2f1ec' } ) } />
							<SpacingControls label={ __( 'Padding', 'zenctuary' ) } value={ selectedCard.overlayHeadingPadding } onChange={ ( value ) => updateCard( { overlayHeadingPadding: value } ) } />
						</PanelBody>

						<PanelBody title={ __( 'Time Row', 'zenctuary' ) } initialOpen={ false }>
							<RangeControl label={ __( 'Clock Icon Size', 'zenctuary' ) } value={ selectedCard.clockIconSize || 20 } onChange={ ( value ) => updateCard( { clockIconSize: value } ) } min={ 12 } max={ 48 } />
							<RangeControl label={ __( 'Text Size', 'zenctuary' ) } value={ selectedCard.timeTextSize || 18 } onChange={ ( value ) => updateCard( { timeTextSize: value } ) } min={ 12 } max={ 40 } />
							<SelectControl label={ __( 'Text Weight', 'zenctuary' ) } value={ selectedCard.timeTextWeight || '500' } options={ FONT_WEIGHT_OPTIONS } onChange={ ( value ) => updateCard( { timeTextWeight: value } ) } />
							<RangeControl label={ __( 'Icon/Text Gap', 'zenctuary' ) } value={ selectedCard.timeGap || 12 } onChange={ ( value ) => updateCard( { timeGap: value } ) } min={ 0 } max={ 40 } />
							<p className="components-base-control__label">{ __( 'Text Color', 'zenctuary' ) }</p>
							<ColorPalette value={ selectedCard.timeTextColor } onChange={ ( value ) => updateCard( { timeTextColor: value || '#f2f1ec' } ) } />
						</PanelBody>

						<PanelBody title={ __( 'Description', 'zenctuary' ) } initialOpen={ false }>
							<RangeControl label={ __( 'Font Size', 'zenctuary' ) } value={ selectedCard.descriptionSize || 18 } onChange={ ( value ) => updateCard( { descriptionSize: value } ) } min={ 12 } max={ 36 } />
							<SelectControl label={ __( 'Font Weight', 'zenctuary' ) } value={ selectedCard.descriptionWeight || '400' } options={ FONT_WEIGHT_OPTIONS } onChange={ ( value ) => updateCard( { descriptionWeight: value } ) } />
							<RangeControl label={ __( 'Line Height', 'zenctuary' ) } value={ selectedCard.descriptionLineHeight || 1.45 } onChange={ ( value ) => updateCard( { descriptionLineHeight: value } ) } min={ 1 } max={ 2.2 } step={ 0.05 } />
							<p className="components-base-control__label">{ __( 'Color', 'zenctuary' ) }</p>
							<ColorPalette value={ selectedCard.descriptionColor } onChange={ ( value ) => updateCard( { descriptionColor: value || '#f2f1ec' } ) } />
						</PanelBody>

						<PanelBody title={ __( 'Feature Rows', 'zenctuary' ) } initialOpen={ false }>
							<RangeControl label={ __( 'Bold Text Size', 'zenctuary' ) } value={ selectedCard.featureBoldSize || 17 } onChange={ ( value ) => updateCard( { featureBoldSize: value } ) } min={ 12 } max={ 32 } />
							<SelectControl label={ __( 'Bold Text Weight', 'zenctuary' ) } value={ selectedCard.featureBoldWeight || '700' } options={ FONT_WEIGHT_OPTIONS } onChange={ ( value ) => updateCard( { featureBoldWeight: value } ) } />
							<p className="components-base-control__label">{ __( 'Bold Text Color', 'zenctuary' ) }</p>
							<ColorPalette value={ selectedCard.featureBoldColor } onChange={ ( value ) => updateCard( { featureBoldColor: value || '#f2f1ec' } ) } />
							<RangeControl label={ __( 'Normal Text Size', 'zenctuary' ) } value={ selectedCard.featureTextSize || 17 } onChange={ ( value ) => updateCard( { featureTextSize: value } ) } min={ 12 } max={ 32 } />
							<SelectControl label={ __( 'Normal Text Weight', 'zenctuary' ) } value={ selectedCard.featureTextWeight || '400' } options={ FONT_WEIGHT_OPTIONS } onChange={ ( value ) => updateCard( { featureTextWeight: value } ) } />
							<p className="components-base-control__label">{ __( 'Normal Text Color', 'zenctuary' ) }</p>
							<ColorPalette value={ selectedCard.featureTextColor } onChange={ ( value ) => updateCard( { featureTextColor: value || '#f2f1ec' } ) } />
							<div className="zen-choose-exp-actions"><Button variant="primary" onClick={ addFeatureRow }>{ __( 'Add Feature Row', 'zenctuary' ) }</Button></div>
						</PanelBody>

						<PanelBody title={ __( 'Button Row', 'zenctuary' ) } initialOpen={ false }>
							<RangeControl label={ __( 'Border Width', 'zenctuary' ) } value={ selectedCard.buttonBorderWidth || 2 } onChange={ ( value ) => updateCard( { buttonBorderWidth: value } ) } min={ 0 } max={ 10 } />
							<RangeControl label={ __( 'Border Radius', 'zenctuary' ) } value={ selectedCard.buttonBorderRadius || 999 } onChange={ ( value ) => updateCard( { buttonBorderRadius: value } ) } min={ 0 } max={ 999 } />
							<ToggleControl label={ __( 'Show Arrow Icon', 'zenctuary' ) } checked={ !! selectedCard.buttonShowArrow } onChange={ ( value ) => updateCard( { buttonShowArrow: value } ) } />
							{ selectedCard.buttonShowArrow && <SelectControl label={ __( 'Arrow Position', 'zenctuary' ) } value={ selectedCard.buttonArrowPosition || 'right' } options={ ARROW_POSITION_OPTIONS } onChange={ ( value ) => updateCard( { buttonArrowPosition: value } ) } /> }
							<p className="components-base-control__label">{ __( 'Background Color', 'zenctuary' ) }</p>
							<ColorPalette value={ selectedCard.buttonBg } onChange={ ( value ) => updateCard( { buttonBg: value || '#434346' } ) } />
							<p className="components-base-control__label">{ __( 'Text Color', 'zenctuary' ) }</p>
							<ColorPalette value={ selectedCard.buttonTextColor } onChange={ ( value ) => updateCard( { buttonTextColor: value || '#d7b24e' } ) } />
							<p className="components-base-control__label">{ __( 'Border Color', 'zenctuary' ) }</p>
							<ColorPalette value={ selectedCard.buttonBorderColor } onChange={ ( value ) => updateCard( { buttonBorderColor: value || '#d7b24e' } ) } />
						</PanelBody>

						<PanelBody title={ __( 'Bottom Separator + Toggle Row', 'zenctuary' ) } initialOpen={ false }>
							<RangeControl label={ __( 'Separator Thickness', 'zenctuary' ) } value={ selectedCard.bottomSeparatorThickness || 1 } onChange={ ( value ) => updateCard( { bottomSeparatorThickness: value } ) } min={ 1 } max={ 10 } />
							<RangeControl label={ __( 'Separator Width (%)', 'zenctuary' ) } value={ selectedCard.bottomSeparatorWidth || 100 } onChange={ ( value ) => updateCard( { bottomSeparatorWidth: value } ) } min={ 10 } max={ 100 } />
							<p className="components-base-control__label">{ __( 'Separator Color', 'zenctuary' ) }</p>
							<ColorPalette value={ selectedCard.bottomSeparatorColor } onChange={ ( value ) => updateCard( { bottomSeparatorColor: value || '#bcbcbc' } ) } />
							<RangeControl label={ __( 'Footer Text Size', 'zenctuary' ) } value={ selectedCard.footerTextSize || 17 } onChange={ ( value ) => updateCard( { footerTextSize: value } ) } min={ 12 } max={ 36 } />
							<SelectControl label={ __( 'Footer Text Weight', 'zenctuary' ) } value={ selectedCard.footerTextWeight || '700' } options={ FONT_WEIGHT_OPTIONS } onChange={ ( value ) => updateCard( { footerTextWeight: value } ) } />
							<RangeControl label={ __( 'Plus Icon Size', 'zenctuary' ) } value={ selectedCard.footerPlusSize || 46 } onChange={ ( value ) => updateCard( { footerPlusSize: value } ) } min={ 14 } max={ 80 } />
							<p className="components-base-control__label">{ __( 'Footer Text Color', 'zenctuary' ) }</p>
							<ColorPalette value={ selectedCard.footerTextColor } onChange={ ( value ) => updateCard( { footerTextColor: value || '#f2f1ec' } ) } />
							<p className="components-base-control__label">{ __( 'Plus Icon Color', 'zenctuary' ) }</p>
							<ColorPalette value={ selectedCard.footerPlusColor } onChange={ ( value ) => updateCard( { footerPlusColor: value || '#f2f1ec' } ) } />
						</PanelBody>
					</>
				) }
			</InspectorControls>

			<section { ...blockProps }>
				<div className="zen-choose-exp__inner">
					<RichText tagName="h2" className="zen-choose-exp__heading" value={ headingText } onChange={ ( value ) => setAttributes( { headingText: value } ) } placeholder={ __( 'CHOOSE YOUR EXPERIENCE', 'zenctuary' ) } style={ { color: headingColor, fontSize: `${ headingFontSize }px`, fontWeight: headingFontWeight, letterSpacing: `${ headingLetterSpacing }px`, ...spacingStyle( headingPadding, 'padding' ), ...spacingStyle( headingMargin, 'margin' ) } } />
					<RichText tagName="p" className="zen-choose-exp__paragraph" value={ paragraphText } onChange={ ( value ) => setAttributes( { paragraphText: value } ) } placeholder={ __( 'Add paragraph...', 'zenctuary' ) } style={ { color: paragraphColor, fontSize: `${ paragraphFontSize }px`, fontWeight: paragraphFontWeight, lineHeight: paragraphLineHeight, ...spacingStyle( paragraphPadding, 'padding' ), ...spacingStyle( paragraphMargin, 'margin' ) } } />

					<div className="zen-choose-exp__cards">
						{ safeCards.map( ( card, cardIndex ) => {
							const cardButtonClass = `zen-choose-exp__button is-arrow-${ card.buttonArrowPosition || 'right' }`;
							const features = Array.isArray( card.featureRows ) ? card.featureRows : [];
							return (
								<article className={ `zen-choose-exp__card${ cardIndex === selectedCardIndex ? ' is-selected' : '' }` } key={ card.id || cardIndex } onClick={ () => setSelectedCardIndex( cardIndex ) }>
									<div className="zen-choose-exp__card-top" style={ { backgroundColor: card.topBarBg } }>
										<div className="zen-choose-exp__coin-row" style={ { color: card.topBarTextColor, fontSize: `${ card.topBarFontSize }px`, fontWeight: card.topBarFontWeight } }>
											<RichText tagName="span" className="zen-choose-exp__coin-label" value={ card.coinLabel || '' } onChange={ ( value ) => cardIndex === selectedCardIndex && updateCard( { coinLabel: value } ) } placeholder={ __( 'ZENCOINS:', 'zenctuary' ) } />
											<CoinIcon value={ card.coinValue || '' } size={ card.coinSize || 44 } />
										</div>
									</div>
									<div className="zen-choose-exp__separator zen-choose-exp__separator--top" style={ { width: `${ card.topSeparatorWidth || 100 }%`, borderTopColor: card.topSeparatorColor, borderTopWidth: `${ card.topSeparatorThickness || 1 }px` } } />
									<div className="zen-choose-exp__media" style={ { backgroundImage: card.imageUrl ? `url(${ card.imageUrl })` : 'none', backgroundSize: card.imageFit || 'cover', backgroundPosition: card.imagePosition || 'center center' } }>
										<div className="zen-choose-exp__overlay">
											<RichText tagName="h3" className="zen-choose-exp__card-heading" value={ card.overlayHeading || '' } onChange={ ( value ) => cardIndex === selectedCardIndex && updateCard( { overlayHeading: value } ) } placeholder={ __( 'FREE FLOW SESSION', 'zenctuary' ) } style={ { color: card.overlayHeadingColor, fontSize: `${ card.overlayHeadingSize }px`, fontWeight: card.overlayHeadingWeight, letterSpacing: `${ card.overlayHeadingLetterSpacing || 0 }px`, ...spacingStyle( card.overlayHeadingPadding, 'padding' ) } } />
											<div className="zen-choose-exp__time-row" style={ { color: card.timeTextColor, gap: `${ card.timeGap || 12 }px` } }>
												<span className="zen-choose-exp__clock" style={ { width: `${ card.clockIconSize || 20 }px`, height: `${ card.clockIconSize || 20 }px` } }><ClockIcon /></span>
												<RichText tagName="span" className="zen-choose-exp__time-text" value={ card.timeText || '' } onChange={ ( value ) => cardIndex === selectedCardIndex && updateCard( { timeText: value } ) } placeholder={ __( '(60 min)', 'zenctuary' ) } style={ { fontSize: `${ card.timeTextSize || 18 }px`, fontWeight: card.timeTextWeight || '500' } } />
											</div>
											<RichText tagName="p" className="zen-choose-exp__description" value={ card.description || '' } onChange={ ( value ) => cardIndex === selectedCardIndex && updateCard( { description: value } ) } placeholder={ __( 'Description...', 'zenctuary' ) } style={ { color: card.descriptionColor, fontSize: `${ card.descriptionSize || 18 }px`, fontWeight: card.descriptionWeight || '400', lineHeight: card.descriptionLineHeight || 1.45 } } />
											<div className="zen-choose-exp__feature-list">
												{ features.map( ( row, rowIndex ) => (
													<div className="zen-choose-exp__feature-row" key={ row.id || rowIndex }>
														<RichText tagName="strong" className="zen-choose-exp__feature-label" value={ row.label || '' } onChange={ ( value ) => cardIndex === selectedCardIndex && updateFeatureRow( rowIndex, { label: value } ) } placeholder={ __( 'Includes:', 'zenctuary' ) } style={ { color: card.featureBoldColor, fontSize: `${ card.featureBoldSize || 17 }px`, fontWeight: card.featureBoldWeight || '700' } } />
														<RichText tagName="span" className="zen-choose-exp__feature-text" value={ row.text || '' } onChange={ ( value ) => cardIndex === selectedCardIndex && updateFeatureRow( rowIndex, { text: value } ) } placeholder={ __( 'Feature text...', 'zenctuary' ) } style={ { color: card.featureTextColor, fontSize: `${ card.featureTextSize || 17 }px`, fontWeight: card.featureTextWeight || '400' } } />
														{ cardIndex === selectedCardIndex && <Button className="zen-choose-exp__remove-feature" variant="tertiary" isDestructive onClick={ ( event ) => { event.stopPropagation(); removeFeatureRow( rowIndex ); } }>{ __( 'Remove', 'zenctuary' ) }</Button> }
													</div>
												) ) }
											</div>
											<div className={ cardButtonClass } style={ { backgroundColor: card.buttonBg, color: card.buttonTextColor, borderColor: card.buttonBorderColor, borderWidth: `${ card.buttonBorderWidth || 2 }px`, borderRadius: `${ card.buttonBorderRadius || 999 }px` } }>
												{ card.buttonShowArrow && [ 'left', 'top' ].includes( card.buttonArrowPosition ) && <span className="zen-choose-exp__button-icon"><ArrowIcon /></span> }
												<RichText tagName="span" value={ card.buttonText || '' } onChange={ ( value ) => cardIndex === selectedCardIndex && updateCard( { buttonText: value } ) } placeholder={ __( 'Book Now', 'zenctuary' ) } />
												{ card.buttonShowArrow && [ 'right', 'bottom' ].includes( card.buttonArrowPosition ) && <span className="zen-choose-exp__button-icon"><ArrowIcon /></span> }
											</div>
											<div className="zen-choose-exp__separator zen-choose-exp__separator--bottom" style={ { width: `${ card.bottomSeparatorWidth || 100 }%`, borderTopColor: card.bottomSeparatorColor, borderTopWidth: `${ card.bottomSeparatorThickness || 1 }px` } } />
											<div className="zen-choose-exp__footer-row">
												<RichText tagName="span" className="zen-choose-exp__footer-text" value={ card.footerText || '' } onChange={ ( value ) => cardIndex === selectedCardIndex && updateCard( { footerText: value } ) } placeholder={ __( 'What to expect', 'zenctuary' ) } style={ { color: card.footerTextColor, fontSize: `${ card.footerTextSize || 17 }px`, fontWeight: card.footerTextWeight || '700' } } />
												<span className="zen-choose-exp__footer-plus" style={ { color: card.footerPlusColor, fontSize: `${ card.footerPlusSize || 46 }px` } }>+</span>
											</div>
										</div>
									</div>
								</article>
							);
						} ) }
					</div>
				</div>
			</section>
		</>
	);
}
