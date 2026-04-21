import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    InspectorControls,
    RichText,
    MediaUpload,
    MediaUploadCheck,
    ColorPalette,
} from '@wordpress/block-editor';
import {
    PanelBody,
    TextControl,
    RangeControl,
    Button,
    FocalPointPicker,
    SelectControl,
} from '@wordpress/components';

export default function Edit({ attributes, setAttributes }) {
    const {
        bgImageUrl,
        bgImageId,
        columnGap,
        blockPadding,
        formShortcode,
        formBgColor,
        formPadding,
        formBorderColor,
        formBorderWidth,
        formBorderRadius,
        headingText,
        headingColor,
        headingFontSize,
        headingFontWeight,
        headingAlignment,
        headingLetterSpacing,
        headingLineHeight,
        paragraphText,
        paragraphColor,
        paragraphFontSize,
        paragraphFontWeight,
        paragraphAlignment,
        paragraphSpacing,
        emailText,
        emailIconUrl,
        emailIconId,
        emailIconColor,
        emailIconSize,
        emailTextColor,
        emailTextSize,
        emailSpacing,
        phoneText,
        phoneIconUrl,
        phoneIconId,
        phoneIconColor,
        phoneIconSize,
        phoneTextColor,
        phoneTextSize,
        phoneSpacing,
    } = attributes;

    const blockProps = useBlockProps({
        className: 'zen-contact-section',
        style: {
            backgroundImage: bgImageUrl ? `url(${bgImageUrl})` : 'none',
            paddingTop: blockPadding.top,
            paddingRight: blockPadding.right,
            paddingBottom: blockPadding.bottom,
            paddingLeft: blockPadding.left,
            '--zen-contact-gap': columnGap,
            gap: columnGap,
        },
    });

    const onSelectBgImage = (media) => {
        setAttributes({ bgImageUrl: media.url, bgImageId: media.id });
    };

    const onRemoveBgImage = () => {
        setAttributes({ bgImageUrl: '', bgImageId: null });
    };

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Block Settings', 'zenctuary')} initialOpen={true}>
                    <MediaUploadCheck>
                        <MediaUpload
                            onSelect={onSelectBgImage}
                            allowedTypes={['image']}
                            value={bgImageId}
                            render={({ open }) => (
                                <div className="zen-image-upload-wrapper">
                                    {bgImageUrl && (
                                        <img src={bgImageUrl} alt="" style={{ marginBottom: '10px', width: '100%' }} />
                                    )}
                                    <Button onClick={open} isPrimary>
                                        {bgImageUrl ? __('Change Background', 'zenctuary') : __('Select Background', 'zenctuary')}
                                    </Button>
                                    {bgImageUrl && (
                                        <Button onClick={onRemoveBgImage} isDestructive style={{ marginLeft: '10px' }}>
                                            {__('Remove', 'zenctuary')}
                                        </Button>
                                    )}
                                </div>
                            )}
                        />
                    </MediaUploadCheck>
                    <TextControl
                        label={__('Column Gap', 'zenctuary')}
                        value={columnGap}
                        onChange={(value) => setAttributes({ columnGap: value })}
                    />
                    <TextControl
                        label={__('Top Padding', 'zenctuary')}
                        value={blockPadding.top}
                        onChange={(value) => setAttributes({ blockPadding: { ...blockPadding, top: value } })}
                    />
                    <TextControl
                        label={__('Bottom Padding', 'zenctuary')}
                        value={blockPadding.bottom}
                        onChange={(value) => setAttributes({ blockPadding: { ...blockPadding, bottom: value } })}
                    />
                    <TextControl
                        label={__('Left/Right Padding', 'zenctuary')}
                        value={blockPadding.left}
                        onChange={(value) => setAttributes({ blockPadding: { ...blockPadding, left: value, right: value } })}
                    />
                </PanelBody>

                <PanelBody title={__('Form Section', 'zenctuary')} initialOpen={false}>
                    <TextControl
                        label={__('Form Shortcode', 'zenctuary')}
                        value={formShortcode}
                        onChange={(value) => setAttributes({ formShortcode: value })}
                    />
                    <ColorPalette
                        label={__('Form Background Color', 'zenctuary')}
                        value={formBgColor}
                        onChange={(value) => setAttributes({ formBgColor: value })}
                    />
                    <TextControl
                        label={__('Form Container Padding', 'zenctuary')}
                        value={formPadding}
                        onChange={(value) => setAttributes({ formPadding: value })}
                    />
                    <TextControl
                        label={__('Border Color', 'zenctuary')}
                        value={formBorderColor}
                        onChange={(value) => setAttributes({ formBorderColor: value })}
                    />
                    <TextControl
                        label={__('Border Width', 'zenctuary')}
                        value={formBorderWidth}
                        onChange={(value) => setAttributes({ formBorderWidth: value })}
                    />
                    <TextControl
                        label={__('Border Radius', 'zenctuary')}
                        value={formBorderRadius}
                        onChange={(value) => setAttributes({ formBorderRadius: value })}
                    />
                </PanelBody>

                <PanelBody title={__('Heading Settings', 'zenctuary')} initialOpen={false}>
                    <ColorPalette
                        label={__('Color', 'zenctuary')}
                        value={headingColor}
                        onChange={(value) => setAttributes({ headingColor: value })}
                    />
                    <TextControl
                        label={__('Font Size', 'zenctuary')}
                        value={headingFontSize}
                        onChange={(value) => setAttributes({ headingFontSize: value })}
                    />
                    <SelectControl
                        label={__('Font Weight', 'zenctuary')}
                        value={headingFontWeight}
                        options={[
                            { label: '400', value: '400' },
                            { label: '500', value: '500' },
                            { label: '600', value: '600' },
                            { label: '700', value: '700' },
                            { label: '800', value: '800' },
                        ]}
                        onChange={(value) => setAttributes({ headingFontWeight: value })}
                    />
                    <SelectControl
                        label={__('Alignment', 'zenctuary')}
                        value={headingAlignment}
                        options={[
                            { label: 'Left', value: 'left' },
                            { label: 'Center', value: 'center' },
                            { label: 'Right', value: 'right' },
                        ]}
                        onChange={(value) => setAttributes({ headingAlignment: value })}
                    />
                    <TextControl
                        label={__('Letter Spacing', 'zenctuary')}
                        value={headingLetterSpacing}
                        onChange={(value) => setAttributes({ headingLetterSpacing: value })}
                    />
                    <TextControl
                        label={__('Line Height', 'zenctuary')}
                        value={headingLineHeight}
                        onChange={(value) => setAttributes({ headingLineHeight: value })}
                    />
                </PanelBody>

                <PanelBody title={__('Paragraph Settings', 'zenctuary')} initialOpen={false}>
                    <ColorPalette
                        label={__('Color', 'zenctuary')}
                        value={paragraphColor}
                        onChange={(value) => setAttributes({ paragraphColor: value })}
                    />
                    <TextControl
                        label={__('Font Size', 'zenctuary')}
                        value={paragraphFontSize}
                        onChange={(value) => setAttributes({ paragraphFontSize: value })}
                    />
                    <TextControl
                        label={__('Bottom Spacing', 'zenctuary')}
                        value={paragraphSpacing}
                        onChange={(value) => setAttributes({ paragraphSpacing: value })}
                    />
                </PanelBody>

                <PanelBody title={__('Email Row Settings', 'zenctuary')} initialOpen={false}>
                    <MediaUpload
                        onSelect={(m) => setAttributes({ emailIconUrl: m.url, emailIconId: m.id })}
                        allowedTypes={['image']}
                        value={emailIconId}
                        render={({ open }) => (
                            <Button onClick={open} isSecondary style={{ marginBottom: '10px' }}>
                                {__('Select Email Icon', 'zenctuary')}
                            </Button>
                        )}
                    />
                    <ColorPalette
                        label={__('Icon Color', 'zenctuary')}
                        value={emailIconColor}
                        onChange={(value) => setAttributes({ emailIconColor: value })}
                    />
                    <TextControl
                        label={__('Icon Size', 'zenctuary')}
                        value={emailIconSize}
                        onChange={(value) => setAttributes({ emailIconSize: value })}
                    />
                    <ColorPalette
                        label={__('Text Color', 'zenctuary')}
                        value={emailTextColor}
                        onChange={(value) => setAttributes({ emailTextColor: value })}
                    />
                    <TextControl
                        label={__('Text Font Size', 'zenctuary')}
                        value={emailTextSize}
                        onChange={(value) => setAttributes({ emailTextSize: value })}
                    />
                    <TextControl
                        label={__('Gap between Icon & Text', 'zenctuary')}
                        value={emailSpacing}
                        onChange={(value) => setAttributes({ emailSpacing: value })}
                    />
                </PanelBody>

                <PanelBody title={__('Phone Row Settings', 'zenctuary')} initialOpen={false}>
                    <MediaUpload
                        onSelect={(m) => setAttributes({ phoneIconUrl: m.url, phoneIconId: m.id })}
                        allowedTypes={['image']}
                        value={phoneIconId}
                        render={({ open }) => (
                            <Button onClick={open} isSecondary style={{ marginBottom: '10px' }}>
                                {__('Select Phone Icon', 'zenctuary')}
                            </Button>
                        )}
                    />
                    <ColorPalette
                        label={__('Icon Color', 'zenctuary')}
                        value={phoneIconColor}
                        onChange={(value) => setAttributes({ phoneIconColor: value })}
                    />
                    <TextControl
                        label={__('Icon Size', 'zenctuary')}
                        value={phoneIconSize}
                        onChange={(value) => setAttributes({ phoneIconSize: value })}
                    />
                    <ColorPalette
                        label={__('Text Color', 'zenctuary')}
                        value={phoneTextColor}
                        onChange={(value) => setAttributes({ phoneTextColor: value })}
                    />
                    <TextControl
                        label={__('Text Font Size', 'zenctuary')}
                        value={phoneTextSize}
                        onChange={(value) => setAttributes({ phoneTextSize: value })}
                    />
                    <TextControl
                        label={__('Gap between Icon & Text', 'zenctuary')}
                        value={phoneSpacing}
                        onChange={(value) => setAttributes({ phoneSpacing: value })}
                    />
                </PanelBody>
            </InspectorControls>

            <div {...blockProps}>
                <div className="zen-contact-form-side">
                    <div className="zen-contact-form-inner" style={{
                        padding: formPadding,
                        border: `${formBorderWidth} solid ${formBorderColor}`,
                        borderRadius: formBorderRadius,
                        backgroundColor: formBgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '400px',
                    }}>
                        <div style={{ textAlign: 'center', color: '#fff', opacity: 0.6 }}>
                            <p style={{ margin: 0 }}>[Form Shortcode]</p>
                            <p style={{ fontSize: '12px' }}>{formShortcode}</p>
                        </div>
                    </div>
                </div>

                <div className="zen-contact-content-side">
                    <RichText
                        tagName="h2"
                        className="zen-contact-heading"
                        value={headingText}
                        onChange={(value) => setAttributes({ headingText: value })}
                        placeholder={__('Heading Text...', 'zenctuary')}
                        style={{
                            color: headingColor,
                            fontSize: headingFontSize,
                            fontWeight: headingFontWeight,
                            textAlign: headingAlignment,
                            letterSpacing: headingLetterSpacing,
                            lineHeight: headingLineHeight,
                            marginBottom: '20px',
                        }}
                    />

                    <RichText
                        tagName="p"
                        className="zen-contact-paragraph"
                        value={paragraphText}
                        onChange={(value) => setAttributes({ paragraphText: value })}
                        placeholder={__('Paragraph Text...', 'zenctuary')}
                        style={{
                            color: paragraphColor,
                            fontSize: paragraphFontSize,
                            fontWeight: paragraphFontWeight,
                            textAlign: paragraphAlignment,
                            marginBottom: paragraphSpacing,
                        }}
                    />

                    <div className="zen-contact-info-rows">
                        <div className="zen-contact-info-row" style={{ marginBottom: '20px', gap: emailSpacing }}>
                            <div className="zen-contact-icon" style={{ width: emailIconSize, height: emailIconSize, color: emailIconColor }}>
                                {emailIconUrl ? (
                                    <img src={emailIconUrl} alt="" />
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                                )}
                            </div>
                            <RichText
                                tagName="span"
                                className="zen-contact-text"
                                value={emailText}
                                onChange={(value) => setAttributes({ emailText: value })}
                                style={{ color: emailTextColor, fontSize: emailTextSize }}
                            />
                        </div>

                        <div className="zen-contact-info-row" style={{ gap: phoneSpacing }}>
                            <div className="zen-contact-icon" style={{ width: phoneIconSize, height: phoneIconSize, color: phoneIconColor }}>
                                {phoneIconUrl ? (
                                    <img src={phoneIconUrl} alt="" />
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                                )}
                            </div>
                            <RichText
                                tagName="span"
                                className="zen-contact-text"
                                value={phoneText}
                                onChange={(value) => setAttributes({ phoneText: value })}
                                style={{ color: phoneTextColor, fontSize: phoneTextSize }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
