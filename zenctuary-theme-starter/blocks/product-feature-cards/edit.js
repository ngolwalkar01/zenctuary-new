import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	useBlockProps,
} from '@wordpress/block-editor';
import ServerSideRender from '@wordpress/server-side-render';
import apiFetch from '@wordpress/api-fetch';
import {
	BaseControl,
	CheckboxControl,
	ColorPalette,
	PanelBody,
	RangeControl,
	SelectControl,
	TextControl,
	TextareaControl,
	ToggleControl,
} from '@wordpress/components';
import { useEffect, useMemo, useState } from '@wordpress/element';

const COLORS = [
	{ name: 'Gold', color: '#d8b354' },
	{ name: 'Charcoal', color: '#3f3d3d' },
	{ name: 'Cream', color: '#f6f2ea' },
	{ name: 'White', color: '#ffffff' },
	{ name: 'Ink', color: '#1f1c18' },
];

const ORDER_BY = [
	{ label: __( 'Date', 'zenctuary' ), value: 'date' },
	{ label: __( 'Title', 'zenctuary' ), value: 'title' },
	{ label: __( 'Modified', 'zenctuary' ), value: 'modified' },
	{ label: __( 'Random', 'zenctuary' ), value: 'rand' },
	{ label: __( 'Menu Order', 'zenctuary' ), value: 'menu_order' },
];

const ALIGN_OPTIONS = [
	{ label: __( 'Left', 'zenctuary' ), value: 'start' },
	{ label: __( 'Center', 'zenctuary' ), value: 'center' },
	{ label: __( 'Right', 'zenctuary' ), value: 'end' },
];

const WEIGHTS = [ '400', '500', '600', '700', '800' ].map( ( value ) => ( {
	label: value,
	value,
} ) );

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

