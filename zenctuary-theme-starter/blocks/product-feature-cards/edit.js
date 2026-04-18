import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	useBlockProps,
} from '@wordpress/block-editor';
import ServerSideRender from '@wordpress/server-side-render';
import apiFetch from '@wordpress/api-fetch';
import {
	BaseControl,
	ColorPalette,
	PanelBody,
	RangeControl,
	SelectControl,
	TextControl,
	ToggleControl,
	CheckboxControl,
} from '@wordpress/components';
import { useEffect, useMemo, useState } from '@wordpress/element';

const COLORS = [
	{ name: 'Gold', color: '#d8b354' },
	{ name: 'Charcoal', color: '#3f3d3d' },
	{ name: 'Cream', color: '#f6f2ea' },
	{ name: 'White', color: '#ffffff' },
	{ name: 'Ink', color: '#111111' },
];

const ORDER_BY = [
	{ label: __( 'Date', 'zenctuary' ), value: 'date' },
	{ label: __( 'Title', 'zenctuary' ), value: 'title' },
	{ label: __( 'Menu Order', 'zenctuary' ), value: 'menu_order' },
	{ label: __( 'Random', 'zenctuary' ), value: 'rand' },
];

const WEIGHTS = [ '400', '500', '600', '700', '800' ].map( ( value ) => ( {
	label: value,
	value,
} ) );

