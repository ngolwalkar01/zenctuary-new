import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls, RichText } from '@wordpress/block-editor';
import { PanelBody, TextControl, SelectControl } from '@wordpress/components';
import { useState } from '@wordpress/element';

export default function Edit({ attributes, setAttributes }) {
  const {
    heading, headingColor, headingFontSize, headingFontWeight, headingPadding, headingMargin, headingAlignment,
    paragraph, paragraphColor, paragraphFontSize, paragraphFontWeight, paragraphPadding, paragraphMargin, paragraphAlignment,
    btnMonthlyText, btnYearlyText,
    btnNormalBgColor, btnNormalTextColor, btnNormalFontSize, btnNormalFontWeight, btnNormalPadding, btnNormalMargin, btnNormalBorderRadius, btnNormalBorderColor, btnNormalBorderWidth,
    btnActiveBgColor, btnActiveTextColor, btnActiveFontSize, btnActiveFontWeight, btnActiveBorderRadius, btnActiveBorderColor,
    cardWidth, cardHeight, cardBgColor, cardBorderColor, cardBorderWidth, cardBorderRadius
  } = attributes;

  const [selectedPlan, setSelectedPlan] = useState('monthly');

  // Let the wrapper take the anchor value from supports but we don't need to manually define ID here 
  // since Gutenberg's anchor support adds it to blockProps automatically.
  // However, the instructions say "Add anchor ID - memberships". The block supports "anchor: true" 
  // which means the user can set it in Advanced settings. 
  // To ensure it defaults correctly if needed, we can just enforce it on save, or use blockProps.
  
  const blockProps = useBlockProps({
    className: 'wp-block-zenctuary-zen-memberships'
  });

  return (
    <div {...blockProps}>
      <InspectorControls>
        <PanelBody title={__('Heading Settings', 'zenctuary')} initialOpen={false}>
          <TextControl label="Color" value={headingColor} onChange={(val) => setAttributes({ headingColor: val })} />
          <TextControl label="Font Size" value={headingFontSize} onChange={(val) => setAttributes({ headingFontSize: val })} />
          <TextControl label="Font Weight" value={headingFontWeight} onChange={(val) => setAttributes({ headingFontWeight: val })} />
          <TextControl label="Padding" value={headingPadding} onChange={(val) => setAttributes({ headingPadding: val })} />
          <TextControl label="Margin" value={headingMargin} onChange={(val) => setAttributes({ headingMargin: val })} />
          <SelectControl label="Alignment" value={headingAlignment} options={[{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }]} onChange={(val) => setAttributes({ headingAlignment: val })} />
        </PanelBody>
        <PanelBody title={__('Paragraph Settings', 'zenctuary')} initialOpen={false}>
          <TextControl label="Color" value={paragraphColor} onChange={(val) => setAttributes({ paragraphColor: val })} />
          <TextControl label="Font Size" value={paragraphFontSize} onChange={(val) => setAttributes({ paragraphFontSize: val })} />
          <TextControl label="Font Weight" value={paragraphFontWeight} onChange={(val) => setAttributes({ paragraphFontWeight: val })} />
          <TextControl label="Padding" value={paragraphPadding} onChange={(val) => setAttributes({ paragraphPadding: val })} />
          <TextControl label="Margin" value={paragraphMargin} onChange={(val) => setAttributes({ paragraphMargin: val })} />
          <SelectControl label="Alignment" value={paragraphAlignment} options={[{ label: 'Left', value: 'left' }, { label: 'Center', value: 'center' }, { label: 'Right', value: 'right' }]} onChange={(val) => setAttributes({ paragraphAlignment: val })} />
        </PanelBody>
        <PanelBody title={__('Filter Buttons - Normal State', 'zenctuary')} initialOpen={false}>
          <TextControl label="Background Color" value={btnNormalBgColor} onChange={(val) => setAttributes({ btnNormalBgColor: val })} />
          <TextControl label="Text Color" value={btnNormalTextColor} onChange={(val) => setAttributes({ btnNormalTextColor: val })} />
          <TextControl label="Font Size" value={btnNormalFontSize} onChange={(val) => setAttributes({ btnNormalFontSize: val })} />
          <TextControl label="Font Weight" value={btnNormalFontWeight} onChange={(val) => setAttributes({ btnNormalFontWeight: val })} />
          <TextControl label="Padding" value={btnNormalPadding} onChange={(val) => setAttributes({ btnNormalPadding: val })} />
          <TextControl label="Margin" value={btnNormalMargin} onChange={(val) => setAttributes({ btnNormalMargin: val })} />
          <TextControl label="Border Radius" value={btnNormalBorderRadius} onChange={(val) => setAttributes({ btnNormalBorderRadius: val })} />
          <TextControl label="Border Color" value={btnNormalBorderColor} onChange={(val) => setAttributes({ btnNormalBorderColor: val })} />
          <TextControl label="Border Width" value={btnNormalBorderWidth} onChange={(val) => setAttributes({ btnNormalBorderWidth: val })} />
        </PanelBody>
        <PanelBody title={__('Filter Buttons - Active State', 'zenctuary')} initialOpen={false}>
          <TextControl label="Background Color" value={btnActiveBgColor} onChange={(val) => setAttributes({ btnActiveBgColor: val })} />
          <TextControl label="Text Color" value={btnActiveTextColor} onChange={(val) => setAttributes({ btnActiveTextColor: val })} />
          <TextControl label="Font Size" value={btnActiveFontSize} onChange={(val) => setAttributes({ btnActiveFontSize: val })} />
          <TextControl label="Font Weight" value={btnActiveFontWeight} onChange={(val) => setAttributes({ btnActiveFontWeight: val })} />
          <TextControl label="Border Radius" value={btnActiveBorderRadius} onChange={(val) => setAttributes({ btnActiveBorderRadius: val })} />
          <TextControl label="Border Color" value={btnActiveBorderColor} onChange={(val) => setAttributes({ btnActiveBorderColor: val })} />
        </PanelBody>
        <PanelBody title={__('Card Settings', 'zenctuary')} initialOpen={false}>
          <TextControl label="Card Width" value={cardWidth} onChange={(val) => setAttributes({ cardWidth: val })} />
          <TextControl label="Card Height" value={cardHeight} onChange={(val) => setAttributes({ cardHeight: val })} />
          <TextControl label="Background Color" value={cardBgColor} onChange={(val) => setAttributes({ cardBgColor: val })} />
          <TextControl label="Border Color" value={cardBorderColor} onChange={(val) => setAttributes({ cardBorderColor: val })} />
          <TextControl label="Border Width" value={cardBorderWidth} onChange={(val) => setAttributes({ cardBorderWidth: val })} />
          <TextControl label="Border Radius" value={cardBorderRadius} onChange={(val) => setAttributes({ cardBorderRadius: val })} />
        </PanelBody>
      </InspectorControls>

      <RichText
        tagName="h2"
        className="zen-memberships-heading"
        value={heading}
        onChange={(val) => setAttributes({ heading: val })}
        style={{
          color: headingColor,
          fontSize: headingFontSize,
          fontWeight: headingFontWeight,
          padding: headingPadding,
          margin: headingMargin,
          textAlign: headingAlignment
        }}
        placeholder={__('Enter Heading...', 'zenctuary')}
      />
      <RichText
        tagName="p"
        className="zen-memberships-paragraph"
        value={paragraph}
        onChange={(val) => setAttributes({ paragraph: val })}
        style={{
          color: paragraphColor,
          fontSize: paragraphFontSize,
          fontWeight: paragraphFontWeight,
          padding: paragraphPadding,
          margin: paragraphMargin,
          textAlign: paragraphAlignment
        }}
        placeholder={__('Enter paragraph text...', 'zenctuary')}
      />

      <div className="zen-memberships-tabs-wrapper">
        <div className="zen-memberships-tabs-row">
          <button
            className={`zen-memberships-tab-btn ${selectedPlan === 'monthly' ? 'active' : ''}`}
            onClick={() => setSelectedPlan('monthly')}
            style={selectedPlan === 'monthly' ? {
              backgroundColor: btnActiveBgColor, color: btnActiveTextColor, fontSize: btnActiveFontSize, fontWeight: btnActiveFontWeight,
              borderRadius: btnActiveBorderRadius, borderColor: btnActiveBorderColor, borderWidth: btnNormalBorderWidth, padding: btnNormalPadding, margin: btnNormalMargin
            } : {
              backgroundColor: btnNormalBgColor, color: btnNormalTextColor, fontSize: btnNormalFontSize, fontWeight: btnNormalFontWeight,
              borderRadius: btnNormalBorderRadius, borderColor: btnNormalBorderColor, borderWidth: btnNormalBorderWidth, padding: btnNormalPadding, margin: btnNormalMargin
            }}
          >
            <RichText
              tagName="span"
              value={btnMonthlyText}
              onChange={(val) => setAttributes({ btnMonthlyText: val })}
              placeholder="Monthly"
            />
          </button>
          <button
            className={`zen-memberships-tab-btn ${selectedPlan === 'yearly' ? 'active' : ''}`}
            onClick={() => setSelectedPlan('yearly')}
            style={selectedPlan === 'yearly' ? {
              backgroundColor: btnActiveBgColor, color: btnActiveTextColor, fontSize: btnActiveFontSize, fontWeight: btnActiveFontWeight,
              borderRadius: btnActiveBorderRadius, borderColor: btnActiveBorderColor, borderWidth: btnNormalBorderWidth, padding: btnNormalPadding, margin: btnNormalMargin
            } : {
              backgroundColor: btnNormalBgColor, color: btnNormalTextColor, fontSize: btnNormalFontSize, fontWeight: btnNormalFontWeight,
              borderRadius: btnNormalBorderRadius, borderColor: btnNormalBorderColor, borderWidth: btnNormalBorderWidth, padding: btnNormalPadding, margin: btnNormalMargin
            }}
          >
            <RichText
              tagName="span"
              value={btnYearlyText}
              onChange={(val) => setAttributes({ btnYearlyText: val })}
              placeholder="Yearly"
            />
          </button>
        </div>
      </div>

      <div className="zen-memberships-placeholders">
        {selectedPlan === 'monthly' && (
          <div className="zen-memberships-placeholder monthly-placeholder">
            <div className="zen-memberships-cards-wrapper">
              {[1, 2, 3].map((card) => (
                <div key={card} className="zen-memberships-card" style={{
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
        )}
        {selectedPlan === 'yearly' && (
          <div className="zen-memberships-placeholder yearly-placeholder">
            <div className="zen-memberships-cards-wrapper">
              {[1, 2, 3].map((card) => (
                <div key={card} className="zen-memberships-card" style={{
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
        )}
      </div>
    </div>
  );
}
