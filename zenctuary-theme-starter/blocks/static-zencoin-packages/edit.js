import { __ } from '@wordpress/i18n';
import { InspectorControls, RichText, useBlockProps } from '@wordpress/block-editor';
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
	{ name: 'Soft border', color: 'rgba(241, 238, 231, 0.56)' },
	{ name: 'White', color: '#ffffff' },
	{ name: 'Black', color: '#000000' },
];

const createPackage = () => ( {
	id: `package-${ Date.now() }`,
	zencoins: '20',
	title: 'NEW PACKAGE',
	price: '100€',
	feature: 'For all Classes and Fire & Ice',
	validity: 'Valid for 12 Months beginning with the date of purchase',
	buttonText: 'Book now',
	buttonUrl: '#',
	buttonOpenInNewTab: false,
} );

function ColorControl( { label, value, onChange } ) {
	return (
		<div className="zen-static-packages-control">
			<p className="components-base-control__label">{ label }</p>
			<ColorPalette colors={ COLOR_CHOICES } value={ value } onChange={ onChange } enableAlpha />
		</div>
	);
}

function TypographyControls( { title, prefix, attributes, setAttributes, colorDefault } ) {
	const set = ( key, value ) => setAttributes( { [ `${ prefix }${ key }` ]: value } );
	return (
		<PanelBody title={ title } initialOpen={ false }>
			<SelectControl label={ __( 'Font family', 'zenctuary' ) } value={ attributes[ `${ prefix }FontFamily` ] } options={ FONT_FAMILIES } onChange={ ( value ) => set( 'FontFamily', value ) } />
			<UnitControl label={ __( 'Font size', 'zenctuary' ) } value={ attributes[ `${ prefix }FontSize` ] } onChange={ ( value ) => set( 'FontSize', value || '' ) } />
			<SelectControl label={ __( 'Font weight', 'zenctuary' ) } value={ attributes[ `${ prefix }FontWeight` ] } options={ WEIGHTS } onChange={ ( value ) => set( 'FontWeight', value ) } />
			<TextControl label={ __( 'Line height', 'zenctuary' ) } value={ attributes[ `${ prefix }LineHeight` ] || '' } onChange={ ( value ) => set( 'LineHeight', value ) } />
			<UnitControl label={ __( 'Letter spacing', 'zenctuary' ) } value={ attributes[ `${ prefix }LetterSpacing` ] || '' } onChange={ ( value ) => set( 'LetterSpacing', value || '' ) } />
			<ColorControl label={ __( 'Color', 'zenctuary' ) } value={ attributes[ `${ prefix }Color` ] } onChange={ ( value ) => set( 'Color', value || colorDefault ) } />
		</PanelBody>
	);
}

const textStyle = ( attributes, prefix ) => ( {
	fontFamily: attributes[ `${ prefix }FontFamily` ] || undefined,
	fontSize: attributes[ `${ prefix }FontSize` ],
	fontWeight: attributes[ `${ prefix }FontWeight` ],
	lineHeight: attributes[ `${ prefix }LineHeight` ],
	letterSpacing: attributes[ `${ prefix }LetterSpacing` ],
	color: attributes[ `${ prefix }Color` ],
} );

function ArrowIcon() {
	return <svg viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d="M9.7 3.3 15.4 9l-5.7 5.7-1.2-1.2 3.7-3.7H2.6V8.2h9.6L8.5 4.5z" /></svg>;
}

function CheckIcon() {
	return <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M6.3 11.8 2.7 8.2l1.4-1.4 2.2 2.2 5.6-5.6 1.4 1.4z" /></svg>;
}

function Coin( { value, attributes } ) {
	return (
		<span className="zen-static-packages-coin" style={ { width: `${ attributes.coinSize }px`, height: `${ attributes.coinSize }px`, fontSize: attributes.coinValueFontSize, fontWeight: attributes.coinValueFontWeight } }>
			<span className="zen-static-packages-coin__ring" />
			<span className="zen-static-packages-coin__value">{ value }</span>
		</span>
	);
}

