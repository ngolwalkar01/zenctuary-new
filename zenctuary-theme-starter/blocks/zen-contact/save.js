import { useBlockProps, RichText } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const {
        bgImageUrl,
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
        emailIconColor,
        emailIconSize,
        emailTextColor,
        emailTextSize,
        emailSpacing,
        phoneText,
        phoneIconUrl,
        phoneIconColor,
        phoneIconSize,
        phoneTextColor,
        phoneTextSize,
        phoneSpacing,
        leftWidth,
        rightWidth,
    } = attributes;

    const blockProps = useBlockProps.save({
        className: 'zen-contact-section alignfull',
        style: {
            backgroundImage: bgImageUrl ? `url(${bgImageUrl})` : 'none',
            paddingTop: blockPadding.top,
            paddingRight: blockPadding.right,
            paddingBottom: blockPadding.bottom,
            paddingLeft: blockPadding.left,
            '--zen-contact-gap': columnGap,
            gap: columnGap,
            alignItems: 'flex-start',
        },
    });

    return (
        <div {...blockProps}>
            <div className="zen-contact-form-side" style={{ width: `${leftWidth}%` }}>
                <div className="zen-contact-form-inner" style={{
                    padding: formPadding,
                    border: `${formBorderWidth} solid ${formBorderColor}`,
                    borderRadius: formBorderRadius,
                    backgroundColor: formBgColor,
                }}>
                    {formShortcode}
                </div>
            </div>

            <div className="zen-contact-content-side" style={{ width: `${rightWidth}%` }}>
                <RichText.Content
                    tagName="h2"
                    className="zen-contact-heading"
                    value={headingText}
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

                <RichText.Content
                    tagName="p"
                    className="zen-contact-paragraph"
                    value={paragraphText}
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
                        <RichText.Content
                            tagName="span"
                            className="zen-contact-text"
                            value={emailText}
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
                        <RichText.Content
                            tagName="span"
                            className="zen-contact-text"
                            value={phoneText}
                            style={{ color: phoneTextColor, fontSize: phoneTextSize }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
