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
	ToggleControl,
	TextareaControl,
} from '@wordpress/components';
import { useEffect, useMemo, useState } from '@wordpress/element';

const COLORS = [
	{ name: 'Gold', color: '#d8b354' },
	{ name: 'Charcoal', color: '#3f3d3d' },
	{ name: 'Cream', color: '#f1eee7' },
	{ name: 'Ink', color: '#1f1c18' },
	{ name: 'White', color: '#ffffff' },
];

const ORDER_BY = [
	{ label: __( 'Date', 'zenctuary' ), value: 'date' },
	{ label: __( 'Modified', 'zenctuary' ), value: 'modified' },
	{ label: __( 'Title', 'zenctuary' ), value: 'title' },
	{ label: __( 'Random', 'zenctuary' ), value: 'rand' },
	{ label: __( 'Menu Order', 'zenctuary' ), value: 'menu_order' },
];

const ORDER = [
	{ label: __( 'Descending', 'zenctuary' ), value: 'DESC' },
	{ label: __( 'Ascending', 'zenctuary' ), value: 'ASC' },
];

const ALIGNMENT = [
	{ label: __( 'Center', 'zenctuary' ), value: 'center' },
	{ label: __( 'Left', 'zenctuary' ), value: 'start' },
	{ label: __( 'Right', 'zenctuary' ), value: 'end' },
];

const VERTICAL_ALIGNMENT = [
	{ label: __( 'Top', 'zenctuary' ), value: 'start' },
	{ label: __( 'Center', 'zenctuary' ), value: 'center' },
	{ label: __( 'Bottom', 'zenctuary' ), value: 'end' },
];

const HORIZONTAL_POSITION = [
	{ label: __( 'Left', 'zenctuary' ), value: 'start' },
	{ label: __( 'Center', 'zenctuary' ), value: 'center' },
	{ label: __( 'Right', 'zenctuary' ), value: 'end' },
];

const META_SOURCE = [
	{ label: __( 'Date', 'zenctuary' ), value: 'date' },
	{ label: __( 'Category / Term', 'zenctuary' ), value: 'term' },
	{ label: __( 'Custom Meta Key', 'zenctuary' ), value: 'custom' },
	{ label: __( 'None', 'zenctuary' ), value: 'none' },
];

const MOBILE_INTERACTION = [
	{ label: __( 'Tap To Expand', 'zenctuary' ), value: 'tap-expand' },
	{ label: __( 'Always Expanded', 'zenctuary' ), value: 'always-expanded' },
	{ label: __( 'Disabled', 'zenctuary' ), value: 'disabled' },
];

const PREVIEW_STATE = [
	{ label: __( 'Resting State', 'zenctuary' ), value: 'resting' },
	{ label: __( 'Hover State', 'zenctuary' ), value: 'hover' },
];

const WEIGHTS = [ '400', '500', '600', '700', '800' ].map( ( value ) => ( {
	label: value,
	value,
} ) );

function ColorControl( { label, value, fallback, onChange } ) {
	return (
		<BaseControl label={ label }>
			<ColorPalette colors={ COLORS } value={ value } onChange={ ( next ) => onChange( next || fallback ) } />
			<TextControl value={ value } onChange={ ( next ) => onChange( next || fallback ) } />
		</BaseControl>
	);
}