function PackageCard( { item, index, attributes, updatePackage, setSelectedPackageIndex } ) {
	const renderButtonIcon = () => <span className="zen-static-packages__button-icon"><ArrowIcon /></span>;

	return (
		<article className="zen-static-packages__card" onClick={ () => setSelectedPackageIndex( index ) }>
			<div className="zen-static-packages__card-top">
				<div className="zen-static-packages__zencoins">
					<RichText tagName="span" className="zen-static-packages__zencoin-label" value={ attributes.zencoinLabel } onChange={ ( zencoinLabel ) => updatePackage( index, {}, { zencoinLabel } ) } style={ textStyle( attributes, 'zencoinLabel' ) } allowedFormats={ [ 'core/bold', 'core/italic' ] } />
					<Coin value={ item.zencoins } attributes={ attributes } />
				</div>
			</div>
			<div className="zen-static-packages__card-body">
				<RichText tagName="h3" className="zen-static-packages__card-title" value={ item.title } onChange={ ( title ) => updatePackage( index, { title } ) } style={ { ...textStyle( attributes, 'cardTitle' ), whiteSpace: attributes.cardTitleWrap ? 'normal' : 'nowrap' } } allowedFormats={ [ 'core/bold', 'core/italic' ] } />
				<RichText tagName="div" className="zen-static-packages__price" value={ item.price } onChange={ ( price ) => updatePackage( index, { price } ) } style={ textStyle( attributes, 'price' ) } allowedFormats={ [ 'core/bold', 'core/italic' ] } />
				<div className="zen-static-packages__feature" style={ textStyle( attributes, 'feature' ) }>
					{ attributes.showFeatureIcon && <span className="zen-static-packages__feature-icon"><CheckIcon /></span> }
					<RichText tagName="span" value={ item.feature } onChange={ ( feature ) => updatePackage( index, { feature } ) } allowedFormats={ [ 'core/bold', 'core/italic' ] } />
				</div>
				<RichText tagName="p" className="zen-static-packages__validity" value={ item.validity } onChange={ ( validity ) => updatePackage( index, { validity } ) } style={ textStyle( attributes, 'validity' ) } allowedFormats={ [ 'core/bold', 'core/italic', 'core/link' ] } />
				<a className="zen-static-packages__button" href={ item.buttonUrl || '#' } onClick={ ( event ) => event.preventDefault() } style={ textStyle( attributes, 'button' ) }>
					<RichText tagName="span" value={ item.buttonText } onChange={ ( buttonText ) => updatePackage( index, { buttonText } ) } allowedFormats={ [ 'core/bold', 'core/italic' ] } />
					{ attributes.showButtonIcon && renderButtonIcon() }
				</a>
			</div>
		</article>
	);
}

