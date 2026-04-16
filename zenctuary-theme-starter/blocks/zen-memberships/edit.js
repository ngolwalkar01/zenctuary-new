import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls, RichText, MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { PanelBody, TextControl, SelectControl, Button } from '@wordpress/components';
import { useState } from '@wordpress/element';

export default function Edit({ attributes, setAttributes }) {
  const {
    heading, headingColor, headingFontSize, headingFontWeight, headingPadding, headingMargin, headingAlignment,
    paragraph, paragraphColor, paragraphFontSize, paragraphFontWeight, paragraphPadding, paragraphMargin, paragraphAlignment,
    btnMonthlyText, btnYearlyText,
    btnNormalBgColor, btnNormalTextColor, btnNormalFontSize, btnNormalFontWeight, btnNormalPadding, btnNormalMargin, btnNormalBorderRadius, btnNormalBorderColor, btnNormalBorderWidth,
    btnActiveBgColor, btnActiveTextColor, btnActiveFontSize, btnActiveFontWeight, btnActiveBorderRadius, btnActiveBorderColor,
    cardWidth, cardHeight, cardBgColor, cardBorderColor, cardBorderWidth, cardBorderRadius,
    cardTopBgColor, cardBottomBgColor, cardImageWidth, cardImageHeight, cardImageSpacing,
    cardHeadingColor, cardHeadingFontSize, cardHeadingFontWeight, cardHeadingFontStyle, cardHeadingLetterSpacing, cardHeadingMargin,
    cardSeparatorColor, cardSeparatorThickness, cardSeparatorLength,
    cardPriceColor, cardPriceFontSize, cardPriceFontWeight, cardPriceMargin,
    cardDurationColor, cardDurationFontSize, cardDurationFontWeight, cardDurationMargin,
    cardPriceRowGap, cardPriceRowMargin,
    monthlyCards, yearlyCards
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

  const addCard = () => {
    if (selectedPlan === 'monthly') {
      const newCards = [...monthlyCards, { id: 'm' + Date.now().toString() }];
      setAttributes({ monthlyCards: newCards });
    } else {
      const newCards = [...yearlyCards, { id: 'y' + Date.now().toString() }];
      setAttributes({ yearlyCards: newCards });
    }
  };

  const removeCard = (id, planType) => {
    if (planType === 'monthly') {
      setAttributes({ monthlyCards: monthlyCards.filter(c => c.id !== id) });
    } else {
      setAttributes({ yearlyCards: yearlyCards.filter(c => c.id !== id) });
    }
  };

  const updateCard = (id, planType, field, value) => {
    if (planType === 'monthly') {
      setAttributes({ monthlyCards: monthlyCards.map(c => c.id === id ? { ...c, [field]: value } : c) });
    } else {
      setAttributes({ yearlyCards: yearlyCards.map(c => c.id === id ? { ...c, [field]: value } : c) });
    }
  };


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
          <TextControl label="Top Section Background" value={cardTopBgColor} onChange={(val) => setAttributes({ cardTopBgColor: val })} />
          <TextControl label="Bottom Section Background" value={cardBottomBgColor} onChange={(val) => setAttributes({ cardBottomBgColor: val })} />
        </PanelBody>
        <PanelBody title={__('Card Image / Logo Settings', 'zenctuary')} initialOpen={false}>
          <TextControl label="Image Width" value={cardImageWidth} onChange={(val) => setAttributes({ cardImageWidth: val })} />
          <TextControl label="Image Height" value={cardImageHeight} onChange={(val) => setAttributes({ cardImageHeight: val })} />
          <TextControl label="Image Spacing (Margin Bottom)" value={cardImageSpacing} onChange={(val) => setAttributes({ cardImageSpacing: val })} />
        </PanelBody>
        <PanelBody title={__('Card Heading Settings', 'zenctuary')} initialOpen={false}>
          <TextControl label="Color" value={cardHeadingColor} onChange={(val) => setAttributes({ cardHeadingColor: val })} />
          <TextControl label="Font Size" value={cardHeadingFontSize} onChange={(val) => setAttributes({ cardHeadingFontSize: val })} />
          <TextControl label="Font Weight" value={cardHeadingFontWeight} onChange={(val) => setAttributes({ cardHeadingFontWeight: val })} />
          <SelectControl label="Font Style" value={cardHeadingFontStyle} options={[{ label: 'Normal', value: 'normal' }, { label: 'Italic', value: 'italic' }]} onChange={(val) => setAttributes({ cardHeadingFontStyle: val })} />
          <TextControl label="Letter Spacing" value={cardHeadingLetterSpacing} onChange={(val) => setAttributes({ cardHeadingLetterSpacing: val })} />
          <TextControl label="Margin" value={cardHeadingMargin} onChange={(val) => setAttributes({ cardHeadingMargin: val })} />
        </PanelBody>
        <PanelBody title={__('Card Separator Settings', 'zenctuary')} initialOpen={false}>
          <TextControl label="Line Color" value={cardSeparatorColor} onChange={(val) => setAttributes({ cardSeparatorColor: val })} />
          <TextControl label="Thickness (px)" value={cardSeparatorThickness} onChange={(val) => setAttributes({ cardSeparatorThickness: val })} />
          <TextControl label="Length (Width % or px)" value={cardSeparatorLength} onChange={(val) => setAttributes({ cardSeparatorLength: val })} />
        </PanelBody>
        <PanelBody title={__('Card Price Settings', 'zenctuary')} initialOpen={false}>
          <TextControl label="Price Color" value={cardPriceColor} onChange={(val) => setAttributes({ cardPriceColor: val })} />
          <TextControl label="Price Font Size" value={cardPriceFontSize} onChange={(val) => setAttributes({ cardPriceFontSize: val })} />
          <TextControl label="Price Font Weight" value={cardPriceFontWeight} onChange={(val) => setAttributes({ cardPriceFontWeight: val })} />
          <TextControl label="Price Margin" value={cardPriceMargin} onChange={(val) => setAttributes({ cardPriceMargin: val })} />
        </PanelBody>
        <PanelBody title={__('Card Duration Settings', 'zenctuary')} initialOpen={false}>
          <TextControl label="Duration Color" value={cardDurationColor} onChange={(val) => setAttributes({ cardDurationColor: val })} />
          <TextControl label="Duration Font Size" value={cardDurationFontSize} onChange={(val) => setAttributes({ cardDurationFontSize: val })} />
          <TextControl label="Duration Font Weight" value={cardDurationFontWeight} onChange={(val) => setAttributes({ cardDurationFontWeight: val })} />
          <TextControl label="Duration Margin" value={cardDurationMargin} onChange={(val) => setAttributes({ cardDurationMargin: val })} />
          <TextControl label="Gap between Price & Duration" value={cardPriceRowGap} onChange={(val) => setAttributes({ cardPriceRowGap: val })} />
          <TextControl label="Price Row Margin" value={cardPriceRowMargin} onChange={(val) => setAttributes({ cardPriceRowMargin: val })} />
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
              {monthlyCards.map((card) => (
                <div key={card.id} className="zen-memberships-card" style={{
                  position: 'relative',
                  width: cardWidth,
                  height: cardHeight,
                  backgroundColor: cardBgColor,
                  borderColor: cardBorderColor,
                  borderWidth: cardBorderWidth,
                  borderRadius: cardBorderRadius,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}>
                  <div className="zen-memberships-card-top" style={{ backgroundColor: cardTopBgColor }}>
                    <div className="zen-memberships-card-image-wrapper" style={{ marginBottom: cardImageSpacing }}>
                      <MediaUploadCheck>
                        <MediaUpload
                          onSelect={(media) => updateCard(card.id, 'monthly', 'imageUrl', media.url)}
                          allowedTypes={['image']}
                          value={card.imageUrl}
                          render={({ open }) => (
                            card.imageUrl ? (
                              <div style={{ position: 'relative', display: 'inline-block' }}>
                                <img src={card.imageUrl} alt="" style={{ width: cardImageWidth, height: cardImageHeight, objectFit: 'contain' }} onClick={open} />
                                <Button isDestructive isSmall onClick={() => updateCard(card.id, 'monthly', 'imageUrl', '')} style={{ position: 'absolute', top: -10, right: -10, borderRadius: '50%' }}>X</Button>
                              </div>
                            ) : (
                              <Button variant="secondary" onClick={open}>Add Logo</Button>
                            )
                          )}
                        />
                      </MediaUploadCheck>
                    </div>
                    <RichText
                      tagName="h2"
                      value={card.headingText}
                      onChange={(val) => updateCard(card.id, 'monthly', 'headingText', val)}
                      placeholder="Enter heading..."
                      style={{
                        color: cardHeadingColor,
                        fontSize: cardHeadingFontSize,
                        fontWeight: cardHeadingFontWeight,
                        fontStyle: cardHeadingFontStyle,
                        letterSpacing: cardHeadingLetterSpacing,
                        margin: cardHeadingMargin,
                        textAlign: 'center'
                      }}
                    />
                    <div className="zen-memberships-card-separator" style={{ backgroundColor: cardSeparatorColor, height: cardSeparatorThickness, width: cardSeparatorLength }}></div>
                  </div>
                  <div className="zen-memberships-card-bottom" style={{ backgroundColor: cardBottomBgColor }}>
                    <div className="zen-memberships-price-row" style={{ gap: cardPriceRowGap, margin: cardPriceRowMargin }}>
                      <RichText
                        tagName="span"
                        className="zen-memberships-price"
                        value={card.priceText}
                        onChange={(val) => updateCard(card.id, 'monthly', 'priceText', val)}
                        placeholder="90€"
                        style={{
                          color: cardPriceColor,
                          fontSize: cardPriceFontSize,
                          fontWeight: cardPriceFontWeight,
                          margin: cardPriceMargin
                        }}
                      />
                      <RichText
                        tagName="span"
                        className="zen-memberships-duration"
                        value={card.durationText}
                        onChange={(val) => updateCard(card.id, 'monthly', 'durationText', val)}
                        placeholder="/month"
                        style={{
                          color: cardDurationColor,
                          fontSize: cardDurationFontSize,
                          fontWeight: cardDurationFontWeight,
                          margin: cardDurationMargin
                        }}
                      />
                    </div>
                  </div>
                  
                  <button className="zen-memberships-remove-card" onClick={() => removeCard(card.id, 'monthly')} title="Remove Card">×</button>
                </div>
              ))}
            </div>
            <div className="zen-memberships-add-wrapper">
              <button className="zen-memberships-add-card" onClick={addCard}>+ Add Card</button>
            </div>
          </div>
        )}
        {selectedPlan === 'yearly' && (
          <div className="zen-memberships-placeholder yearly-placeholder">
            <div className="zen-memberships-cards-wrapper">
              {yearlyCards.map((card) => (
                <div key={card.id} className="zen-memberships-card" style={{
                  position: 'relative',
                  width: cardWidth,
                  height: cardHeight,
                  backgroundColor: cardBgColor,
                  borderColor: cardBorderColor,
                  borderWidth: cardBorderWidth,
                  borderRadius: cardBorderRadius,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}>
                  <div className="zen-memberships-card-top" style={{ backgroundColor: cardTopBgColor }}>
                    <div className="zen-memberships-card-image-wrapper" style={{ marginBottom: cardImageSpacing }}>
                      <MediaUploadCheck>
                        <MediaUpload
                          onSelect={(media) => updateCard(card.id, 'yearly', 'imageUrl', media.url)}
                          allowedTypes={['image']}
                          value={card.imageUrl}
                          render={({ open }) => (
                            card.imageUrl ? (
                              <div style={{ position: 'relative', display: 'inline-block' }}>
                                <img src={card.imageUrl} alt="" style={{ width: cardImageWidth, height: cardImageHeight, objectFit: 'contain' }} onClick={open} />
                                <Button isDestructive isSmall onClick={() => updateCard(card.id, 'yearly', 'imageUrl', '')} style={{ position: 'absolute', top: -10, right: -10, borderRadius: '50%' }}>X</Button>
                              </div>
                            ) : (
                              <Button variant="secondary" onClick={open}>Add Logo</Button>
                            )
                          )}
                        />
                      </MediaUploadCheck>
                    </div>
                    <RichText
                      tagName="h2"
                      value={card.headingText}
                      onChange={(val) => updateCard(card.id, 'yearly', 'headingText', val)}
                      placeholder="Enter heading..."
                      style={{
                        color: cardHeadingColor,
                        fontSize: cardHeadingFontSize,
                        fontWeight: cardHeadingFontWeight,
                        fontStyle: cardHeadingFontStyle,
                        letterSpacing: cardHeadingLetterSpacing,
                        margin: cardHeadingMargin,
                        textAlign: 'center'
                      }}
                    />
                    <div className="zen-memberships-card-separator" style={{ backgroundColor: cardSeparatorColor, height: cardSeparatorThickness, width: cardSeparatorLength }}></div>
                  </div>
                  <div className="zen-memberships-card-bottom" style={{ backgroundColor: cardBottomBgColor }}>
                    <div className="zen-memberships-price-row" style={{ gap: cardPriceRowGap, margin: cardPriceRowMargin }}>
                      <RichText
                        tagName="span"
                        className="zen-memberships-price"
                        value={card.priceText}
                        onChange={(val) => updateCard(card.id, 'yearly', 'priceText', val)}
                        placeholder="900€"
                        style={{
                          color: cardPriceColor,
                          fontSize: cardPriceFontSize,
                          fontWeight: cardPriceFontWeight,
                          margin: cardPriceMargin
                        }}
                      />
                      <RichText
                        tagName="span"
                        className="zen-memberships-duration"
                        value={card.durationText}
                        onChange={(val) => updateCard(card.id, 'yearly', 'durationText', val)}
                        placeholder="/year"
                        style={{
                          color: cardDurationColor,
                          fontSize: cardDurationFontSize,
                          fontWeight: cardDurationFontWeight,
                          margin: cardDurationMargin
                        }}
                      />
                    </div>
                  </div>
                  
                  <button className="zen-memberships-remove-card" onClick={() => removeCard(card.id, 'yearly')} title="Remove Card">×</button>
                </div>
              ))}
            </div>
            <div className="zen-memberships-add-wrapper">
              <button className="zen-memberships-add-card" onClick={addCard}>+ Add Card</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
