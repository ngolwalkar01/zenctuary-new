import { __ } from '@wordpress/i18n';
import { InspectorControls, RichText, useBlockProps } from '@wordpress/block-editor';
import {
	Button,
	ColorPalette,
	PanelBody,
	RangeControl,
	SelectControl,
	TextControl,
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';

const FONT_FAMILIES = [
	{ label: 'Montserrat', value: 'var(--wp--preset--font-family--montserrat)' },
	{ label: 'DM Sans', value: 'var(--wp--preset--font-family--dm-sans)' },
	{ label: 'Theme default', value: '' },
];

const WEIGHTS = [ '300', '400', '500', '600', '700', '800', '900' ].map( ( value ) => ( { label: value, value } ) );
const COLOR_CHOICES = [
	{ name: 'Gold', color: '#d8b354' },
	{ name: 'Dark grey', color: '#3f3d3d' },
	{ name: 'Beige', color: '#f1eee7' },
	{ name: 'Muted grey', color: '#b9b9b9' },
	{ name: 'Divider grey', color: '#949494' },
	{ name: 'Black', color: '#000000' },
	{ name: 'White', color: '#ffffff' },
];

const numberOrDefault = ( value, fallback ) => Number.isFinite( Number( value ) ) ? Number( value ) : fallback;
const parseCoinValues = ( value = '' ) => String( value ).split( ',' ).map( ( item ) => item.trim() ).filter( Boolean );
const createSection = () => ( {
	id: `section-${ Date.now() }`,
	title: 'NEW EXPERIENCE',
	coinValues: '5',
	description: 'Add your description here.',
} );

function ColorControl( { label, value, onChange } ) {
	return (
		<div className="zen-static-zencoins-control">
			<p className="components-base-control__label">{ label }</p>
			<ColorPalette colors={ COLOR_CHOICES } value={ value } onChange={ onChange } enableAlpha />
		</div>
	);
}

function TypographyControls( { title, prefix, attributes, setAttributes, colorDefault } ) {
	const set = ( key, value ) => setAttributes( { [ `${ prefix }${ key }` ]: value } );
	return (
		<PanelBody title={ title } initialOpen={ false }>
			<SelectControl
				label={ __( 'Font family', 'zenctuary' ) }
				value={ attributes[ `${ prefix }FontFamily` ] }
				options={ FONT_FAMILIES }
				onChange={ ( value ) => set( 'FontFamily', value ) }
			/>
			<UnitControl
				label={ __( 'Font size', 'zenctuary' ) }
				value={ attributes[ `${ prefix }FontSize` ] }
				onChange={ ( value ) => set( 'FontSize', value || '' ) }
			/>
			<SelectControl
				label={ __( 'Font weight', 'zenctuary' ) }
				value={ attributes[ `${ prefix }FontWeight` ] }
				options={ WEIGHTS }
				onChange={ ( value ) => set( 'FontWeight', value ) }
			/>
			<TextControl
				label={ __( 'Line height', 'zenctuary' ) }
				value={ attributes[ `${ prefix }LineHeight` ] || '' }
				onChange={ ( value ) => set( 'LineHeight', value ) }
			/>
			<UnitControl
				label={ __( 'Letter spacing', 'zenctuary' ) }
				value={ attributes[ `${ prefix }LetterSpacing` ] || '' }
				onChange={ ( value ) => set( 'LetterSpacing', value || '' ) }
			/>
			<ColorControl
				label={ __( 'Color', 'zenctuary' ) }
				value={ attributes[ `${ prefix }Color` ] }
				onChange={ ( value ) => set( 'Color', value || colorDefault ) }
			/>
		</PanelBody>
	);
}

function Coin( { value = '', size = 52, className = '', valueFontSize = '', valueFontWeight = '' } ) {
	const hasValue = value !== undefined && value !== null && `${ value }` !== '';
	const safeSize = numberOrDefault( size, 52 );

	return (
		<span className={ `zen-static-zencoins-coin ${ className }` } style={ { width: `${ safeSize }px`, height: `${ safeSize }px`, fontSize: valueFontSize || `${ Math.max( 12, Math.round( safeSize * 0.34 ) ) }px`, fontWeight: valueFontWeight || undefined } }>
			<span className="zen-static-zencoins-coin__ring" />
			{ hasValue && <span className="zen-static-zencoins-coin__value">{ value }</span> }
		</span>
	);
}

function CoinStack( { coins = [], size = 52, overlap = -16, className = '', valueFontSize = '', valueFontWeight = '' } ) {
	return (
		<span className={ `zen-static-zencoins-coin-stack ${ className }` } style={ { '--zen-static-zencoins-overlap': `${ overlap }px` } }>
			{ coins.map( ( coin, index ) => (
				<Coin key={ `${ coin?.value ?? coin }-${ index }` } value={ coin?.value ?? coin ?? '' } size={ size } className="zen-static-zencoins-coin-stack__coin" valueFontSize={ valueFontSize } valueFontWeight={ valueFontWeight } />
			) ) }
		</span>
	);
}

function BlockView( { attributes, setAttributes, setSelectedSectionIndex } ) {
	const headingCoins = Array.isArray( attributes.headingCoins ) ? attributes.headingCoins : [];
	const sections = Array.isArray( attributes.sections ) ? attributes.sections : [];
	const updateSection = ( index, patch ) => setAttributes( {
		sections: sections.map( ( section, sectionIndex ) => sectionIndex === index ? { ...section, ...patch } : section ),
	} );

	const blockProps = useBlockProps( {
		className: 'zen-static-zencoins',
		style: {
			'--zen-static-zencoins-bg': attributes.backgroundColor,
			'--zen-static-zencoins-max-width': attributes.contentMaxWidth,
			'--zen-static-zencoins-column-gap': `${ attributes.columnGap }px`,
			'--zen-static-zencoins-panel-border-color': attributes.panelBorderColor,
			'--zen-static-zencoins-panel-bg': attributes.panelBackgroundColor,
			'--zen-static-zencoins-panel-border-width': `${ attributes.panelBorderWidth }px`,
			'--zen-static-zencoins-panel-radius': `${ attributes.panelBorderRadius }px`,
			'--zen-static-zencoins-coin-bg': attributes.coinBackgroundColor,
			'--zen-static-zencoins-coin-border': attributes.coinBorderColor,
			'--zen-static-zencoins-coin-text': attributes.coinTextColor,
			'--zen-static-zencoins-coin-ring-inset': `${ attributes.coinRingInset }px`,
			'--zen-static-zencoins-coin-border-width': `${ attributes.coinBorderWidth }px`,
			'--zen-static-zencoins-divider-color': attributes.dividerColor,
			'--zen-static-zencoins-divider-thickness': `${ attributes.dividerThickness }px`,
			'--zen-static-zencoins-divider-spacing': `${ attributes.dividerSpacing }px`,
			paddingTop: attributes.sectionPaddingTop,
			paddingRight: attributes.sectionPaddingRight,
			paddingBottom: attributes.sectionPaddingBottom,
			paddingLeft: attributes.sectionPaddingLeft,
		},
	} );

	const textStyle = ( prefix ) => ( {
		fontFamily: attributes[ `${ prefix }FontFamily` ] || undefined,
		fontSize: attributes[ `${ prefix }FontSize` ],
		fontWeight: attributes[ `${ prefix }FontWeight` ],
		lineHeight: attributes[ `${ prefix }LineHeight` ],
		letterSpacing: attributes[ `${ prefix }LetterSpacing` ],
		color: attributes[ `${ prefix }Color` ],
	} );

	return (
		<section { ...blockProps }>
			<div className="zen-static-zencoins__inner">
				<div className="zen-static-zencoins__left">
					<div className="zen-static-zencoins__heading-row">
						<RichText
							tagName="h2"
							className="zen-static-zencoins__heading"
							value={ attributes.heading }
							onChange={ ( heading ) => setAttributes( { heading } ) }
							style={ textStyle( 'heading' ) }
							allowedFormats={ [ 'core/bold', 'core/italic' ] }
						/>
						<CoinStack coins={ headingCoins } size={ attributes.headingCoinSize } overlap={ attributes.headingCoinOverlap } />
					</div>
					<RichText
						tagName="p"
						className="zen-static-zencoins__intro"
						value={ attributes.introText }
						onChange={ ( introText ) => setAttributes( { introText } ) }
						style={ textStyle( 'intro' ) }
						allowedFormats={ [ 'core/bold', 'core/italic', 'core/link' ] }
					/>
				</div>
				<div className="zen-static-zencoins__right">
					<div
						className="zen-static-zencoins__panel"
						style={ {
							paddingTop: attributes.panelPaddingTop,
							paddingRight: attributes.panelPaddingRight,
							paddingBottom: attributes.panelPaddingBottom,
							paddingLeft: attributes.panelPaddingLeft,
						} }
					>
						<div className="zen-static-zencoins__conversion">
							<Coin value={ attributes.conversionCoinValue } size={ attributes.conversionCoinSize } />
							<RichText
								tagName="span"
								className="zen-static-zencoins__conversion-label"
								value={ attributes.conversionLabel }
								onChange={ ( conversionLabel ) => setAttributes( { conversionLabel } ) }
								style={ textStyle( 'conversionLabel' ) }
								allowedFormats={ [ 'core/bold', 'core/italic' ] }
							/>
							<RichText
								tagName="span"
								className="zen-static-zencoins__conversion-value"
								value={ attributes.conversionValue }
								onChange={ ( conversionValue ) => setAttributes( { conversionValue } ) }
								style={ textStyle( 'conversionValue' ) }
								allowedFormats={ [ 'core/bold', 'core/italic' ] }
							/>
						</div>
						<span className="zen-static-zencoins__divider" aria-hidden="true" />
						<div className="zen-static-zencoins__sections">
							{ sections.map( ( section, index ) => (
								<div className="zen-static-zencoins__section" key={ section.id || index } onClick={ () => setSelectedSectionIndex( index ) }>
									<div className="zen-static-zencoins__section-top">
										<RichText
											tagName="h3"
											className="zen-static-zencoins__section-title"
											value={ section.title }
											onChange={ ( title ) => updateSection( index, { title } ) }
											style={ textStyle( 'sectionTitle' ) }
											allowedFormats={ [ 'core/bold', 'core/italic' ] }
										/>
										<div className="zen-static-zencoins__price">
											<span className="zen-static-zencoins__price-label" style={ textStyle( 'zencoinLabel' ) }>ZENCOINS:</span>
											<CoinStack coins={ parseCoinValues( section.coinValues ) } size={ attributes.sectionCoinSize } overlap={ attributes.sectionCoinOverlap } valueFontSize={ attributes.zencoinValueFontSize } valueFontWeight={ attributes.zencoinValueFontWeight } />
										</div>
									</div>
									<RichText
										tagName="p"
										className="zen-static-zencoins__description"
										value={ section.description }
										onChange={ ( description ) => updateSection( index, { description } ) }
										style={ textStyle( 'description' ) }
										allowedFormats={ [ 'core/bold', 'core/italic', 'core/link' ] }
									/>
									{ index < sections.length - 1 && <span className="zen-static-zencoins__divider" aria-hidden="true" /> }
								</div>
							) ) }
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const [ selectedSectionIndex, setSelectedSectionIndex ] = useState( 0 );
	const sections = Array.isArray( attributes.sections ) ? attributes.sections : [];
	const selectedSection = sections[ selectedSectionIndex ];

	useEffect( () => {
		if ( selectedSectionIndex > sections.length - 1 ) {
			setSelectedSectionIndex( Math.max( sections.length - 1, 0 ) );
		}
	}, [ sections.length, selectedSectionIndex ] );

	const updateSection = ( index, patch ) => setAttributes( {
		sections: sections.map( ( section, sectionIndex ) => sectionIndex === index ? { ...section, ...patch } : section ),
	} );
	const addSection = () => {
		setAttributes( { sections: [ ...sections, createSection() ] } );
		setSelectedSectionIndex( sections.length );
	};
	const removeSection = () => {
		if ( sections.length <= 1 ) return;
		setAttributes( { sections: sections.filter( ( section, index ) => index !== selectedSectionIndex ) } );
		setSelectedSectionIndex( Math.max( selectedSectionIndex - 1, 0 ) );
	};
	const moveSection = ( amount ) => {
		const nextIndex = selectedSectionIndex + amount;
		if ( nextIndex < 0 || nextIndex >= sections.length ) return;
		const nextSections = [ ...sections ];
		const [ section ] = nextSections.splice( selectedSectionIndex, 1 );
		nextSections.splice( nextIndex, 0, section );
		setAttributes( { sections: nextSections } );
		setSelectedSectionIndex( nextIndex );
	};
	const updateHeadingCoin = ( index, value ) => {
		const headingCoins = Array.isArray( attributes.headingCoins ) ? attributes.headingCoins : [];
		setAttributes( { headingCoins: headingCoins.map( ( coin, coinIndex ) => coinIndex === index ? { value } : coin ) } );
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Layout', 'zenctuary' ) } initialOpen>
					<ColorControl label={ __( 'Section background', 'zenctuary' ) } value={ attributes.backgroundColor } onChange={ ( value ) => setAttributes( { backgroundColor: value || '#3f3d3d' } ) } />
					<UnitControl label={ __( 'Top padding', 'zenctuary' ) } value={ attributes.sectionPaddingTop } onChange={ ( value ) => setAttributes( { sectionPaddingTop: value || '0px' } ) } />
					<UnitControl label={ __( 'Right padding', 'zenctuary' ) } value={ attributes.sectionPaddingRight } onChange={ ( value ) => setAttributes( { sectionPaddingRight: value || '0px' } ) } />
					<UnitControl label={ __( 'Bottom padding', 'zenctuary' ) } value={ attributes.sectionPaddingBottom } onChange={ ( value ) => setAttributes( { sectionPaddingBottom: value || '0px' } ) } />
					<UnitControl label={ __( 'Left padding', 'zenctuary' ) } value={ attributes.sectionPaddingLeft } onChange={ ( value ) => setAttributes( { sectionPaddingLeft: value || '0px' } ) } />
					<UnitControl label={ __( 'Content max width', 'zenctuary' ) } value={ attributes.contentMaxWidth } onChange={ ( value ) => setAttributes( { contentMaxWidth: value || '1200px' } ) } />
					<RangeControl label={ __( 'Column gap', 'zenctuary' ) } value={ attributes.columnGap } onChange={ ( value ) => setAttributes( { columnGap: value } ) } min={ 20 } max={ 220 } />
				</PanelBody>

				<TypographyControls title={ __( 'Left heading typography', 'zenctuary' ) } prefix="heading" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#d8b354" />
				<PanelBody title={ __( 'Heading coins', 'zenctuary' ) } initialOpen={ false }>
					<RangeControl label={ __( 'Coin size', 'zenctuary' ) } value={ attributes.headingCoinSize } onChange={ ( value ) => setAttributes( { headingCoinSize: value } ) } min={ 24 } max={ 110 } />
					<RangeControl label={ __( 'Coin overlap', 'zenctuary' ) } value={ attributes.headingCoinOverlap } onChange={ ( value ) => setAttributes( { headingCoinOverlap: value } ) } min={ -60 } max={ 20 } />
					{ ( Array.isArray( attributes.headingCoins ) ? attributes.headingCoins : [] ).map( ( coin, index ) => (
						<TextControl key={ index } label={ `Heading coin ${ index + 1 } value` } value={ coin?.value || '' } onChange={ ( value ) => updateHeadingCoin( index, value ) } help={ __( 'Leave empty for a blank decorative coin.', 'zenctuary' ) } />
					) ) }
				</PanelBody>
				<TypographyControls title={ __( 'Left text typography', 'zenctuary' ) } prefix="intro" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#f1eee7" />

				<PanelBody title={ __( 'Right panel style', 'zenctuary' ) } initialOpen={ false }>
					<ColorControl label={ __( 'Panel background', 'zenctuary' ) } value={ attributes.panelBackgroundColor } onChange={ ( value ) => setAttributes( { panelBackgroundColor: value || 'transparent' } ) } />
					<ColorControl label={ __( 'Panel border', 'zenctuary' ) } value={ attributes.panelBorderColor } onChange={ ( value ) => setAttributes( { panelBorderColor: value || '#f1eee7' } ) } />
					<RangeControl label={ __( 'Border width', 'zenctuary' ) } value={ attributes.panelBorderWidth } onChange={ ( value ) => setAttributes( { panelBorderWidth: value } ) } min={ 0 } max={ 10 } />
					<RangeControl label={ __( 'Border radius', 'zenctuary' ) } value={ attributes.panelBorderRadius } onChange={ ( value ) => setAttributes( { panelBorderRadius: value } ) } min={ 0 } max={ 70 } />
					<UnitControl label={ __( 'Top padding', 'zenctuary' ) } value={ attributes.panelPaddingTop } onChange={ ( value ) => setAttributes( { panelPaddingTop: value || '0px' } ) } />
					<UnitControl label={ __( 'Right padding', 'zenctuary' ) } value={ attributes.panelPaddingRight } onChange={ ( value ) => setAttributes( { panelPaddingRight: value || '0px' } ) } />
					<UnitControl label={ __( 'Bottom padding', 'zenctuary' ) } value={ attributes.panelPaddingBottom } onChange={ ( value ) => setAttributes( { panelPaddingBottom: value || '0px' } ) } />
					<UnitControl label={ __( 'Left padding', 'zenctuary' ) } value={ attributes.panelPaddingLeft } onChange={ ( value ) => setAttributes( { panelPaddingLeft: value || '0px' } ) } />
					<ColorControl label={ __( 'Divider color', 'zenctuary' ) } value={ attributes.dividerColor } onChange={ ( value ) => setAttributes( { dividerColor: value || '#949494' } ) } />
					<RangeControl label={ __( 'Divider thickness', 'zenctuary' ) } value={ attributes.dividerThickness } onChange={ ( value ) => setAttributes( { dividerThickness: value } ) } min={ 1 } max={ 10 } />
					<RangeControl label={ __( 'Divider spacing', 'zenctuary' ) } value={ attributes.dividerSpacing } onChange={ ( value ) => setAttributes( { dividerSpacing: value } ) } min={ 16 } max={ 90 } />
				</PanelBody>

				<PanelBody title={ __( 'Coin style', 'zenctuary' ) } initialOpen={ false }>
					<ColorControl label={ __( 'Coin background', 'zenctuary' ) } value={ attributes.coinBackgroundColor } onChange={ ( value ) => setAttributes( { coinBackgroundColor: value || '#d8b354' } ) } />
					<ColorControl label={ __( 'Coin ring/border', 'zenctuary' ) } value={ attributes.coinBorderColor } onChange={ ( value ) => setAttributes( { coinBorderColor: value || '#3f3d3d' } ) } />
					<ColorControl label={ __( 'Coin text', 'zenctuary' ) } value={ attributes.coinTextColor } onChange={ ( value ) => setAttributes( { coinTextColor: value || '#3f3d3d' } ) } />
					<RangeControl label={ __( 'Coin border width', 'zenctuary' ) } value={ attributes.coinBorderWidth } onChange={ ( value ) => setAttributes( { coinBorderWidth: value } ) } min={ 1 } max={ 8 } />
					<RangeControl label={ __( 'Inner ring inset', 'zenctuary' ) } value={ attributes.coinRingInset } onChange={ ( value ) => setAttributes( { coinRingInset: value } ) } min={ 2 } max={ 14 } />
				</PanelBody>

				<PanelBody title={ __( 'Top conversion content', 'zenctuary' ) } initialOpen={ false }>
					<TextControl label={ __( 'Coin value', 'zenctuary' ) } value={ attributes.conversionCoinValue } onChange={ ( value ) => setAttributes( { conversionCoinValue: value } ) } />
					<RangeControl label={ __( 'Coin size', 'zenctuary' ) } value={ attributes.conversionCoinSize } onChange={ ( value ) => setAttributes( { conversionCoinSize: value } ) } min={ 24 } max={ 110 } />
				</PanelBody>
				<TypographyControls title={ __( 'Top Zencoin text typography', 'zenctuary' ) } prefix="conversionLabel" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#d8b354" />
				<TypographyControls title={ __( 'Top Euro value typography', 'zenctuary' ) } prefix="conversionValue" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#f1eee7" />

				<PanelBody title={ __( 'Editable sections', 'zenctuary' ) } initialOpen>
					<SelectControl
						label={ __( 'Selected section', 'zenctuary' ) }
						value={ selectedSectionIndex }
						options={ sections.map( ( section, index ) => ( { label: `${ index + 1 }. ${ section.title || 'Untitled section' }`, value: index } ) ) }
						onChange={ ( value ) => setSelectedSectionIndex( Number( value ) ) }
					/>
					{ selectedSection && (
						<>
							<TextControl label={ __( 'Experience name', 'zenctuary' ) } value={ selectedSection.title || '' } onChange={ ( value ) => updateSection( selectedSectionIndex, { title: value } ) } />
							<TextControl label={ __( 'Coin value(s)', 'zenctuary' ) } value={ selectedSection.coinValues || '' } onChange={ ( value ) => updateSection( selectedSectionIndex, { coinValues: value } ) } help={ __( 'Use comma-separated values for ranges, for example: 6, 8.', 'zenctuary' ) } />
						</>
					) }
					<RangeControl label={ __( 'Section coin size', 'zenctuary' ) } value={ attributes.sectionCoinSize } onChange={ ( value ) => setAttributes( { sectionCoinSize: value } ) } min={ 24 } max={ 100 } />
					<RangeControl label={ __( 'Section coin overlap', 'zenctuary' ) } value={ attributes.sectionCoinOverlap } onChange={ ( value ) => setAttributes( { sectionCoinOverlap: value } ) } min={ -60 } max={ 20 } />
					<div className="zen-static-zencoins-actions">
						<Button variant="secondary" onClick={ () => moveSection( -1 ) } disabled={ selectedSectionIndex <= 0 }>{ __( 'Move up', 'zenctuary' ) }</Button>
						<Button variant="secondary" onClick={ () => moveSection( 1 ) } disabled={ selectedSectionIndex >= sections.length - 1 }>{ __( 'Move down', 'zenctuary' ) }</Button>
						<Button variant="tertiary" isDestructive onClick={ removeSection } disabled={ sections.length <= 1 }>{ __( 'Remove', 'zenctuary' ) }</Button>
					</div>
					<Button variant="primary" onClick={ addSection }>{ __( 'Add section', 'zenctuary' ) }</Button>
				</PanelBody>
				<TypographyControls title={ __( 'Experience name typography', 'zenctuary' ) } prefix="sectionTitle" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#f1eee7" />
				<TypographyControls title={ __( 'Static ZENCOINS label typography', 'zenctuary' ) } prefix="zencoinLabel" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#d8b354" />
				<PanelBody title={ __( 'Coin value typography', 'zenctuary' ) } initialOpen={ false }>
					<UnitControl label={ __( 'Font size', 'zenctuary' ) } value={ attributes.zencoinValueFontSize } onChange={ ( value ) => setAttributes( { zencoinValueFontSize: value || '' } ) } />
					<SelectControl label={ __( 'Font weight', 'zenctuary' ) } value={ attributes.zencoinValueFontWeight } options={ WEIGHTS } onChange={ ( value ) => setAttributes( { zencoinValueFontWeight: value } ) } />
				</PanelBody>
				<TypographyControls title={ __( 'Description typography', 'zenctuary' ) } prefix="description" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#b9b9b9" />
			</InspectorControls>
			<BlockView attributes={ attributes } setAttributes={ setAttributes } setSelectedSectionIndex={ setSelectedSectionIndex } />
		</>
	);
}
