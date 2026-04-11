import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    InspectorControls,
    MediaUpload,
    MediaUploadCheck,
} from '@wordpress/block-editor';
import {
    PanelBody,
    TextControl,
    TextareaControl,
    RangeControl,
    Button,
    ColorIndicator,
    Popover,
    ColorPicker,
    SelectControl,
    __experimentalDivider as Divider,
    Notice,
} from '@wordpress/components';
import { useState, useRef } from '@wordpress/element';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function padNumber( n ) {
    return String( n ).padStart( 2, '0' );
}

// Inline color-picker row (label + swatch + popover) — avoids the heavy full
// ColorPicker taking up too much sidebar space when showing multiple colors.
function ColorRow( { label, value, onChange } ) {
    const [ open, setOpen ] = useState( false );
    const ref = useRef();
    return (
        <div style={ { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' } }>
            <span style={ { fontSize: '12px', color: '#ccc' } }>{ label }</span>
            <div ref={ ref } style={ { position: 'relative' } }>
                <button
                    type="button"
                    onClick={ () => setOpen( ! open ) }
                    style={ {
                        background: 'none', border: '1px solid #555', borderRadius: '4px',
                        padding: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                    } }
                    aria-label={ label }
                >
                    <ColorIndicator colorValue={ value } />
                    <span style={ { fontSize: '11px', color: '#aaa', fontFamily: 'monospace' } }>{ value }</span>
                </button>
                { open && (
                    <Popover
                        placement="left-start"
                        onClose={ () => setOpen( false ) }
                        anchor={ ref.current }
                    >
                        <div style={ { padding: '8px' } }>
                            <ColorPicker
                                color={ value }
                                onChange={ onChange }
                                enableAlpha={ false }
                            />
                        </div>
                    </Popover>
                ) }
            </div>
        </div>
    );
}

// Placeholder SVG (meditation figure) used in editor canvas when no icon uploaded
const PLACEHOLDER_SVG = (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <circle cx="32" cy="12" r="6" stroke="currentColor" strokeWidth="2"/>
        <path d="M20 28c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M14 36l8-8M50 36l-8-8M20 28l-6 8M44 28l6 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M20 48c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M16 52h32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
);

// ─── Main Edit function ───────────────────────────────────────────────────────

export default function Edit( { attributes, setAttributes } ) {
    const {
        heading, subheading, items, columns,
        backgroundColor, headingColor, numberColor, iconColor, titleColor, descriptionColor,
        paddingTop, paddingBottom, paddingLeft, paddingRight,
        maxWidth, headingMarginBottom, rowGap, columnGap,
        gapNumIcon, gapIconContent, gapTitleDesc,
        headingFontSize, headingFontWeight, headingLetterSpacing, headingTextTransform,
        numberFontSize, numberMinWidth,
        titleFontSize, titleFontWeight, titleTextTransform, titleLineHeight,
        descFontSize, descLineHeight,
        iconSize,
    } = attributes;

    const [ openItemIndex, setOpenItemIndex ] = useState( null );
    const blockProps = useBlockProps();

    // ── Item helpers ──────────────────────────────────────────────────────────
    function updateItem( index, key, value ) {
        setAttributes( { items: items.map( ( item, i ) => i === index ? { ...item, [ key ]: value } : item ) } );
    }

    function addItem() {
        setAttributes( { items: [ ...items, { iconUrl: '', iconId: 0, iconAlt: '', title: 'NEW FEATURE', description: 'Describe this feature here.' } ] } );
        setOpenItemIndex( items.length );
    }

    function removeItem( index ) {
        setAttributes( { items: items.filter( ( _, i ) => i !== index ) } );
        setOpenItemIndex( null );
    }

    function moveItem( index, dir ) {
        const next = index + dir;
        if ( next < 0 || next >= items.length ) return;
        const updated = [ ...items ];
        [ updated[ index ], updated[ next ] ] = [ updated[ next ], updated[ index ] ];
        setAttributes( { items: updated } );
        setOpenItemIndex( next );
    }

    // ── Preview canvas styles ─────────────────────────────────────────────────
    const previewItemStyle = {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 0,
    };

    const numStyle = {
        flexShrink: 0,
        minWidth: `${ numberMinWidth }px`,
        marginRight: `${ gapNumIcon }px`,
        fontFamily: '"DM Sans", sans-serif',
        fontSize: `${ numberFontSize }px`,
        color: numberColor,
        opacity: 0.45,
        lineHeight: 1,
        paddingTop: '6px',
    };

    const iconWrapStyle = {
        flexShrink: 0,
        width: `${ iconSize }px`,
        height: `${ iconSize }px`,
        marginRight: `${ gapIconContent }px`,
        color: iconColor,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
    };

    const contentStyle = {
        flex: '1 1 0',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: `${ gapTitleDesc }px`,
    };

    const titleStyle = {
        fontFamily: '"Montserrat", sans-serif',
        fontSize: `${ titleFontSize }px`,
        fontWeight: titleFontWeight,
        lineHeight: titleLineHeight,
        textTransform: titleTextTransform,
        color: titleColor,
        margin: 0,
        letterSpacing: '0.01em',
    };

    const descStyle = {
        fontFamily: '"DM Sans", sans-serif',
        fontSize: `${ descFontSize }px`,
        lineHeight: descLineHeight,
        color: descriptionColor,
        opacity: 0.8,
        margin: 0,
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div { ...blockProps }>

            { /* ══════════════════════════ INSPECTOR CONTROLS ══════════════════════════ */ }
            <InspectorControls>

                { /* ── Content ──────────────────────────────────── */ }
                <PanelBody title={ __( 'Section Content', 'zenctuary' ) } initialOpen={ true }>
                    <TextControl
                        label={ __( 'Heading', 'zenctuary' ) }
                        value={ heading }
                        onChange={ ( v ) => setAttributes( { heading: v } ) }
                        placeholder="WHY ZENCTUARY?"
                    />
                    <TextareaControl
                        label={ __( 'Subheading (optional)', 'zenctuary' ) }
                        value={ subheading }
                        onChange={ ( v ) => setAttributes( { subheading: v } ) }
                        rows={ 2 }
                    />
                </PanelBody>

                { /* ── Colors ───────────────────────────────────── */ }
                <PanelBody title={ __( 'Colors', 'zenctuary' ) } initialOpen={ false }>
                    <ColorRow label={ __( 'Background', 'zenctuary' ) }      value={ backgroundColor }  onChange={ ( v ) => setAttributes( { backgroundColor: v } ) } />
                    <ColorRow label={ __( 'Section Heading', 'zenctuary' ) } value={ headingColor }      onChange={ ( v ) => setAttributes( { headingColor: v } ) } />
                    <ColorRow label={ __( 'Item Number', 'zenctuary' ) }     value={ numberColor }       onChange={ ( v ) => setAttributes( { numberColor: v } ) } />
                    <ColorRow label={ __( 'Icon Tint', 'zenctuary' ) }       value={ iconColor }         onChange={ ( v ) => setAttributes( { iconColor: v } ) } />
                    <ColorRow label={ __( 'Item Title', 'zenctuary' ) }      value={ titleColor }        onChange={ ( v ) => setAttributes( { titleColor: v } ) } />
                    <ColorRow label={ __( 'Description', 'zenctuary' ) }     value={ descriptionColor }  onChange={ ( v ) => setAttributes( { descriptionColor: v } ) } />
                </PanelBody>

                { /* ── Section Padding ─────────────────────────── */ }
                <PanelBody title={ __( 'Section Padding', 'zenctuary' ) } initialOpen={ false }>
                    <RangeControl label={ __( 'Top (px)',    'zenctuary' ) } value={ paddingTop }    min={ 0 } max={ 240 } step={ 8 } onChange={ ( v ) => setAttributes( { paddingTop: v } ) } />
                    <RangeControl label={ __( 'Bottom (px)', 'zenctuary' ) } value={ paddingBottom } min={ 0 } max={ 240 } step={ 8 } onChange={ ( v ) => setAttributes( { paddingBottom: v } ) } />
                    <RangeControl label={ __( 'Left (px)',   'zenctuary' ) } value={ paddingLeft }   min={ 0 } max={ 240 } step={ 8 } onChange={ ( v ) => setAttributes( { paddingLeft: v } ) } />
                    <RangeControl label={ __( 'Right (px)',  'zenctuary' ) } value={ paddingRight }  min={ 0 } max={ 240 } step={ 8 } onChange={ ( v ) => setAttributes( { paddingRight: v } ) } />
                </PanelBody>

                { /* ── Layout ───────────────────────────────────── */ }
                <PanelBody title={ __( 'Layout & Grid', 'zenctuary' ) } initialOpen={ false }>
                    <SelectControl
                        label={ __( 'Desktop Columns', 'zenctuary' ) }
                        value={ String( columns ) }
                        options={ [ { label: '1', value: '1' }, { label: '2', value: '2' }, { label: '3', value: '3' } ] }
                        onChange={ ( v ) => setAttributes( { columns: parseInt( v, 10 ) } ) }
                        help={ __( 'Mobile always falls back to 1 column.', 'zenctuary' ) }
                    />
                    <RangeControl label={ __( 'Max Content Width (px)', 'zenctuary' ) } value={ maxWidth }            min={ 800 } max={ 1920 } step={ 40 } onChange={ ( v ) => setAttributes( { maxWidth: v } ) } />
                    <RangeControl label={ __( 'Column Gap (px)', 'zenctuary' ) }        value={ columnGap }           min={ 16 }  max={ 160 } step={ 4 }  onChange={ ( v ) => setAttributes( { columnGap: v } ) } />
                    <RangeControl label={ __( 'Row Gap (px)', 'zenctuary' ) }           value={ rowGap }              min={ 16 }  max={ 120 } step={ 4 }  onChange={ ( v ) => setAttributes( { rowGap: v } ) } />
                    <RangeControl label={ __( 'Heading → Grid Gap (px)', 'zenctuary' ) } value={ headingMarginBottom } min={ 0 }   max={ 120 } step={ 4 }  onChange={ ( v ) => setAttributes( { headingMarginBottom: v } ) } />
                </PanelBody>

                { /* ── Item Internal Spacing ────────────────────── */ }
                <PanelBody title={ __( 'Item Spacing', 'zenctuary' ) } initialOpen={ false }>
                    <RangeControl label={ __( 'Number → Icon gap (px)',    'zenctuary' ) } value={ gapNumIcon }     min={ 4 }  max={ 48 } step={ 2 } onChange={ ( v ) => setAttributes( { gapNumIcon: v } ) } />
                    <RangeControl label={ __( 'Icon → Content gap (px)',   'zenctuary' ) } value={ gapIconContent } min={ 4 }  max={ 48 } step={ 2 } onChange={ ( v ) => setAttributes( { gapIconContent: v } ) } />
                    <RangeControl label={ __( 'Title → Description gap (px)', 'zenctuary' ) } value={ gapTitleDesc } min={ 4 } max={ 40 } step={ 2 } onChange={ ( v ) => setAttributes( { gapTitleDesc: v } ) } />
                </PanelBody>

                { /* ── Typography ───────────────────────────────── */ }
                <PanelBody title={ __( 'Typography', 'zenctuary' ) } initialOpen={ false }>

                    <p style={ { fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#aaa', marginBottom: '8px' } }>Section Heading</p>
                    <RangeControl label={ __( 'Font Size (px)',    'zenctuary' ) } value={ headingFontSize }      min={ 18 } max={ 72 } step={ 1 } onChange={ ( v ) => setAttributes( { headingFontSize: v } ) } />
                    <SelectControl label={ __( 'Font Weight', 'zenctuary' ) }     value={ headingFontWeight }
                        options={ [ { label: '400 — Regular', value: '400' }, { label: '600 — Semi-bold', value: '600' }, { label: '700 — Bold', value: '700' } ] }
                        onChange={ ( v ) => setAttributes( { headingFontWeight: v } ) }
                    />
                    <SelectControl label={ __( 'Text Transform', 'zenctuary' ) } value={ headingTextTransform }
                        options={ [ { label: 'Uppercase', value: 'uppercase' }, { label: 'Capitalize', value: 'capitalize' }, { label: 'None', value: 'none' } ] }
                        onChange={ ( v ) => setAttributes( { headingTextTransform: v } ) }
                    />
                    <RangeControl label={ __( 'Letter Spacing (em)', 'zenctuary' ) } value={ headingLetterSpacing } min={ 0 } max={ 0.2 } step={ 0.005 } onChange={ ( v ) => setAttributes( { headingLetterSpacing: v } ) } />

                    <Divider />

                    <p style={ { fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#aaa', marginBottom: '8px' } }>Number</p>
                    <RangeControl label={ __( 'Font Size (px)',  'zenctuary' ) } value={ numberFontSize } min={ 10 } max={ 24 } step={ 1 } onChange={ ( v ) => setAttributes( { numberFontSize: v } ) } />
                    <RangeControl label={ __( 'Min Width (px)', 'zenctuary' ) } value={ numberMinWidth } min={ 16 } max={ 48 } step={ 2 } onChange={ ( v ) => setAttributes( { numberMinWidth: v } ) } />

                    <Divider />

                    <p style={ { fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#aaa', marginBottom: '8px' } }>Item Title</p>
                    <RangeControl label={ __( 'Font Size (px)', 'zenctuary' ) } value={ titleFontSize } min={ 14 } max={ 48 } step={ 1 } onChange={ ( v ) => setAttributes( { titleFontSize: v } ) } />
                    <SelectControl label={ __( 'Font Weight', 'zenctuary' ) }   value={ titleFontWeight }
                        options={ [ { label: '400 — Regular', value: '400' }, { label: '600 — Semi-bold', value: '600' }, { label: '700 — Bold', value: '700' } ] }
                        onChange={ ( v ) => setAttributes( { titleFontWeight: v } ) }
                    />
                    <SelectControl label={ __( 'Text Transform', 'zenctuary' ) } value={ titleTextTransform }
                        options={ [ { label: 'Uppercase', value: 'uppercase' }, { label: 'Capitalize', value: 'capitalize' }, { label: 'None', value: 'none' } ] }
                        onChange={ ( v ) => setAttributes( { titleTextTransform: v } ) }
                    />
                    <RangeControl label={ __( 'Line Height', 'zenctuary' ) } value={ titleLineHeight } min={ 1 } max={ 2 } step={ 0.05 } onChange={ ( v ) => setAttributes( { titleLineHeight: v } ) } />

                    <Divider />

                    <p style={ { fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#aaa', marginBottom: '8px' } }>Description</p>
                    <RangeControl label={ __( 'Font Size (px)', 'zenctuary' ) } value={ descFontSize }  min={ 12 } max={ 24 } step={ 1 } onChange={ ( v ) => setAttributes( { descFontSize: v } ) } />
                    <RangeControl label={ __( 'Line Height',   'zenctuary' ) } value={ descLineHeight } min={ 1 }  max={ 2 }  step={ 0.05 } onChange={ ( v ) => setAttributes( { descLineHeight: v } ) } />

                    <Divider />

                    <p style={ { fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#aaa', marginBottom: '8px' } }>Icon</p>
                    <RangeControl label={ __( 'Icon Size (px)', 'zenctuary' ) } value={ iconSize } min={ 24 } max={ 96 } step={ 4 } onChange={ ( v ) => setAttributes( { iconSize: v } ) } />

                </PanelBody>

                { /* ── Feature Items Repeater ───────────────────── */ }
                <PanelBody title={ __( `Feature Items (${ items.length })`, 'zenctuary' ) } initialOpen={ true }>

                    { items.map( ( item, index ) => (
                        <div
                            key={ index }
                            style={ { border: '1px solid #444', borderRadius: '6px', marginBottom: '10px', overflow: 'hidden' } }
                        >
                            { /* Accordion row */ }
                            <div
                                role="button"
                                tabIndex={ 0 }
                                style={ {
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    padding: '9px 12px',
                                    background: openItemIndex === index ? '#2a2a2a' : '#333',
                                    cursor: 'pointer', userSelect: 'none',
                                } }
                                onClick={ () => setOpenItemIndex( openItemIndex === index ? null : index ) }
                                onKeyDown={ ( e ) => e.key === 'Enter' && setOpenItemIndex( openItemIndex === index ? null : index ) }
                            >
                                <span style={ { color: iconColor, fontWeight: 700, fontSize: '11px', minWidth: '22px' } }>
                                    { padNumber( index + 1 ) }
                                </span>
                                <span style={ { color: '#fff', fontSize: '13px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }>
                                    { item.title || __( '(untitled)', 'zenctuary' ) }
                                </span>
                                <span style={ { color: '#aaa' } }>{ openItemIndex === index ? '▲' : '▼' }</span>
                            </div>

                            { /* Accordion body */ }
                            { openItemIndex === index && (
                                <div style={ { padding: '12px', background: '#1e1e1e', display: 'flex', flexDirection: 'column', gap: '12px' } }>

                                    { /* Icon upload */ }
                                    <div>
                                        <p style={ { color: '#aaa', fontSize: '12px', margin: '0 0 8px' } }>{ __( 'Icon / Image', 'zenctuary' ) }</p>
                                        { item.iconUrl ? (
                                            <div style={ { display: 'flex', alignItems: 'center', gap: '12px' } }>
                                                <img src={ item.iconUrl } alt={ item.iconAlt }
                                                    style={ { width: '48px', height: '48px', objectFit: 'contain', background: '#333', borderRadius: '4px', padding: '4px' } } />
                                                <div style={ { flex: 1 } }>
                                                    <TextControl
                                                        label={ __( 'Alt Text', 'zenctuary' ) }
                                                        value={ item.iconAlt }
                                                        onChange={ ( v ) => updateItem( index, 'iconAlt', v ) }
                                                    />
                                                </div>
                                                <Button variant="secondary" isDestructive onClick={ () => {
                                                    updateItem( index, 'iconUrl', '' );
                                                    updateItem( index, 'iconId', 0 );
                                                } }>
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
                                        onChange={ ( v ) => updateItem( index, 'title', v ) }
                                        placeholder="FEATURE TITLE"
                                    />

                                    <TextareaControl
                                        label={ __( 'Description', 'zenctuary' ) }
                                        value={ item.description }
                                        onChange={ ( v ) => updateItem( index, 'description', v ) }
                                        rows={ 3 }
                                    />

                                    <div style={ { display: 'flex', gap: '8px', justifyContent: 'space-between' } }>
                                        <div style={ { display: 'flex', gap: '6px' } }>
                                            <Button variant="secondary" onClick={ () => moveItem( index, -1 ) } disabled={ index === 0 } title={ __( 'Move Up', 'zenctuary' ) }>↑</Button>
                                            <Button variant="secondary" onClick={ () => moveItem( index,  1 ) } disabled={ index === items.length - 1 } title={ __( 'Move Down', 'zenctuary' ) }>↓</Button>
                                        </div>
                                        <Button variant="secondary" isDestructive onClick={ () => removeItem( index ) }>
                                            { __( 'Delete', 'zenctuary' ) }
                                        </Button>
                                    </div>

                                </div>
                            ) }
                        </div>
                    ) ) }

                    <Button variant="primary" onClick={ addItem } style={ { width: '100%', justifyContent: 'center' } }>
                        { __( '+ Add Feature Item', 'zenctuary' ) }
                    </Button>

                </PanelBody>

            </InspectorControls>

            { /* ══════════════════════════ CANVAS PREVIEW ══════════════════════════════
                 This renders the exact same structure as render.php so the editor
                 feel matches the frontend faithfully.
             ══════════════════════════════════════════════════════════════════════════ */ }
            <div style={ {
                backgroundColor,
                paddingTop: `${ paddingTop }px`,
                paddingBottom: `${ paddingBottom }px`,
                paddingLeft: `${ paddingLeft }px`,
                paddingRight: `${ paddingRight }px`,
                outline: '2px dashed rgba(216,179,85,0.3)',
                outlineOffset: '-1px',
            } }>
                <div style={ { maxWidth: `${ maxWidth }px` } }>

                    { /* Block label badge */ }
                    <div style={ { display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '20px' } }>
                        <span style={ { fontSize: '16px' } }>✨</span>
                        <span style={ { color: headingColor, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' } }>
                            WHY ZENCTUARY — EDITOR PREVIEW
                        </span>
                    </div>

                    { /* Section heading */ }
                    { heading && (
                        <div style={ { marginBottom: `${ headingMarginBottom }px` } }>
                            <h2 style={ {
                                fontFamily: '"Montserrat", sans-serif',
                                fontSize: `${ headingFontSize }px`,
                                fontWeight: headingFontWeight,
                                textTransform: headingTextTransform,
                                letterSpacing: `${ headingLetterSpacing }em`,
                                color: headingColor,
                                margin: 0,
                                lineHeight: 1.2,
                            } }>{ heading }</h2>
                            { subheading && (
                                <p style={ { color: descriptionColor, opacity: 0.7, fontSize: `${ descFontSize }px`, margin: '10px 0 0' } }>{ subheading }</p>
                            ) }
                        </div>
                    ) }

                    { /* Items grid — mirrors CSS grid */ }
                    { items.length > 0 ? (
                        <ul style={ {
                            listStyle: 'none', margin: 0, padding: 0,
                            display: 'grid',
                            gridTemplateColumns: `repeat(${ columns }, 1fr)`,
                            rowGap: `${ rowGap }px`,
                            columnGap: `${ columnGap }px`,
                        } }>
                            { items.map( ( item, index ) => (
                                <li key={ index } style={ previewItemStyle }>

                                    { /* Zone 1: Number */ }
                                    <span style={ numStyle }>{ padNumber( index + 1 ) }</span>

                                    { /* Zone 2: Icon */ }
                                    <div style={ iconWrapStyle }>
                                        { item.iconUrl ? (
                                            <img src={ item.iconUrl } alt={ item.iconAlt }
                                                style={ { width: `${ iconSize }px`, height: `${ iconSize }px`, objectFit: 'contain', display: 'block' } } />
                                        ) : (
                                            <div style={ { width: `${ iconSize }px`, height: `${ iconSize }px`, color: iconColor, opacity: 0.6 } }>{ PLACEHOLDER_SVG }</div>
                                        ) }
                                    </div>

                                    { /* Zone 3: Content */ }
                                    <div style={ contentStyle }>
                                        <h3 style={ titleStyle }>{ item.title || '(untitled)' }</h3>
                                        { item.description && (
                                            <p style={ descStyle }>{ item.description }</p>
                                        ) }
                                    </div>

                                </li>
                            ) ) }
                        </ul>
                    ) : (
                        <Notice status="warning" isDismissible={ false }>
                            { __( 'No items yet. Open "Feature Items" in the sidebar to add some.', 'zenctuary' ) }
                        </Notice>
                    ) }

                </div>
            </div>
        </div>
    );
}
