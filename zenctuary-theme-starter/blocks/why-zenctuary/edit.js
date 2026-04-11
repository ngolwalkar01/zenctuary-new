import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls, MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import {
    PanelBody,
    TextControl,
    TextareaControl,
    RangeControl,
    Button,
    ColorPicker,
    __experimentalDivider as Divider,
    Notice,
    SelectControl,
} from '@wordpress/components';
import { useState } from '@wordpress/element';

// ─── Helper ──────────────────────────────────────────────────────────────────

/**
 * Returns a two-character, zero-padded number string.
 * e.g. 1 → "01", 10 → "10"
 */
function padNumber( n ) {
    return String( n ).padStart( 2, '0' );
}

// Default placeholder icon (simple SVG yoga/meditation figure matching Figma design)
const PLACEHOLDER_ICON = (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="48" height="48">
        <circle cx="32" cy="12" r="6" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M20 28c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M14 36l8-8M50 36l-8-8M20 28l-6 8M44 28l6 8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M20 48c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M16 52h32" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
);

// ─── Main Edit Component ──────────────────────────────────────────────────────

export default function Edit( { attributes, setAttributes } ) {
    const {
        heading,
        subheading,
        items,
        backgroundColor,
        headingColor,
        textColor,
        accentColor,
        paddingTop,
        paddingBottom,
        columns,
    } = attributes;

    // Track which item accordion is open in the editor panel
    const [ openItemIndex, setOpenItemIndex ] = useState( null );

    const blockProps = useBlockProps();

    // ── Item manipulation helpers ─────────────────────────────────────────────

    function updateItem( index, key, value ) {
        const updated = items.map( ( item, i ) =>
            i === index ? { ...item, [ key ]: value } : item
        );
        setAttributes( { items: updated } );
    }

    function addItem() {
        setAttributes( {
            items: [
                ...items,
                {
                    iconUrl: '',
                    iconId: 0,
                    iconAlt: '',
                    title: 'NEW FEATURE',
                    description: 'Describe this feature here.',
                },
            ],
        } );
        setOpenItemIndex( items.length ); // open newly added item
    }

    function removeItem( index ) {
        const updated = items.filter( ( _, i ) => i !== index );
        setAttributes( { items: updated } );
        setOpenItemIndex( null );
    }

    function moveItem( index, direction ) {
        const updated = [ ...items ];
        const targetIndex = index + direction;
        if ( targetIndex < 0 || targetIndex >= updated.length ) return;
        [ updated[ index ], updated[ targetIndex ] ] = [ updated[ targetIndex ], updated[ index ] ];
        setAttributes( { items: updated } );
        setOpenItemIndex( targetIndex );
    }

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div { ...blockProps }>

            { /* ══ Inspector (sidebar) Controls ══════════════════════════════ */ }
            <InspectorControls>

                { /* Section content */ }
                <PanelBody title={ __( 'Section Content', 'zenctuary' ) } initialOpen={ true }>
                    <TextControl
                        label={ __( 'Section Heading', 'zenctuary' ) }
                        value={ heading }
                        onChange={ ( val ) => setAttributes( { heading: val } ) }
                        placeholder="WHY ZENCTUARY?"
                    />
                    <TextareaControl
                        label={ __( 'Subheading / Intro (optional)', 'zenctuary' ) }
                        value={ subheading }
                        onChange={ ( val ) => setAttributes( { subheading: val } ) }
                        placeholder={ __( 'Optional supporting text…', 'zenctuary' ) }
                        rows={ 2 }
                    />
                </PanelBody>

                { /* Grid layout */ }
                <PanelBody title={ __( 'Layout', 'zenctuary' ) } initialOpen={ false }>
                    <SelectControl
                        label={ __( 'Columns (Desktop)', 'zenctuary' ) }
                        value={ String( columns ) }
                        options={ [
                            { label: '1 Column', value: '1' },
                            { label: '2 Columns', value: '2' },
                            { label: '3 Columns', value: '3' },
                        ] }
                        onChange={ ( val ) => setAttributes( { columns: parseInt( val, 10 ) } ) }
                        help={ __( 'Mobile always uses 1 column.', 'zenctuary' ) }
                    />
                    <RangeControl
                        label={ __( 'Padding Top (px)', 'zenctuary' ) }
                        value={ paddingTop }
                        min={ 0 }
                        max={ 240 }
                        step={ 8 }
                        onChange={ ( val ) => setAttributes( { paddingTop: val } ) }
                    />
                    <RangeControl
                        label={ __( 'Padding Bottom (px)', 'zenctuary' ) }
                        value={ paddingBottom }
                        min={ 0 }
                        max={ 240 }
                        step={ 8 }
                        onChange={ ( val ) => setAttributes( { paddingBottom: val } ) }
                    />
                </PanelBody>

                { /* Colors */ }
                <PanelBody title={ __( 'Colors', 'zenctuary' ) } initialOpen={ false }>
                    <p style={ { color: '#ccc', fontSize: '12px', marginBottom: '8px' } }>
                        { __( 'Background Color', 'zenctuary' ) }
                    </p>
                    <ColorPicker
                        color={ backgroundColor }
                        onChange={ ( val ) => setAttributes( { backgroundColor: val } ) }
                        enableAlpha={ false }
                    />
                    <Divider />
                    <p style={ { color: '#ccc', fontSize: '12px', marginBottom: '8px' } }>
                        { __( 'Heading Color', 'zenctuary' ) }
                    </p>
                    <ColorPicker
                        color={ headingColor }
                        onChange={ ( val ) => setAttributes( { headingColor: val } ) }
                        enableAlpha={ false }
                    />
                    <Divider />
                    <p style={ { color: '#ccc', fontSize: '12px', marginBottom: '8px' } }>
                        { __( 'Text / Description Color', 'zenctuary' ) }
                    </p>
                    <ColorPicker
                        color={ textColor }
                        onChange={ ( val ) => setAttributes( { textColor: val } ) }
                        enableAlpha={ false }
                    />
                    <Divider />
                    <p style={ { color: '#ccc', fontSize: '12px', marginBottom: '8px' } }>
                        { __( 'Accent Color (Numbers & Icons)', 'zenctuary' ) }
                    </p>
                    <ColorPicker
                        color={ accentColor }
                        onChange={ ( val ) => setAttributes( { accentColor: val } ) }
                        enableAlpha={ false }
                    />
                </PanelBody>

                { /* Repeater: items */ }
                <PanelBody title={ __( `Feature Items (${ items.length })`, 'zenctuary' ) } initialOpen={ true }>

                    { items.map( ( item, index ) => (
                        <div
                            key={ index }
                            style={ {
                                border: '1px solid #444',
                                borderRadius: '6px',
                                marginBottom: '12px',
                                overflow: 'hidden',
                            } }
                        >
                            { /* Item accordion header */ }
                            <div
                                role="button"
                                tabIndex={ 0 }
                                style={ {
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '10px 14px',
                                    background: openItemIndex === index ? '#2a2a2a' : '#333',
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                } }
                                onClick={ () => setOpenItemIndex( openItemIndex === index ? null : index ) }
                                onKeyDown={ ( e ) => e.key === 'Enter' && setOpenItemIndex( openItemIndex === index ? null : index ) }
                            >
                                <span style={ { color: accentColor, fontWeight: 700, fontSize: '12px', marginRight: '8px' } }>
                                    { padNumber( index + 1 ) }
                                </span>
                                <span style={ { color: '#fff', fontSize: '13px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }>
                                    { item.title || __( '(untitled)', 'zenctuary' ) }
                                </span>
                                <span style={ { color: '#aaa', fontSize: '16px' } }>
                                    { openItemIndex === index ? '▲' : '▼' }
                                </span>
                            </div>

                            { /* Item accordion body */ }
                            { openItemIndex === index && (
                                <div style={ { padding: '14px', background: '#222', display: 'flex', flexDirection: 'column', gap: '12px' } }>

                                    { /* Icon upload */ }
                                    <div>
                                        <p style={ { color: '#aaa', fontSize: '12px', marginBottom: '8px' } }>
                                            { __( 'Icon / Image', 'zenctuary' ) }
                                        </p>
                                        { item.iconUrl ? (
                                            <div style={ { display: 'flex', alignItems: 'center', gap: '12px' } }>
                                                <img
                                                    src={ item.iconUrl }
                                                    alt={ item.iconAlt }
                                                    style={ { width: '56px', height: '56px', objectFit: 'contain', background: '#333', borderRadius: '4px', padding: '4px' } }
                                                />
                                                <TextControl
                                                    label={ __( 'Alt Text', 'zenctuary' ) }
                                                    value={ item.iconAlt }
                                                    onChange={ ( val ) => updateItem( index, 'iconAlt', val ) }
                                                    style={ { flex: 1 } }
                                                />
                                                <Button
                                                    variant="secondary"
                                                    isDestructive
                                                    onClick={ () => updateItem( index, 'iconUrl', '' ) }
                                                    style={ { alignSelf: 'flex-end' } }
                                                >
                                                    { __( 'Remove', 'zenctuary' ) }
                                                </Button>
                                            </div>
                                        ) : (
                                            <MediaUploadCheck>
                                                <MediaUpload
                                                    onSelect={ ( media ) => {
                                                        updateItem( index, 'iconUrl', media.url );
                                                        updateItem( index, 'iconId', media.id );
                                                        updateItem( index, 'iconAlt', media.alt || '' );
                                                    } }
                                                    allowedTypes={ [ 'image' ] }
                                                    value={ item.iconId }
                                                    render={ ( { open } ) => (
                                                        <Button variant="secondary" onClick={ open } style={ { width: '100%', justifyContent: 'center' } }>
                                                            { __( '+ Upload Icon / Image', 'zenctuary' ) }
                                                        </Button>
                                                    ) }
                                                />
                                            </MediaUploadCheck>
                                        ) }
                                    </div>

                                    <TextControl
                                        label={ __( 'Title', 'zenctuary' ) }
                                        value={ item.title }
                                        onChange={ ( val ) => updateItem( index, 'title', val ) }
                                        placeholder={ __( 'FEATURE TITLE', 'zenctuary' ) }
                                    />

                                    <TextareaControl
                                        label={ __( 'Description', 'zenctuary' ) }
                                        value={ item.description }
                                        onChange={ ( val ) => updateItem( index, 'description', val ) }
                                        placeholder={ __( 'Short supporting description…', 'zenctuary' ) }
                                        rows={ 3 }
                                    />

                                    { /* Reorder + Delete controls */ }
                                    <div style={ { display: 'flex', gap: '8px', justifyContent: 'space-between', marginTop: '4px' } }>
                                        <div style={ { display: 'flex', gap: '6px' } }>
                                            <Button
                                                variant="secondary"
                                                onClick={ () => moveItem( index, -1 ) }
                                                disabled={ index === 0 }
                                                title={ __( 'Move Up', 'zenctuary' ) }
                                            >
                                                ↑
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                onClick={ () => moveItem( index, 1 ) }
                                                disabled={ index === items.length - 1 }
                                                title={ __( 'Move Down', 'zenctuary' ) }
                                            >
                                                ↓
                                            </Button>
                                        </div>
                                        <Button
                                            variant="secondary"
                                            isDestructive
                                            onClick={ () => removeItem( index ) }
                                        >
                                            { __( 'Delete Item', 'zenctuary' ) }
                                        </Button>
                                    </div>

                                </div>
                            ) }
                        </div>
                    ) ) }

                    <Button
                        variant="primary"
                        onClick={ addItem }
                        style={ { width: '100%', justifyContent: 'center' } }
                    >
                        { __( '+ Add Feature Item', 'zenctuary' ) }
                    </Button>

                </PanelBody>

            </InspectorControls>

            { /* ══ Editor Canvas Preview ═══════════════════════════════════════ */ }
            <div
                style={ {
                    backgroundColor,
                    padding: '40px 48px',
                    borderRadius: '12px',
                    border: '2px dashed rgba(216,179,85,0.4)',
                } }
            >

                { /* Block badge */ }
                <div style={ { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' } }>
                    <span style={ { fontSize: '20px' } }>✨</span>
                    <span style={ { color: accentColor, fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em' } }>
                        { __( 'Why Zenctuary Block — Editor Preview', 'zenctuary' ) }
                    </span>
                </div>

                { /* Section heading preview */ }
                { heading && (
                    <h2 style={ {
                        color: headingColor,
                        fontFamily: '"Montserrat", sans-serif',
                        fontWeight: 700,
                        fontSize: '28px',
                        textTransform: 'uppercase',
                        marginBottom: subheading ? '12px' : '32px',
                    } }>
                        { heading }
                    </h2>
                ) }

                { subheading && (
                    <p style={ { color: textColor, opacity: 0.7, marginBottom: '32px', fontSize: '15px' } }>
                        { subheading }
                    </p>
                ) }

                { /* Features grid preview */ }
                <div style={ {
                    display: 'grid',
                    gridTemplateColumns: `repeat(${ columns }, 1fr)`,
                    gap: '32px 48px',
                } }>
                    { items.map( ( item, index ) => (
                        <div key={ index } style={ { display: 'flex', flexDirection: 'column', gap: '12px' } }>

                            { /* Number + Icon row */ }
                            <div style={ { display: 'flex', alignItems: 'flex-start', gap: '20px' } }>

                                { /* Auto number */ }
                                <span style={ {
                                    color: textColor,
                                    opacity: 0.5,
                                    fontFamily: '"DM Sans", sans-serif',
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    minWidth: '24px',
                                    paddingTop: '4px',
                                } }>
                                    { padNumber( index + 1 ) }
                                </span>

                                { /* Icon */ }
                                <div style={ { color: accentColor, flexShrink: 0 } }>
                                    { item.iconUrl ? (
                                        <img
                                            src={ item.iconUrl }
                                            alt={ item.iconAlt }
                                            style={ { width: '48px', height: '48px', objectFit: 'contain' } }
                                        />
                                    ) : (
                                        <div style={ { opacity: 0.5 } }>{ PLACEHOLDER_ICON }</div>
                                    ) }
                                </div>

                                { /* Title */ }
                                <div style={ { flex: 1 } }>
                                    <h3 style={ {
                                        color: textColor,
                                        fontFamily: '"Montserrat", sans-serif',
                                        fontWeight: 700,
                                        fontSize: '20px',
                                        textTransform: 'uppercase',
                                        lineHeight: 1.2,
                                        margin: 0,
                                    } }>
                                        { item.title || __( '(untitled)', 'zenctuary' ) }
                                    </h3>
                                </div>
                            </div>

                            { /* Description */ }
                            <p style={ {
                                color: textColor,
                                opacity: 0.75,
                                fontSize: '14px',
                                lineHeight: 1.6,
                                margin: '0 0 0 44px', // indent past number
                            } }>
                                { item.description }
                            </p>

                        </div>
                    ) ) }
                </div>

                { items.length === 0 && (
                    <Notice status="warning" isDismissible={ false }>
                        { __( 'No items yet. Click "+ Add Feature Item" in the settings panel to get started.', 'zenctuary' ) }
                    </Notice>
                ) }

            </div>
        </div>
    );
}