function BlockView( { attributes, setAttributes, setSelectedPackageIndex } ) {
	const packages = Array.isArray( attributes.packages ) ? attributes.packages : [];
	const blockProps = useBlockProps( {
		className: 'zen-static-packages',
		style: {
			'--zen-static-packages-bg': attributes.backgroundColor,
			'--zen-static-packages-content-width': attributes.contentMaxWidth,
			'--zen-static-packages-header-width': attributes.headerMaxWidth,
			'--zen-static-packages-header-bottom': `${ attributes.headerBottomSpacing }px`,
			'--zen-static-packages-gap': `${ attributes.cardsGap }px`,
			'--zen-static-packages-card-width': attributes.cardWidth,
			'--zen-static-packages-card-min-height': attributes.cardMinHeight,
			'--zen-static-packages-card-bg': attributes.cardBackgroundColor,
			'--zen-static-packages-card-border': attributes.cardBorderColor,
			'--zen-static-packages-card-border-width': `${ attributes.cardBorderWidth }px`,
			'--zen-static-packages-card-radius': `${ attributes.cardBorderRadius }px`,
			'--zen-static-packages-top-bg': attributes.cardTopBarBackgroundColor,
			'--zen-static-packages-top-border': attributes.cardTopBarBorderColor,
			'--zen-static-packages-top-height': `${ attributes.cardTopBarHeight }px`,
			'--zen-static-packages-body-pt': attributes.cardBodyPaddingTop,
			'--zen-static-packages-body-pr': attributes.cardBodyPaddingRight,
			'--zen-static-packages-body-pb': attributes.cardBodyPaddingBottom,
			'--zen-static-packages-body-pl': attributes.cardBodyPaddingLeft,
			'--zen-static-packages-zencoin-gap': `${ attributes.zencoinGap }px`,
			'--zen-static-packages-coin-bg': attributes.coinBackgroundColor,
			'--zen-static-packages-coin-border': attributes.coinBorderColor,
			'--zen-static-packages-coin-text': attributes.coinTextColor,
			'--zen-static-packages-coin-border-width': `${ attributes.coinBorderWidth }px`,
			'--zen-static-packages-coin-ring-inset': `${ attributes.coinRingInset }px`,
			'--zen-static-packages-feature-icon-size': `${ attributes.featureIconSize }px`,
			'--zen-static-packages-feature-icon-bg': attributes.featureIconBackgroundColor,
			'--zen-static-packages-feature-icon-color': attributes.featureIconColor,
			'--zen-static-packages-feature-icon-gap': `${ attributes.featureIconGap }px`,
			'--zen-static-packages-button-bg': attributes.buttonBackgroundColor,
			'--zen-static-packages-button-border': attributes.buttonBorderColor,
			'--zen-static-packages-button-border-width': `${ attributes.buttonBorderWidth }px`,
			'--zen-static-packages-button-radius': attributes.buttonBorderRadius,
			'--zen-static-packages-button-pt': attributes.buttonPaddingTop,
			'--zen-static-packages-button-pr': attributes.buttonPaddingRight,
			'--zen-static-packages-button-pb': attributes.buttonPaddingBottom,
			'--zen-static-packages-button-pl': attributes.buttonPaddingLeft,
			'--zen-static-packages-button-mt': attributes.buttonMarginTop,
			'--zen-static-packages-button-width': attributes.buttonWidth,
			'--zen-static-packages-button-min-height': attributes.buttonMinHeight,
			'--zen-static-packages-button-icon-size': `${ attributes.buttonIconSize }px`,
			'--zen-static-packages-button-icon-gap': `${ attributes.buttonIconGap }px`,
			'--zen-static-packages-button-icon-color': attributes.buttonIconColor,
			paddingTop: attributes.sectionPaddingTop,
			paddingRight: attributes.sectionPaddingRight,
			paddingBottom: attributes.sectionPaddingBottom,
			paddingLeft: attributes.sectionPaddingLeft,
		},
	} );
	const updatePackage = ( index, patch, rootPatch = {} ) => setAttributes( {
		...rootPatch,
		packages: packages.map( ( item, itemIndex ) => itemIndex === index ? { ...item, ...patch } : item ),
	} );

	return (
		<section { ...blockProps }>
			<div className="zen-static-packages__inner">
				<header className="zen-static-packages__header">
					<RichText tagName="h2" className="zen-static-packages__heading" value={ attributes.heading } onChange={ ( heading ) => setAttributes( { heading } ) } style={ { ...textStyle( attributes, 'heading' ), whiteSpace: attributes.headingWrap ? 'normal' : 'nowrap' } } allowedFormats={ [ 'core/bold', 'core/italic' ] } />
					<RichText tagName="p" className="zen-static-packages__intro" value={ attributes.intro } onChange={ ( intro ) => setAttributes( { intro } ) } style={ textStyle( attributes, 'intro' ) } allowedFormats={ [ 'core/bold', 'core/italic', 'core/link' ] } />
				</header>
				<div className="zen-static-packages__grid">
					{ packages.map( ( item, index ) => (
						<PackageCard key={ item.id || index } item={ item } index={ index } attributes={ attributes } updatePackage={ updatePackage } setSelectedPackageIndex={ setSelectedPackageIndex } />
					) ) }
				</div>
			</div>
		</section>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const [ selectedPackageIndex, setSelectedPackageIndex ] = useState( 0 );
	const packages = Array.isArray( attributes.packages ) ? attributes.packages : [];
	const selectedPackage = packages[ selectedPackageIndex ];
	const updatePackage = ( index, patch ) => setAttributes( {
		packages: packages.map( ( item, itemIndex ) => itemIndex === index ? { ...item, ...patch } : item ),
	} );
	const addPackage = () => {
		setAttributes( { packages: [ ...packages, createPackage() ] } );
		setSelectedPackageIndex( packages.length );
	};
	const removePackage = () => {
		if ( packages.length <= 1 ) return;
		setAttributes( { packages: packages.filter( ( item, index ) => index !== selectedPackageIndex ) } );
		setSelectedPackageIndex( Math.max( selectedPackageIndex - 1, 0 ) );
	};
	const movePackage = ( amount ) => {
		const nextIndex = selectedPackageIndex + amount;
		if ( nextIndex < 0 || nextIndex >= packages.length ) return;
		const nextPackages = [ ...packages ];
		const [ item ] = nextPackages.splice( selectedPackageIndex, 1 );
		nextPackages.splice( nextIndex, 0, item );
		setAttributes( { packages: nextPackages } );
		setSelectedPackageIndex( nextIndex );
	};

	useEffect( () => {
		if ( selectedPackageIndex > packages.length - 1 ) {
			setSelectedPackageIndex( Math.max( packages.length - 1, 0 ) );
		}
	}, [ packages.length, selectedPackageIndex ] );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Layout', 'zenctuary' ) } initialOpen>
					<ColorControl label={ __( 'Section background', 'zenctuary' ) } value={ attributes.backgroundColor } onChange={ ( backgroundColor ) => setAttributes( { backgroundColor: backgroundColor || '#3f3d3d' } ) } />
					<UnitControl label={ __( 'Top padding', 'zenctuary' ) } value={ attributes.sectionPaddingTop } onChange={ ( sectionPaddingTop ) => setAttributes( { sectionPaddingTop: sectionPaddingTop || '0px' } ) } />
					<UnitControl label={ __( 'Right padding', 'zenctuary' ) } value={ attributes.sectionPaddingRight } onChange={ ( sectionPaddingRight ) => setAttributes( { sectionPaddingRight: sectionPaddingRight || '0px' } ) } />
					<UnitControl label={ __( 'Bottom padding', 'zenctuary' ) } value={ attributes.sectionPaddingBottom } onChange={ ( sectionPaddingBottom ) => setAttributes( { sectionPaddingBottom: sectionPaddingBottom || '0px' } ) } />
					<UnitControl label={ __( 'Left padding', 'zenctuary' ) } value={ attributes.sectionPaddingLeft } onChange={ ( sectionPaddingLeft ) => setAttributes( { sectionPaddingLeft: sectionPaddingLeft || '0px' } ) } />
					<UnitControl label={ __( 'Content max width', 'zenctuary' ) } value={ attributes.contentMaxWidth } onChange={ ( contentMaxWidth ) => setAttributes( { contentMaxWidth: contentMaxWidth || '1240px' } ) } />
					<UnitControl label={ __( 'Header max width', 'zenctuary' ) } value={ attributes.headerMaxWidth } onChange={ ( headerMaxWidth ) => setAttributes( { headerMaxWidth: headerMaxWidth || '840px' } ) } />
					<RangeControl label={ __( 'Header bottom spacing', 'zenctuary' ) } value={ attributes.headerBottomSpacing } onChange={ ( headerBottomSpacing ) => setAttributes( { headerBottomSpacing } ) } min={ 0 } max={ 120 } />
					<RangeControl label={ __( 'Cards gap', 'zenctuary' ) } value={ attributes.cardsGap } onChange={ ( cardsGap ) => setAttributes( { cardsGap } ) } min={ 8 } max={ 90 } />
				</PanelBody>
				<TypographyControls title={ __( 'Heading typography', 'zenctuary' ) } prefix="heading" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#d8b354" />
				<PanelBody title={ __( 'Heading layout', 'zenctuary' ) } initialOpen={ false }>
					<ToggleControl label={ __( 'Allow heading to wrap', 'zenctuary' ) } checked={ !! attributes.headingWrap } onChange={ ( headingWrap ) => setAttributes( { headingWrap } ) } />
				</PanelBody>
				<TypographyControls title={ __( 'Intro typography', 'zenctuary' ) } prefix="intro" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#f1eee7" />
				<PanelBody title={ __( 'Cards', 'zenctuary' ) } initialOpen>
					<SelectControl label={ __( 'Selected package', 'zenctuary' ) } value={ selectedPackageIndex } options={ packages.map( ( item, index ) => ( { label: `${ index + 1 }. ${ item.title || 'Untitled package' }`, value: index } ) ) } onChange={ ( value ) => setSelectedPackageIndex( Number( value ) ) } />
					{ selectedPackage && (
						<>
							<TextControl label={ __( 'Zencoins value', 'zenctuary' ) } value={ selectedPackage.zencoins || '' } onChange={ ( zencoins ) => updatePackage( selectedPackageIndex, { zencoins } ) } />
							<TextControl label={ __( 'Price', 'zenctuary' ) } value={ selectedPackage.price || '' } onChange={ ( price ) => updatePackage( selectedPackageIndex, { price } ) } />
							<TextControl label={ __( 'Book Now URL', 'zenctuary' ) } value={ selectedPackage.buttonUrl || '' } onChange={ ( buttonUrl ) => updatePackage( selectedPackageIndex, { buttonUrl } ) } />
							<ToggleControl label={ __( 'Open button in new tab', 'zenctuary' ) } checked={ !! selectedPackage.buttonOpenInNewTab } onChange={ ( buttonOpenInNewTab ) => updatePackage( selectedPackageIndex, { buttonOpenInNewTab } ) } />
						</>
					) }
					<div className="zen-static-packages-actions">
						<Button variant="secondary" onClick={ () => movePackage( -1 ) } disabled={ selectedPackageIndex <= 0 }>{ __( 'Move up', 'zenctuary' ) }</Button>
						<Button variant="secondary" onClick={ () => movePackage( 1 ) } disabled={ selectedPackageIndex >= packages.length - 1 }>{ __( 'Move down', 'zenctuary' ) }</Button>
						<Button variant="tertiary" isDestructive onClick={ removePackage } disabled={ packages.length <= 1 }>{ __( 'Remove', 'zenctuary' ) }</Button>
					</div>
					<Button variant="primary" onClick={ addPackage }>{ __( 'Add package card', 'zenctuary' ) }</Button>
				</PanelBody>
				<PanelBody title={ __( 'Card style', 'zenctuary' ) } initialOpen={ false }>
					<UnitControl label={ __( 'Card width', 'zenctuary' ) } value={ attributes.cardWidth } onChange={ ( cardWidth ) => setAttributes( { cardWidth: cardWidth || '350px' } ) } />
					<UnitControl label={ __( 'Card min height', 'zenctuary' ) } value={ attributes.cardMinHeight } onChange={ ( cardMinHeight ) => setAttributes( { cardMinHeight: cardMinHeight || '480px' } ) } />
					<ColorControl label={ __( 'Card background', 'zenctuary' ) } value={ attributes.cardBackgroundColor } onChange={ ( cardBackgroundColor ) => setAttributes( { cardBackgroundColor: cardBackgroundColor || '#3f3d3d' } ) } />
					<ColorControl label={ __( 'Card border', 'zenctuary' ) } value={ attributes.cardBorderColor } onChange={ ( cardBorderColor ) => setAttributes( { cardBorderColor: cardBorderColor || 'rgba(241, 238, 231, 0.56)' } ) } />
					<RangeControl label={ __( 'Border width', 'zenctuary' ) } value={ attributes.cardBorderWidth } onChange={ ( cardBorderWidth ) => setAttributes( { cardBorderWidth } ) } min={ 0 } max={ 8 } />
					<RangeControl label={ __( 'Border radius', 'zenctuary' ) } value={ attributes.cardBorderRadius } onChange={ ( cardBorderRadius ) => setAttributes( { cardBorderRadius } ) } min={ 0 } max={ 60 } />
					<ColorControl label={ __( 'Top bar background', 'zenctuary' ) } value={ attributes.cardTopBarBackgroundColor } onChange={ ( cardTopBarBackgroundColor ) => setAttributes( { cardTopBarBackgroundColor: cardTopBarBackgroundColor || '#3f3d3d' } ) } />
					<ColorControl label={ __( 'Top bar divider', 'zenctuary' ) } value={ attributes.cardTopBarBorderColor } onChange={ ( cardTopBarBorderColor ) => setAttributes( { cardTopBarBorderColor: cardTopBarBorderColor || 'rgba(241, 238, 231, 0.35)' } ) } />
					<RangeControl label={ __( 'Top bar height', 'zenctuary' ) } value={ attributes.cardTopBarHeight } onChange={ ( cardTopBarHeight ) => setAttributes( { cardTopBarHeight } ) } min={ 40 } max={ 150 } />
					<UnitControl label={ __( 'Body padding top', 'zenctuary' ) } value={ attributes.cardBodyPaddingTop } onChange={ ( cardBodyPaddingTop ) => setAttributes( { cardBodyPaddingTop: cardBodyPaddingTop || '0px' } ) } />
					<UnitControl label={ __( 'Body padding right', 'zenctuary' ) } value={ attributes.cardBodyPaddingRight } onChange={ ( cardBodyPaddingRight ) => setAttributes( { cardBodyPaddingRight: cardBodyPaddingRight || '0px' } ) } />
					<UnitControl label={ __( 'Body padding bottom', 'zenctuary' ) } value={ attributes.cardBodyPaddingBottom } onChange={ ( cardBodyPaddingBottom ) => setAttributes( { cardBodyPaddingBottom: cardBodyPaddingBottom || '0px' } ) } />
					<UnitControl label={ __( 'Body padding left', 'zenctuary' ) } value={ attributes.cardBodyPaddingLeft } onChange={ ( cardBodyPaddingLeft ) => setAttributes( { cardBodyPaddingLeft: cardBodyPaddingLeft || '0px' } ) } />
				</PanelBody>
				<TypographyControls title={ __( 'Zencoin label typography', 'zenctuary' ) } prefix="zencoinLabel" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#d8b354" />
				<PanelBody title={ __( 'Coin style', 'zenctuary' ) } initialOpen={ false }>
					<RangeControl label={ __( 'Coin size', 'zenctuary' ) } value={ attributes.coinSize } onChange={ ( coinSize ) => setAttributes( { coinSize } ) } min={ 24 } max={ 90 } />
					<RangeControl label={ __( 'Zencoin label gap', 'zenctuary' ) } value={ attributes.zencoinGap } onChange={ ( zencoinGap ) => setAttributes( { zencoinGap } ) } min={ 0 } max={ 40 } />
					<ColorControl label={ __( 'Coin background', 'zenctuary' ) } value={ attributes.coinBackgroundColor } onChange={ ( coinBackgroundColor ) => setAttributes( { coinBackgroundColor: coinBackgroundColor || '#d8b354' } ) } />
					<ColorControl label={ __( 'Coin ring/border', 'zenctuary' ) } value={ attributes.coinBorderColor } onChange={ ( coinBorderColor ) => setAttributes( { coinBorderColor: coinBorderColor || '#3f3d3d' } ) } />
					<ColorControl label={ __( 'Coin text', 'zenctuary' ) } value={ attributes.coinTextColor } onChange={ ( coinTextColor ) => setAttributes( { coinTextColor: coinTextColor || '#3f3d3d' } ) } />
					<RangeControl label={ __( 'Coin border width', 'zenctuary' ) } value={ attributes.coinBorderWidth } onChange={ ( coinBorderWidth ) => setAttributes( { coinBorderWidth } ) } min={ 1 } max={ 8 } />
					<RangeControl label={ __( 'Inner ring inset', 'zenctuary' ) } value={ attributes.coinRingInset } onChange={ ( coinRingInset ) => setAttributes( { coinRingInset } ) } min={ 2 } max={ 14 } />
					<UnitControl label={ __( 'Coin value font size', 'zenctuary' ) } value={ attributes.coinValueFontSize } onChange={ ( coinValueFontSize ) => setAttributes( { coinValueFontSize: coinValueFontSize || '' } ) } />
					<SelectControl label={ __( 'Coin value font weight', 'zenctuary' ) } value={ attributes.coinValueFontWeight } options={ WEIGHTS } onChange={ ( coinValueFontWeight ) => setAttributes( { coinValueFontWeight } ) } />
				</PanelBody>
				<TypographyControls title={ __( 'Card title typography', 'zenctuary' ) } prefix="cardTitle" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#f1eee7" />
				<PanelBody title={ __( 'Card title layout', 'zenctuary' ) } initialOpen={ false }>
					<ToggleControl label={ __( 'Allow card title to wrap', 'zenctuary' ) } checked={ !! attributes.cardTitleWrap } onChange={ ( cardTitleWrap ) => setAttributes( { cardTitleWrap } ) } />
				</PanelBody>
				<TypographyControls title={ __( 'Price typography', 'zenctuary' ) } prefix="price" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#f1eee7" />
				<TypographyControls title={ __( 'Feature typography', 'zenctuary' ) } prefix="feature" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#f1eee7" />
				<PanelBody title={ __( 'Feature icon', 'zenctuary' ) } initialOpen={ false }>
					<ToggleControl label={ __( 'Show check icon', 'zenctuary' ) } checked={ !! attributes.showFeatureIcon } onChange={ ( showFeatureIcon ) => setAttributes( { showFeatureIcon } ) } />
					<RangeControl label={ __( 'Icon size', 'zenctuary' ) } value={ attributes.featureIconSize } onChange={ ( featureIconSize ) => setAttributes( { featureIconSize } ) } min={ 12 } max={ 48 } />
					<RangeControl label={ __( 'Icon gap', 'zenctuary' ) } value={ attributes.featureIconGap } onChange={ ( featureIconGap ) => setAttributes( { featureIconGap } ) } min={ 0 } max={ 32 } />
					<ColorControl label={ __( 'Icon background', 'zenctuary' ) } value={ attributes.featureIconBackgroundColor } onChange={ ( featureIconBackgroundColor ) => setAttributes( { featureIconBackgroundColor: featureIconBackgroundColor || '#d8b354' } ) } />
					<ColorControl label={ __( 'Icon color', 'zenctuary' ) } value={ attributes.featureIconColor } onChange={ ( featureIconColor ) => setAttributes( { featureIconColor: featureIconColor || '#3f3d3d' } ) } />
				</PanelBody>
				<TypographyControls title={ __( 'Validity typography', 'zenctuary' ) } prefix="validity" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#f1eee7" />
				<TypographyControls title={ __( 'Button typography', 'zenctuary' ) } prefix="button" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#d8b354" />
				<PanelBody title={ __( 'Button style', 'zenctuary' ) } initialOpen={ false }>
					<ColorControl label={ __( 'Button background', 'zenctuary' ) } value={ attributes.buttonBackgroundColor } onChange={ ( buttonBackgroundColor ) => setAttributes( { buttonBackgroundColor: buttonBackgroundColor || 'transparent' } ) } />
					<ColorControl label={ __( 'Button border', 'zenctuary' ) } value={ attributes.buttonBorderColor } onChange={ ( buttonBorderColor ) => setAttributes( { buttonBorderColor: buttonBorderColor || '#d8b354' } ) } />
					<RangeControl label={ __( 'Border width', 'zenctuary' ) } value={ attributes.buttonBorderWidth } onChange={ ( buttonBorderWidth ) => setAttributes( { buttonBorderWidth } ) } min={ 0 } max={ 8 } />
					<UnitControl label={ __( 'Border radius', 'zenctuary' ) } value={ attributes.buttonBorderRadius } onChange={ ( buttonBorderRadius ) => setAttributes( { buttonBorderRadius: buttonBorderRadius || '0px' } ) } />
					<UnitControl label={ __( 'Button width', 'zenctuary' ) } value={ attributes.buttonWidth } onChange={ ( buttonWidth ) => setAttributes( { buttonWidth: buttonWidth || 'auto' } ) } />
					<UnitControl label={ __( 'Button min height', 'zenctuary' ) } value={ attributes.buttonMinHeight } onChange={ ( buttonMinHeight ) => setAttributes( { buttonMinHeight: buttonMinHeight || 'auto' } ) } />
					<UnitControl label={ __( 'Padding top', 'zenctuary' ) } value={ attributes.buttonPaddingTop } onChange={ ( buttonPaddingTop ) => setAttributes( { buttonPaddingTop: buttonPaddingTop || '0px' } ) } />
					<UnitControl label={ __( 'Padding right', 'zenctuary' ) } value={ attributes.buttonPaddingRight } onChange={ ( buttonPaddingRight ) => setAttributes( { buttonPaddingRight: buttonPaddingRight || '0px' } ) } />
					<UnitControl label={ __( 'Padding bottom', 'zenctuary' ) } value={ attributes.buttonPaddingBottom } onChange={ ( buttonPaddingBottom ) => setAttributes( { buttonPaddingBottom: buttonPaddingBottom || '0px' } ) } />
					<UnitControl label={ __( 'Padding left', 'zenctuary' ) } value={ attributes.buttonPaddingLeft } onChange={ ( buttonPaddingLeft ) => setAttributes( { buttonPaddingLeft: buttonPaddingLeft || '0px' } ) } />
					<UnitControl label={ __( 'Top margin', 'zenctuary' ) } value={ attributes.buttonMarginTop } onChange={ ( buttonMarginTop ) => setAttributes( { buttonMarginTop: buttonMarginTop || '0px' } ) } />
					<ToggleControl label={ __( 'Show arrow icon', 'zenctuary' ) } checked={ !! attributes.showButtonIcon } onChange={ ( showButtonIcon ) => setAttributes( { showButtonIcon } ) } />
					<RangeControl label={ __( 'Icon size', 'zenctuary' ) } value={ attributes.buttonIconSize } onChange={ ( buttonIconSize ) => setAttributes( { buttonIconSize } ) } min={ 10 } max={ 64 } />
					<RangeControl label={ __( 'Icon gap', 'zenctuary' ) } value={ attributes.buttonIconGap } onChange={ ( buttonIconGap ) => setAttributes( { buttonIconGap } ) } min={ 0 } max={ 40 } />
					<ColorControl label={ __( 'Icon color', 'zenctuary' ) } value={ attributes.buttonIconColor } onChange={ ( buttonIconColor ) => setAttributes( { buttonIconColor: buttonIconColor || '#d8b354' } ) } />
				</PanelBody>
			</InspectorControls>
			<BlockView attributes={ attributes } setAttributes={ setAttributes } setSelectedPackageIndex={ setSelectedPackageIndex } />
		</>
	);
}
