import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls, MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { PanelBody, SelectControl, RangeControl, TextControl, ToggleControl, Button, ColorPicker, Popover, TextareaControl } from '@wordpress/components';
import { useState, useRef, useEffect } from '@wordpress/element';

const Divider = () => <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #ddd' }} />;

// Compact Color Picker
function ColorRow( { label, value, onChange } ) {
    const [ open, setOpen ] = useState( false );
    const ref = useRef();
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px' }}>{ label }</span>
            <div style={{ position: 'relative' }}>
                <button
                    type="button"
                    ref={ ref }
                    onClick={ () => setOpen( !open ) }
                    style={{
                        background: 'transparent', border: 'none', padding: '0', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                    }}
                >
                    <div style={{ display: 'inline-block', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: value || 'transparent', border: '1px solid #ccc' }} />
                    <span style={{ fontSize: '11px', color: '#aaa', fontFamily: 'monospace' }}>{ value || 'none' }</span>
                </button>
                { open && (
                    <Popover placement="left-start" onClose={ () => setOpen( false ) } anchor={ ref.current }>
                        <div style={{ padding: '16px' }}>
                            <ColorPicker color={ value } onChange={ onChange } enableAlpha={ false } />
                        </div>
                    </Popover>
                ) }
            </div>
        </div>
    );
}

