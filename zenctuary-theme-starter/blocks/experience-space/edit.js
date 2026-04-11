import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import {
    PanelBody,
    SelectControl,
    ToggleControl,
    TextControl,
    Spinner,
    Notice,
} from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

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