const ALIGN_OPTIONS = [
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
	const blockProps = useBlockProps( { className: 'pfc-editor' } );
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
				const nextTaxonomies = Object.values( response || {} )
					.filter( ( taxonomy ) => taxonomy.rest_base )
					.map( ( taxonomy ) => ( {
						label: taxonomy.name,
						value: taxonomy.slug,
						restBase: taxonomy.rest_base,
					} ) );

				setTaxonomies( nextTaxonomies );
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
						{
							label: __( 'Product categories', 'zenctuary' ),
							value: 'product_cat',
							restBase: 'product_cat',
						},
						{
							label: __( 'Product tags', 'zenctuary' ),
							value: 'product_tag',
							restBase: 'product_tag',
						},
				  ],
		[ taxonomies ]
	);

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
				<PanelBody title={ __( 'Products', 'zenctuary' ) } initialOpen>
					<SelectControl
						label={ __( 'Selection Mode', 'zenctuary' ) }
						value={ attributes.queryMode }
						options={ [
							{ label: __( 'Taxonomy Query', 'zenctuary' ), value: 'taxonomy' },
							{ label: __( 'Manual Products', 'zenctuary' ), value: 'manual' },
						] }
						onChange={ ( queryMode ) => setAttributes( { queryMode } ) }
					/>

					{ 'taxonomy' === attributes.queryMode && (
						<>
							<SelectControl
								label={ __( 'Product Taxonomy', 'zenctuary' ) }
								value={ attributes.productTaxonomy }
								options={ taxonomyOptions }
								onChange={ ( productTaxonomy ) =>
									setAttributes( { productTaxonomy, termIds: [] } )
								}
							/>
							<MultiCheckboxControl
								label={ __( 'Terms', 'zenctuary' ) }
								options={ terms }
								selected={ attributes.termIds || [] }
								onChange={ ( termIds ) => setAttributes( { termIds } ) }
								emptyLabel={ __( 'No terms found for the selected taxonomy.', 'zenctuary' ) }
							/>
							<RangeControl
								label={ __( 'Number Of Products', 'zenctuary' ) }
								value={ attributes.productsToShow }
								onChange={ ( productsToShow ) => setAttributes( { productsToShow } ) }
								min={ 1 }
								max={ 12 }
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
									{ label: __( 'Ascending', 'zenctuary' ), value: 'ASC' },
									{ label: __( 'Descending', 'zenctuary' ), value: 'DESC' },
								] }
								onChange={ ( order ) => setAttributes( { order } ) }
							/>
						</>
					) }

					{ 'manual' === attributes.queryMode && (
						<MultiCheckboxControl
							label={ __( 'Products', 'zenctuary' ) }
							options={ products }
							selected={ attributes.manualProductIds || [] }
							onChange={ ( manualProductIds ) => setAttributes( { manualProductIds } ) }
							emptyLabel={ __( 'No products available in REST yet.', 'zenctuary' ) }
						/>
					) }
				</PanelBody>

				<PanelBody title={ __( 'Section', 'zenctuary' ) }>
					<TextControl
						label={ __( 'Heading', 'zenctuary' ) }
						value={ attributes.sectionHeading }
						onChange={ ( sectionHeading ) => setAttributes( { sectionHeading } ) }
					/>
					<TextControl
						label={ __( 'Intro Text', 'zenctuary' ) }
						value={ attributes.sectionIntro }
						onChange={ ( sectionIntro ) => setAttributes( { sectionIntro } ) }
					/>
					<SelectControl
						label={ __( 'Header Alignment', 'zenctuary' ) }
						value={ attributes.sectionHeaderAlignment }
						options={ ALIGN_OPTIONS }
						onChange={ ( sectionHeaderAlignment ) =>
							setAttributes( { sectionHeaderAlignment } )
						}
					/>
					<SelectControl
						label={ __( 'Heading Alignment', 'zenctuary' ) }
						value={ attributes.sectionHeadingAlignment }
						options={ ALIGN_OPTIONS }
						onChange={ ( sectionHeadingAlignment ) =>
							setAttributes( { sectionHeadingAlignment } )
						}
					/>
					<SelectControl
						label={ __( 'Description Alignment', 'zenctuary' ) }
						value={ attributes.sectionIntroAlignment }
						options={ ALIGN_OPTIONS }
						onChange={ ( sectionIntroAlignment ) =>
							setAttributes( { sectionIntroAlignment } )
						}
					/>
					<ColorControl
						label={ __( 'Background', 'zenctuary' ) }
						value={ attributes.sectionBackgroundColor }
						fallback="#3f3d3d"
						onChange={ ( sectionBackgroundColor ) => setAttributes( { sectionBackgroundColor } ) }
					/>
					<ColorControl
						label={ __( 'Heading Color', 'zenctuary' ) }
						value={ attributes.sectionHeadingColor }
						fallback="#d8b354"
						onChange={ ( sectionHeadingColor ) => setAttributes( { sectionHeadingColor } ) }
					/>
					<ColorControl
						label={ __( 'Intro Color', 'zenctuary' ) }
						value={ attributes.sectionIntroColor }
						fallback="#f6f2ea"
						onChange={ ( sectionIntroColor ) => setAttributes( { sectionIntroColor } ) }
					/>
					<ColorControl
						label={ __( 'Text Color', 'zenctuary' ) }
						value={ attributes.sectionTextColor }
						fallback="#f6f2ea"
						onChange={ ( sectionTextColor ) => setAttributes( { sectionTextColor } ) }
					/>
					<RangeControl
						label={ __( 'Section Max Width', 'zenctuary' ) }
						value={ attributes.sectionMaxWidth }
						onChange={ ( sectionMaxWidth ) => setAttributes( { sectionMaxWidth } ) }
						min={ 900 }
						max={ 1800 }
					/>
					<RangeControl
						label={ __( 'Row Max Width', 'zenctuary' ) }
						value={ attributes.sectionRowMaxWidth }
						onChange={ ( sectionRowMaxWidth ) => setAttributes( { sectionRowMaxWidth } ) }
						min={ 700 }
						max={ 1600 }
					/>
					<RangeControl
						label={ __( 'Heading Font Size', 'zenctuary' ) }
						value={ attributes.sectionHeadingFontSize }
						onChange={ ( sectionHeadingFontSize ) => setAttributes( { sectionHeadingFontSize } ) }
						min={ 20 }
						max={ 72 }
					/>
					<SelectControl
						label={ __( 'Heading Weight', 'zenctuary' ) }
						value={ attributes.sectionHeadingFontWeight }
						options={ WEIGHTS }
						onChange={ ( sectionHeadingFontWeight ) => setAttributes( { sectionHeadingFontWeight } ) }
					/>
					<RangeControl
						label={ __( 'Intro Font Size', 'zenctuary' ) }
						value={ attributes.sectionIntroFontSize }
						onChange={ ( sectionIntroFontSize ) => setAttributes( { sectionIntroFontSize } ) }
						min={ 12 }
						max={ 28 }
					/>
					<RangeControl
						label={ __( 'Intro Max Width', 'zenctuary' ) }
						value={ attributes.sectionIntroMaxWidth }
						onChange={ ( sectionIntroMaxWidth ) => setAttributes( { sectionIntroMaxWidth } ) }
						min={ 300 }
						max={ 1200 }
					/>
					<RangeControl
						label={ __( 'Space Below Heading', 'zenctuary' ) }
						value={ attributes.sectionHeadingBottomSpacing }
						onChange={ ( sectionHeadingBottomSpacing ) =>
							setAttributes( { sectionHeadingBottomSpacing } )
						}
						min={ 0 }
						max={ 80 }
					/>
					<RangeControl
						label={ __( 'Space Below Intro', 'zenctuary' ) }
						value={ attributes.sectionIntroBottomSpacing }
						onChange={ ( sectionIntroBottomSpacing ) =>
							setAttributes( { sectionIntroBottomSpacing } )
						}
						min={ 0 }
						max={ 100 }
					/>
					<RangeControl
						label={ __( 'Padding Top', 'zenctuary' ) }
						value={ attributes.sectionPaddingTop }
						onChange={ ( sectionPaddingTop ) => setAttributes( { sectionPaddingTop } ) }
						min={ 0 }
						max={ 180 }
					/>
					<RangeControl
						label={ __( 'Padding Bottom', 'zenctuary' ) }
						value={ attributes.sectionPaddingBottom }
						onChange={ ( sectionPaddingBottom ) => setAttributes( { sectionPaddingBottom } ) }
						min={ 0 }
						max={ 180 }
					/>
					<RangeControl
						label={ __( 'Padding Left', 'zenctuary' ) }
						value={ attributes.sectionPaddingLeft }
						onChange={ ( sectionPaddingLeft ) => setAttributes( { sectionPaddingLeft } ) }
						min={ 0 }
						max={ 120 }
					/>
					<RangeControl
						label={ __( 'Padding Right', 'zenctuary' ) }
						value={ attributes.sectionPaddingRight }
						onChange={ ( sectionPaddingRight ) => setAttributes( { sectionPaddingRight } ) }
						min={ 0 }
						max={ 120 }
					/>
					<RangeControl
						label={ __( 'Mobile Padding Left', 'zenctuary' ) }
						value={ attributes.sectionPaddingLeftMobile }
						onChange={ ( sectionPaddingLeftMobile ) => setAttributes( { sectionPaddingLeftMobile } ) }
						min={ 0 }
						max={ 60 }
					/>
					<RangeControl
						label={ __( 'Mobile Padding Right', 'zenctuary' ) }
						value={ attributes.sectionPaddingRightMobile }
						onChange={ ( sectionPaddingRightMobile ) => setAttributes( { sectionPaddingRightMobile } ) }
						min={ 0 }
						max={ 60 }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Row Layout', 'zenctuary' ) }>
					<RangeControl
						label={ __( 'Desktop Gap', 'zenctuary' ) }
						value={ attributes.cardGapDesktop }
						onChange={ ( cardGapDesktop ) => setAttributes( { cardGapDesktop } ) }
						min={ 0 }
						max={ 80 }
					/>
					<RangeControl
						label={ __( 'Tablet Gap', 'zenctuary' ) }
						value={ attributes.cardGapTablet }
						onChange={ ( cardGapTablet ) => setAttributes( { cardGapTablet } ) }
						min={ 0 }
						max={ 80 }
					/>
					<RangeControl
						label={ __( 'Mobile Gap', 'zenctuary' ) }
						value={ attributes.cardGapMobile }
						onChange={ ( cardGapMobile ) => setAttributes( { cardGapMobile } ) }
						min={ 0 }
						max={ 50 }
					/>
					<p>
						{ __( 'Desktop keeps cards centered with up to 4 per row. Smaller screens stack them vertically.', 'zenctuary' ) }
					</p>
				</PanelBody>

				<PanelBody title={ __( 'Card Shell', 'zenctuary' ) }>
					<RangeControl
						label={ __( 'Card Width', 'zenctuary' ) }
						value={ attributes.cardWidth }
						onChange={ ( cardWidth ) => setAttributes( { cardWidth } ) }
						min={ 260 }
						max={ 520 }
					/>
					<RangeControl
						label={ __( 'Card Height', 'zenctuary' ) }
						value={ attributes.cardHeight }
						onChange={ ( cardHeight ) => setAttributes( { cardHeight } ) }
						min={ 420 }
						max={ 760 }
					/>
					<RangeControl
						label={ __( 'Mobile Card Width', 'zenctuary' ) }
						value={ attributes.cardWidthMobile }
						onChange={ ( cardWidthMobile ) => setAttributes( { cardWidthMobile } ) }
						min={ 240 }
						max={ 420 }
					/>
					<RangeControl
						label={ __( 'Mobile Card Height', 'zenctuary' ) }
						value={ attributes.cardHeightMobile }
						onChange={ ( cardHeightMobile ) => setAttributes( { cardHeightMobile } ) }
						min={ 360 }
						max={ 700 }
					/>
					<RangeControl
						label={ __( 'Border Radius', 'zenctuary' ) }
						value={ attributes.cardBorderRadius }
						onChange={ ( cardBorderRadius ) => setAttributes( { cardBorderRadius } ) }
						min={ 0 }
						max={ 60 }
					/>
					<RangeControl
						label={ __( 'Border Width', 'zenctuary' ) }
						value={ attributes.cardBorderWidth }
						onChange={ ( cardBorderWidth ) => setAttributes( { cardBorderWidth } ) }
						min={ 0 }
						max={ 8 }
					/>
					<ColorControl
						label={ __( 'Border Color', 'zenctuary' ) }
						value={ attributes.cardBorderColor }
						fallback="rgba(246, 242, 234, 0.55)"
						onChange={ ( cardBorderColor ) => setAttributes( { cardBorderColor } ) }
					/>
					<ColorControl
						label={ __( 'Card Background', 'zenctuary' ) }
						value={ attributes.cardBackgroundColor }
						fallback="#3f3d3d"
						onChange={ ( cardBackgroundColor ) => setAttributes( { cardBackgroundColor } ) }
					/>
					<TextControl
						label={ __( 'Card Shadow', 'zenctuary' ) }
						value={ attributes.cardShadow }
						onChange={ ( cardShadow ) => setAttributes( { cardShadow } ) }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Top Header Bar', 'zenctuary' ) }>
					<RangeControl
						label={ __( 'Bar Height', 'zenctuary' ) }
						value={ attributes.topBarHeight }
						onChange={ ( topBarHeight ) => setAttributes( { topBarHeight } ) }
						min={ 52 }
						max={ 140 }
					/>
					<ColorControl
						label={ __( 'Bar Background', 'zenctuary' ) }
						value={ attributes.topBarBackgroundColor }
						fallback="#3f3d3d"
						onChange={ ( topBarBackgroundColor ) => setAttributes( { topBarBackgroundColor } ) }
					/>
					<TextControl
						label={ __( 'Label Text', 'zenctuary' ) }
						value={ attributes.zencoinLabel }
						onChange={ ( zencoinLabel ) => setAttributes( { zencoinLabel } ) }
					/>
					<ColorControl
						label={ __( 'Label Color', 'zenctuary' ) }
						value={ attributes.zencoinLabelColor }
						fallback="#d8b354"
						onChange={ ( zencoinLabelColor ) => setAttributes( { zencoinLabelColor } ) }
					/>
					<RangeControl
						label={ __( 'Label Font Size', 'zenctuary' ) }
						value={ attributes.zencoinLabelFontSize }
						onChange={ ( zencoinLabelFontSize ) => setAttributes( { zencoinLabelFontSize } ) }
						min={ 12 }
						max={ 28 }
					/>
					<RangeControl
						label={ __( 'Label / Badge Gap', 'zenctuary' ) }
						value={ attributes.zencoinGap }
						onChange={ ( zencoinGap ) => setAttributes( { zencoinGap } ) }
						min={ 0 }
						max={ 30 }
					/>
					<RangeControl
						label={ __( 'Badge Size', 'zenctuary' ) }
						value={ attributes.zencoinBadgeSize }
						onChange={ ( zencoinBadgeSize ) => setAttributes( { zencoinBadgeSize } ) }
						min={ 28 }
						max={ 70 }
					/>
					<ColorControl
						label={ __( 'Badge Background', 'zenctuary' ) }
						value={ attributes.zencoinBadgeBackgroundColor }
						fallback="#d8b354"
						onChange={ ( zencoinBadgeBackgroundColor ) =>
							setAttributes( { zencoinBadgeBackgroundColor } )
						}
					/>
					<ColorControl
						label={ __( 'Badge Border Color', 'zenctuary' ) }
						value={ attributes.zencoinBadgeBorderColor }
						fallback="#d8b354"
						onChange={ ( zencoinBadgeBorderColor ) => setAttributes( { zencoinBadgeBorderColor } ) }
					/>
					<ColorControl
						label={ __( 'Badge Inner Ring Color', 'zenctuary' ) }
						value={ attributes.zencoinBadgeRingColor }
						fallback="#3f3d3d"
						onChange={ ( zencoinBadgeRingColor ) =>
							setAttributes( { zencoinBadgeRingColor } )
						}
					/>
					<ColorControl
						label={ __( 'Badge Text Color', 'zenctuary' ) }
						value={ attributes.zencoinBadgeTextColor }
						fallback="#d8b354"
						onChange={ ( zencoinBadgeTextColor ) => setAttributes( { zencoinBadgeTextColor } ) }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Image Body', 'zenctuary' ) }>
					<ColorControl
						label={ __( 'Overlay Color', 'zenctuary' ) }
						value={ attributes.overlayColor }
						fallback="#111111"
						onChange={ ( overlayColor ) => setAttributes( { overlayColor } ) }
					/>
					<RangeControl
						label={ __( 'Overlay Opacity', 'zenctuary' ) }
						value={ attributes.overlayOpacity }
						onChange={ ( overlayOpacity ) => setAttributes( { overlayOpacity } ) }
						min={ 0 }
						max={ 1 }
						step={ 0.05 }
					/>
					<RangeControl
						label={ __( 'Body Padding Top', 'zenctuary' ) }
						value={ attributes.bodyPaddingTop }
						onChange={ ( bodyPaddingTop ) => setAttributes( { bodyPaddingTop } ) }
						min={ 0 }
						max={ 80 }
					/>
					<RangeControl
						label={ __( 'Body Padding Right', 'zenctuary' ) }
						value={ attributes.bodyPaddingRight }
						onChange={ ( bodyPaddingRight ) => setAttributes( { bodyPaddingRight } ) }
						min={ 0 }
						max={ 60 }
					/>
					<RangeControl
						label={ __( 'Body Padding Bottom', 'zenctuary' ) }
						value={ attributes.bodyPaddingBottom }
						onChange={ ( bodyPaddingBottom ) => setAttributes( { bodyPaddingBottom } ) }
						min={ 0 }
						max={ 60 }
					/>
					<RangeControl
						label={ __( 'Body Padding Left', 'zenctuary' ) }
						value={ attributes.bodyPaddingLeft }
						onChange={ ( bodyPaddingLeft ) => setAttributes( { bodyPaddingLeft } ) }
						min={ 0 }
						max={ 60 }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Title / Session / Excerpt', 'zenctuary' ) }>
					<ColorControl
						label={ __( 'Title Color', 'zenctuary' ) }
						value={ attributes.titleColor }
						fallback="#ffffff"
						onChange={ ( titleColor ) => setAttributes( { titleColor } ) }
					/>
					<RangeControl
						label={ __( 'Title Font Size', 'zenctuary' ) }
						value={ attributes.titleFontSize }
						onChange={ ( titleFontSize ) => setAttributes( { titleFontSize } ) }
						min={ 20 }
						max={ 72 }
					/>
					<SelectControl
						label={ __( 'Title Weight', 'zenctuary' ) }
						value={ attributes.titleFontWeight }
						options={ WEIGHTS }
						onChange={ ( titleFontWeight ) => setAttributes( { titleFontWeight } ) }
					/>
					<SelectControl
						label={ __( 'Title Transform', 'zenctuary' ) }
						value={ attributes.titleTextTransform }
						options={ [
							{ label: __( 'Uppercase', 'zenctuary' ), value: 'uppercase' },
							{ label: __( 'None', 'zenctuary' ), value: 'none' },
						] }
						onChange={ ( titleTextTransform ) => setAttributes( { titleTextTransform } ) }
					/>
					<RangeControl
						label={ __( 'Title Max Width', 'zenctuary' ) }
						value={ attributes.titleMaxWidth }
						onChange={ ( titleMaxWidth ) => setAttributes( { titleMaxWidth } ) }
						min={ 120 }
						max={ 340 }
					/>
					<ToggleControl
						label={ __( 'Show Session Icon', 'zenctuary' ) }
						checked={ attributes.showSessionIcon }
						onChange={ ( showSessionIcon ) => setAttributes( { showSessionIcon } ) }
					/>
					<ColorControl
						label={ __( 'Session Text Color', 'zenctuary' ) }
						value={ attributes.sessionTextColor }
						fallback="#ffffff"
						onChange={ ( sessionTextColor ) => setAttributes( { sessionTextColor } ) }
					/>
					<ColorControl
						label={ __( 'Session Icon Color', 'zenctuary' ) }
						value={ attributes.sessionIconColor }
						fallback="#3f3d3d"
						onChange={ ( sessionIconColor ) => setAttributes( { sessionIconColor } ) }
					/>
					<ColorControl
						label={ __( 'Session Icon Background', 'zenctuary' ) }
						value={ attributes.sessionIconBackgroundColor }
						fallback="#d8b354"
						onChange={ ( sessionIconBackgroundColor ) =>
							setAttributes( { sessionIconBackgroundColor } )
						}
					/>
					<ColorControl
						label={ __( 'Ideal For Color', 'zenctuary' ) }
						value={ attributes.idealForColor }
						fallback="#f6f2ea"
						onChange={ ( idealForColor ) => setAttributes( { idealForColor } ) }
					/>
					<RangeControl
						label={ __( 'Ideal For Font Size', 'zenctuary' ) }
						value={ attributes.idealForFontSize }
						onChange={ ( idealForFontSize ) => setAttributes( { idealForFontSize } ) }
						min={ 12 }
						max={ 26 }
					/>
					<SelectControl
						label={ __( 'Ideal For Weight', 'zenctuary' ) }
						value={ attributes.idealForFontWeight }
						options={ WEIGHTS }
						onChange={ ( idealForFontWeight ) => setAttributes( { idealForFontWeight } ) }
					/>
					<RangeControl
						label={ __( 'Ideal For Max Width', 'zenctuary' ) }
						value={ attributes.idealForMaxWidth }
						onChange={ ( idealForMaxWidth ) => setAttributes( { idealForMaxWidth } ) }
						min={ 160 }
						max={ 340 }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Button', 'zenctuary' ) }>
					<TextControl
						label={ __( 'Button Label', 'zenctuary' ) }
						value={ attributes.buttonLabel }
						onChange={ ( buttonLabel ) => setAttributes( { buttonLabel } ) }
					/>
					<ColorControl
						label={ __( 'Text Color', 'zenctuary' ) }
						value={ attributes.buttonTextColor }
						fallback="#d8b354"
						onChange={ ( buttonTextColor ) => setAttributes( { buttonTextColor } ) }
					/>
					<ColorControl
						label={ __( 'Background', 'zenctuary' ) }
						value={ attributes.buttonBackgroundColor }
						fallback="#3f3d3d"
						onChange={ ( buttonBackgroundColor ) => setAttributes( { buttonBackgroundColor } ) }
					/>
					<ColorControl
						label={ __( 'Border Color', 'zenctuary' ) }
						value={ attributes.buttonBorderColor }
						fallback="#d8b354"
						onChange={ ( buttonBorderColor ) => setAttributes( { buttonBorderColor } ) }
					/>
					<ToggleControl
						label={ __( 'Show Icon', 'zenctuary' ) }
						checked={ attributes.buttonShowIcon }
						onChange={ ( buttonShowIcon ) => setAttributes( { buttonShowIcon } ) }
					/>
					<SelectControl
						label={ __( 'Icon Position', 'zenctuary' ) }
						value={ attributes.buttonIconPosition }
						options={ [
							{ label: __( 'Right', 'zenctuary' ), value: 'right' },
							{ label: __( 'Left', 'zenctuary' ), value: 'left' },
						] }
						onChange={ ( buttonIconPosition ) => setAttributes( { buttonIconPosition } ) }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Expandable Area', 'zenctuary' ) }>
					<TextControl
						label={ __( 'Row Label', 'zenctuary' ) }
						value={ attributes.expandLabel }
						onChange={ ( expandLabel ) => setAttributes( { expandLabel } ) }
					/>
					<ColorControl
						label={ __( 'Divider Color', 'zenctuary' ) }
						value={ attributes.dividerColor }
						fallback="rgba(246, 242, 234, 0.72)"
						onChange={ ( dividerColor ) => setAttributes( { dividerColor } ) }
					/>
					<RangeControl
						label={ __( 'Divider Space Top', 'zenctuary' ) }
						value={ attributes.dividerSpacingTop }
						onChange={ ( dividerSpacingTop ) => setAttributes( { dividerSpacingTop } ) }
						min={ 0 }
						max={ 40 }
					/>
					<RangeControl
						label={ __( 'Divider Space Right', 'zenctuary' ) }
						value={ attributes.dividerSpacingRight }
						onChange={ ( dividerSpacingRight ) => setAttributes( { dividerSpacingRight } ) }
						min={ 0 }
						max={ 40 }
					/>
					<RangeControl
						label={ __( 'Divider Space Bottom', 'zenctuary' ) }
						value={ attributes.dividerSpacingBottom }
						onChange={ ( dividerSpacingBottom ) =>
							setAttributes( { dividerSpacingBottom } )
						}
						min={ 0 }
						max={ 40 }
					/>
					<RangeControl
						label={ __( 'Divider Space Left', 'zenctuary' ) }
						value={ attributes.dividerSpacingLeft }
						onChange={ ( dividerSpacingLeft ) => setAttributes( { dividerSpacingLeft } ) }
						min={ 0 }
						max={ 40 }
					/>
					<ColorControl
						label={ __( 'Label Color', 'zenctuary' ) }
						value={ attributes.expandLabelColor }
						fallback="#f6f2ea"
						onChange={ ( expandLabelColor ) => setAttributes( { expandLabelColor } ) }
					/>
					<ColorControl
						label={ __( 'Icon Color', 'zenctuary' ) }
						value={ attributes.expandIconColor }
						fallback="#f6f2ea"
						onChange={ ( expandIconColor ) => setAttributes( { expandIconColor } ) }
					/>
					<ColorControl
						label={ __( 'Expanded Text Color', 'zenctuary' ) }
						value={ attributes.expandedContentColor }
						fallback="#f6f2ea"
						onChange={ ( expandedContentColor ) => setAttributes( { expandedContentColor } ) }
					/>
					<RangeControl
						label={ __( 'Expanded Max Height', 'zenctuary' ) }
						value={ attributes.expandedContentMaxHeight }
						onChange={ ( expandedContentMaxHeight ) =>
							setAttributes( { expandedContentMaxHeight } )
						}
						min={ 80 }
						max={ 320 }
					/>
					<RangeControl
						label={ __( 'Transition Duration', 'zenctuary' ) }
						value={ attributes.transitionDuration }
						onChange={ ( transitionDuration ) => setAttributes( { transitionDuration } ) }
						min={ 100 }
						max={ 800 }
					/>
					<ToggleControl
						label={ __( 'Allow Multiple Open', 'zenctuary' ) }
						checked={ attributes.allowMultipleOpen }
						onChange={ ( allowMultipleOpen ) => setAttributes( { allowMultipleOpen } ) }
					/>
					<SelectControl
						label={ __( 'Editor Preview', 'zenctuary' ) }
						value={ attributes.previewState }
						options={ [
							{ label: __( 'Collapsed', 'zenctuary' ), value: 'collapsed' },
							{ label: __( 'Expanded', 'zenctuary' ), value: 'expanded' },
						] }
						onChange={ ( previewState ) => setAttributes( { previewState } ) }
					/>
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
