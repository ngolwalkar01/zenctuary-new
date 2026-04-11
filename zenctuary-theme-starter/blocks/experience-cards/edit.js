import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, ToggleControl, TextControl } from '@wordpress/components';
import { useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

export default function Edit( { attributes, setAttributes } ) {
    const {
        heading, description, categorySlug,
        showZencoins, showDuration, showIncludes, showBestFor,
        showBookBtn, bookBtnLabel,
    } = attributes;

    const blockProps = useBlockProps();

    const [ categoryOptions, setCategoryOptions ] = useState( [
        { label: __( 'Loading…', 'zenctuary' ), value: '' },
    ] );

    useEffect( () => {
        apiFetch( { path: '/wp/v2/experience_category?per_page=100&_fields=id,slug,name' } )
            .then( ( terms ) => {
                const opts = terms.map( ( t ) => ( { label: t.name, value: t.slug } ) );
                setCategoryOptions( [
                    { label: __( '— Select Category —', 'zenctuary' ), value: '' },
                    ...opts,
                ] );
            } )
            .catch( () =>
                setCategoryOptions( [ { label: __( 'Could not load categories', 'zenctuary' ), value: '' } ] )
            );
    }, [] );

    return (
        <div { ...blockProps }>
            <InspectorControls>
                <PanelBody title={ __( 'Query', 'zenctuary' ) } initialOpen={ true }>
                    <SelectControl
                        label={ __( 'Experience Category', 'zenctuary' ) }
                        value={ categorySlug }
                        options={ categoryOptions }
                        onChange={ ( val ) => setAttributes( { categorySlug: val } ) }
                        help={ __( 'Products in this category will be shown as cards.', 'zenctuary' ) }
                    />
                </PanelBody>
                <PanelBody title={ __( 'Card Fields', 'zenctuary' ) } initialOpen={ false }>
                    <ToggleControl label={ __( 'Show Zencoins', 'zenctuary' ) }     checked={ showZencoins } onChange={ ( v ) => setAttributes( { showZencoins: v } ) } />
                    <ToggleControl label={ __( 'Show Duration', 'zenctuary' ) }     checked={ showDuration } onChange={ ( v ) => setAttributes( { showDuration: v } ) } />
                    <ToggleControl label={ __( 'Show Includes', 'zenctuary' ) }     checked={ showIncludes } onChange={ ( v ) => setAttributes( { showIncludes: v } ) } />
                    <ToggleControl label={ __( 'Show Best For', 'zenctuary' ) }     checked={ showBestFor }  onChange={ ( v ) => setAttributes( { showBestFor: v } ) } />
                    <ToggleControl label={ __( 'Show Book Button', 'zenctuary' ) }  checked={ showBookBtn }  onChange={ ( v ) => setAttributes( { showBookBtn: v } ) } />
                    { showBookBtn && (
                        <TextControl
                            label={ __( 'Button Label', 'zenctuary' ) }
                            value={ bookBtnLabel }
                            onChange={ ( v ) => setAttributes( { bookBtnLabel: v } ) }
                        />
                    ) }
                </PanelBody>
            </InspectorControls>

            {/* Editable heading + description */}
            <div style={ { textAlign: 'center', padding: '32px 24px 20px', background: '#2a2a2a', borderRadius: '12px 12px 0 0' } }>
                <RichText
                    tagName="h2"
                    value={ heading }
                    onChange={ ( val ) => setAttributes( { heading: val } ) }
                    placeholder={ __( 'CHOOSE YOUR EXPERIENCE', 'zenctuary' ) }
                    style={ { color: '#D8B355', fontWeight: 800, fontSize: '28px', letterSpacing: '.1em', textAlign: 'center', margin: 0 } }
                    allowedFormats={ [] }
                />
                <RichText
                    tagName="p"
                    value={ description }
                    onChange={ ( val ) => setAttributes( { description: val } ) }
                    placeholder={ __( 'Add an optional intro paragraph…', 'zenctuary' ) }
                    style={ { color: '#ccc', margin: '12px auto 0', maxWidth: '720px', lineHeight: 1.7 } }
                    allowedFormats={ [ 'core/bold', 'core/italic' ] }
                />
            </div>

            {/* Card preview placeholders */}
            <div style={ { display: 'flex', gap: '16px', padding: '20px', background: '#1a1a1a', borderRadius: '0 0 12px 12px', minHeight: '320px', alignItems: 'stretch' } }>
                { [ 'Free Flow Session', 'Guided Session' ].map( ( label, i ) => (
                    <div key={ i } style={ {
                        flex: '1 1 50%', background: '#2c2c2c', borderRadius: '16px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        minHeight: '280px', border: '2px dashed #555', color: '#666', fontSize: '13px', gap: '8px'
                    } }>
                        <span style={ { fontSize: '28px' } }>🎫</span>
                        <strong style={ { color: '#888' } }>{ label }</strong>
                        <span style={ { fontSize: '11px', color: '#444' } }>
                            { `Category: ${ categorySlug || '—' }` }
                        </span>
                    </div>
                ) ) }
            </div>
        </div>
    );
}
