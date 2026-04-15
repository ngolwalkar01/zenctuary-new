import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
    PanelBody,
    SelectControl,
    ToggleControl,
    TextControl,
    Spinner,
    Notice,
    RangeControl,
    ColorPalette,
} from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

const WEIGHTS = [ '400', '500', '600', '700', '800' ].map( ( value ) => ( { label: value, value } ) );
const ZENCOIN_PLACEMENTS = [
    { label: 'Top Left', value: 'top-left' },
    { label: 'Top Right', value: 'top-right' },
    { label: 'Bottom Left', value: 'bottom-left' },
    { label: 'Bottom Right', value: 'bottom-right' },
];

// The available taxonomy options the admin can pick from.
const TAXONOMY_OPTIONS = [
    { label: 'Experience Category', value: 'experience_category' },
    { label: 'Activity Type',       value: 'activity_type' },
    { label: 'Space Type',          value: 'space_type' },
];

export default function Edit( { attributes, setAttributes } ) {
    const {
        filterTaxonomy,
        filterTermSlug,
        primaryTaxonomy,
        accordionTaxonomy,
        showZencoins,
        showDifficulty,
        showBookButton,
        bookButtonLabel,

        headingIconSize,
        headingIconGap,
        headingFontSize,
        headingFontWeight,
        headingLetterSpacing,
        headingTextTransform,
        headingColor,

        descFontSize,
        descFontWeight,
        descLineHeight,
        descColor,
        descMaxWidth,

        accordionBorderWidth,
        accordionBorderColor,
        accordionBorderRadius,
        accordionPaddingX,
        accordionPaddingY,
        accordionTitleFontSize,
        accordionTitleFontWeight,
        accordionTitleColor,
        accordionIconSize,
        accordionIconWeight,
        accordionGap,

        zencoinPlacement,
        zencoinLabelFontSize,
        zencoinLabelFontWeight,
        zencoinLabelColor,
        zencoinBadgeSize,
        zencoinBadgeFontSize,
        zencoinBadgeBgColor,
        zencoinBadgeTextColor,
        zencoinGap,

        btnFontSize,
        btnFontWeight,
        btnPaddingX,
        btnPaddingY,
        btnBorderRadius,
        btnBorderWidth,
        btnBorderColor,
        btnBgColor,
        btnTextColor,
        btnMarginTop,

        cardImageHeight,
        cardBodyPadding,
        cardBorderRadius,
    } = attributes;

    const blockProps = useBlockProps();

    const [ filterTerms, setFilterTerms ]   = useState( [] );
    const [ loadingTerms, setLoadingTerms ] = useState( false );
    const [ previewLabel, setPreviewLabel ] = useState( '' );

    // Fetch terms whenever the filter taxonomy changes.
    useEffect( () => {
        if ( ! filterTaxonomy ) return;

        setLoadingTerms( true );
        setFilterTerms( [] );

        apiFetch( { path: `/wp/v2/${ filterTaxonomy }?per_page=100&_fields=id,slug,name` } )
            .then( ( terms ) => {
                setFilterTerms(
                    terms.map( ( t ) => ( { label: t.name, value: t.slug } ) )
                );
                setLoadingTerms( false );
            } )
            .catch( () => setLoadingTerms( false ) );
    }, [ filterTaxonomy ] );

    // Build a human-readable preview label.
    useEffect( () => {
        const taxLabel = TAXONOMY_OPTIONS.find( ( t ) => t.value === filterTaxonomy )?.label || filterTaxonomy;
        const termPart = filterTermSlug ? ` › "${ filterTermSlug }"` : ' (all terms)';
        setPreviewLabel( `Filter: ${ taxLabel }${ termPart } → Group by: ${ primaryTaxonomy } / ${ accordionTaxonomy }` );
    }, [ filterTaxonomy, filterTermSlug, primaryTaxonomy, accordionTaxonomy ] );

    return (
        <div { ...blockProps }>
            <InspectorControls>
                {/* ── Filter Configuration ── */}
                <PanelBody title={ __( 'Filter Products By', 'zenctuary' ) } initialOpen={ true }>
                    <SelectControl
                        label={ __( 'Filter Taxonomy', 'zenctuary' ) }
                        value={ filterTaxonomy }
                        options={ TAXONOMY_OPTIONS }
                        onChange={ ( val ) => setAttributes( { filterTaxonomy: val, filterTermSlug: '' } ) }
                        help={ __( 'Which taxonomy to use when selecting which products to show.', 'zenctuary' ) }
                    />

                    { loadingTerms && <Spinner /> }

                    { ! loadingTerms && filterTerms.length > 0 && (
                        <SelectControl
                            label={ __( 'Filter Term', 'zenctuary' ) }
                            value={ filterTermSlug }
                            options={ [ { label: '— All —', value: '' }, ...filterTerms ] }
                            onChange={ ( val ) => setAttributes( { filterTermSlug: val } ) }
                            help={ __( 'Which specific term to filter products by.', 'zenctuary' ) }
                        />
                    ) }
                </PanelBody>

                {/* ── Grouping Configuration ── */}
                <PanelBody title={ __( 'Grouping / Display', 'zenctuary' ) } initialOpen={ true }>
                    <SelectControl
                        label={ __( 'Primary Group (Sections)', 'zenctuary' ) }
                        value={ primaryTaxonomy }
                        options={ TAXONOMY_OPTIONS }
                        onChange={ ( val ) => setAttributes( { primaryTaxonomy: val } ) }
                        help={ __( 'Top-level section grouping, e.g. Space Type gives Movement Space / Soul Space.', 'zenctuary' ) }
                    />
                    <SelectControl
                        label={ __( 'Accordion Sub-group', 'zenctuary' ) }
                        value={ accordionTaxonomy }
                        options={ TAXONOMY_OPTIONS }
                        onChange={ ( val ) => setAttributes( { accordionTaxonomy: val } ) }
                        help={ __( 'Accordion titles inside each section, e.g. Activity Type gives Yoga / Pilates.', 'zenctuary' ) }
                    />
                </PanelBody>

                {/* ── Card Toggles ── */}
                <PanelBody title={ __( 'Card Options', 'zenctuary' ) } initialOpen={ false }>
                    <ToggleControl
                        label={ __( 'Show Zencoins Badge', 'zenctuary' ) }
                        checked={ showZencoins }
                        onChange={ ( val ) => setAttributes( { showZencoins: val } ) }
                    />
                    <ToggleControl
                        label={ __( 'Show Difficulty Level', 'zenctuary' ) }
                        checked={ showDifficulty }
                        onChange={ ( val ) => setAttributes( { showDifficulty: val } ) }
                    />
                    <ToggleControl
                        label={ __( 'Show Book Button', 'zenctuary' ) }
                        checked={ showBookButton }
                        onChange={ ( val ) => setAttributes( { showBookButton: val } ) }
                    />
                    { showBookButton && (
                        <TextControl
                            label={ __( 'Book Button Label', 'zenctuary' ) }
                            value={ bookButtonLabel }
                            onChange={ ( val ) => setAttributes( { bookButtonLabel: val } ) }
                        />
                    ) }
                </PanelBody>

                {/* ── Heading Icon Styling ── */}
                <PanelBody title={ __( 'Heading Icon', 'zenctuary' ) } initialOpen={ false }>
                    <RangeControl
                        label={ __( 'Icon Size (px)', 'zenctuary' ) }
                        value={ headingIconSize }
                        onChange={ ( val ) => setAttributes( { headingIconSize: val } ) }
                        min={ 20 }
                        max={ 120 }
                    />
                    <RangeControl
                        label={ __( 'Icon Gap (px)', 'zenctuary' ) }
                        value={ headingIconGap }
                        onChange={ ( val ) => setAttributes( { headingIconGap: val } ) }
                        min={ 0 }
                        max={ 60 }
                    />
                </PanelBody>

                {/* ── Heading Text Styling ── */}
                <PanelBody title={ __( 'Heading Text', 'zenctuary' ) } initialOpen={ false }>
                    <RangeControl
                        label={ __( 'Font Size (px)', 'zenctuary' ) }
                        value={ headingFontSize }
                        onChange={ ( val ) => setAttributes( { headingFontSize: val } ) }
                        min={ 16 }
                        max={ 80 }
                    />
                    <SelectControl
                        label={ __( 'Font Weight', 'zenctuary' ) }
                        value={ headingFontWeight }
                        options={ WEIGHTS }
                        onChange={ ( val ) => setAttributes( { headingFontWeight: val } ) }
                    />
                    <RangeControl
                        label={ __( 'Letter Spacing (px)', 'zenctuary' ) }
                        value={ headingLetterSpacing }
                        onChange={ ( val ) => setAttributes( { headingLetterSpacing: val } ) }
                        min={ 0 }
                        max={ 20 }
                        step={ 0.5 }
                    />
                    <TextControl
                        label={ __( 'Text Transform', 'zenctuary' ) }
                        value={ headingTextTransform }
                        onChange={ ( val ) => setAttributes( { headingTextTransform: val } ) }
                        help={ __( 'e.g., uppercase, lowercase, capitalize, none', 'zenctuary' ) }
                    />
                    <p className="components-base-control__label">{ __( 'Color', 'zenctuary' ) }</p>
                    <ColorPalette
                        value={ headingColor }
                        onChange={ ( val ) => setAttributes( { headingColor: val || '#D8B355' } ) }
                    />
                </PanelBody>

                {/* ── Description Styling ── */}
                <PanelBody title={ __( 'Description', 'zenctuary' ) } initialOpen={ false }>
                    <RangeControl
                        label={ __( 'Font Size (px)', 'zenctuary' ) }
                        value={ descFontSize }
                        onChange={ ( val ) => setAttributes( { descFontSize: val } ) }
                        min={ 12 }
                        max={ 32 }
                    />
                    <SelectControl
                        label={ __( 'Font Weight', 'zenctuary' ) }
                        value={ descFontWeight }
                        options={ WEIGHTS }
                        onChange={ ( val ) => setAttributes( { descFontWeight: val } ) }
                    />
                    <RangeControl
                        label={ __( 'Line Height', 'zenctuary' ) }
                        value={ descLineHeight }
                        onChange={ ( val ) => setAttributes( { descLineHeight: val } ) }
                        min={ 1 }
                        max={ 3 }
                        step={ 0.1 }
                    />
                    <RangeControl
                        label={ __( 'Max Width (px)', 'zenctuary' ) }
                        value={ descMaxWidth }
                        onChange={ ( val ) => setAttributes( { descMaxWidth: val } ) }
                        min={ 400 }
                        max={ 1400 }
                    />
                    <p className="components-base-control__label">{ __( 'Color', 'zenctuary' ) }</p>
                    <ColorPalette
                        value={ descColor }
                        onChange={ ( val ) => setAttributes( { descColor: val || '#F6F2EA' } ) }
                    />
                </PanelBody>

                {/* ── Accordion Styling ── */}
                <PanelBody title={ __( 'Accordion', 'zenctuary' ) } initialOpen={ false }>
                    <RangeControl
                        label={ __( 'Border Width (px)', 'zenctuary' ) }
                        value={ accordionBorderWidth }
                        onChange={ ( val ) => setAttributes( { accordionBorderWidth: val } ) }
                        min={ 0 }
                        max={ 10 }
                    />
                    <RangeControl
                        label={ __( 'Border Radius (px)', 'zenctuary' ) }
                        value={ accordionBorderRadius }
                        onChange={ ( val ) => setAttributes( { accordionBorderRadius: val } ) }
                        min={ 0 }
                        max={ 60 }
                    />
                    <p className="components-base-control__label">{ __( 'Border Color', 'zenctuary' ) }</p>
                    <ColorPalette
                        value={ accordionBorderColor }
                        onChange={ ( val ) => setAttributes( { accordionBorderColor: val || '#3d3c3c' } ) }
                    />
                    <RangeControl
                        label={ __( 'Padding Horizontal (px)', 'zenctuary' ) }
                        value={ accordionPaddingX }
                        onChange={ ( val ) => setAttributes( { accordionPaddingX: val } ) }
                        min={ 0 }
                        max={ 80 }
                    />
                    <RangeControl
                        label={ __( 'Padding Vertical (px)', 'zenctuary' ) }
                        value={ accordionPaddingY }
                        onChange={ ( val ) => setAttributes( { accordionPaddingY: val } ) }
                        min={ 0 }
                        max={ 80 }
                    />
                    <RangeControl
                        label={ __( 'Title Font Size (px)', 'zenctuary' ) }
                        value={ accordionTitleFontSize }
                        onChange={ ( val ) => setAttributes( { accordionTitleFontSize: val } ) }
                        min={ 12 }
                        max={ 40 }
                    />
                    <SelectControl
                        label={ __( 'Title Font Weight', 'zenctuary' ) }
                        value={ accordionTitleFontWeight }
                        options={ WEIGHTS }
                        onChange={ ( val ) => setAttributes( { accordionTitleFontWeight: val } ) }
                    />
                    <p className="components-base-control__label">{ __( 'Title Color', 'zenctuary' ) }</p>
                    <ColorPalette
                        value={ accordionTitleColor }
                        onChange={ ( val ) => setAttributes( { accordionTitleColor: val || '#F6F2EA' } ) }
                    />
                    <RangeControl
                        label={ __( 'Icon Size (px)', 'zenctuary' ) }
                        value={ accordionIconSize }
                        onChange={ ( val ) => setAttributes( { accordionIconSize: val } ) }
                        min={ 12 }
                        max={ 60 }
                    />
                    <SelectControl
                        label={ __( 'Icon Weight', 'zenctuary' ) }
                        value={ accordionIconWeight }
                        options={ WEIGHTS }
                        onChange={ ( val ) => setAttributes( { accordionIconWeight: val } ) }
                    />
                    <RangeControl
                        label={ __( 'Accordion Gap (px)', 'zenctuary' ) }
                        value={ accordionGap }
                        onChange={ ( val ) => setAttributes( { accordionGap: val } ) }
                        min={ 0 }
                        max={ 40 }
                    />
                </PanelBody>

                {/* ── Zencoin Badge Styling ── */}
                <PanelBody title={ __( 'Zencoin Badge', 'zenctuary' ) } initialOpen={ false }>
                    <SelectControl
                        label={ __( 'Placement', 'zenctuary' ) }
                        value={ zencoinPlacement }
                        options={ ZENCOIN_PLACEMENTS }
                        onChange={ ( val ) => setAttributes( { zencoinPlacement: val } ) }
                    />
                    <RangeControl
                        label={ __( 'Label Font Size (px)', 'zenctuary' ) }
                        value={ zencoinLabelFontSize }
                        onChange={ ( val ) => setAttributes( { zencoinLabelFontSize: val } ) }
                        min={ 8 }
                        max={ 24 }
                    />
                    <SelectControl
                        label={ __( 'Label Font Weight', 'zenctuary' ) }
                        value={ zencoinLabelFontWeight }
                        options={ WEIGHTS }
                        onChange={ ( val ) => setAttributes( { zencoinLabelFontWeight: val } ) }
                    />
                    <p className="components-base-control__label">{ __( 'Label Color', 'zenctuary' ) }</p>
                    <ColorPalette
                        value={ zencoinLabelColor }
                        onChange={ ( val ) => setAttributes( { zencoinLabelColor: val || '#D8B355' } ) }
                    />
                    <RangeControl
                        label={ __( 'Badge Size (px)', 'zenctuary' ) }
                        value={ zencoinBadgeSize }
                        onChange={ ( val ) => setAttributes( { zencoinBadgeSize: val } ) }
                        min={ 20 }
                        max={ 80 }
                    />
                    <RangeControl
                        label={ __( 'Badge Font Size (px)', 'zenctuary' ) }
                        value={ zencoinBadgeFontSize }
                        onChange={ ( val ) => setAttributes( { zencoinBadgeFontSize: val } ) }
                        min={ 10 }
                        max={ 24 }
                    />
                    <p className="components-base-control__label">{ __( 'Badge Background Color', 'zenctuary' ) }</p>
                    <ColorPalette
                        value={ zencoinBadgeBgColor }
                        onChange={ ( val ) => setAttributes( { zencoinBadgeBgColor: val || '#D8B355' } ) }
                    />
                    <p className="components-base-control__label">{ __( 'Badge Text Color', 'zenctuary' ) }</p>
                    <ColorPalette
                        value={ zencoinBadgeTextColor }
                        onChange={ ( val ) => setAttributes( { zencoinBadgeTextColor: val || '#3F3E3E' } ) }
                    />
                    <RangeControl
                        label={ __( 'Label & Badge Gap (px)', 'zenctuary' ) }
                        value={ zencoinGap }
                        onChange={ ( val ) => setAttributes( { zencoinGap: val } ) }
                        min={ 0 }
                        max={ 40 }
                    />
                </PanelBody>

                {/* ── Button Styling ── */}
                <PanelBody title={ __( 'Button', 'zenctuary' ) } initialOpen={ false }>
                    <RangeControl
                        label={ __( 'Font Size (px)', 'zenctuary' ) }
                        value={ btnFontSize }
                        onChange={ ( val ) => setAttributes( { btnFontSize: val } ) }
                        min={ 12 }
                        max={ 32 }
                    />
                    <SelectControl
                        label={ __( 'Font Weight', 'zenctuary' ) }
                        value={ btnFontWeight }
                        options={ WEIGHTS }
                        onChange={ ( val ) => setAttributes( { btnFontWeight: val } ) }
                    />
                    <RangeControl
                        label={ __( 'Padding Horizontal (px)', 'zenctuary' ) }
                        value={ btnPaddingX }
                        onChange={ ( val ) => setAttributes( { btnPaddingX: val } ) }
                        min={ 0 }
                        max={ 80 }
                    />
                    <RangeControl
                        label={ __( 'Padding Vertical (px)', 'zenctuary' ) }
                        value={ btnPaddingY }
                        onChange={ ( val ) => setAttributes( { btnPaddingY: val } ) }
                        min={ 0 }
                        max={ 60 }
                    />
                    <RangeControl
                        label={ __( 'Border Radius (px)', 'zenctuary' ) }
                        value={ btnBorderRadius }
                        onChange={ ( val ) => setAttributes( { btnBorderRadius: val } ) }
                        min={ 0 }
                        max={ 999 }
                    />
                    <RangeControl
                        label={ __( 'Border Width (px)', 'zenctuary' ) }
                        value={ btnBorderWidth }
                        onChange={ ( val ) => setAttributes( { btnBorderWidth: val } ) }
                        min={ 0 }
                        max={ 10 }
                    />
                    <p className="components-base-control__label">{ __( 'Border Color', 'zenctuary' ) }</p>
                    <ColorPalette
                        value={ btnBorderColor }
                        onChange={ ( val ) => setAttributes( { btnBorderColor: val || '#D8B355' } ) }
                    />
                    <p className="components-base-control__label">{ __( 'Background Color', 'zenctuary' ) }</p>
                    <ColorPalette
                        value={ btnBgColor }
                        onChange={ ( val ) => setAttributes( { btnBgColor: val || '#D8B355' } ) }
                    />
                    <p className="components-base-control__label">{ __( 'Text Color', 'zenctuary' ) }</p>
                    <ColorPalette
                        value={ btnTextColor }
                        onChange={ ( val ) => setAttributes( { btnTextColor: val || '#1D1D1B' } ) }
                    />
                    <RangeControl
                        label={ __( 'Margin Top (px)', 'zenctuary' ) }
                        value={ btnMarginTop }
                        onChange={ ( val ) => setAttributes( { btnMarginTop: val } ) }
                        min={ 0 }
                        max={ 80 }
                    />
                </PanelBody>

                {/* ── Card Styling ── */}
                <PanelBody title={ __( 'Card', 'zenctuary' ) } initialOpen={ false }>
                    <RangeControl
                        label={ __( 'Image Height (px)', 'zenctuary' ) }
                        value={ cardImageHeight }
                        onChange={ ( val ) => setAttributes( { cardImageHeight: val } ) }
                        min={ 100 }
                        max={ 500 }
                    />
                    <RangeControl
                        label={ __( 'Body Padding (px)', 'zenctuary' ) }
                        value={ cardBodyPadding }
                        onChange={ ( val ) => setAttributes( { cardBodyPadding: val } ) }
                        min={ 0 }
                        max={ 60 }
                    />
                    <RangeControl
                        label={ __( 'Border Radius (px)', 'zenctuary' ) }
                        value={ cardBorderRadius }
                        onChange={ ( val ) => setAttributes( { cardBorderRadius: val } ) }
                        min={ 0 }
                        max={ 60 }
                    />
                </PanelBody>
            </InspectorControls>

            {/* ── Editor preview panel ── */}
            <div style={ {
                backgroundColor: '#2a2a2a',
                padding: '32px',
                borderRadius: '16px',
                border: '2px dashed #D8B355',
            } }>
                <div style={ { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' } }>
                    <span style={ { fontSize: '28px' } }>🧘</span>
                    <strong style={ { color: '#D8B355', fontSize: '18px', textTransform: 'uppercase' } }>
                        { __( 'Experience Space Block', 'zenctuary' ) }
                    </strong>
                </div>

                <Notice status="info" isDismissible={ false }>
                    { previewLabel }
                </Notice>

                <p style={ { color: '#9A9A9A', fontSize: '13px', marginTop: '16px' } }>
                    { __( 'This block renders dynamically on the frontend. Use the settings panel on the right to configure which products appear and how they are grouped.', 'zenctuary' ) }
                </p>

                <div style={ { display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' } }>
                    { [
                        { label: 'Zencoins', on: showZencoins },
                        { label: 'Difficulty', on: showDifficulty },
                        { label: 'Book Button', on: showBookButton },
                    ].map( ( item ) => (
                        <span
                            key={ item.label }
                            style={ {
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                backgroundColor: item.on ? '#D8B355' : '#444',
                                color: item.on ? '#1a1a1a' : '#888',
                            } }
                        >
                            { item.on ? '✓' : '✕' } { item.label }
                        </span>
                    ) ) }
                </div>
            </div>
        </div>
    );
}
