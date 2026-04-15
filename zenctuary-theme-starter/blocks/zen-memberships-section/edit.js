import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls, RichText, MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { PanelBody, TextControl, ColorPalette, Button, ToggleControl } from '@wordpress/components';
import { useState } from '@wordpress/element';
import ZenCoinIcon from './components/ZenCoinIcon';

export default function Edit({ attributes, setAttributes }) {
  const {
    heading, headingColor, headingFontSize, headingFontWeight, headingPadding, headingMargin,
    paragraph, paragraphColor, paragraphFontSize, paragraphFontWeight, paragraphPadding, paragraphMargin,
    tabBtnActiveBgColor, tabBtnActiveTextColor, tabBtnActiveBorderColor, tabBtnActiveBorderWidth, tabBtnActiveBorderRadius,
    tabBtnInactiveBgColor, tabBtnInactiveTextColor, tabBtnInactiveBorderColor,
    monthlyCards, yearlyCards
  } = attributes;

  const [activeTab, setActiveTab] = useState('monthly');
  const [editingCardIndex, setEditingCardIndex] = useState(null);

  const blockProps = useBlockProps({
    className: 'wp-block-zenctuary-zen-memberships-section'
  });

  const cards = activeTab === 'monthly' ? monthlyCards : yearlyCards;

  const updateCard = (index, key, value) => {
    const updatedCards = [...cards];
    updatedCards[index][key] = value;
    if (activeTab === 'monthly') {
      setAttributes({ monthlyCards: updatedCards });
    } else {
      setAttributes({ yearlyCards: updatedCards });
    }
  };

  const updateZencoinsOptions = (index, key, value) => {
    const updatedCards = [...cards];
    updatedCards[index].zencoinsOptions = { ...updatedCards[index].zencoinsOptions, [key]: value };
    if (activeTab === 'monthly') {
      setAttributes({ monthlyCards: updatedCards });
    } else {
      setAttributes({ yearlyCards: updatedCards });
    }
  };

  const updateFeature = (cardIndex, featureIndex, key, value) => {
    const updatedCards = [...cards];
    updatedCards[cardIndex].features[featureIndex][key] = value;
    if (activeTab === 'monthly') {
      setAttributes({ monthlyCards: updatedCards });
    } else {
      setAttributes({ yearlyCards: updatedCards });
    }
  };

  const addFeature = (cardIndex) => {
    const updatedCards = [...cards];
    updatedCards[cardIndex].features.push({ text: "New Feature", active: true });
    if (activeTab === 'monthly') {
      setAttributes({ monthlyCards: updatedCards });
    } else {
      setAttributes({ yearlyCards: updatedCards });
    }
  };

  const removeFeature = (cardIndex, featureIndex) => {
    const updatedCards = [...cards];
    updatedCards[cardIndex].features.splice(featureIndex, 1);
    if (activeTab === 'monthly') {
      setAttributes({ monthlyCards: updatedCards });
    } else {
      setAttributes({ yearlyCards: updatedCards });
    }
  };

  const addCard = () => {
    const newCard = {
      uuid: `card_${Date.now()}`,
      topBgColor: "#3f3d3d",
      topText: "NEW PLAN",
      price: "100",
      currency: "€",
      duration: "/month",
      zencoinsValue: "10",
      zencoinsPrice: "≈ 3 €/ Zencoin",
      zencoinsOptions: {
        size: "40px",
        bgColor: "#d8b354",
        innerBgColor: "#3f3d3d",
        valueColor: "#d8b354",
        borderColor: "transparent"
      },
      btnText: "Become Member",
      features: [{ text: "Feature 1", active: true }],
      expandedContent: "More info...",
      tooltipText: "",
      tooltipOptions: { bgColor: "#d8b354", textColor: "#3f3d3d" }
    };
    if (activeTab === 'monthly') {
      setAttributes({ monthlyCards: [...monthlyCards, newCard] });
    } else {
      setAttributes({ yearlyCards: [...yearlyCards, newCard] });
    }
  };

  const removeCard = (index) => {
    const updatedCards = [...cards];
    updatedCards.splice(index, 1);
    if (activeTab === 'monthly') {
      setAttributes({ monthlyCards: updatedCards });
    } else {
      setAttributes({ yearlyCards: updatedCards });
    }
  };

  return (
    <div {...blockProps}>
      <InspectorControls>
        <PanelBody title={__('Section Headings', 'zenctuary')} initialOpen={false}>
          <TextControl label="Heading Color" value={headingColor} onChange={(val) => setAttributes({ headingColor: val })} />
          <TextControl label="Heading Font Size" value={headingFontSize} onChange={(val) => setAttributes({ headingFontSize: val })} />
          <TextControl label="Paragraph Color" value={paragraphColor} onChange={(val) => setAttributes({ paragraphColor: val })} />
        </PanelBody>
        <PanelBody title={__('Tab Button Styles', 'zenctuary')} initialOpen={false}>
          <h3>Active State</h3>
          <TextControl label="Background Color" value={tabBtnActiveBgColor} onChange={(val) => setAttributes({ tabBtnActiveBgColor: val })} />
          <TextControl label="Text Color" value={tabBtnActiveTextColor} onChange={(val) => setAttributes({ tabBtnActiveTextColor: val })} />
          <TextControl label="Border Radius" value={tabBtnActiveBorderRadius} onChange={(val) => setAttributes({ tabBtnActiveBorderRadius: val })} />
          <h3>Inactive State</h3>
          <TextControl label="Background Color" value={tabBtnInactiveBgColor} onChange={(val) => setAttributes({ tabBtnInactiveBgColor: val })} />
          <TextControl label="Text Color" value={tabBtnInactiveTextColor} onChange={(val) => setAttributes({ tabBtnInactiveTextColor: val })} />
          <TextControl label="Border Color" value={tabBtnInactiveBorderColor} onChange={(val) => setAttributes({ tabBtnInactiveBorderColor: val })} />
        </PanelBody>
        
        {editingCardIndex !== null && cards[editingCardIndex] && (
          <PanelBody title={__(`Editing Card: ${cards[editingCardIndex].topText}`, 'zenctuary')} initialOpen={true}>
            <TextControl label="Top Background Color" value={cards[editingCardIndex].topBgColor} onChange={(val) => updateCard(editingCardIndex, 'topBgColor', val)} />
            <TextControl label="Top Text" value={cards[editingCardIndex].topText} onChange={(val) => updateCard(editingCardIndex, 'topText', val)} />
            <TextControl label="Tooltip Text (optional)" value={cards[editingCardIndex].tooltipText || ''} onChange={(val) => updateCard(editingCardIndex, 'tooltipText', val)} />
            
            <h4>Zencoin Options</h4>
            <TextControl label="Zencoin Background" value={cards[editingCardIndex].zencoinsOptions.bgColor} onChange={(val) => updateZencoinsOptions(editingCardIndex, 'bgColor', val)} />
            <TextControl label="Zencoin Inner Center" value={cards[editingCardIndex].zencoinsOptions.innerBgColor} onChange={(val) => updateZencoinsOptions(editingCardIndex, 'innerBgColor', val)} />
            <TextControl label="Zencoin Value Color" value={cards[editingCardIndex].zencoinsOptions.valueColor} onChange={(val) => updateZencoinsOptions(editingCardIndex, 'valueColor', val)} />
            <TextControl label="Zencoin Border Color" value={cards[editingCardIndex].zencoinsOptions.borderColor} onChange={(val) => updateZencoinsOptions(editingCardIndex, 'borderColor', val)} />
          </PanelBody>
        )}
      </InspectorControls>

      <RichText
        tagName="h2"
        className="zen-memberships-heading"
        value={heading}
        onChange={(val) => setAttributes({ heading: val })}
        style={{ color: headingColor, fontSize: headingFontSize, fontWeight: headingFontWeight, padding: headingPadding, margin: headingMargin }}
      />
      <RichText
        tagName="p"
        className="zen-memberships-paragraph"
        value={paragraph}
        onChange={(val) => setAttributes({ paragraph: val })}
        style={{ color: paragraphColor, fontSize: paragraphFontSize, fontWeight: paragraphFontWeight, padding: paragraphPadding, margin: paragraphMargin }}
      />

      <div className="zen-editor-tabs-control">
        <button className={activeTab === 'monthly' ? 'active' : ''} onClick={() => setActiveTab('monthly')}>Edit Monthly</button>
        <button className={activeTab === 'yearly' ? 'active' : ''} onClick={() => setActiveTab('yearly')}>Edit Yearly</button>
      </div>

      <div className="zen-memberships-tabs">
        <div className="zen-memberships-tab-btn" style={activeTab === 'monthly' ? { backgroundColor: tabBtnActiveBgColor, color: tabBtnActiveTextColor, borderRadius: tabBtnActiveBorderRadius, borderWidth: tabBtnActiveBorderWidth, borderColor: tabBtnActiveBorderColor } : { backgroundColor: tabBtnInactiveBgColor, color: tabBtnInactiveTextColor, borderColor: tabBtnInactiveBorderColor }}>
          Monthly
        </div>
        <div className="zen-memberships-tab-btn" style={activeTab === 'yearly' ? { backgroundColor: tabBtnActiveBgColor, color: tabBtnActiveTextColor, borderRadius: tabBtnActiveBorderRadius, borderWidth: tabBtnActiveBorderWidth, borderColor: tabBtnActiveBorderColor } : { backgroundColor: tabBtnInactiveBgColor, color: tabBtnInactiveTextColor, borderColor: tabBtnInactiveBorderColor }}>
          Yearly
        </div>
      </div>

      <div className="zen-memberships-cards-grid active">
        {cards.map((card, index) => (
          <div key={card.uuid} className="zen-memberships-card" onClick={() => setEditingCardIndex(index)}>
            <div className="zen-editor-card-controls">
              <button onClick={(e) => { e.stopPropagation(); removeCard(index); }}>Delete</button>
            </div>
            {card.tooltipText && (
              <div className="zen-memberships-tooltip" style={{ backgroundColor: card.tooltipOptions?.bgColor || '#d8b354', color: card.tooltipOptions?.textColor || '#3f3d3d' }}>
                <RichText value={card.tooltipText} onChange={(val) => updateCard(index, 'tooltipText', val)} />
              </div>
            )}
            <div className="zen-card-top" style={{ backgroundColor: card.topBgColor }}>
              <MediaUploadCheck>
                <MediaUpload
                  onSelect={(media) => updateCard(index, 'iconUrl', media.sizes?.full?.url || media.url)}
                  allowedTypes={['image']}
                  render={({ open }) => (
                    <Button onClick={open} className={card.iconUrl ? 'image-button' : 'button button-large'}>
                      {!card.iconUrl ? 'Upload Icon' : <img src={card.iconUrl} className="zen-card-top-icon" alt="Icon" />}
                    </Button>
                  )}
                />
              </MediaUploadCheck>
              <RichText tagName="h3" className="zen-card-top-text" value={card.topText} onChange={(val) => updateCard(index, 'topText', val)} style={{ color: card.topBgColor === '#d8b354' ? '#3f3d3d' : '#d8b354' }} />
            </div>
            
            <div className="zen-card-body">
              <div className="zen-card-price-row">
                <RichText tagName="span" className="zen-card-price" value={card.price} onChange={(val) => updateCard(index, 'price', val)} />
                <RichText tagName="span" className="zen-card-currency" value={card.currency} onChange={(val) => updateCard(index, 'currency', val)} />
                <RichText tagName="span" className="zen-card-duration" value={card.duration} onChange={(val) => updateCard(index, 'duration', val)} />
              </div>

              <div className="zen-card-zencoins-row">
                <div className="zen-card-zencoins-left">
                  <span>ZENCOINS:</span>
                  <div style={{cursor: 'pointer'}} onClick={(e) => { e.stopPropagation(); setEditingCardIndex(index); }}>
                    <ZenCoinIcon value={card.zencoinsValue} options={card.zencoinsOptions} />
                  </div>
                </div>
                <RichText tagName="span" value={card.zencoinsPrice} onChange={(val) => updateCard(index, 'zencoinsPrice', val)} />
              </div>

              <ul className="zen-card-features">
                {card.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="zen-card-feature-item">
                    <div className="zen-card-feature-icon" style={{ backgroundColor: card.topBgColor }}>
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="3" stroke={card.topBgColor === '#d8b354' ? '#3f3d3d' : '#d8b354'} strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <RichText tagName="span" value={feature.text} onChange={(val) => updateFeature(index, featureIndex, 'text', val)} style={{flexGrow: 1}} />
                    <button style={{background:'red',color:'white',border:'none',borderRadius:'50%',marginLeft:'5px',cursor:'pointer'}} onClick={(e) => { e.stopPropagation(); removeFeature(index, featureIndex); }}>x</button>
                  </li>
                ))}
              </ul>
              <button onClick={() => addFeature(index)} style={{marginBottom:'20px'}}>+ Add Feature</button>

              <div className="zen-card-button-wrap">
                <button className="zen-card-button" style={{ backgroundColor: card.topBgColor, color: card.topBgColor === '#d8b354' ? '#3f3d3d' : '#d8b354' }}>
                  <RichText tagName="span" value={card.btnText} onChange={(val) => updateCard(index, 'btnText', val)} />
                </button>
              </div>

              <div className="zen-card-separator" style={{ backgroundColor: '#2b2b2b' }}></div>

              <div className="zen-card-expand-toggle">
                 <span className="zen-card-expand-text">more information</span>
                 <span className="zen-card-expand-icon">+</span>
              </div>
              
              <div className="zen-card-expanded-content open" style={{border: '1px dotted #ccc', marginTop: '10px'}}>
                <RichText tagName="p" value={card.expandedContent} onChange={(val) => updateCard(index, 'expandedContent', val)} placeholder="Expanded content..." />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="zen-editor-add-card-btn" onClick={addCard}>+ Add Card to {activeTab === 'monthly' ? 'Monthly' : 'Yearly'}</button>
    </div>
  );
}
