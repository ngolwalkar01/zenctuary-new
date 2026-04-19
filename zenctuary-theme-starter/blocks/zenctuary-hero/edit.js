import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls, MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { PanelBody, SelectControl, RangeControl, TextControl, ToggleControl, Button, ColorPicker, Popover, TextareaControl } from '@wordpress/components';
import { useState, useRef } from '@wordpress/element';

// Shared SVGs
const ICONS = {
    email: <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>,
    phone: <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>,
    whatsapp: <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12.01 2C6.48 2 2 6.48 2 12c0 1.84.5 3.56 1.35 5.06L2 22l5.09-1.33c1.47.82 3.16 1.3 4.92 1.3 5.53 0 10-4.48 10-10l-.01-.03C22 6.45 17.52 2 12.01 2zM12 20.03c-1.57 0-3.08-.4-4.4-1.16l-.32-.18-3.27.86.87-3.19-.2-.31C3.96 14.65 3.5 13.36 3.5 12c0-4.69 3.82-8.5 8.5-8.5 4.69 0 8.5 3.82 8.5 8.5-.01 4.69-3.82 8.5-8.5 8.53z"/></svg>,
    trigger: <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm5 0h-4v-4h4v4zm0-5H4V9h16v4z"/></svg>
};

const Divider = () => <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #ddd' }} />;

// Compact Color Picker
function ColorRow( { label, value, onChange } ) {
    const [ open, setOpen ] = useState( false );
    const ref = useRef();
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px' }}>{ label }</span>
            <div style={{ position: 'relative' }} ref={ ref }>
                <button
                    type="button"
                    onClick={ () => setOpen( ! open ) }
                    style={{
                        padding: '4px',
                        background: 'transparent',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                    }}
                >
                    <div style={{ display: 'inline-block', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: value || 'transparent', border: '1px solid #ccc' }} />
                    <span style={{ fontSize: '11px', color: '#aaa', fontFamily: 'monospace' }}>{ value || 'none' }</span>
                </button>
                { open && (
                    <Popover placement="left-start" onClose={ () => setOpen( false ) } anchor={ ref.current }>
                        <div style={{ padding: '8px' }}>
                            <ColorPicker color={ value } onChange={ onChange } enableAlpha={ false } />
                        </div>
                    </Popover>
                ) }
            </div>
        </div>
    );
}

const ANIMATION_OPTIONS = [
    { label: 'None', value: 'none' },
    { label: 'Fade', value: 'fade' },
    { label: 'Slide Up', value: 'slide-up' },
    { label: 'Slide Down', value: 'slide-down' },
    { label: 'Slide Left', value: 'slide-left' },
    { label: 'Slide Right', value: 'slide-right' },
    { label: 'Zoom In', value: 'zoom-in' }
];