function MultiCheckboxControl( { label, options, selected, onChange, emptyLabel } ) {
	return (
		<BaseControl label={ label }>
			{ ! options.length && <p>{ emptyLabel || __( 'No items found.', 'zenctuary' ) }</p> }
			{ !! options.length && (
				<div className="pfc-editor__checklist">
					{ options.map( ( option ) => (
						<CheckboxControl
							key={ option.value }
							label={ option.label }
							checked={ selected.includes( option.value ) }
							onChange={ ( checked ) => {
								onChange(
									checked
										? [ ...selected, option.value ]
										: selected.filter( ( value ) => value !== option.value )
								);
							} }
						/>
					) ) }
				</div>
			) }
		</BaseControl>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const blockProps = useBlockProps( {
		className: 'pfc-editor',
	} );

	const [ productRestBase, setProductRestBase ] = useState( 'products' );
	const [ taxonomies, setTaxonomies ] = useState( [] );
	const [ terms, setTerms ] = useState( [] );
	const [ products, setProducts ] = useState( [] );

	useEffect( () => {
		apiFetch( { path: '/wp/v2/types/product' } )
			.then( ( response ) => {
				if ( response?.rest_base ) {
					setProductRestBase( response.rest_base );
				}
			} )
			.catch( () => {} );

		apiFetch( { path: '/wp/v2/taxonomies?type=product' } )
			.then( ( response ) => {
				const options = Object.values( response || {} )
					.filter( ( taxonomy ) => taxonomy.rest_base )
					.map( ( taxonomy ) => ( {
						label: taxonomy.name,
						value: taxonomy.slug,
						restBase: taxonomy.rest_base,
					} ) );
				setTaxonomies( options );
			} )
			.catch( () => setTaxonomies( [] ) );
	}, [] );

	useEffect( () => {
		if ( ! productRestBase ) {
			return;
		}

		apiFetch( {
			path: `/wp/v2/${ productRestBase }?per_page=100&orderby=title&order=asc&_fields=id,title`,
		} )
			.then( ( response ) => {
				setProducts(
					Array.isArray( response )
						? response.map( ( product ) => ( {
								label: product?.title?.rendered || `#${ product.id }`,
								value: product.id,
						  } ) )
						: []
				);
			} )
			.catch( () => setProducts( [] ) );
	}, [ productRestBase ] );

	const taxonomyOptions = useMemo(
		() =>
			taxonomies.length
				? taxonomies
				: [
						{ label: __( 'Product categories', 'zenctuary' ), value: 'product_cat', restBase: 'product_cat' },
						{ label: __( 'Product tags', 'zenctuary' ), value: 'product_tag', restBase: 'product_tag' },
				  ],
		[ taxonomies ]
	);

	useEffect( () => {
		if ( ! taxonomyOptions.find( ( taxonomy ) => taxonomy.value === attributes.productTaxonomy ) ) {
			setAttributes( { productTaxonomy: taxonomyOptions[ 0 ]?.value || 'product_cat', termIds: [] } );
		}
	}, [ taxonomyOptions, attributes.productTaxonomy, setAttributes ] );

	useEffect( () => {
		const selectedTaxonomy = taxonomyOptions.find(
			( taxonomy ) => taxonomy.value === attributes.productTaxonomy
		);

		if ( ! selectedTaxonomy?.restBase ) {
			setTerms( [] );
			return;
		}

		apiFetch( {
			path: `/wp/v2/${ selectedTaxonomy.restBase }?per_page=100&_fields=id,name`,
		} )
			.then( ( response ) => {
				setTerms(
					Array.isArray( response )
						? response.map( ( term ) => ( {
								label: term.name,
								value: term.id,
						  } ) )
						: []
				);
			} )
			.catch( () => setTerms( [] ) );
	}, [ attributes.productTaxonomy, taxonomyOptions ] );

	return (
		<div { ...blockProps }>
			<InspectorControls>
				<PanelBody title={ __( 'Query', 'zenctuary' ) } initialOpen>
					<SelectControl
						label={ __( 'Query Mode', 'zenctuary' ) }
						value={ attributes.queryMode }
						options={ [
							{ label: __( 'Taxonomy', 'zenctuary' ), value: 'taxonomy' },
							{ label: __( 'Manual Products', 'zenctuary' ), value: 'manual' },
							{ label: __( 'Hybrid Manual Order', 'zenctuary' ), value: 'hybrid' },
						] }
						onChange={ ( queryMode ) => setAttributes( { queryMode } ) }
					/>
					<SelectControl
						label={ __( 'Product Taxonomy', 'zenctuary' ) }
						value={ attributes.productTaxonomy }
						options={ taxonomyOptions }
						onChange={ ( productTaxonomy ) => setAttributes( { productTaxonomy, termIds: [] } ) }
					/>
					<MultiCheckboxControl
						label={ __( 'Terms', 'zenctuary' ) }
						options={ terms }
						selected={ attributes.termIds || [] }
						onChange={ ( termIds ) => setAttributes( { termIds } ) }
						emptyLabel={ __( 'No terms found for the selected taxonomy.', 'zenctuary' ) }
					/>
					<RangeControl
						label={ __( 'Products To Show', 'zenctuary' ) }
						value={ attributes.productsToShow }
						onChange={ ( productsToShow ) => setAttributes( { productsToShow } ) }
						min={ 1 }
						max={ 20 }
					/>
					<SelectControl
						label={ __( 'Order By', 'zenctuary' ) }
						value={ attributes.orderBy }
						options={ ORDER_BY }
						onChange={ ( orderBy ) => setAttributes( { orderBy } ) }
					/>
					<SelectControl
						label={ __( 'Order', 'zenctuary' ) }
						value={ attributes.order }
						options={ [
							{ label: __( 'Descending', 'zenctuary' ), value: 'DESC' },
							{ label: __( 'Ascending', 'zenctuary' ), value: 'ASC' },
						] }
						onChange={ ( order ) => setAttributes( { order } ) }
					/>
					<RangeControl
						label={ __( 'Offset', 'zenctuary' ) }
						value={ attributes.offset }
						onChange={ ( offset ) => setAttributes( { offset } ) }
						min={ 0 }
						max={ 20 }
					/>
					<MultiCheckboxControl
						label={ __( 'Manual Products', 'zenctuary' ) }
						options={ products }
						selected={ attributes.manualProductIds || [] }
						onChange={ ( manualProductIds ) => setAttributes( { manualProductIds } ) }
						emptyLabel={ __( 'No products available in REST yet.', 'zenctuary' ) }
					/>
					<MultiCheckboxControl
						label={ __( 'Exclude Products', 'zenctuary' ) }
						options={ products }
						selected={ attributes.excludeProductIds || [] }
						onChange={ ( excludeProductIds ) => setAttributes( { excludeProductIds } ) }
						emptyLabel={ __( 'No products available in REST yet.', 'zenctuary' ) }
					/>
					<ToggleControl
						label={ __( 'Hide Out Of Stock', 'zenctuary' ) }
						checked={ attributes.hideOutOfStock }
						onChange={ ( hideOutOfStock ) => setAttributes( { hideOutOfStock } ) }
					/>
					<ToggleControl
						label={ __( 'Only Featured Products', 'zenctuary' ) }
						checked={ attributes.onlyFeaturedProducts }
						onChange={ ( onlyFeaturedProducts ) => setAttributes( { onlyFeaturedProducts } ) }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Section', 'zenctuary' ) }>
					<TextControl label={ __( 'Heading', 'zenctuary' ) } value={ attributes.sectionHeading } onChange={ ( sectionHeading ) => setAttributes( { sectionHeading } ) } />
					<TextareaControl label={ __( 'Intro Text', 'zenctuary' ) } value={ attributes.sectionIntro } onChange={ ( sectionIntro ) => setAttributes( { sectionIntro } ) } />
					<ColorControl label={ __( 'Background', 'zenctuary' ) } value={ attributes.sectionBackgroundColor } fallback="#3f3d3d" onChange={ ( sectionBackgroundColor ) => setAttributes( { sectionBackgroundColor } ) } />
					<ColorControl label={ __( 'Text Color', 'zenctuary' ) } value={ attributes.sectionTextColor } fallback="#f6f2ea" onChange={ ( sectionTextColor ) => setAttributes( { sectionTextColor } ) } />
					<SelectControl label={ __( 'Content Alignment', 'zenctuary' ) } value={ attributes.contentAlignment } options={ ALIGN_OPTIONS } onChange={ ( contentAlignment ) => setAttributes( { contentAlignment } ) } />
					<RangeControl label={ __( 'Max Width', 'zenctuary' ) } value={ attributes.sectionMaxWidth } onChange={ ( sectionMaxWidth ) => setAttributes( { sectionMaxWidth } ) } min={ 900 } max={ 1920 } />
					<RangeControl label={ __( 'Padding Top', 'zenctuary' ) } value={ attributes.sectionPaddingTop } onChange={ ( sectionPaddingTop ) => setAttributes( { sectionPaddingTop } ) } min={ 0 } max={ 220 } />
					<RangeControl label={ __( 'Padding Bottom', 'zenctuary' ) } value={ attributes.sectionPaddingBottom } onChange={ ( sectionPaddingBottom ) => setAttributes( { sectionPaddingBottom } ) } min={ 0 } max={ 220 } />
					<RangeControl label={ __( 'Padding Left', 'zenctuary' ) } value={ attributes.sectionPaddingLeft } onChange={ ( sectionPaddingLeft ) => setAttributes( { sectionPaddingLeft } ) } min={ 0 } max={ 120 } />
					<RangeControl label={ __( 'Padding Right', 'zenctuary' ) } value={ attributes.sectionPaddingRight } onChange={ ( sectionPaddingRight ) => setAttributes( { sectionPaddingRight } ) } min={ 0 } max={ 120 } />
					<RangeControl label={ __( 'Heading Bottom Spacing', 'zenctuary' ) } value={ attributes.headingBottomSpacing } onChange={ ( headingBottomSpacing ) => setAttributes( { headingBottomSpacing } ) } min={ 0 } max={ 100 } />
					<RangeControl label={ __( 'Intro Bottom Spacing', 'zenctuary' ) } value={ attributes.introBottomSpacing } onChange={ ( introBottomSpacing ) => setAttributes( { introBottomSpacing } ) } min={ 0 } max={ 120 } />
				</PanelBody>

				<PanelBody title={ __( 'Slider / Row', 'zenctuary' ) }>
					<RangeControl label={ __( 'Slides Per View Desktop', 'zenctuary' ) } value={ attributes.slidesPerViewDesktop } onChange={ ( slidesPerViewDesktop ) => setAttributes( { slidesPerViewDesktop } ) } min={ 1 } max={ 4 } step={ 0.1 } />
					<RangeControl label={ __( 'Slides Per View Tablet', 'zenctuary' ) } value={ attributes.slidesPerViewTablet } onChange={ ( slidesPerViewTablet ) => setAttributes( { slidesPerViewTablet } ) } min={ 1 } max={ 3 } step={ 0.05 } />
					<RangeControl label={ __( 'Slides Per View Mobile', 'zenctuary' ) } value={ attributes.slidesPerViewMobile } onChange={ ( slidesPerViewMobile ) => setAttributes( { slidesPerViewMobile } ) } min={ 1 } max={ 2 } step={ 0.05 } />
					<RangeControl label={ __( 'Card Width', 'zenctuary' ) } value={ attributes.cardWidth } onChange={ ( cardWidth ) => setAttributes( { cardWidth } ) } min={ 320 } max={ 900 } />
					<RangeControl label={ __( 'Card Height Desktop', 'zenctuary' ) } value={ attributes.cardHeight } onChange={ ( cardHeight ) => setAttributes( { cardHeight } ) } min={ 420 } max={ 1200 } />
					<RangeControl label={ __( 'Card Height Tablet', 'zenctuary' ) } value={ attributes.cardHeightTablet } onChange={ ( cardHeightTablet ) => setAttributes( { cardHeightTablet } ) } min={ 360 } max={ 1200 } />
					<RangeControl label={ __( 'Card Height Mobile', 'zenctuary' ) } value={ attributes.cardHeightMobile } onChange={ ( cardHeightMobile ) => setAttributes( { cardHeightMobile } ) } min={ 320 } max={ 1000 } />
					<RangeControl label={ __( 'Gap Desktop', 'zenctuary' ) } value={ attributes.cardGapDesktop } onChange={ ( cardGapDesktop ) => setAttributes( { cardGapDesktop } ) } min={ 0 } max={ 80 } />
					<RangeControl label={ __( 'Gap Tablet', 'zenctuary' ) } value={ attributes.cardGapTablet } onChange={ ( cardGapTablet ) => setAttributes( { cardGapTablet } ) } min={ 0 } max={ 80 } />
					<RangeControl label={ __( 'Gap Mobile', 'zenctuary' ) } value={ attributes.cardGapMobile } onChange={ ( cardGapMobile ) => setAttributes( { cardGapMobile } ) } min={ 0 } max={ 60 } />
					<ToggleControl label={ __( 'Show Arrows', 'zenctuary' ) } checked={ attributes.showArrows } onChange={ ( showArrows ) => setAttributes( { showArrows } ) } />
					<ToggleControl label={ __( 'Enable Drag / Swipe', 'zenctuary' ) } checked={ attributes.enableDrag } onChange={ ( enableDrag ) => setAttributes( { enableDrag } ) } />
					<ToggleControl label={ __( 'Enable Loop', 'zenctuary' ) } checked={ attributes.enableLoop } onChange={ ( enableLoop ) => setAttributes( { enableLoop } ) } />
					<ToggleControl label={ __( 'Autoplay', 'zenctuary' ) } checked={ attributes.autoplay } onChange={ ( autoplay ) => setAttributes( { autoplay } ) } />
					{ attributes.autoplay && <RangeControl label={ __( 'Autoplay Speed', 'zenctuary' ) } value={ attributes.autoplaySpeed } onChange={ ( autoplaySpeed ) => setAttributes( { autoplaySpeed } ) } min={ 1500 } max={ 10000 } step={ 250 } /> }
				</PanelBody>

				<PanelBody title={ __( 'Card', 'zenctuary' ) }>
					<ColorControl label={ __( 'Overlay Color', 'zenctuary' ) } value={ attributes.cardOverlayColor } fallback="#20201f" onChange={ ( cardOverlayColor ) => setAttributes( { cardOverlayColor } ) } />
					<RangeControl label={ __( 'Overlay Opacity', 'zenctuary' ) } value={ attributes.cardOverlayOpacity } onChange={ ( cardOverlayOpacity ) => setAttributes( { cardOverlayOpacity } ) } min={ 0 } max={ 1 } step={ 0.05 } />
					<ColorControl label={ __( 'Border Color', 'zenctuary' ) } value={ attributes.cardBorderColor } fallback="rgba(246, 242, 234, 0.58)" onChange={ ( cardBorderColor ) => setAttributes( { cardBorderColor } ) } />
					<RangeControl label={ __( 'Border Width', 'zenctuary' ) } value={ attributes.cardBorderWidth } onChange={ ( cardBorderWidth ) => setAttributes( { cardBorderWidth } ) } min={ 0 } max={ 8 } />
					<RangeControl label={ __( 'Border Radius', 'zenctuary' ) } value={ attributes.cardBorderRadius } onChange={ ( cardBorderRadius ) => setAttributes( { cardBorderRadius } ) } min={ 0 } max={ 60 } />
					<TextControl label={ __( 'Card Shadow', 'zenctuary' ) } value={ attributes.cardShadow } onChange={ ( cardShadow ) => setAttributes( { cardShadow } ) } help={ __( 'Use CSS shadow value or none.', 'zenctuary' ) } />
				</PanelBody>

				<PanelBody title={ __( 'Top Strip / Zencoin', 'zenctuary' ) }>
					<RangeControl label={ __( 'Top Strip Height', 'zenctuary' ) } value={ attributes.topStripHeight } onChange={ ( topStripHeight ) => setAttributes( { topStripHeight } ) } min={ 50 } max={ 180 } />
					<ColorControl label={ __( 'Top Strip Background', 'zenctuary' ) } value={ attributes.topStripBackgroundColor } fallback="#3f3d3d" onChange={ ( topStripBackgroundColor ) => setAttributes( { topStripBackgroundColor } ) } />
					<SelectControl label={ __( 'Top Strip Alignment', 'zenctuary' ) } value={ attributes.topStripAlignment } options={ ALIGN_OPTIONS } onChange={ ( topStripAlignment ) => setAttributes( { topStripAlignment } ) } />
					<TextControl label={ __( 'Label', 'zenctuary' ) } value={ attributes.zencoinLabel } onChange={ ( zencoinLabel ) => setAttributes( { zencoinLabel } ) } />
					<SelectControl label={ __( 'Value Source', 'zenctuary' ) } value={ attributes.zencoinSource } options={ [ { label: __( 'Custom Field', 'zenctuary' ), value: 'custom' }, { label: __( 'Regular Price', 'zenctuary' ), value: 'regular_price' }, { label: __( 'Sale Price', 'zenctuary' ), value: 'sale_price' }, { label: __( 'None', 'zenctuary' ), value: 'none' } ] } onChange={ ( zencoinSource ) => setAttributes( { zencoinSource } ) } />
					<ColorControl label={ __( 'Label Color', 'zenctuary' ) } value={ attributes.zencoinLabelColor } fallback="#d8b354" onChange={ ( zencoinLabelColor ) => setAttributes( { zencoinLabelColor } ) } />
					<ColorControl label={ __( 'Badge Background', 'zenctuary' ) } value={ attributes.zencoinBadgeBackgroundColor } fallback="#d8b354" onChange={ ( zencoinBadgeBackgroundColor ) => setAttributes( { zencoinBadgeBackgroundColor } ) } />
					<ColorControl label={ __( 'Badge Border Color', 'zenctuary' ) } value={ attributes.zencoinBadgeBorderColor } fallback="#d8b354" onChange={ ( zencoinBadgeBorderColor ) => setAttributes( { zencoinBadgeBorderColor } ) } />
					<ColorControl label={ __( 'Value Color', 'zenctuary' ) } value={ attributes.zencoinValueColor } fallback="#3f3d3d" onChange={ ( zencoinValueColor ) => setAttributes( { zencoinValueColor } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Title / Session / Excerpt', 'zenctuary' ) }>
					<ColorControl label={ __( 'Title Color', 'zenctuary' ) } value={ attributes.titleColor } fallback="#ffffff" onChange={ ( titleColor ) => setAttributes( { titleColor } ) } />
					<RangeControl label={ __( 'Title Font Size', 'zenctuary' ) } value={ attributes.titleFontSize } onChange={ ( titleFontSize ) => setAttributes( { titleFontSize } ) } min={ 20 } max={ 96 } />
					<SelectControl label={ __( 'Title Weight', 'zenctuary' ) } value={ attributes.titleFontWeight } options={ WEIGHTS } onChange={ ( titleFontWeight ) => setAttributes( { titleFontWeight } ) } />
					<SelectControl label={ __( 'Title Transform', 'zenctuary' ) } value={ attributes.titleTextTransform } options={ [ { label: __( 'Uppercase', 'zenctuary' ), value: 'uppercase' }, { label: __( 'None', 'zenctuary' ), value: 'none' } ] } onChange={ ( titleTextTransform ) => setAttributes( { titleTextTransform } ) } />
					<ToggleControl label={ __( 'Show Session Icon', 'zenctuary' ) } checked={ attributes.showSessionIcon } onChange={ ( showSessionIcon ) => setAttributes( { showSessionIcon } ) } />
					<ColorControl label={ __( 'Session Text Color', 'zenctuary' ) } value={ attributes.sessionTextColor } fallback="#f6f2ea" onChange={ ( sessionTextColor ) => setAttributes( { sessionTextColor } ) } />
					<ColorControl label={ __( 'Session Icon Color', 'zenctuary' ) } value={ attributes.sessionIconColor } fallback="#3f3d3d" onChange={ ( sessionIconColor ) => setAttributes( { sessionIconColor } ) } />
					<ColorControl label={ __( 'Session Icon Badge Background', 'zenctuary' ) } value={ attributes.sessionBadgeBackground } fallback="#d8b354" onChange={ ( sessionBadgeBackground ) => setAttributes( { sessionBadgeBackground } ) } />
					<ColorControl label={ __( 'Excerpt Color', 'zenctuary' ) } value={ attributes.excerptColor } fallback="#f6f2ea" onChange={ ( excerptColor ) => setAttributes( { excerptColor } ) } />
					<RangeControl label={ __( 'Excerpt Font Size', 'zenctuary' ) } value={ attributes.excerptFontSize } onChange={ ( excerptFontSize ) => setAttributes( { excerptFontSize } ) } min={ 12 } max={ 34 } />
				</PanelBody>

				<PanelBody title={ __( 'Button', 'zenctuary' ) }>
					<TextControl label={ __( 'CTA Label', 'zenctuary' ) } value={ attributes.ctaLabel } onChange={ ( ctaLabel ) => setAttributes( { ctaLabel } ) } />
					<ColorControl label={ __( 'Text Color', 'zenctuary' ) } value={ attributes.ctaTextColor } fallback="#d8b354" onChange={ ( ctaTextColor ) => setAttributes( { ctaTextColor } ) } />
					<ColorControl label={ __( 'Background', 'zenctuary' ) } value={ attributes.ctaBackgroundColor } fallback="#3f3d3d" onChange={ ( ctaBackgroundColor ) => setAttributes( { ctaBackgroundColor } ) } />
					<ColorControl label={ __( 'Border Color', 'zenctuary' ) } value={ attributes.ctaBorderColor } fallback="#d8b354" onChange={ ( ctaBorderColor ) => setAttributes( { ctaBorderColor } ) } />
					<RangeControl label={ __( 'Border Width', 'zenctuary' ) } value={ attributes.ctaBorderWidth } onChange={ ( ctaBorderWidth ) => setAttributes( { ctaBorderWidth } ) } min={ 0 } max={ 6 } />
					<RangeControl label={ __( 'Border Radius', 'zenctuary' ) } value={ attributes.ctaBorderRadius } onChange={ ( ctaBorderRadius ) => setAttributes( { ctaBorderRadius } ) } min={ 0 } max={ 999 } />
					<ToggleControl label={ __( 'Show Icon', 'zenctuary' ) } checked={ attributes.ctaShowIcon } onChange={ ( ctaShowIcon ) => setAttributes( { ctaShowIcon } ) } />
					<SelectControl label={ __( 'Icon Position', 'zenctuary' ) } value={ attributes.ctaIconPosition } options={ [ { label: __( 'Right', 'zenctuary' ), value: 'right' }, { label: __( 'Left', 'zenctuary' ), value: 'left' } ] } onChange={ ( ctaIconPosition ) => setAttributes( { ctaIconPosition } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Expandable Area', 'zenctuary' ) }>
					<TextControl label={ __( 'Expand Label', 'zenctuary' ) } value={ attributes.expandLabel } onChange={ ( expandLabel ) => setAttributes( { expandLabel } ) } />
					<ColorControl label={ __( 'Divider Color', 'zenctuary' ) } value={ attributes.dividerColor } fallback="rgba(246, 242, 234, 0.7)" onChange={ ( dividerColor ) => setAttributes( { dividerColor } ) } />
					<ColorControl label={ __( 'Label Color', 'zenctuary' ) } value={ attributes.expandLabelColor } fallback="#f6f2ea" onChange={ ( expandLabelColor ) => setAttributes( { expandLabelColor } ) } />
					<ColorControl label={ __( 'Icon Color', 'zenctuary' ) } value={ attributes.expandIconColor } fallback="#f6f2ea" onChange={ ( expandIconColor ) => setAttributes( { expandIconColor } ) } />
					<ColorControl label={ __( 'Expanded Content Color', 'zenctuary' ) } value={ attributes.expandedContentColor } fallback="#f6f2ea" onChange={ ( expandedContentColor ) => setAttributes( { expandedContentColor } ) } />
					<RangeControl label={ __( 'Expanded Content Max Height', 'zenctuary' ) } value={ attributes.expandedContentMaxHeight } onChange={ ( expandedContentMaxHeight ) => setAttributes( { expandedContentMaxHeight } ) } min={ 80 } max={ 520 } />
					<ToggleControl label={ __( 'Allow Multiple Expanded Cards', 'zenctuary' ) } checked={ attributes.allowMultipleExpanded } onChange={ ( allowMultipleExpanded ) => setAttributes( { allowMultipleExpanded } ) } />
					<SelectControl label={ __( 'Editor Preview State', 'zenctuary' ) } value={ attributes.previewState } options={ [ { label: __( 'Collapsed', 'zenctuary' ), value: 'collapsed' }, { label: __( 'Expanded', 'zenctuary' ), value: 'expanded' } ] } onChange={ ( previewState ) => setAttributes( { previewState } ) } />
				</PanelBody>
			</InspectorControls>

			<ServerSideRender
				block="zenctuary/product-feature-cards"
				attributes={ attributes }
				className="pfc-editor__preview"
			/>
		</div>
	);
}