function MultiTermControl( { terms, selected, onChange } ) {
	if ( ! terms.length ) {
		return <p>{ __( 'No terms found for the selected taxonomy.', 'zenctuary' ) }</p>;
	}

	return (
		<BaseControl label={ __( 'Terms', 'zenctuary' ) }>
			<div style={ { maxHeight: '220px', overflowY: 'auto', border: '1px solid #ddd', padding: '8px' } }>
				{ terms.map( ( term ) => (
					<CheckboxControl
						key={ term.id }
						label={ term.name }
						checked={ selected.includes( term.id ) }
						onChange={ ( checked ) => {
							onChange(
								checked
									? [ ...selected, term.id ]
									: selected.filter( ( id ) => id !== term.id )
							);
						} }
					/>
				) ) }
			</div>
		</BaseControl>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const blockProps = useBlockProps( {
		className: 'latest-news-sticky-stack__editor-shell',
	} );

	const [ postTypes, setPostTypes ] = useState( [] );
	const [ taxonomies, setTaxonomies ] = useState( [] );
	const [ terms, setTerms ] = useState( [] );

	useEffect( () => {
		apiFetch( { path: '/wp/v2/types' } ).then( ( response ) => {
			const options = Object.values( response )
				.filter( ( type ) => type.viewable && type.slug !== 'attachment' && type.rest_base )
				.map( ( type ) => ( {
					label: type.name,
					value: type.slug,
					restBase: type.rest_base,
				} ) );
			setPostTypes( options );
		} );

		apiFetch( { path: '/wp/v2/taxonomies' } ).then( ( response ) => {
			const options = Object.values( response )
				.filter( ( taxonomy ) => taxonomy.rest_base )
				.map( ( taxonomy ) => ( {
					label: taxonomy.name,
					value: taxonomy.slug,
					restBase: taxonomy.rest_base,
					types: taxonomy.types || [],
				} ) );
			setTaxonomies( options );
		} );
	}, [] );

	const filteredTaxonomies = useMemo(
		() => taxonomies.filter( ( taxonomy ) => taxonomy.types.includes( attributes.postType ) ),
		[ taxonomies, attributes.postType ]
	);

	useEffect( () => {
		if ( ! filteredTaxonomies.find( ( taxonomy ) => taxonomy.value === attributes.taxonomy ) ) {
			setAttributes( { taxonomy: filteredTaxonomies[ 0 ]?.value || '' } );
		}
	}, [ filteredTaxonomies, attributes.taxonomy, setAttributes ] );

	useEffect( () => {
		const selectedTax = filteredTaxonomies.find( ( taxonomy ) => taxonomy.value === attributes.taxonomy );
		if ( ! selectedTax?.restBase ) {
			setTerms( [] );
			return;
		}

		apiFetch( {
			path: `/wp/v2/${ selectedTax.restBase }?per_page=100&_fields=id,name`,
		} ).then( ( response ) => {
			setTerms( Array.isArray( response ) ? response : [] );
		} ).catch( () => setTerms( [] ) );
	}, [ filteredTaxonomies, attributes.taxonomy ] );

	return (
		<div { ...blockProps }>
			<InspectorControls>
				<PanelBody title={ __( 'Query', 'zenctuary' ) } initialOpen>
					<SelectControl
						label={ __( 'Post Type', 'zenctuary' ) }
						value={ attributes.postType }
						options={ postTypes }
						onChange={ ( value ) => setAttributes( { postType: value, taxonomy: '', termIds: [] } ) }
					/>
					<SelectControl
						label={ __( 'Taxonomy', 'zenctuary' ) }
						value={ attributes.taxonomy }
						options={ filteredTaxonomies }
						onChange={ ( value ) => setAttributes( { taxonomy: value, termIds: [] } ) }
					/>
					<MultiTermControl terms={ terms } selected={ attributes.termIds || [] } onChange={ ( termIds ) => setAttributes( { termIds } ) } />
					<SelectControl
						label={ __( 'Mode', 'zenctuary' ) }
						value={ attributes.queryMode }
						options={ [
							{ label: __( 'Automatic Query', 'zenctuary' ), value: 'auto' },
							{ label: __( 'Manual Post IDs', 'zenctuary' ), value: 'manual' },
						] }
						onChange={ ( value ) => setAttributes( { queryMode: value } ) }
					/>
					{ attributes.queryMode === 'manual' && (
						<TextControl
							label={ __( 'Manual Post IDs', 'zenctuary' ) }
							value={ attributes.manualPostIds }
							onChange={ ( value ) => setAttributes( { manualPostIds: value } ) }
							help={ __( 'Comma-separated post IDs.', 'zenctuary' ) }
						/>
					) }
					<RangeControl label={ __( 'Posts To Show', 'zenctuary' ) } value={ attributes.postsToShow } onChange={ ( postsToShow ) => setAttributes( { postsToShow } ) } min={ 1 } max={ 20 } />
					<SelectControl label={ __( 'Order By', 'zenctuary' ) } value={ attributes.orderBy } options={ ORDER_BY } onChange={ ( orderBy ) => setAttributes( { orderBy } ) } />
					<SelectControl label={ __( 'Order', 'zenctuary' ) } value={ attributes.order } options={ ORDER } onChange={ ( order ) => setAttributes( { order } ) } />
					<RangeControl label={ __( 'Offset', 'zenctuary' ) } value={ attributes.offset } onChange={ ( offset ) => setAttributes( { offset } ) } min={ 0 } max={ 20 } />
					<TextControl label={ __( 'Include IDs', 'zenctuary' ) } value={ attributes.includeIds } onChange={ ( includeIds ) => setAttributes( { includeIds } ) } help={ __( 'Optional comma-separated IDs.', 'zenctuary' ) } />
					<TextControl label={ __( 'Exclude IDs', 'zenctuary' ) } value={ attributes.excludeIds } onChange={ ( excludeIds ) => setAttributes( { excludeIds } ) } />
					<ToggleControl label={ __( 'Only Posts With Featured Image', 'zenctuary' ) } checked={ attributes.onlyWithFeaturedImage } onChange={ ( onlyWithFeaturedImage ) => setAttributes( { onlyWithFeaturedImage } ) } />
					<ToggleControl label={ __( 'Exclude Current Post', 'zenctuary' ) } checked={ attributes.excludeCurrentPost } onChange={ ( excludeCurrentPost ) => setAttributes( { excludeCurrentPost } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Section', 'zenctuary' ) }>
					<ColorControl label={ __( 'Background Color', 'zenctuary' ) } value={ attributes.sectionBackgroundColor } fallback="#3f3d3d" onChange={ ( sectionBackgroundColor ) => setAttributes( { sectionBackgroundColor } ) } />
					<ColorControl label={ __( 'Text Color', 'zenctuary' ) } value={ attributes.sectionTextColor } fallback="#f1eee7" onChange={ ( sectionTextColor ) => setAttributes( { sectionTextColor } ) } />
					<RangeControl label={ __( 'Max Width', 'zenctuary' ) } value={ attributes.sectionMaxWidth } onChange={ ( sectionMaxWidth ) => setAttributes( { sectionMaxWidth } ) } min={ 960 } max={ 1920 } step={ 20 } />
					<RangeControl label={ __( 'Padding Top', 'zenctuary' ) } value={ attributes.sectionPaddingTop } onChange={ ( sectionPaddingTop ) => setAttributes( { sectionPaddingTop } ) } min={ 0 } max={ 200 } />
					<RangeControl label={ __( 'Padding Bottom', 'zenctuary' ) } value={ attributes.sectionPaddingBottom } onChange={ ( sectionPaddingBottom ) => setAttributes( { sectionPaddingBottom } ) } min={ 0 } max={ 200 } />
					<RangeControl label={ __( 'Horizontal Padding', 'zenctuary' ) } value={ attributes.sectionPaddingHorizontal } onChange={ ( sectionPaddingHorizontal ) => setAttributes( { sectionPaddingHorizontal } ) } min={ 0 } max={ 120 } />
					<RangeControl label={ __( 'Space Below Sticky Header', 'zenctuary' ) } value={ attributes.headerToCardsGap } onChange={ ( headerToCardsGap ) => setAttributes( { headerToCardsGap } ) } min={ 0 } max={ 160 } />
					<RangeControl label={ __( 'Sticky Z Index', 'zenctuary' ) } value={ attributes.stickyZIndex } onChange={ ( stickyZIndex ) => setAttributes( { stickyZIndex } ) } min={ 1 } max={ 80 } />
				</PanelBody>

				<PanelBody title={ __( 'Sticky Strip', 'zenctuary' ) }>
					<ToggleControl label={ __( 'Enable Sticky Header', 'zenctuary' ) } checked={ attributes.enableSticky } onChange={ ( enableSticky ) => setAttributes( { enableSticky } ) } />
					<RangeControl label={ __( 'Desktop Top Offset', 'zenctuary' ) } value={ attributes.stickyTopOffset } onChange={ ( stickyTopOffset ) => setAttributes( { stickyTopOffset } ) } min={ 0 } max={ 120 } />
					<RangeControl label={ __( 'Tablet Top Offset', 'zenctuary' ) } value={ attributes.stickyTopOffsetTablet } onChange={ ( stickyTopOffsetTablet ) => setAttributes( { stickyTopOffsetTablet } ) } min={ 0 } max={ 120 } />
					<RangeControl label={ __( 'Mobile Top Offset', 'zenctuary' ) } value={ attributes.stickyTopOffsetMobile } onChange={ ( stickyTopOffsetMobile ) => setAttributes( { stickyTopOffsetMobile } ) } min={ 0 } max={ 120 } />
					<ColorControl label={ __( 'Strip Background', 'zenctuary' ) } value={ attributes.stickyStripBackgroundColor } fallback="#3f3d3d" onChange={ ( stickyStripBackgroundColor ) => setAttributes( { stickyStripBackgroundColor } ) } />
					<RangeControl label={ __( 'Padding Top', 'zenctuary' ) } value={ attributes.stickyStripPaddingTop } onChange={ ( stickyStripPaddingTop ) => setAttributes( { stickyStripPaddingTop } ) } min={ 0 } max={ 60 } />
					<RangeControl label={ __( 'Padding Right', 'zenctuary' ) } value={ attributes.stickyStripPaddingRight } onChange={ ( stickyStripPaddingRight ) => setAttributes( { stickyStripPaddingRight } ) } min={ 0 } max={ 80 } />
					<RangeControl label={ __( 'Padding Bottom', 'zenctuary' ) } value={ attributes.stickyStripPaddingBottom } onChange={ ( stickyStripPaddingBottom ) => setAttributes( { stickyStripPaddingBottom } ) } min={ 0 } max={ 60 } />
					<RangeControl label={ __( 'Padding Left', 'zenctuary' ) } value={ attributes.stickyStripPaddingLeft } onChange={ ( stickyStripPaddingLeft ) => setAttributes( { stickyStripPaddingLeft } ) } min={ 0 } max={ 80 } />
					<RangeControl label={ __( 'Border Width', 'zenctuary' ) } value={ attributes.stickyStripBorderWidth } onChange={ ( stickyStripBorderWidth ) => setAttributes( { stickyStripBorderWidth } ) } min={ 0 } max={ 6 } />
					<ColorControl label={ __( 'Border Color', 'zenctuary' ) } value={ attributes.stickyStripBorderColor } fallback="#6b6038" onChange={ ( stickyStripBorderColor ) => setAttributes( { stickyStripBorderColor } ) } />
					<ToggleControl label={ __( 'Enable Shadow', 'zenctuary' ) } checked={ attributes.stickyStripShadow } onChange={ ( stickyStripShadow ) => setAttributes( { stickyStripShadow } ) } />
					<ToggleControl label={ __( 'Full Width Strip', 'zenctuary' ) } checked={ attributes.stickyStripFullWidth } onChange={ ( stickyStripFullWidth ) => setAttributes( { stickyStripFullWidth } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Header', 'zenctuary' ) }>
					<TextControl label={ __( 'Heading Text', 'zenctuary' ) } value={ attributes.headingText } onChange={ ( headingText ) => setAttributes( { headingText } ) } />
					<ColorControl label={ __( 'Heading Color', 'zenctuary' ) } value={ attributes.headingColor } fallback="#d8b354" onChange={ ( headingColor ) => setAttributes( { headingColor } ) } />
					<RangeControl label={ __( 'Heading Font Size', 'zenctuary' ) } value={ attributes.headingFontSize } onChange={ ( headingFontSize ) => setAttributes( { headingFontSize } ) } min={ 16 } max={ 80 } />
					<SelectControl label={ __( 'Heading Weight', 'zenctuary' ) } value={ attributes.headingFontWeight } options={ WEIGHTS } onChange={ ( headingFontWeight ) => setAttributes( { headingFontWeight } ) } />
					<RangeControl label={ __( 'Heading Line Height', 'zenctuary' ) } value={ attributes.headingLineHeight } onChange={ ( headingLineHeight ) => setAttributes( { headingLineHeight } ) } min={ 0.8 } max={ 2 } step={ 0.05 } />
					<SelectControl label={ __( 'Heading Transform', 'zenctuary' ) } value={ attributes.headingTextTransform } options={ [ { label: __( 'Uppercase', 'zenctuary' ), value: 'uppercase' }, { label: __( 'None', 'zenctuary' ), value: 'none' } ] } onChange={ ( headingTextTransform ) => setAttributes( { headingTextTransform } ) } />
					<TextControl label={ __( 'Button Text', 'zenctuary' ) } value={ attributes.buttonText } onChange={ ( buttonText ) => setAttributes( { buttonText } ) } />
					<TextControl label={ __( 'Button URL', 'zenctuary' ) } value={ attributes.buttonUrl } onChange={ ( buttonUrl ) => setAttributes( { buttonUrl } ) } />
					<ColorControl label={ __( 'Button Text Color', 'zenctuary' ) } value={ attributes.buttonTextColor } fallback="#3f3d3d" onChange={ ( buttonTextColor ) => setAttributes( { buttonTextColor } ) } />
					<ColorControl label={ __( 'Button Background Color', 'zenctuary' ) } value={ attributes.buttonBackgroundColor } fallback="#d8b354" onChange={ ( buttonBackgroundColor ) => setAttributes( { buttonBackgroundColor } ) } />
					<ColorControl label={ __( 'Button Border Color', 'zenctuary' ) } value={ attributes.buttonBorderColor } fallback="#d8b354" onChange={ ( buttonBorderColor ) => setAttributes( { buttonBorderColor } ) } />
					<RangeControl label={ __( 'Button Font Size', 'zenctuary' ) } value={ attributes.buttonFontSize } onChange={ ( buttonFontSize ) => setAttributes( { buttonFontSize } ) } min={ 12 } max={ 32 } />
					<SelectControl label={ __( 'Button Weight', 'zenctuary' ) } value={ attributes.buttonFontWeight } options={ WEIGHTS } onChange={ ( buttonFontWeight ) => setAttributes( { buttonFontWeight } ) } />
					<RangeControl label={ __( 'Button Padding Y', 'zenctuary' ) } value={ attributes.buttonPaddingY } onChange={ ( buttonPaddingY ) => setAttributes( { buttonPaddingY } ) } min={ 0 } max={ 40 } />
					<RangeControl label={ __( 'Button Padding X', 'zenctuary' ) } value={ attributes.buttonPaddingX } onChange={ ( buttonPaddingX ) => setAttributes( { buttonPaddingX } ) } min={ 0 } max={ 80 } />
					<RangeControl label={ __( 'Button Radius', 'zenctuary' ) } value={ attributes.buttonRadius } onChange={ ( buttonRadius ) => setAttributes( { buttonRadius } ) } min={ 0 } max={ 999 } />
					<RangeControl label={ __( 'Button Border Width', 'zenctuary' ) } value={ attributes.buttonBorderWidth } onChange={ ( buttonBorderWidth ) => setAttributes( { buttonBorderWidth } ) } min={ 0 } max={ 6 } />
					<RangeControl label={ __( 'Button / Heading Gap', 'zenctuary' ) } value={ attributes.headerGap } onChange={ ( headerGap ) => setAttributes( { headerGap } ) } min={ 0 } max={ 140 } />
					<SelectControl label={ __( 'Header Alignment', 'zenctuary' ) } value={ attributes.headerAlignment } options={ ALIGNMENT } onChange={ ( headerAlignment ) => setAttributes( { headerAlignment } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Card Layout', 'zenctuary' ) }>
					<RangeControl label={ __( 'Desktop Card Width', 'zenctuary' ) } value={ attributes.cardWidth } onChange={ ( cardWidth ) => setAttributes( { cardWidth } ) } min={ 360 } max={ 1400 } step={ 2 } />
					<RangeControl label={ __( 'Desktop Card Height', 'zenctuary' ) } value={ attributes.cardHeight } onChange={ ( cardHeight ) => setAttributes( { cardHeight } ) } min={ 220 } max={ 900 } step={ 2 } />
					<RangeControl label={ __( 'Card Max Width', 'zenctuary' ) } value={ attributes.cardMaxWidth } onChange={ ( cardMaxWidth ) => setAttributes( { cardMaxWidth } ) } min={ 360 } max={ 1600 } step={ 10 } />
					<RangeControl label={ __( 'Tablet Card Width (%)', 'zenctuary' ) } value={ attributes.cardWidthTablet } onChange={ ( cardWidthTablet ) => setAttributes( { cardWidthTablet } ) } min={ 60 } max={ 100 } />
					<RangeControl label={ __( 'Tablet Card Height', 'zenctuary' ) } value={ attributes.cardHeightTablet } onChange={ ( cardHeightTablet ) => setAttributes( { cardHeightTablet } ) } min={ 220 } max={ 800 } />
					<RangeControl label={ __( 'Mobile Card Width (%)', 'zenctuary' ) } value={ attributes.cardWidthMobile } onChange={ ( cardWidthMobile ) => setAttributes( { cardWidthMobile } ) } min={ 60 } max={ 100 } />
					<RangeControl label={ __( 'Mobile Card Height', 'zenctuary' ) } value={ attributes.cardHeightMobile } onChange={ ( cardHeightMobile ) => setAttributes( { cardHeightMobile } ) } min={ 220 } max={ 700 } />
					<RangeControl label={ __( 'Border Radius', 'zenctuary' ) } value={ attributes.cardBorderRadius } onChange={ ( cardBorderRadius ) => setAttributes( { cardBorderRadius } ) } min={ 0 } max={ 48 } />
					<RangeControl label={ __( 'Vertical Gap', 'zenctuary' ) } value={ attributes.cardVerticalGap } onChange={ ( cardVerticalGap ) => setAttributes( { cardVerticalGap } ) } min={ 0 } max={ 120 } />
					<SelectControl label={ __( 'Card Alignment', 'zenctuary' ) } value={ attributes.cardAlignment } options={ ALIGNMENT } onChange={ ( cardAlignment ) => setAttributes( { cardAlignment } ) } />
					<ColorControl label={ __( 'Resting Overlay Color', 'zenctuary' ) } value={ attributes.restingOverlayColor } fallback="#1f1c18" onChange={ ( restingOverlayColor ) => setAttributes( { restingOverlayColor } ) } />
					<RangeControl label={ __( 'Resting Overlay Opacity', 'zenctuary' ) } value={ attributes.restingOverlayOpacity } onChange={ ( restingOverlayOpacity ) => setAttributes( { restingOverlayOpacity } ) } min={ 0 } max={ 1 } step={ 0.05 } />
					<ColorControl label={ __( 'Hover Overlay Color', 'zenctuary' ) } value={ attributes.hoverOverlayColor } fallback="#3f3d3d" onChange={ ( hoverOverlayColor ) => setAttributes( { hoverOverlayColor } ) } />
					<RangeControl label={ __( 'Hover Overlay Opacity', 'zenctuary' ) } value={ attributes.hoverOverlayOpacity } onChange={ ( hoverOverlayOpacity ) => setAttributes( { hoverOverlayOpacity } ) } min={ 0 } max={ 1 } step={ 0.05 } />
					<ColorControl label={ __( 'Hover Border Color', 'zenctuary' ) } value={ attributes.hoverBorderColor } fallback="#d8b354" onChange={ ( hoverBorderColor ) => setAttributes( { hoverBorderColor } ) } />
					<RangeControl label={ __( 'Hover Border Width', 'zenctuary' ) } value={ attributes.hoverBorderWidth } onChange={ ( hoverBorderWidth ) => setAttributes( { hoverBorderWidth } ) } min={ 0 } max={ 6 } />
					<RangeControl label={ __( 'Desktop Card Padding', 'zenctuary' ) } value={ attributes.cardPadding } onChange={ ( cardPadding ) => setAttributes( { cardPadding } ) } min={ 8 } max={ 80 } />
					<RangeControl label={ __( 'Tablet Card Padding', 'zenctuary' ) } value={ attributes.cardPaddingTablet } onChange={ ( cardPaddingTablet ) => setAttributes( { cardPaddingTablet } ) } min={ 8 } max={ 60 } />
					<RangeControl label={ __( 'Mobile Card Padding', 'zenctuary' ) } value={ attributes.cardPaddingMobile } onChange={ ( cardPaddingMobile ) => setAttributes( { cardPaddingMobile } ) } min={ 8 } max={ 40 } />
					<RangeControl label={ __( 'Hover Content Max Width', 'zenctuary' ) } value={ attributes.hoverContentMaxWidth } onChange={ ( hoverContentMaxWidth ) => setAttributes( { hoverContentMaxWidth } ) } min={ 280 } max={ 1200 } />
				</PanelBody>

				<PanelBody title={ __( 'Resting State', 'zenctuary' ) }>
					<SelectControl
						label={ __( 'Content Vertical Alignment', 'zenctuary' ) }
						value={ attributes.restingContentVerticalAlign }
						options={ VERTICAL_ALIGNMENT }
						onChange={ ( restingContentVerticalAlign ) => setAttributes( { restingContentVerticalAlign } ) }
					/>
					<RangeControl
						label={ __( 'Content Horizontal Offset', 'zenctuary' ) }
						value={ attributes.restingContentOffsetX }
						onChange={ ( restingContentOffsetX ) => setAttributes( { restingContentOffsetX } ) }
						min={ -300 }
						max={ 300 }
					/>
					<RangeControl
						label={ __( 'Content Vertical Offset', 'zenctuary' ) }
						value={ attributes.restingContentOffsetY }
						onChange={ ( restingContentOffsetY ) => setAttributes( { restingContentOffsetY } ) }
						min={ -300 }
						max={ 300 }
					/>
					<RangeControl label={ __( 'Title Font Size', 'zenctuary' ) } value={ attributes.restingTitleFontSize } onChange={ ( restingTitleFontSize ) => setAttributes( { restingTitleFontSize } ) } min={ 16 } max={ 72 } />
					<RangeControl label={ __( 'Title Font Size Tablet', 'zenctuary' ) } value={ attributes.restingTitleFontSizeTablet } onChange={ ( restingTitleFontSizeTablet ) => setAttributes( { restingTitleFontSizeTablet } ) } min={ 14 } max={ 64 } />
					<RangeControl label={ __( 'Title Font Size Mobile', 'zenctuary' ) } value={ attributes.restingTitleFontSizeMobile } onChange={ ( restingTitleFontSizeMobile ) => setAttributes( { restingTitleFontSizeMobile } ) } min={ 14 } max={ 48 } />
					<SelectControl label={ __( 'Title Weight', 'zenctuary' ) } value={ attributes.restingTitleFontWeight } options={ WEIGHTS } onChange={ ( restingTitleFontWeight ) => setAttributes( { restingTitleFontWeight } ) } />
					<ColorControl label={ __( 'Title Color', 'zenctuary' ) } value={ attributes.restingTitleColor } fallback="#f6f2ea" onChange={ ( restingTitleColor ) => setAttributes( { restingTitleColor } ) } />
					<ToggleControl label={ __( 'Uppercase Title', 'zenctuary' ) } checked={ attributes.restingTitleUppercase } onChange={ ( restingTitleUppercase ) => setAttributes( { restingTitleUppercase } ) } />
					<RangeControl label={ __( 'Title Max Width', 'zenctuary' ) } value={ attributes.restingTitleMaxWidth } onChange={ ( restingTitleMaxWidth ) => setAttributes( { restingTitleMaxWidth } ) } min={ 200 } max={ 1000 } />
					<RangeControl label={ __( 'Excerpt Font Size', 'zenctuary' ) } value={ attributes.restingExcerptFontSize } onChange={ ( restingExcerptFontSize ) => setAttributes( { restingExcerptFontSize } ) } min={ 12 } max={ 36 } />
					<RangeControl label={ __( 'Excerpt Font Size Tablet', 'zenctuary' ) } value={ attributes.restingExcerptFontSizeTablet } onChange={ ( restingExcerptFontSizeTablet ) => setAttributes( { restingExcerptFontSizeTablet } ) } min={ 12 } max={ 32 } />
					<RangeControl label={ __( 'Excerpt Font Size Mobile', 'zenctuary' ) } value={ attributes.restingExcerptFontSizeMobile } onChange={ ( restingExcerptFontSizeMobile ) => setAttributes( { restingExcerptFontSizeMobile } ) } min={ 12 } max={ 28 } />
					<RangeControl label={ __( 'Excerpt Line Height', 'zenctuary' ) } value={ attributes.restingExcerptLineHeight } onChange={ ( restingExcerptLineHeight ) => setAttributes( { restingExcerptLineHeight } ) } min={ 1 } max={ 2.4 } step={ 0.05 } />
					<ColorControl label={ __( 'Excerpt Color', 'zenctuary' ) } value={ attributes.restingExcerptColor } fallback="#f6f2ea" onChange={ ( restingExcerptColor ) => setAttributes( { restingExcerptColor } ) } />
					<RangeControl label={ __( 'Excerpt Max Width', 'zenctuary' ) } value={ attributes.restingExcerptMaxWidth } onChange={ ( restingExcerptMaxWidth ) => setAttributes( { restingExcerptMaxWidth } ) } min={ 200 } max={ 1000 } />
					<RangeControl label={ __( 'Title / Excerpt Gap', 'zenctuary' ) } value={ attributes.restingTitleExcerptGap } onChange={ ( restingTitleExcerptGap ) => setAttributes( { restingTitleExcerptGap } ) } min={ 0 } max={ 80 } />
					<RangeControl label={ __( 'Excerpt Length (words)', 'zenctuary' ) } value={ attributes.excerptLength } onChange={ ( excerptLength ) => setAttributes( { excerptLength } ) } min={ 6 } max={ 80 } />
				</PanelBody>

				<PanelBody title={ __( 'Hover State', 'zenctuary' ) }>
					<SelectControl
						label={ __( 'Content Vertical Alignment', 'zenctuary' ) }
						value={ attributes.hoverContentVerticalAlign }
						options={ VERTICAL_ALIGNMENT }
						onChange={ ( hoverContentVerticalAlign ) => setAttributes( { hoverContentVerticalAlign } ) }
					/>
					<RangeControl
						label={ __( 'Content Horizontal Offset', 'zenctuary' ) }
						value={ attributes.hoverContentOffsetX }
						onChange={ ( hoverContentOffsetX ) => setAttributes( { hoverContentOffsetX } ) }
						min={ -300 }
						max={ 300 }
					/>
					<RangeControl
						label={ __( 'Content Vertical Offset', 'zenctuary' ) }
						value={ attributes.hoverContentOffsetY }
						onChange={ ( hoverContentOffsetY ) => setAttributes( { hoverContentOffsetY } ) }
						min={ -300 }
						max={ 300 }
					/>
					<RangeControl label={ __( 'Hover Title Font Size', 'zenctuary' ) } value={ attributes.hoverTitleFontSize } onChange={ ( hoverTitleFontSize ) => setAttributes( { hoverTitleFontSize } ) } min={ 16 } max={ 60 } />
					<SelectControl label={ __( 'Hover Title Weight', 'zenctuary' ) } value={ attributes.hoverTitleFontWeight } options={ WEIGHTS } onChange={ ( hoverTitleFontWeight ) => setAttributes( { hoverTitleFontWeight } ) } />
					<ColorControl label={ __( 'Hover Title Color', 'zenctuary' ) } value={ attributes.hoverTitleColor } fallback="#d8b354" onChange={ ( hoverTitleColor ) => setAttributes( { hoverTitleColor } ) } />
					<RangeControl label={ __( 'Hover Body Font Size', 'zenctuary' ) } value={ attributes.hoverBodyFontSize } onChange={ ( hoverBodyFontSize ) => setAttributes( { hoverBodyFontSize } ) } min={ 12 } max={ 32 } />
					<RangeControl label={ __( 'Hover Body Font Size Tablet', 'zenctuary' ) } value={ attributes.hoverBodyFontSizeTablet } onChange={ ( hoverBodyFontSizeTablet ) => setAttributes( { hoverBodyFontSizeTablet } ) } min={ 12 } max={ 30 } />
					<RangeControl label={ __( 'Hover Body Font Size Mobile', 'zenctuary' ) } value={ attributes.hoverBodyFontSizeMobile } onChange={ ( hoverBodyFontSizeMobile ) => setAttributes( { hoverBodyFontSizeMobile } ) } min={ 12 } max={ 26 } />
					<RangeControl label={ __( 'Hover Body Line Height', 'zenctuary' ) } value={ attributes.hoverBodyLineHeight } onChange={ ( hoverBodyLineHeight ) => setAttributes( { hoverBodyLineHeight } ) } min={ 1 } max={ 2.4 } step={ 0.05 } />
					<ColorControl label={ __( 'Hover Body Color', 'zenctuary' ) } value={ attributes.hoverBodyColor } fallback="#f1eee7" onChange={ ( hoverBodyColor ) => setAttributes( { hoverBodyColor } ) } />
					<RangeControl label={ __( 'Title / Body Gap', 'zenctuary' ) } value={ attributes.hoverTitleBodyGap } onChange={ ( hoverTitleBodyGap ) => setAttributes( { hoverTitleBodyGap } ) } min={ 0 } max={ 80 } />
					<RangeControl label={ __( 'Body / Button Gap', 'zenctuary' ) } value={ attributes.hoverBodyButtonGap } onChange={ ( hoverBodyButtonGap ) => setAttributes( { hoverBodyButtonGap } ) } min={ 0 } max={ 120 } />
					<TextareaControl label={ __( 'Fallback Hover Content', 'zenctuary' ) } value={ attributes.hoverFallbackText } onChange={ ( hoverFallbackText ) => setAttributes( { hoverFallbackText } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Meta & CTA', 'zenctuary' ) }>
					<ToggleControl label={ __( 'Show Meta / Badge', 'zenctuary' ) } checked={ attributes.showMeta } onChange={ ( showMeta ) => setAttributes( { showMeta } ) } />
					<SelectControl label={ __( 'Meta Source', 'zenctuary' ) } value={ attributes.metaSource } options={ META_SOURCE } onChange={ ( metaSource ) => setAttributes( { metaSource } ) } />
					{ attributes.metaSource === 'custom' && <TextControl label={ __( 'Custom Meta Key', 'zenctuary' ) } value={ attributes.customMetaKey } onChange={ ( customMetaKey ) => setAttributes( { customMetaKey } ) } /> }
					<RangeControl label={ __( 'Meta Font Size', 'zenctuary' ) } value={ attributes.metaFontSize } onChange={ ( metaFontSize ) => setAttributes( { metaFontSize } ) } min={ 10 } max={ 32 } />
					<SelectControl label={ __( 'Meta Weight', 'zenctuary' ) } value={ attributes.metaFontWeight } options={ WEIGHTS } onChange={ ( metaFontWeight ) => setAttributes( { metaFontWeight } ) } />
					<ColorControl label={ __( 'Meta Color', 'zenctuary' ) } value={ attributes.metaColor } fallback="#d8b354" onChange={ ( metaColor ) => setAttributes( { metaColor } ) } />
					<RangeControl label={ __( 'Meta Gap', 'zenctuary' ) } value={ attributes.metaGap } onChange={ ( metaGap ) => setAttributes( { metaGap } ) } min={ 0 } max={ 30 } />
					<ToggleControl label={ __( 'Show Meta Icon', 'zenctuary' ) } checked={ attributes.showMetaIcon } onChange={ ( showMetaIcon ) => setAttributes( { showMetaIcon } ) } />
					<TextControl label={ __( 'CTA Label', 'zenctuary' ) } value={ attributes.ctaLabel } onChange={ ( ctaLabel ) => setAttributes( { ctaLabel } ) } />
					<RangeControl label={ __( 'CTA Font Size', 'zenctuary' ) } value={ attributes.ctaFontSize } onChange={ ( ctaFontSize ) => setAttributes( { ctaFontSize } ) } min={ 12 } max={ 28 } />
					<SelectControl label={ __( 'CTA Weight', 'zenctuary' ) } value={ attributes.ctaFontWeight } options={ WEIGHTS } onChange={ ( ctaFontWeight ) => setAttributes( { ctaFontWeight } ) } />
					<ColorControl label={ __( 'CTA Text Color', 'zenctuary' ) } value={ attributes.ctaTextColor } fallback="#d8b354" onChange={ ( ctaTextColor ) => setAttributes( { ctaTextColor } ) } />
					<ColorControl label={ __( 'CTA Background Color', 'zenctuary' ) } value={ attributes.ctaBackgroundColor } fallback="#3f3d3d" onChange={ ( ctaBackgroundColor ) => setAttributes( { ctaBackgroundColor } ) } />
					<ColorControl label={ __( 'CTA Border Color', 'zenctuary' ) } value={ attributes.ctaBorderColor } fallback="#d8b354" onChange={ ( ctaBorderColor ) => setAttributes( { ctaBorderColor } ) } />
					<RangeControl label={ __( 'CTA Padding Y', 'zenctuary' ) } value={ attributes.ctaPaddingY } onChange={ ( ctaPaddingY ) => setAttributes( { ctaPaddingY } ) } min={ 0 } max={ 40 } />
					<RangeControl label={ __( 'CTA Padding X', 'zenctuary' ) } value={ attributes.ctaPaddingX } onChange={ ( ctaPaddingX ) => setAttributes( { ctaPaddingX } ) } min={ 0 } max={ 80 } />
					<RangeControl label={ __( 'CTA Radius', 'zenctuary' ) } value={ attributes.ctaRadius } onChange={ ( ctaRadius ) => setAttributes( { ctaRadius } ) } min={ 0 } max={ 999 } />
					<RangeControl label={ __( 'CTA Border Width', 'zenctuary' ) } value={ attributes.ctaBorderWidth } onChange={ ( ctaBorderWidth ) => setAttributes( { ctaBorderWidth } ) } min={ 0 } max={ 6 } />
					<ToggleControl label={ __( 'Show CTA Icon', 'zenctuary' ) } checked={ attributes.ctaShowIcon } onChange={ ( ctaShowIcon ) => setAttributes( { ctaShowIcon } ) } />
					<SelectControl label={ __( 'CTA Icon Position', 'zenctuary' ) } value={ attributes.ctaIconPosition } options={ [ { label: __( 'Right', 'zenctuary' ), value: 'right' }, { label: __( 'Left', 'zenctuary' ), value: 'left' } ] } onChange={ ( ctaIconPosition ) => setAttributes( { ctaIconPosition } ) } />
					<SelectControl
						label={ __( 'Hover CTA Horizontal Align', 'zenctuary' ) }
						value={ attributes.hoverCtaHorizontalAlign }
						options={ HORIZONTAL_POSITION }
						onChange={ ( hoverCtaHorizontalAlign ) => setAttributes( { hoverCtaHorizontalAlign } ) }
					/>
					<SelectControl
						label={ __( 'Hover CTA Vertical Align', 'zenctuary' ) }
						value={ attributes.hoverCtaVerticalAlign }
						options={ VERTICAL_ALIGNMENT }
						onChange={ ( hoverCtaVerticalAlign ) => setAttributes( { hoverCtaVerticalAlign } ) }
					/>
					<RangeControl
						label={ __( 'Hover CTA Horizontal Offset', 'zenctuary' ) }
						value={ attributes.hoverCtaOffsetX }
						onChange={ ( hoverCtaOffsetX ) => setAttributes( { hoverCtaOffsetX } ) }
						min={ -300 }
						max={ 300 }
					/>
					<RangeControl
						label={ __( 'Hover CTA Vertical Offset', 'zenctuary' ) }
						value={ attributes.hoverCtaOffsetY }
						onChange={ ( hoverCtaOffsetY ) => setAttributes( { hoverCtaOffsetY } ) }
						min={ -300 }
						max={ 300 }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Mobile & Preview', 'zenctuary' ) }>
					<SelectControl label={ __( 'Mobile Interaction', 'zenctuary' ) } value={ attributes.mobileInteraction } options={ MOBILE_INTERACTION } onChange={ ( mobileInteraction ) => setAttributes( { mobileInteraction } ) } />
					<SelectControl label={ __( 'Editor Preview State', 'zenctuary' ) } value={ attributes.previewState } options={ PREVIEW_STATE } onChange={ ( previewState ) => setAttributes( { previewState } ) } />
				</PanelBody>
			</InspectorControls>

			<ServerSideRender
				block="zenctuary/latest-news-sticky-stack"
				attributes={ attributes }
				httpMethod="POST"
			/>

			<p className="latest-news-sticky-stack__preview-note">
				{ __( 'Preview uses the live dynamic query. Toggle the preview state to inspect resting and expanded card layouts.', 'zenctuary' ) }
			</p>
		</div>
	);
}