export default function Edit( { attributes, setAttributes, clientId } ) {
    const {
        panels = [],
        transitionDur = 0.6,
        sectionBgColor = '#f9f9f9',
        
        titleFontSize = 48, titleFontWeight = '400', titleLineHeight = 1.1, titleLetterSpacing = 0.05, titleTextTransform = 'uppercase', titleColor = '#ffffff',
        descFontSize = 16, descFontWeight = '400', descLineHeight = 1.5, descColor = '#ffffff',
        hotspotFontSize = 14, hotspotFontWeight = '500', hotspotLineHeight = 1.4, hotspotColor = '#ffffff',
        
        gapIconTitle = 24, gapTitleDesc = 16, gapHotspotIconText = 12, gapHotspotVertical = 24
    } = attributes;

    const blockProps = useBlockProps({
        className: 'zenctuary-experience-panels',
        style: {
            '--zep-dur': `${transitionDur}s`,
            '--zep-bg': sectionBgColor,
            '--zep-tt-fs': `${titleFontSize}px`,
            '--zep-tt-fw': titleFontWeight,
            '--zep-tt-lh': titleLineHeight,
            '--zep-tt-ls': `${titleLetterSpacing}em`,
            '--zep-tt-tc': titleTextTransform,
            '--zep-tt-c': titleColor,
            '--zep-desc-fs': `${descFontSize}px`,
            '--zep-desc-fw': descFontWeight,
            '--zep-desc-lh': descLineHeight,
            '--zep-desc-c': descColor,
            '--zep-hot-fs': `${hotspotFontSize}px`,
            '--zep-hot-fw': hotspotFontWeight,
            '--zep-hot-lh': hotspotLineHeight,
            '--zep-hot-c': hotspotColor,
            '--zep-gap-it': `${gapIconTitle}px`,
            '--zep-gap-td': `${gapTitleDesc}px`,
            '--zep-gap-hot-it': `${gapHotspotIconText}px`,
            '--zep-gap-hot-v': `${gapHotspotVertical}px`,
        }
    });

    // Helper for modifying the primary Panels array safely
    const updatePanelField = (index, key, val) => {
        const newPanels = [...panels];
        newPanels[index] = { ...newPanels[index], [key]: val };
        setAttributes({ panels: newPanels });
    };

    // Helper for nested Array modification (Left/Right Hotspots)
    const updateHotspotField = (panelIndex, side, hsIndex, key, val) => {
        const newPanels = [...panels];
        const newHotspots = [...(newPanels[panelIndex][side] || [])];
        if (!newHotspots[hsIndex]) newHotspots[hsIndex] = {};
        newHotspots[hsIndex] = { ...newHotspots[hsIndex], [key]: val };
        newPanels[panelIndex] = { ...newPanels[panelIndex], [side]: newHotspots };
        setAttributes({ panels: newPanels });
    };

    const addHotspot = (panelIndex, side) => {
        const newPanels = [...panels];
        const hsArray = newPanels[panelIndex][side] || [];
        newPanels[panelIndex] = { 
            ...newPanels[panelIndex], 
            [side]: [...hsArray, { description: 'New Hotspot', linkEnable: false }] 
        };
        setAttributes({ panels: newPanels });
    };

    const removeHotspot = (panelIndex, side, hsIndex) => {
        const newPanels = [...panels];
        const hsArray = [...(newPanels[panelIndex][side] || [])];
        hsArray.splice(hsIndex, 1);
        newPanels[panelIndex] = { ...newPanels[panelIndex], [side]: hsArray };
        setAttributes({ panels: newPanels });
    };

    // -1 represents the 'Null' grouped neutral state exactly mimicking frontend.
    const [editorActiveIndex, setEditorActiveIndex] = useState(-1);

    const fwOptions = [{label:'300',value:'300'},{label:'400',value:'400'},{label:'500',value:'500'},{label:'600',value:'600'},{label:'700',value:'700'}];
    const ttOptions = [{label:'None',value:'none'},{label:'Uppercase',value:'uppercase'},{label:'Lowercase',value:'lowercase'}];
    const bgTransOpts = [{label:'Fade Only',value:'fade'},{label:'Fade & Zoom',value:'fade-zoom'},{label:'None',value:'none'}];
    const contentTransOpts = [{label:'Slide Up',value:'slide-up'},{label:'Slide Left',value:'slide-left'},{label:'Slide Right',value:'slide-right'},{label:'None',value:'none'}];

    return (
        <div { ...blockProps }>
            <InspectorControls>
                <PanelBody title="1. Global Configuration" initialOpen={true}>
                    <ToggleControl 
                        label="Enable Content Animation" 
                        checked={ attributes.enableContentAnim } 
                        onChange={ v => setAttributes({ enableContentAnim: v }) } 
                    />
                    <RangeControl label="Hover Transition Duration (s)" value={ transitionDur } min={0.2} max={1.5} step={0.1} onChange={ v => setAttributes({ transitionDur: v }) } />
                    
                    <Divider />
                    <ColorRow label="Section Background" value={ sectionBgColor } onChange={ v => setAttributes({ sectionBgColor: v }) } />
                </PanelBody>

                <PanelBody title="2. Global Typography" initialOpen={false}>
                    <h3 style={{ fontSize:'12px',textTransform:'uppercase',color:'#888',margin:'0 0 8px' }}>Center Title</h3>
                    <RangeControl label="Font Size" value={ titleFontSize } min={16} max={96} step={1} onChange={ v => setAttributes({ titleFontSize: v }) } />
                    <SelectControl label="Font Weight" value={ titleFontWeight } options={ fwOptions } onChange={ v => setAttributes({ titleFontWeight: v }) } />
                    <SelectControl label="Text Transform" value={ titleTextTransform } options={ ttOptions } onChange={ v => setAttributes({ titleTextTransform: v }) } />
                    <ColorRow label="Title Color" value={ titleColor } onChange={ v => setAttributes({ titleColor: v }) } />
                    
                    <Divider />
                    <h3 style={{ fontSize:'12px',textTransform:'uppercase',color:'#888',margin:'0 0 8px' }}>Center Description</h3>
                    <RangeControl label="Font Size" value={ descFontSize } min={10} max={32} step={1} onChange={ v => setAttributes({ descFontSize: v }) } />
                    <SelectControl label="Font Weight" value={ descFontWeight } options={ fwOptions } onChange={ v => setAttributes({ descFontWeight: v }) } />
                    <ColorRow label="Desc Color" value={ descColor } onChange={ v => setAttributes({ descColor: v }) } />
                    
                    <Divider />
                    <h3 style={{ fontSize:'12px',textTransform:'uppercase',color:'#888',margin:'0 0 8px' }}>Hotspots</h3>
                    <RangeControl label="Font Size" value={ hotspotFontSize } min={10} max={32} step={1} onChange={ v => setAttributes({ hotspotFontSize: v }) } />
                    <ColorRow label="Text Color" value={ hotspotColor } onChange={ v => setAttributes({ hotspotColor: v }) } />
                </PanelBody>

                <PanelBody title="3. Manage Panels" initialOpen={false}>
                    { panels.map((panel, pIndex) => (
                        <div key={pIndex} style={{ border: '1px solid #444', borderRadius: '4px', padding: '12px', marginBottom: '16px', background: '#1e1e1e' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <strong style={{ fontSize: '14px' }}>Panel {pIndex + 1}</strong>
                                <Button isDestructive variant="link" onClick={() => {
                                    const newPanels = [...panels];
                                    newPanels.splice(pIndex, 1);
                                    setAttributes({ panels: newPanels });
                                }}>Remove Panel</Button>
                            </div>
                            
                            {/* Editor Only - Force Preview */}
                            <Button 
                                variant={editorActiveIndex === pIndex ? "primary" : "secondary"} 
                                onClick={() => setEditorActiveIndex(pIndex)} 
                                style={{ width: '100%', justifyContent: 'center', marginBottom: '16px' }}
                            >
                                {editorActiveIndex === pIndex ? 'Currently Previewing' : 'Click to Set as Editor Preview'}
                            </Button>

                            <TextControl label="Center Title" value={ panel.centerTitle || '' } onChange={ v => updatePanelField(pIndex, 'centerTitle', v) } />
                            <TextareaControl label="Center Description" value={ panel.centerDescription || '' } onChange={ v => updatePanelField(pIndex, 'centerDescription', v) } />
                            
                            <Divider />
                            
                            <MediaUploadCheck>
                                <MediaUpload
                                    onSelect={ media => {
                                        updatePanelField(pIndex, 'centerIconId', media.id);
                                        updatePanelField(pIndex, 'centerIconUrl', media.url);
                                        updatePanelField(pIndex, 'centerIconAlt', media.alt);
                                    }}
                                    allowedTypes={ ['image'] }
                                    value={ panel.centerIconId }
                                    render={ ({ open }) => (
                                        <Button variant="secondary" onClick={ open } style={{ width: '100%', justifyContent: 'center', marginBottom: '16px' }}>
                                            { panel.centerIconUrl ? 'Change Center Icon' : 'Set Center Icon' }
                                        </Button>
                                    )}
                                />
                            </MediaUploadCheck>
                            { panel.centerIconUrl && (
                                <Button variant="link" isDestructive onClick={ () => { updatePanelField(pIndex, 'centerIconUrl', ''); updatePanelField(pIndex, 'centerIconId', 0); } }>Remove Center Icon</Button>
                            ) }

                            <Divider />
                            <h4 style={{ margin: '0 0 12px 0' }}>Background Layer</h4>
                            <MediaUploadCheck>
                                <MediaUpload
                                    onSelect={ media => {
                                        updatePanelField(pIndex, 'defaultBgImageId', media.id);
                                        updatePanelField(pIndex, 'defaultBgImageUrl', media.url);
                                        updatePanelField(pIndex, 'defaultBgImageAlt', media.alt);
                                    }}
                                    allowedTypes={ ['image'] }
                                    value={ panel.defaultBgImageId }
                                    render={ ({ open }) => (
                                        <Button variant="secondary" onClick={ open } style={{ width: '100%', justifyContent: 'center', marginBottom: '8px' }}>
                                            { panel.defaultBgImageUrl ? 'Change Default Base Image' : 'Set Default Base Image' }
                                        </Button>
                                    )}
                                />
                            </MediaUploadCheck>
                            { panel.defaultBgImageUrl && (
                                <Button variant="link" isDestructive onClick={ () => { updatePanelField(pIndex, 'defaultBgImageUrl', ''); updatePanelField(pIndex, 'defaultBgImageId', 0); } } style={{ display:'block', marginBottom:'8px' }}>Remove Default Base Image</Button>
                            ) }

                            <MediaUploadCheck>
                                <MediaUpload
                                    onSelect={ media => {
                                        updatePanelField(pIndex, 'activeBgImageId', media.id);
                                        updatePanelField(pIndex, 'activeBgImageUrl', media.url);
                                        updatePanelField(pIndex, 'activeBgImageAlt', media.alt);
                                    }}
                                    allowedTypes={ ['image'] }
                                    value={ panel.activeBgImageId }
                                    render={ ({ open }) => (
                                        <Button variant="secondary" onClick={ open } style={{ width: '100%', justifyContent: 'center', marginBottom: '8px' }}>
                                            { panel.activeBgImageUrl ? 'Change Active Hover Image' : 'Set Active Hover Image' }
                                        </Button>
                                    )}
                                />
                            </MediaUploadCheck>
                            { panel.activeBgImageUrl && (
                                <Button variant="link" isDestructive onClick={ () => { updatePanelField(pIndex, 'activeBgImageUrl', ''); updatePanelField(pIndex, 'activeBgImageId', 0); } } style={{ display:'block', marginBottom:'8px' }}>Remove Active Hover Image</Button>
                            ) }
                            
                            <Divider />
                            <h4 style={{ margin: '0 0 12px 0' }}>Animations</h4>
                            <SelectControl label="Background Swap Transition" value={ panel.bgTransition || 'fade' } options={ bgTransOpts } onChange={ v => updatePanelField(pIndex, 'bgTransition', v) } />
                            <SelectControl label="Content Reveal Transition" value={ panel.contentTransition || 'slide-up' } options={ contentTransOpts } onChange={ v => updatePanelField(pIndex, 'contentTransition', v) } />

                            <Divider />
                            
                            <div style={{ marginBottom: '16px' }}>
                                <ToggleControl label="Enable Dark Overlay" checked={ panel.overlayEnable ?? true } onChange={ v => updatePanelField(pIndex, 'overlayEnable', v) } />
                                { (panel.overlayEnable ?? true) && (
                                    <>
                                        <ColorRow label="Overlay Color" value={ panel.overlayColor } onChange={ v => updatePanelField(pIndex, 'overlayColor', v) } />
                                        <RangeControl label="Overlay Opacity" value={ panel.overlayOpacity ?? 0.5 } min={0} max={1} step={0.05} onChange={ v => updatePanelField(pIndex, 'overlayOpacity', v) } />
                                    </>
                                )}
                            </div>

                            <Divider />
                            
                            {/* Hotspots Arrays Manager */}
                            {['leftHotspots', 'rightHotspots'].map(side => (
                                <div key={side} style={{ background: '#2a2a2a', padding: '12px', borderRadius: '4px', marginBottom: '16px' }}>
                                    <h4 style={{ margin: '0 0 12px 0' }}>{side === 'leftHotspots' ? 'Left Side Hotspots' : 'Right Side Hotspots'}</h4>
                                    
                                    { (panel[side] || []).map((hot, hIndex) => (
                                        <div key={hIndex} style={{ border: '1px solid #555', padding: '10px', marginBottom: '8px', borderRadius: '4px' }}>
                                            <TextControl label="Description Text" value={ hot.description || '' } onChange={ v => updateHotspotField(pIndex, side, hIndex, 'description', v) } />
                                            <MediaUploadCheck>
                                                <MediaUpload
                                                    onSelect={ m => {
                                                        updateHotspotField(pIndex, side, hIndex, 'iconUrl', m.url);
                                                        updateHotspotField(pIndex, side, hIndex, 'iconId', m.id);
                                                        updateHotspotField(pIndex, side, hIndex, 'iconAlt', m.alt);
                                                    }}
                                                    allowedTypes={ ['image'] }
                                                    value={ hot.iconId }
                                                    render={ ({ open }) => (
                                                        <Button variant="secondary" onClick={ open } style={{ marginBottom: '8px' }}>
                                                            { hot.iconUrl ? 'Change Hotspot Icon' : 'Set Icon' }
                                                        </Button>
                                                    )}
                                                />
                                            </MediaUploadCheck>
                                            
                                            {/* Scalability Future Fields */}
                                            <div style={{ marginTop: '8px' }}>
                                                <ToggleControl label="Enable Clickable Link" checked={ hot.linkEnable || false } onChange={ v => updateHotspotField(pIndex, side, hIndex, 'linkEnable', v) } />
                                                { hot.linkEnable && (
                                                    <>
                                                        <TextControl label="URL" value={ hot.linkUrl || '' } onChange={ v => updateHotspotField(pIndex, side, hIndex, 'linkUrl', v) } />
                                                        <ToggleControl label="Open in New Tab" checked={ hot.newTab || false } onChange={ v => updateHotspotField(pIndex, side, hIndex, 'newTab', v) } />
                                                    </>
                                                ) }
                                            </div>

                                            <Button isDestructive variant="link" onClick={() => removeHotspot(pIndex, side, hIndex)}>Remove Hotspot</Button>
                                        </div>
                                    ))}
                                    <Button variant="secondary" onClick={() => addHotspot(pIndex, side)} style={{ width: '100%', justifyContent: 'center' }}>+ Add {side === 'leftHotspots' ? 'Left' : 'Right'} Hotspot</Button>
                                </div>
                            ))}

                        </div>
                    ))}
                    
                    <Button variant="primary" onClick={() => {
                        const newPanels = [...panels, {
                            bgImageUrl: '', bgImageId: 0, overlayEnable: true, overlayColor: '#1D1D1B', overlayOpacity: 0.5,
                            centerIconUrl: '', centerIconId: 0, centerTitle: 'NEW PANEL', centerDescription: 'Description...', leftHotspots: [], rightHotspots: []
                        }];
                        setAttributes({ panels: newPanels });
                    }} style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}>+ Add New Panel</Button>
                </PanelBody>
            </InspectorControls>

            {/* PREVIEW CANVAS */}
            <div className="editor-styles-wrapper">
                <Button 
                    variant={editorActiveIndex === -1 ? "primary" : "secondary"}
                    onClick={() => setEditorActiveIndex(-1)}
                    style={{ position:'absolute', top: 0, left: 0, zIndex: 9999, margin: '8px' }}
                >
                    Reset Grid to Grouped Neutral Preview
                </Button>
            </div>
            <div className={editorActiveIndex !== -1 ? "zep-layout-wrapper has-active-panel" : "zep-layout-wrapper"}>
                { panels.map((panel, i) => {
                    // We use editorActiveIndex to mock CSS active classes cleanly within Gutenberg layout so editors can see their changes predictably.
                    const isActive = ( i === editorActiveIndex ) ? ' is-active' : '';
                    
                    const leftHQ = panel.leftHotspots || [];
                    const rightHQ = panel.rightHotspots || [];

                    return (
                        <article key={i} className={`zep-panel${isActive}`} data-index={i} data-bg-trans={panel.bgTransition || 'fade'} data-content-trans={panel.contentTransition || 'slide-up'} onClick={() => setEditorActiveIndex(i)}>
                            
                            <div className="zep-panel__bg-layer">
                                { panel.defaultBgImageUrl && (
                                    <div className="zep-panel__bg-cell zep-panel__bg-cell--default">
                                        <img className="zep-panel__bg-img" src={panel.defaultBgImageUrl} alt={panel.defaultBgImageAlt || ''} /> 
                                    </div>
                                )}
                                { panel.activeBgImageUrl && (
                                    <div className="zep-panel__bg-cell zep-panel__bg-cell--active">
                                        <img className="zep-panel__bg-img" src={panel.activeBgImageUrl} alt={panel.activeBgImageAlt || ''} /> 
                                    </div>
                                )}
                                { (panel.overlayEnable ?? true) && (
                                    <div className="zep-panel__overlay" style={{ backgroundColor: panel.overlayColor || '#1D1D1B', opacity: panel.overlayOpacity ?? 0.5 }}></div>
                                )}
                            </div>

                            <div className="zep-panel__core">
                                { leftHQ.length > 0 && (
                                    <div className="zep-panel__hotspots zep-panel__hotspots--left">
                                        { leftHQ.map((hot, h) => (
                                            <div key={h} className="zep-hotspot">
                                                { hot.iconUrl && <img className="zep-hotspot__icon" src={hot.iconUrl} alt={hot.iconAlt || ''} /> }
                                                { hot.description && <span className="zep-hotspot__desc">{ hot.description }</span> }
                                            </div>
                                        )) }
                                    </div>
                                )}

                                <div className="zep-panel__center">
                                    { panel.centerIconUrl && <img className="zep-panel__center-icon" src={panel.centerIconUrl} alt={panel.centerIconAlt || ''} /> }
                                    { panel.centerTitle && <h3 className="zep-panel__title">{ panel.centerTitle }</h3> }
                                    { panel.centerDescription && <p className="zep-panel__desc">{ panel.centerDescription }</p> }
                                </div>

                                { rightHQ.length > 0 && (
                                    <div className="zep-panel__hotspots zep-panel__hotspots--right">
                                        { rightHQ.map((hot, h) => (
                                            <div key={h} className="zep-hotspot">
                                                { hot.iconUrl && <img className="zep-hotspot__icon" src={hot.iconUrl} alt={hot.iconAlt || ''} /> }
                                                { hot.description && <span className="zep-hotspot__desc">{ hot.description }</span> }
                                            </div>
                                        )) }
                                    </div>
                                )}
                            </div>

                        </article>
                    );
                })}
            </div>
        </div>
    );
}