export default function Edit( { attributes, setAttributes } ) {
    const {
        bgImageUrl = '', bgImageId = 0, bgOverlayColor = '#000000', bgOverlayOpacity = 0.4,
        centerMode = 'logo-tagline',
        logoUrl = '', logoId = 0, logoAlt = '', logoMaxWidth = 600,
        taglineText = 'Your journey begins here.', taglineFontSize = 20, taglineFontWeight = '400', taglineColor = '#F6F2EA',
        titleText = 'SCHEDULE', titleFontSize = 64, titleFontWeight = '400', titleTextTransform = 'uppercase', titleColor = '#F6F2EA',
        iconUrl = '', iconId = 0, iconAlt = '', iconSize = 80,
        gapCenterElements = 32,
        centerHorizontalGap = 32, centerVerticalGap = 24,
        logoAnim = 'fade', logoAnimDur = 1.2, logoAnimDel = 0.2,
        taglineAnim = 'slide-up', taglineAnimDur = 1.0, taglineAnimDel = 0.4,
        titleAnim = 'zoom-in', titleAnimDur = 1.2, titleAnimDel = 0.2,
        iconAnim = 'fade', iconAnimDur = 1.0, iconAnimDel = 0.1,
        showTagsRow = true, tagsItems = [], tagsColor = '#D8B355', tagsBottomOffset = 60, tagsMobileBottomOffset = 80, tagsGap = 24, tagsFontSize = 18, tagsBulletSize = 18, tagsBulletMobileSize = 18, tagsFontWeight = '500', tagsTextTransform = 'uppercase', tagsLetterSpacing = 0.05,
        showContactBundle = true, contactRightOffset = 40, contactBottomOffset = 40, contactTriggerBg = '#D8B355', contactTriggerColor = '#3F3E3E', contactTriggerSize = 64,
        contactActionBg = '#3F3E3E', contactActionBorder = '#D8B355', contactActionColor = '#D8B355', contactActionGap = 12, contactActions = []
    } = attributes || {};

    const blockProps = useBlockProps( {
        style: {
            position: 'relative',
            width: '100%',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            backgroundColor: '#000',
        }
    } );

    const setObjAttrParams = (arr, index, key, val, attrName) => {
        const newArr = [...(arr || [])];
        if (!newArr[index]) newArr[index] = {};
        newArr[index] = { ...newArr[index], [key]: val };
        setAttributes({ [attrName]: newArr });
    };

    return (
        <div { ...blockProps }>

            <InspectorControls>
                
                <PanelBody title={ __( 'Background', 'zenctuary' ) } initialOpen={ true }>
                    { bgImageUrl ? (
                        <div style={{ marginBottom: '16px' }}>
                            <img src={ bgImageUrl } alt="background" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                            <Button isDestructive variant="secondary" onClick={ () => setAttributes({ bgImageUrl: '', bgImageId: 0 }) } style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>Remove Background</Button>
                        </div>
                    ) : (
                        <MediaUploadCheck>
                            <MediaUpload
                                allowedTypes={['image']}
                                value={ bgImageId }
                                onSelect={ ( media ) => setAttributes({ bgImageUrl: media.url, bgImageId: media.id }) }
                                render={ ({ open }) => (
                                    <Button variant="secondary" onClick={ open } style={{ width: '100%', justifyContent: 'center', marginBottom: '16px' }}>
                                        + Add Background Image
                                    </Button>
                                ) }
                            />
                        </MediaUploadCheck>
                    ) }

                    <ColorRow label="Overlay Color" value={ bgOverlayColor } onChange={ v => setAttributes({ bgOverlayColor: v }) } />
                    <RangeControl label="Overlay Opacity" value={ bgOverlayOpacity } min={0} max={1} step={0.05} onChange={ v => setAttributes({ bgOverlayOpacity: v }) } />
                </PanelBody>

                <PanelBody title={ __( 'Center Content', 'zenctuary' ) } initialOpen={ false }>
                    <SelectControl
                        label="Content Mode"
                        value={ centerMode }
                        options={[
                            { label: 'Logo + Tagline', value: 'logo-tagline' },
                            { label: 'Text Only', value: 'text-only' },
                            { label: 'Icon + Text', value: 'icon-text' },
                            { label: 'Title + Icon + Text', value: 'title-icon-text' }
                        ]}
                        onChange={ v => setAttributes({ centerMode: v }) }
                    />
                    <RangeControl label="Gap Between Elements" value={ gapCenterElements } min={0} max={120} step={4} onChange={ v => setAttributes({ gapCenterElements: v }) } />
                    { centerMode === 'title-icon-text' && (
                        <>
                            <RangeControl label="Horizontal Gap (Icon / Text)" value={ centerHorizontalGap } min={0} max={160} step={4} onChange={ v => setAttributes({ centerHorizontalGap: v }) } />
                            <RangeControl label="Vertical Gap (Title / Row)" value={ centerVerticalGap } min={0} max={160} step={4} onChange={ v => setAttributes({ centerVerticalGap: v }) } />
                        </>
                    ) }

                    <Divider />

                    { centerMode === 'logo-tagline' && (
                        <>
                            <h3 style={{ fontSize:'12px',textTransform:'uppercase',color:'#888',margin:'0 0 8px' }}>Logo</h3>
                            { logoUrl ? (
                                <div style={{ display:'flex', gap:'8px', marginBottom:'16px' }}>
                                    <img src={logoUrl} style={{ width:'40px', height:'40px', objectFit:'contain', background:'#333', padding:'4px', borderRadius:'4px' }} />
                                    <Button isDestructive variant="secondary" onClick={()=>setAttributes({logoUrl:'', logoId:0, logoAlt:''})}>Remove</Button>
                                </div>
                            ) : (
                                <MediaUploadCheck>
                                    <MediaUpload allowedTypes={['image']} onSelect={m=>setAttributes({logoUrl:m.url, logoId:m.id, logoAlt:m.alt})} render={({open})=><Button variant="secondary" onClick={open} style={{marginBottom:'16px',width:'100%',justifyContent:'center'}}>+ Add Logo</Button>} />
                                </MediaUploadCheck>
                            )}
                            <RangeControl label="Max Width" value={ logoMaxWidth } min={100} max={1000} step={20} onChange={ v => setAttributes({ logoMaxWidth: v }) } />
                            
                            <h3 style={{ fontSize:'12px',textTransform:'uppercase',color:'#888',margin:'16px 0 8px' }}>Tagline</h3>
                            <TextareaControl label="Text" value={ taglineText } onChange={ v => setAttributes({ taglineText: v }) } />
                            <RangeControl label="Font Size" value={ taglineFontSize } min={12} max={48} step={1} onChange={ v => setAttributes({ taglineFontSize: v }) } />
                            <SelectControl label="Font Weight" value={ taglineFontWeight } options={[{label:'400',value:'400'},{label:'500',value:'500'},{label:'600',value:'600'}]} onChange={ v => setAttributes({ taglineFontWeight: v }) } />
                            <ColorRow label="Color" value={ taglineColor } onChange={ v => setAttributes({ taglineColor: v }) } />
                        </>
                    )}

                    { (centerMode === 'text-only' || centerMode === 'icon-text' || centerMode === 'title-icon-text') && (
                        <>
                            <h3 style={{ fontSize:'12px',textTransform:'uppercase',color:'#888',margin:'0 0 8px' }}>Title</h3>
                            <TextareaControl label="Text" value={ titleText } onChange={ v => setAttributes({ titleText: v }) } />
                            <RangeControl label="Font Size" value={ titleFontSize } min={24} max={120} step={2} onChange={ v => setAttributes({ titleFontSize: v }) } />
                            <SelectControl label="Font Weight" value={ titleFontWeight } options={[{label:'400',value:'400'},{label:'600',value:'600'},{label:'700',value:'700'}]} onChange={ v => setAttributes({ titleFontWeight: v }) } />
                            <SelectControl label="Text Transform" value={ titleTextTransform } options={[{label:'Uppercase',value:'uppercase'},{label:'None',value:'none'}]} onChange={ v => setAttributes({ titleTextTransform: v }) } />
                            <ColorRow label="Color" value={ titleColor } onChange={ v => setAttributes({ titleColor: v }) } />
                        </>
                    )}

                    { (centerMode === 'icon-text' || centerMode === 'title-icon-text') && (
                        <>
                            <h3 style={{ fontSize:'12px',textTransform:'uppercase',color:'#888',margin:'16px 0 8px' }}>Icon</h3>
                            { iconUrl ? (
                                <div style={{ display:'flex', gap:'8px', marginBottom:'16px' }}>
                                    <img src={iconUrl} style={{ width:'40px', height:'40px', objectFit:'contain', background:'#333', padding:'4px', borderRadius:'4px' }} />
                                    <Button isDestructive variant="secondary" onClick={()=>setAttributes({iconUrl:'', iconId:0, iconAlt:''})}>Remove</Button>
                                </div>
                            ) : (
                                <MediaUploadCheck>
                                    <MediaUpload allowedTypes={['image']} onSelect={m=>setAttributes({iconUrl:m.url, iconId:m.id, iconAlt:m.alt})} render={({open})=><Button variant="secondary" onClick={open} style={{marginBottom:'16px',width:'100%',justifyContent:'center'}}>+ Add Icon</Button>} />
                                </MediaUploadCheck>
                            )}
                            <RangeControl label="Size" value={ iconSize } min={24} max={200} step={4} onChange={ v => setAttributes({ iconSize: v }) } />
                        </>
                    )}

                    { centerMode === 'title-icon-text' && (
                        <>
                            <h3 style={{ fontSize:'12px',textTransform:'uppercase',color:'#888',margin:'16px 0 8px' }}>Supporting Text</h3>
                            <TextareaControl label="Text" value={ taglineText } onChange={ v => setAttributes({ taglineText: v }) } />
                            <RangeControl label="Font Size" value={ taglineFontSize } min={12} max={48} step={1} onChange={ v => setAttributes({ taglineFontSize: v }) } />
                            <SelectControl label="Font Weight" value={ taglineFontWeight } options={[{label:'400',value:'400'},{label:'500',value:'500'},{label:'600',value:'600'}]} onChange={ v => setAttributes({ taglineFontWeight: v }) } />
                            <ColorRow label="Color" value={ taglineColor } onChange={ v => setAttributes({ taglineColor: v }) } />
                        </>
                    )}

                </PanelBody>

                <PanelBody title={ __( 'Animations', 'zenctuary' ) } initialOpen={ false }>
                    { centerMode === 'logo-tagline' && (
                        <>
                            <h3 style={{ fontSize:'12px',textTransform:'uppercase',color:'#888',margin:'0 0 8px' }}>Logo</h3>
                            <SelectControl label="Type" value={logoAnim} options={ANIMATION_OPTIONS} onChange={v=>setAttributes({logoAnim:v})} />
                            <RangeControl label="Duration (s)" value={logoAnimDur} min={0.1} max={3} step={0.1} onChange={v=>setAttributes({logoAnimDur:v})} />
                            <RangeControl label="Delay (s)" value={logoAnimDel} min={0} max={2} step={0.1} onChange={v=>setAttributes({logoAnimDel:v})} />
                            <Divider />
                            <h3 style={{ fontSize:'12px',textTransform:'uppercase',color:'#888',margin:'0 0 8px' }}>Tagline</h3>
                            <SelectControl label="Type" value={taglineAnim} options={ANIMATION_OPTIONS} onChange={v=>setAttributes({taglineAnim:v})} />
                            <RangeControl label="Duration (s)" value={taglineAnimDur} min={0.1} max={3} step={0.1} onChange={v=>setAttributes({taglineAnimDur:v})} />
                            <RangeControl label="Delay (s)" value={taglineAnimDel} min={0} max={2} step={0.1} onChange={v=>setAttributes({taglineAnimDel:v})} />
                        </>
                    )}
                    { centerMode === 'text-only' && (
                        <>
                            <h3 style={{ fontSize:'12px',textTransform:'uppercase',color:'#888',margin:'0 0 8px' }}>Title</h3>
                            <SelectControl label="Type" value={titleAnim} options={ANIMATION_OPTIONS} onChange={v=>setAttributes({titleAnim:v})} />
                            <RangeControl label="Duration (s)" value={titleAnimDur} min={0.1} max={3} step={0.1} onChange={v=>setAttributes({titleAnimDur:v})} />
                            <RangeControl label="Delay (s)" value={titleAnimDel} min={0} max={2} step={0.1} onChange={v=>setAttributes({titleAnimDel:v})} />
                        </>
                    )}
                    { centerMode === 'icon-text' && (
                        <>
                            <h3 style={{ fontSize:'12px',textTransform:'uppercase',color:'#888',margin:'0 0 8px' }}>Icon</h3>
                            <SelectControl label="Type" value={iconAnim} options={ANIMATION_OPTIONS} onChange={v=>setAttributes({iconAnim:v})} />
                            <RangeControl label="Duration (s)" value={iconAnimDur} min={0.1} max={3} step={0.1} onChange={v=>setAttributes({iconAnimDur:v})} />
                            <RangeControl label="Delay (s)" value={iconAnimDel} min={0} max={2} step={0.1} onChange={v=>setAttributes({iconAnimDel:v})} />
                            <Divider />
                            <h3 style={{ fontSize:'12px',textTransform:'uppercase',color:'#888',margin:'0 0 8px' }}>Title</h3>
                            <SelectControl label="Type" value={titleAnim} options={ANIMATION_OPTIONS} onChange={v=>setAttributes({titleAnim:v})} />
                            <RangeControl label="Duration (s)" value={titleAnimDur} min={0.1} max={3} step={0.1} onChange={v=>setAttributes({titleAnimDur:v})} />
                            <RangeControl label="Delay (s)" value={titleAnimDel} min={0} max={2} step={0.1} onChange={v=>setAttributes({titleAnimDel:v})} />
                        </>
                    )}
                    { centerMode === 'title-icon-text' && (
                        <>
                            <h3 style={{ fontSize:'12px',textTransform:'uppercase',color:'#888',margin:'0 0 8px' }}>Title</h3>
                            <SelectControl label="Type" value={titleAnim} options={ANIMATION_OPTIONS} onChange={v=>setAttributes({titleAnim:v})} />
                            <RangeControl label="Duration (s)" value={titleAnimDur} min={0.1} max={3} step={0.1} onChange={v=>setAttributes({titleAnimDur:v})} />
                            <RangeControl label="Delay (s)" value={titleAnimDel} min={0} max={2} step={0.1} onChange={v=>setAttributes({titleAnimDel:v})} />
                            <Divider />
                            <h3 style={{ fontSize:'12px',textTransform:'uppercase',color:'#888',margin:'0 0 8px' }}>Icon</h3>
                            <SelectControl label="Type" value={iconAnim} options={ANIMATION_OPTIONS} onChange={v=>setAttributes({iconAnim:v})} />
                            <RangeControl label="Duration (s)" value={iconAnimDur} min={0.1} max={3} step={0.1} onChange={v=>setAttributes({iconAnimDur:v})} />
                            <RangeControl label="Delay (s)" value={iconAnimDel} min={0} max={2} step={0.1} onChange={v=>setAttributes({iconAnimDel:v})} />
                            <Divider />
                            <h3 style={{ fontSize:'12px',textTransform:'uppercase',color:'#888',margin:'0 0 8px' }}>Supporting Text</h3>
                            <SelectControl label="Type" value={taglineAnim} options={ANIMATION_OPTIONS} onChange={v=>setAttributes({taglineAnim:v})} />
                            <RangeControl label="Duration (s)" value={taglineAnimDur} min={0.1} max={3} step={0.1} onChange={v=>setAttributes({taglineAnimDur:v})} />
                            <RangeControl label="Delay (s)" value={taglineAnimDel} min={0} max={2} step={0.1} onChange={v=>setAttributes({taglineAnimDel:v})} />
                        </>
                    )}
                </PanelBody>

                <PanelBody title={ __( 'Bottom Tags Row', 'zenctuary' ) } initialOpen={ false }>
                    <ToggleControl label="Enable Bottom Tags" checked={ showTagsRow } onChange={ v => setAttributes({ showTagsRow: v }) } />
                    
                    { showTagsRow && (
                        <>
                            <div style={{ background: '#1e1e1e', padding: '12px', borderRadius: '4px', marginBottom: '16px' }}>
                                { (tagsItems || []).map((item, index) => (
                                    <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                        <TextControl value={item || ''} onChange={v => {
                                            const newTags = [...(tagsItems || [])];
                                            newTags[index] = v;
                                            setAttributes({ tagsItems: newTags });
                                        }} style={{ flex: 1, marginBottom: 0 }} />
                                        <Button isDestructive variant="secondary" onClick={() => {
                                            const newTags = [...(tagsItems || [])];
                                            newTags.splice(index, 1);
                                            setAttributes({ tagsItems: newTags });
                                        }}>✖</Button>
                                    </div>
                                ))}
                                <Button variant="secondary" onClick={() => setAttributes({ tagsItems: [...(tagsItems || []), 'NEW TAG'] })} style={{ width: '100%', justifyContent: 'center' }}>+ Add Tag</Button>
                            </div>

                            <RangeControl label="Bottom Offset (Desktop)" value={ tagsBottomOffset } min={0} max={200} step={4} onChange={ v => setAttributes({ tagsBottomOffset: v }) } />
                            <RangeControl label="Bottom Offset (Mobile)" value={ tagsMobileBottomOffset } min={0} max={200} step={4} onChange={ v => setAttributes({ tagsMobileBottomOffset: v }) } />
                            <RangeControl label="Gap Between Tags" value={ tagsGap } min={0} max={64} step={4} onChange={ v => setAttributes({ tagsGap: v }) } />
                            <RangeControl label="Font Size" value={ tagsFontSize } min={10} max={32} step={1} onChange={ v => setAttributes({ tagsFontSize: v }) } />
                            <RangeControl label="Bullet Size (Desktop)" value={ tagsBulletSize } min={6} max={40} step={1} onChange={ v => setAttributes({ tagsBulletSize: v }) } />
                            <RangeControl label="Bullet Size (Mobile)" value={ tagsBulletMobileSize } min={6} max={40} step={1} onChange={ v => setAttributes({ tagsBulletMobileSize: v }) } />
                            <SelectControl label="Font Weight" value={ tagsFontWeight } options={[{label:'400',value:'400'},{label:'500',value:'500'},{label:'600',value:'600'}]} onChange={ v => setAttributes({ tagsFontWeight: v }) } />
                            <SelectControl label="Text Transform" value={ tagsTextTransform } options={[{label:'Uppercase',value:'uppercase'},{label:'None',value:'none'}]} onChange={ v => setAttributes({ tagsTextTransform: v }) } />
                            <ColorRow label="Color" value={ tagsColor } onChange={ v => setAttributes({ tagsColor: v }) } />
                        </>
                    )}
                </PanelBody>

                <PanelBody title={ __( 'Floating Contact Bundle', 'zenctuary' ) } initialOpen={ false }>
                    <ToggleControl label="Enable Contact Bundle" checked={ showContactBundle } onChange={ v => setAttributes({ showContactBundle: v }) } />
                    
                    { showContactBundle && (
                        <>
                            <h3 style={{ fontSize:'12px',textTransform:'uppercase',color:'#888',margin:'0 0 8px' }}>Positioning</h3>
                            <RangeControl label="Right Offset" value={ contactRightOffset } min={0} max={120} step={4} onChange={ v => setAttributes({ contactRightOffset: v }) } />
                            <RangeControl label="Bottom Offset" value={ contactBottomOffset } min={0} max={120} step={4} onChange={ v => setAttributes({ contactBottomOffset: v }) } />

                            <Divider />
                            <h3 style={{ fontSize:'12px',textTransform:'uppercase',color:'#888',margin:'0 0 8px' }}>Trigger Button</h3>
                            <RangeControl label="Size" value={ contactTriggerSize } min={40} max={100} step={2} onChange={ v => setAttributes({ contactTriggerSize: v }) } />
                            <ColorRow label="Background" value={ contactTriggerBg } onChange={ v => setAttributes({ contactTriggerBg: v }) } />
                            <ColorRow label="Icon Color" value={ contactTriggerColor } onChange={ v => setAttributes({ contactTriggerColor: v }) } />

                            <Divider />
                            <h3 style={{ fontSize:'12px',textTransform:'uppercase',color:'#888',margin:'0 0 8px' }}>Action Buttons</h3>
                            <RangeControl label="Gap Between Buttons" value={ contactActionGap } min={4} max={32} step={2} onChange={ v => setAttributes({ contactActionGap: v }) } />
                            <ColorRow label="Background" value={ contactActionBg } onChange={ v => setAttributes({ contactActionBg: v }) } />
                            <ColorRow label="Border" value={ contactActionBorder } onChange={ v => setAttributes({ contactActionBorder: v }) } />
                            <ColorRow label="Text/Icon" value={ contactActionColor } onChange={ v => setAttributes({ contactActionColor: v }) } />

                            <Divider />
                            <h3 style={{ fontSize:'12px',textTransform:'uppercase',color:'#888',margin:'0 0 8px' }}>Actions list</h3>
                            <div style={{ background: '#1e1e1e', padding: '12px', borderRadius: '4px' }}>
                                { (contactActions || []).map((act, idx) => (
                                    <div key={idx} style={{ padding: '8px', background: '#2e2e2e', marginBottom: '8px', borderRadius: '4px' }}>
                                        <SelectControl label="Type" value={act.type || 'email'} options={[{label:'Email',value:'email'},{label:'Phone',value:'phone'},{label:'Whatsapp',value:'whatsapp'}]} onChange={v => setObjAttrParams(contactActions, idx, 'type', v, 'contactActions')} />
                                        <TextControl label="Label Text" value={act.label || ''} onChange={v => setObjAttrParams(contactActions, idx, 'label', v, 'contactActions')} />
                                        <TextControl label="Value (email/phone num)" value={act.value || ''} onChange={v => setObjAttrParams(contactActions, idx, 'value', v, 'contactActions')} />
                                        <Button isDestructive variant="link" onClick={() => {
                                            const newActs = [...(contactActions || [])];
                                            newActs.splice(idx, 1);
                                            setAttributes({ contactActions: newActs });
                                        }}>Remove Action</Button>
                                    </div>
                                ))}
                                <Button variant="secondary" onClick={() => setAttributes({ contactActions: [...(contactActions || []), { type: 'email', label: 'New Action', value: '' }] })} style={{ width: '100%', justifyContent: 'center' }}>+ Add Action</Button>
                            </div>
                        </>
                    )}
                </PanelBody>

            </InspectorControls>

            {/* ═══ REAL-TIME EDITOR PREVIEW CANVAS ═══ */}
            
            {/* 1. Background image + Overlay */}
            { bgImageUrl && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
                    <img src={ bgImageUrl } alt="hero bg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
            ) }
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: bgOverlayColor, opacity: bgOverlayOpacity, zIndex: 1 }}></div>

            {/* 2. Inner content area */}
            <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '1400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 40px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: `${gapCenterElements}px` }}>
                    
                    { centerMode === 'logo-tagline' && (
                        <>
                            { logoUrl ? (
                                <img src={logoUrl} style={{ maxWidth: `${logoMaxWidth}px`, display: 'block' }} alt="hero logo" />
                            ) : (
                                <div className="zh-editor-placeholder">Select Logo in Sidebar</div>
                            )}
                            <p style={{ margin: 0, fontSize: `${taglineFontSize}px`, fontWeight: taglineFontWeight, color: taglineColor }}>
                                { taglineText }
                            </p>
                        </>
                    )}

                    { centerMode === 'text-only' && (
                        <h1 style={{ margin: 0, fontSize: `${titleFontSize}px`, fontWeight: titleFontWeight, textTransform: titleTextTransform, color: titleColor, lineHeight: 1.1 }}>
                            { titleText }
                        </h1>
                    )}

                    { centerMode === 'icon-text' && (
                        <>
                            { iconUrl ? (
                                <img src={iconUrl} style={{ width: `${iconSize}px`, height: `${iconSize}px`, objectFit: 'contain' }} alt="hero icon" />
                            ) : (
                                <div className="zh-editor-placeholder" style={{ width: `${iconSize}px`, height: `${iconSize}px` }}>Icon</div>
                            )}
                            <h1 style={{ margin: 0, fontSize: `${titleFontSize}px`, fontWeight: titleFontWeight, textTransform: titleTextTransform, color: titleColor, lineHeight: 1.1 }}>
                                { titleText }
                            </h1>
                        </>
                    )}

                    { centerMode === 'title-icon-text' && (
                        <>
                            <h1 style={{ margin: 0, fontSize: `${titleFontSize}px`, fontWeight: titleFontWeight, textTransform: titleTextTransform, color: titleColor, lineHeight: 1.1 }}>
                                { titleText }
                            </h1>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: `${centerHorizontalGap}px`, marginTop: `${centerVerticalGap}px`, flexWrap: 'wrap' }}>
                                { iconUrl ? (
                                    <img src={iconUrl} style={{ width: `${iconSize}px`, height: `${iconSize}px`, objectFit: 'contain', flex: '0 0 auto' }} alt="hero icon" />
                                ) : (
                                    <div className="zh-editor-placeholder" style={{ width: `${iconSize}px`, height: `${iconSize}px` }}>Icon</div>
                                )}
                                <p style={{ margin: 0, fontSize: `${taglineFontSize}px`, fontWeight: taglineFontWeight, color: taglineColor, lineHeight: 1.2, maxWidth: '720px', textAlign: 'left' }}>
                                    { taglineText }
                                </p>
                            </div>
                        </>
                    )}

                </div>
            </div>

            {/* 3. Bottom Tags */}
            { showTagsRow && (tagsItems || []).length > 0 && (
                <div style={{ position: 'absolute', bottom: `${tagsBottomOffset}px`, left: 0, width: '100%', display: 'flex', justifyContent: 'center', zIndex: 10, padding: '0 20px' }}>
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: `${tagsGap}px` }}>
                        { (tagsItems || []).map((tag, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'center', fontSize: `${tagsFontSize}px`, fontWeight: tagsFontWeight, textTransform: tagsTextTransform, letterSpacing: `${tagsLetterSpacing}em`, color: tagsColor }}>
                                { tag }
                                { i < (tagsItems || []).length - 1 && (
                                    <span style={{ marginLeft: `${tagsGap}px`, opacity: 0.6 }}>•</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* 4. Floating Contact Bundle */}
            { showContactBundle && (
                <div style={{ position: 'absolute', bottom: `${contactBottomOffset}px`, right: `${contactRightOffset}px`, zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px' }}>
                    
                    {/* Visual action preview (always visible in editor so they can style it) */}
                    { (contactActions || []).length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: `${contactActionGap}px` }}>
                            { (contactActions || []).map((act, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    background: contactActionBg, border: `1px solid ${contactActionBorder}`, color: contactActionColor,
                                    borderRadius: '999px', padding: '10px 14px 10px 20px', fontSize: '15px', fontWeight: 500
                                }}>
                                    <span>{ act.label }</span>
                                    <span style={{ display: 'flex' }}>{ ICONS[act.type] || ICONS.email }</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Trigger Button */}
                    <div style={{
                        width: `${contactTriggerSize}px`, height: `${contactTriggerSize}px`, borderRadius: '50%',
                        background: contactTriggerBg, color: contactTriggerColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}>
                        { ICONS.trigger }
                    </div>

                </div>
            )}

        </div>
    );
}
