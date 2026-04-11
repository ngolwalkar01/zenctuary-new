import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { Button, PanelBody, Spinner, TextControl, __experimentalUnitControl as UnitControl } from '@wordpress/components';
import { useEffect, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
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
	const [ products, setProducts ] = useState( [] );
	const [ isLoading, setIsLoading ] = useState( true );
	const [ errorMessage, setErrorMessage ] = useState( '' );
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
				<PanelBody title={ __( 'Block Layout', 'zenctuary' ) }>
					<TextControl label={ __( 'Heading', 'zenctuary' ) } value={ attributes.heading } onChange={ ( heading ) => setAttributes( { heading } ) } />
					<FourSideControls label={ __( 'Padding', 'zenctuary' ) } value={ attributes.sectionPadding } onChange={ ( sectionPadding ) => setAttributes( { sectionPadding } ) } />
					<FourSideControls label={ __( 'Margin', 'zenctuary' ) } value={ attributes.sectionMargin } onChange={ ( sectionMargin ) => setAttributes( { sectionMargin } ) } />
				</PanelBody>
				<PanelBody title={ __( 'Filter Settings', 'zenctuary' ) } initialOpen={ false }>
					<TextControl label={ __( 'Drinks tag slug', 'zenctuary' ) } value={ attributes.drinksTagSlug } onChange={ ( drinksTagSlug ) => setAttributes( { drinksTagSlug } ) } />
					<TextControl label={ __( 'Food tag slug', 'zenctuary' ) } value={ attributes.foodTagSlug } onChange={ ( foodTagSlug ) => setAttributes( { foodTagSlug } ) } />
				</PanelBody>
				<PanelBody title={ __( 'Category Settings', 'zenctuary' ) } initialOpen={ true }>
					{ categories.length ? categories.map( ( category ) => {
						const settings = attributes.categorySettings?.[ category.id ] || {};
						return (
							<div className="zen-soul-menu__category-settings" key={ category.id }>
								<p className="zen-soul-menu__category-settings-title">{ category.name }</p>
								<TextControl label={ __( 'Right-side text', 'zenctuary' ) } value={ settings.metaText || '' } placeholder="40ml / 2,50 €" onChange={ ( value ) => updateCategorySetting( category.id, 'metaText', value ) } />
								<TextControl label={ __( 'Description override', 'zenctuary' ) } value={ settings.description || '' } onChange={ ( value ) => updateCategorySetting( category.id, 'description', value ) } />
							</div>
						);
					} ) : <p>{ __( 'No categories found for the active filter.', 'zenctuary' ) }</p> }
				</PanelBody>
			</InspectorControls>

			<section { ...blockProps }>
				<h2 className="zen-soul-menu__heading">{ attributes.heading || __( 'Soul Kitchen Menu', 'zenctuary' ) }</h2>
				<div className="zen-soul-menu__filters" role="group" aria-label={ __( 'Menu filters', 'zenctuary' ) }>
					{ FILTERS.map( ( filter ) => (
						<Button
							key={ filter.key }
							className={ `zen-soul-menu__filter-button${ activeFilter === filter.key ? ' is-active' : '' }` }
							onClick={ () => setAttributes( { activeFilter: filter.key } ) }
							aria-pressed={ activeFilter === filter.key }
						>
							{ filter.label }
						</Button>
					) ) }
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
