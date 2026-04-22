import { 
	InspectorControls, 
	useBlockProps, 
	AlignmentToolbar, 
	PanelColorSettings 
} from '@wordpress/block-editor';
import { 
	Button, 
	PanelBody, 
	Spinner, 
	TextControl, 
	__experimentalUnitControl as UnitControl,
	FormTokenField,
	SelectControl,
	FontSizePicker
} from '@wordpress/components';
import { useEffect, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';

const FILTERS = [
	{ key: 'drinks', label: 'Drinks', slugAttribute: 'drinksTagSlug' },
	{ key: 'food', label: 'Food', slugAttribute: 'foodTagSlug' },
];

const defaultSpacing = () => ( { top: '0px', right: '0px', bottom: '0px', left: '0px' } );

const spacingStyle = ( spacing, prefix ) => {
	const value = { ...defaultSpacing(), ...( spacing || {} ) };
	return {
		[ `${ prefix }Top` ]: value.top,
		[ `${ prefix }Right` ]: value.right,
		[ `${ prefix }Bottom` ]: value.bottom,
		[ `${ prefix }Left` ]: value.left,
	};
};

const stripHtml = ( value = '' ) => {
	const element = document.createElement( 'div' );
	element.innerHTML = value;
	return element.textContent || element.innerText || '';
};

const formatPlainText = ( value = '' ) => stripHtml(
	String( value )
		.replace( /<\s*br\s*\/?>/gi, '\n' )
		.replace( /<\/(p|div|li|h[1-6])>/gi, '\n' )
).replace( /\n{3,}/g, '\n\n' ).trim();

const decodeEntities = ( value = '' ) => {
	const textarea = document.createElement( 'textarea' );
	textarea.innerHTML = value;
	return textarea.value;
};

const getProductPrice = ( product ) => {
	if ( product?.prices?.price && product?.prices?.currency_symbol ) {
		const minorUnit = product.prices.currency_minor_unit || 2;
		return `${ ( Number( product.prices.price ) / Math.pow( 10, minorUnit ) ).toFixed( minorUnit ) }${ product.prices.currency_symbol }`;
	}

	return stripHtml( product?.price_html || '' );
};

const getAttributeText = ( product ) => {
	const attributes = Array.isArray( product.attributes ) ? product.attributes : [];
	const preferred = attributes.find( ( attribute ) => {
		const label = String( attribute.name || attribute.slug || '' ).toLowerCase();
		return label.includes( 'ml' ) || label.includes( 'size' ) || label.includes( 'menge' ) || label.includes( 'protein' );
	} ) || attributes[ 0 ];

	if ( ! preferred ) {
		return '';
	}

	const terms = Array.isArray( preferred.terms ) ? preferred.terms.map( ( term ) => term.name ) : [];
	return terms.length ? terms.join( ', ' ) : stripHtml( preferred.name || '' );
};

const getDetailsText = ( product ) => {
	const attributes = Array.isArray( product.attributes ) ? product.attributes : [];
	const details = attributes.find( ( attribute ) => {
		const label = String( attribute.name || attribute.slug || '' ).toLowerCase();
		return label.includes( 'zutat' ) || label.includes( 'ingredient' ) || label.includes( 'detail' );
	} );

	if ( ! details || ! Array.isArray( details.terms ) || ! details.terms.length ) {
		return '';
	}

	return details.terms.map( ( term ) => term.name ).join( ', ' );
};

const productHasTag = ( product, tagSlug ) => {
	const normalizedTag = String( tagSlug || '' ).toLowerCase();
	return ( product.tags || [] ).some( ( tag ) => String( tag.slug || tag.name || '' ).toLowerCase() === normalizedTag );
};

const groupProductsByCategory = ( products, tagSlug ) => {
	const categories = new Map();

	products.filter( ( product ) => productHasTag( product, tagSlug ) ).forEach( ( product ) => {
		( product.categories || [] ).forEach( ( category ) => {
			const key = String( category.id || category.slug || category.name );
			const current = categories.get( key ) || {
				id: key,
				name: decodeEntities( category.name || '' ),
				description: stripHtml( category.description || '' ),
				products: [],
			};

			current.products.push( product );
			categories.set( key, current );
		} );
	} );

	return Array.from( categories.values() ).sort( ( a, b ) => a.name.localeCompare( b.name ) );
};

function FourSideControls( { label, value, onChange } ) {
	const nextValue = { ...defaultSpacing(), ...( value || {} ) };
	const updateSide = ( side, sideValue ) => onChange( { ...nextValue, [ side ]: sideValue || '0px' } );

	return (
		<div className="zen-soul-menu__spacing-controls">
			<p className="components-base-control__label">{ label }</p>
			<UnitControl label={ __( 'Top', 'zenctuary' ) } value={ nextValue.top } onChange={ ( sideValue ) => updateSide( 'top', sideValue ) } />
			<UnitControl label={ __( 'Right', 'zenctuary' ) } value={ nextValue.right } onChange={ ( sideValue ) => updateSide( 'right', sideValue ) } />
			<UnitControl label={ __( 'Bottom', 'zenctuary' ) } value={ nextValue.bottom } onChange={ ( sideValue ) => updateSide( 'bottom', sideValue ) } />
			<UnitControl label={ __( 'Left', 'zenctuary' ) } value={ nextValue.left } onChange={ ( sideValue ) => updateSide( 'left', sideValue ) } />
		</div>
	);
}

function ProductCard( { product } ) {
	const attribute = getAttributeText( product );
	const price = getProductPrice( product );
	const details = getDetailsText( product );
	const description = formatPlainText( product.description || '' );
	const shortDescription = formatPlainText( product.short_description || '' );

	return (
		<article className="zen-soul-menu__product">
			<h4 className="zen-soul-menu__product-title">{ decodeEntities( product.name || __( 'Untitled product', 'zenctuary' ) ) }</h4>
			{ description && <p className="zen-soul-menu__product-description">{ description }</p> }
			{ shortDescription && <p className="zen-soul-menu__product-short-description">{ shortDescription }</p> }
			{ details && <p className="zen-soul-menu__product-details">{ details }</p> }
			{ ( attribute || price ) && (
				<p className="zen-soul-menu__product-meta">{ [ attribute, price ].filter( Boolean ).join( ' / ' ) }</p>
			) }
		</article>
	);
}

function CategorySection( { category, settings } ) {
	const categorySettings = settings?.[ category.id ] || {};
	const description = categorySettings.description || category.description;

	return (
		<section className="zen-soul-menu__category">
			<div className="zen-soul-menu__category-header">
				<h3 className="zen-soul-menu__category-title">{ category.name }</h3>
				{ categorySettings.metaText && <p className="zen-soul-menu__category-meta">{ categorySettings.metaText }</p> }
			</div>
			{ description && <p className="zen-soul-menu__category-description">{ description }</p> }
			<div className="zen-soul-menu__products">
				{ category.products.map( ( product ) => <ProductCard key={ product.id } product={ product } /> ) }
			</div>
		</section>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const {
		heading,
		headingColor,
		headingFontSize,
		headingFontWeight,
		headingAlignment,
		selectedTags,
		buttonStyles,
		sectionPadding,
		sectionMargin,
		activeFilter,
	} = attributes;

	const [ products, setProducts ] = useState( [] );
	const [ isLoading, setIsLoading ] = useState( true );
	const [ errorMessage, setErrorMessage ] = useState( '' );

	// Fetch Product Tags
	const allTags = useSelect( ( select ) => {
		return select( 'core' ).getEntityRecords( 'taxonomy', 'product_tag', { per_page: -1 } );
	}, [] );

	const tagOptions = useMemo( () => {
		if ( ! allTags ) return [];
		return allTags.map( ( tag ) => tag.name );
	}, [ allTags ] );

	const onTagsChange = ( tokens ) => {
		const newSelectedTags = tokens.map( ( token ) => {
			const tag = allTags.find( ( t ) => t.name === token );
			if ( ! tag ) return null;

			const existing = selectedTags.find( ( st ) => st.id === tag.id );
			return existing || { id: tag.id, slug: tag.slug, label: tag.name };
		} ).filter( Boolean );

		setAttributes( { selectedTags: newSelectedTags } );
	};

	const updateTagLabel = ( index, newLabel ) => {
		const newTags = [ ...selectedTags ];
		newTags[ index ] = { ...newTags[ index ], label: newLabel };
		setAttributes( { selectedTags: newTags } );
	};

	const updateButtonStyle = ( state, key, value ) => {
		setAttributes( {
			buttonStyles: {
				...buttonStyles,
				[ state ]: {
					...( buttonStyles[ state ] || {} ),
					[ key ]: value,
				},
			},
		} );
	};
	const activeFilter = attributes.activeFilter || 'drinks';
	const activeFilterConfig = FILTERS.find( ( filter ) => filter.key === activeFilter ) || FILTERS[ 0 ];
	const activeTagSlug = attributes[ activeFilterConfig.slugAttribute ];

	useEffect( () => {
		let isMounted = true;

		apiFetch( { path: '/wc/store/v1/products?per_page=100&page=1' } )
			.then( ( response ) => {
				if ( ! isMounted ) {
					return;
				}

				setProducts( Array.isArray( response ) ? response : [] );
				setErrorMessage( '' );
			} )
			.catch( () => {
				if ( isMounted ) {
					setErrorMessage( __( 'WooCommerce products could not be loaded. Please confirm WooCommerce is active and the Store API is available.', 'zenctuary' ) );
				}
			} )
			.finally( () => {
				if ( isMounted ) {
					setIsLoading( false );
				}
			} );

		return () => {
			isMounted = false;
		};
	}, [] );

	const categories = useMemo( () => groupProductsByCategory( products, activeTagSlug ), [ products, activeTagSlug ] );

	const blockProps = useBlockProps( {
		style: {
			...spacingStyle( attributes.sectionPadding, 'padding' ),
			...spacingStyle( attributes.sectionMargin, 'margin' ),
		},
	} );

	const updateCategorySetting = ( categoryId, key, value ) => {
		const currentSettings = attributes.categorySettings || {};
		setAttributes( {
			categorySettings: {
				...currentSettings,
				[ categoryId ]: {
					...( currentSettings[ categoryId ] || {} ),
					[ key ]: value,
				},
			},
		} );
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Heading Settings', 'zenctuary' ) }>
					<TextControl
						label={ __( 'Heading Text', 'zenctuary' ) }
						value={ heading }
						onChange={ ( val ) => setAttributes( { heading: val } ) }
					/>
					<PanelColorSettings
						title={ __( 'Heading Color', 'zenctuary' ) }
						initialOpen={ false }
						colorSettings={ [
							{
								value: headingColor,
								onChange: ( val ) => setAttributes( { headingColor: val } ),
								label: __( 'Color', 'zenctuary' ),
							},
						] }
					/>
					<UnitControl
						label={ __( 'Font Size', 'zenctuary' ) }
						value={ headingFontSize }
						onChange={ ( val ) => setAttributes( { headingFontSize: val } ) }
					/>
					<SelectControl
						label={ __( 'Font Weight', 'zenctuary' ) }
						value={ headingFontWeight }
						options={ [
							{ label: 'Normal', value: '400' },
							{ label: 'Medium', value: '500' },
							{ label: 'Semi Bold', value: '600' },
							{ label: 'Bold', value: '700' },
							{ label: 'Extra Bold', value: '800' },
						] }
						onChange={ ( val ) => setAttributes( { headingFontWeight: val } ) }
					/>
					<div className="components-base-control">
						<span className="components-base-control__label">{ __( 'Alignment', 'zenctuary' ) }</span>
						<AlignmentToolbar
							value={ headingAlignment }
							onChange={ ( val ) => setAttributes( { headingAlignment: val } ) }
						/>
					</div>
				</PanelBody>

				<PanelBody title={ __( 'Filter Settings', 'zenctuary' ) } initialOpen={ false }>
					<FormTokenField
						label={ __( 'Select Tags', 'zenctuary' ) }
						value={ selectedTags.map( ( t ) => t.label ) }
						suggestions={ tagOptions }
						onChange={ onTagsChange }
					/>
					{ selectedTags.length > 0 && (
						<div className="zen-soul-menu__tag-labels">
							<p className="components-base-control__label">{ __( 'Edit Tag Labels', 'zenctuary' ) }</p>
							{ selectedTags.map( ( tag, index ) => (
								<TextControl
									key={ tag.id }
									label={ sprintf( __( 'Label for %s', 'zenctuary' ), tag.slug ) }
									value={ tag.label }
									onChange={ ( val ) => updateTagLabel( index, val ) }
								/>
							) ) }
						</div>
					) }
				</PanelBody>

				<PanelBody title={ __( 'Button Styles (Normal)', 'zenctuary' ) } initialOpen={ false }>
					<PanelColorSettings
						title={ __( 'Colors', 'zenctuary' ) }
						initialOpen={ true }
						colorSettings={ [
							{
								value: buttonStyles.normal?.backgroundColor,
								onChange: ( val ) => updateButtonStyle( 'normal', 'backgroundColor', val ),
								label: __( 'Background Color', 'zenctuary' ),
							},
							{
								value: buttonStyles.normal?.textColor,
								onChange: ( val ) => updateButtonStyle( 'normal', 'textColor', val ),
								label: __( 'Text Color', 'zenctuary' ),
							},
							{
								value: buttonStyles.normal?.borderColor,
								onChange: ( val ) => updateButtonStyle( 'normal', 'borderColor', val ),
								label: __( 'Border Color', 'zenctuary' ),
							},
						] }
					/>
					<SelectControl
						label={ __( 'Font Weight', 'zenctuary' ) }
						value={ buttonStyles.normal?.fontWeight }
						options={ [
							{ label: 'Normal', value: '400' },
							{ label: 'Medium', value: '500' },
							{ label: 'Semi Bold', value: '600' },
							{ label: 'Bold', value: '700' },
						] }
						onChange={ ( val ) => updateButtonStyle( 'normal', 'fontWeight', val ) }
					/>
					<UnitControl
						label={ __( 'Border Width', 'zenctuary' ) }
						value={ buttonStyles.normal?.borderWidth }
						onChange={ ( val ) => updateButtonStyle( 'normal', 'borderWidth', val ) }
					/>
					<UnitControl
						label={ __( 'Border Radius', 'zenctuary' ) }
						value={ buttonStyles.normal?.borderRadius }
						onChange={ ( val ) => updateButtonStyle( 'normal', 'borderRadius', val ) }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Button Styles (Active)', 'zenctuary' ) } initialOpen={ false }>
					<PanelColorSettings
						title={ __( 'Active State Colors', 'zenctuary' ) }
						initialOpen={ true }
						colorSettings={ [
							{
								value: buttonStyles.active?.backgroundColor,
								onChange: ( val ) => updateButtonStyle( 'active', 'backgroundColor', val ),
								label: __( 'Background Color', 'zenctuary' ),
							},
							{
								value: buttonStyles.active?.textColor,
								onChange: ( val ) => updateButtonStyle( 'active', 'textColor', val ),
								label: __( 'Text Color', 'zenctuary' ),
							},
							{
								value: buttonStyles.active?.borderColor,
								onChange: ( val ) => updateButtonStyle( 'active', 'borderColor', val ),
								label: __( 'Border Color', 'zenctuary' ),
							},
						] }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Block Spacing', 'zenctuary' ) } initialOpen={ false }>
					<FourSideControls label={ __( 'Padding', 'zenctuary' ) } value={ sectionPadding } onChange={ ( val ) => setAttributes( { sectionPadding: val } ) } />
					<FourSideControls label={ __( 'Margin', 'zenctuary' ) } value={ sectionMargin } onChange={ ( val ) => setAttributes( { sectionMargin: val } ) } />
				</PanelBody>
			</InspectorControls>

			<section { ...blockProps }>
				<h2 
					className="zen-soul-menu__heading"
					style={ {
						color: headingColor,
						fontSize: headingFontSize,
						fontWeight: headingFontWeight,
						textAlign: headingAlignment,
					} }
				>
					{ heading || __( 'Soul Kitchen Menu', 'zenctuary' ) }
				</h2>

				<div 
					className="zen-soul-menu__filters" 
					role="group" 
					aria-label={ __( 'Menu filters', 'zenctuary' ) }
					style={ { textAlign: headingAlignment } }
				>
					{ selectedTags.length > 0 ? selectedTags.map( ( tag, index ) => {
						const isActive = index === 0; // Just for preview
						const styles = isActive ? buttonStyles.active : buttonStyles.normal;
						return (
							<Button
								key={ tag.id }
								className={ `zen-soul-menu__filter-button${ isActive ? ' is-active' : '' }` }
								style={ {
									backgroundColor: styles?.backgroundColor,
									color: styles?.textColor,
									borderColor: styles?.borderColor,
									borderWidth: isActive ? undefined : styles?.borderWidth,
									borderRadius: isActive ? undefined : styles?.borderRadius,
									fontWeight: isActive ? undefined : styles?.fontWeight,
									borderStyle: 'solid',
								} }
							>
								{ tag.label }
							</Button>
						);
					} ) : (
						<p className="zen-soul-menu__notice">{ __( 'Please select tags in the inspector.', 'zenctuary' ) }</p>
					) }
				</div>
				{ isLoading && <div className="zen-soul-menu__notice"><Spinner /> { __( 'Loading menu products...', 'zenctuary' ) }</div> }
				{ errorMessage && <p className="zen-soul-menu__notice">{ errorMessage }</p> }
				{ ! isLoading && ! errorMessage && categories.map( ( category ) => (
					<CategorySection key={ category.id } category={ category } settings={ attributes.categorySettings || {} } />
				) ) }
				{ ! isLoading && ! errorMessage && ! categories.length && (
					<p className="zen-soul-menu__notice">{ __( 'No products found for this tag. Check the tag slug mapping or WooCommerce product tags.', 'zenctuary' ) }</p>
				) }
			</section>
		</>
	);
}
