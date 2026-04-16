import { useBlockProps, RichText } from '@wordpress/block-editor';

export default function save({ attributes }) {
  const {
    heading, headingColor, headingFontSize, headingFontWeight, headingPadding, headingMargin, headingAlignment,
    paragraph, paragraphColor, paragraphFontSize, paragraphFontWeight, paragraphPadding, paragraphMargin, paragraphAlignment,
    btnMonthlyText, btnYearlyText,
    btnNormalBgColor, btnNormalTextColor, btnNormalFontSize, btnNormalFontWeight, btnNormalPadding, btnNormalMargin, btnNormalBorderRadius, btnNormalBorderColor, btnNormalBorderWidth,
    btnActiveBgColor, btnActiveTextColor, btnActiveFontSize, btnActiveFontWeight, btnActiveBorderRadius, btnActiveBorderColor,
    cardWidth, cardHeight, cardBgColor, cardBorderColor, cardBorderWidth, cardBorderRadius,
    monthlyCards, yearlyCards
  } = attributes;

  // Enforce id="memberships" if standard anchor is not set, 
  // though useBlockProps.save() handles standard anchor attribute as well.
  const blockProps = useBlockProps.save({
    className: 'wp-block-zenctuary-zen-memberships',
    id: 'memberships' 
  });

  return (
    <div {...blockProps}>
      <RichText.Content
        tagName="h2"
        className="zen-memberships-heading"
        value={heading}
        style={{
          color: headingColor,
          fontSize: headingFontSize,
          fontWeight: headingFontWeight,
          padding: headingPadding,
          margin: headingMargin,
          textAlign: headingAlignment
        }}
      />
      <RichText.Content
        tagName="p"
        className="zen-memberships-paragraph"
        value={paragraph}
        style={{
          color: paragraphColor,
          fontSize: paragraphFontSize,
          fontWeight: paragraphFontWeight,
          padding: paragraphPadding,
          margin: paragraphMargin,
          textAlign: paragraphAlignment
        }}
      />

      <div className="zen-memberships-tabs-wrapper">
        <div className="zen-memberships-tabs-row">
          <button
            className="zen-memberships-tab-btn active zen-tab-monthly"
            data-target="monthly"
            data-active-bg={btnActiveBgColor}
            data-active-text={btnActiveTextColor}
            data-active-font-size={btnActiveFontSize}
            data-active-font-weight={btnActiveFontWeight}
            data-active-border-radius={btnActiveBorderRadius}
            data-active-border-color={btnActiveBorderColor}
            data-inactive-bg={btnNormalBgColor}
            data-inactive-text={btnNormalTextColor}
            data-inactive-font-size={btnNormalFontSize}
            data-inactive-font-weight={btnNormalFontWeight}
            data-inactive-border-radius={btnNormalBorderRadius}
            data-inactive-border-color={btnNormalBorderColor}
            data-border-width={btnNormalBorderWidth}
            data-padding={btnNormalPadding}
            data-margin={btnNormalMargin}
            style={{
              backgroundColor: btnActiveBgColor, color: btnActiveTextColor, fontSize: btnActiveFontSize, fontWeight: btnActiveFontWeight,
              borderRadius: btnActiveBorderRadius, borderColor: btnActiveBorderColor, borderWidth: btnNormalBorderWidth, padding: btnNormalPadding, margin: btnNormalMargin
            }}
          >
            <RichText.Content value={btnMonthlyText} />
          </button>
          <button
            className="zen-memberships-tab-btn zen-tab-yearly"
            data-target="yearly"
            data-active-bg={btnActiveBgColor}
            data-active-text={btnActiveTextColor}
            data-active-font-size={btnActiveFontSize}
            data-active-font-weight={btnActiveFontWeight}
            data-active-border-radius={btnActiveBorderRadius}
            data-active-border-color={btnActiveBorderColor}
            data-inactive-bg={btnNormalBgColor}
            data-inactive-text={btnNormalTextColor}
            data-inactive-font-size={btnNormalFontSize}
            data-inactive-font-weight={btnNormalFontWeight}
            data-inactive-border-radius={btnNormalBorderRadius}
            data-inactive-border-color={btnNormalBorderColor}
            data-border-width={btnNormalBorderWidth}
            data-padding={btnNormalPadding}
            data-margin={btnNormalMargin}
            style={{
              backgroundColor: btnNormalBgColor, color: btnNormalTextColor, fontSize: btnNormalFontSize, fontWeight: btnNormalFontWeight,
              borderRadius: btnNormalBorderRadius, borderColor: btnNormalBorderColor, borderWidth: btnNormalBorderWidth, padding: btnNormalPadding, margin: btnNormalMargin
            }}
          >
            <RichText.Content value={btnYearlyText} />
          </button>
        </div>
      </div>

      <div className="zen-memberships-placeholders">
        <div className="zen-memberships-placeholder monthly-placeholder active" id="zen-memberships-monthly-container">
          <div className="zen-memberships-cards-wrapper">
            {monthlyCards.map((card) => (
              <div key={card.id} className="zen-memberships-card" style={{
                position: 'relative',
                width: cardWidth,
                height: cardHeight,
                backgroundColor: cardBgColor,
                borderColor: cardBorderColor,
                borderWidth: cardBorderWidth,
                borderRadius: cardBorderRadius
              }}></div>
            ))}
          </div>
        </div>
        <div className="zen-memberships-placeholder yearly-placeholder" id="zen-memberships-yearly-container" style={{ display: 'none' }}>
          <div className="zen-memberships-cards-wrapper">
            {yearlyCards.map((card) => (
              <div key={card.id} className="zen-memberships-card" style={{
                position: 'relative',
                width: cardWidth,
                height: cardHeight,
                backgroundColor: cardBgColor,
                borderColor: cardBorderColor,
                borderWidth: cardBorderWidth,
                borderRadius: cardBorderRadius
              }}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
