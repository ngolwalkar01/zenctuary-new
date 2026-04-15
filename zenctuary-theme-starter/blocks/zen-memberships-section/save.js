import { useBlockProps, RichText } from '@wordpress/block-editor';
import ZenCoinIcon from './components/ZenCoinIcon';

export default function save({ attributes }) {
  const {
    heading, headingColor, headingFontSize, headingFontWeight, headingPadding, headingMargin,
    paragraph, paragraphColor, paragraphFontSize, paragraphFontWeight, paragraphPadding, paragraphMargin,
    tabBtnActiveBgColor, tabBtnActiveTextColor, tabBtnActiveBorderColor, tabBtnActiveBorderWidth, tabBtnActiveBorderRadius,
    tabBtnInactiveBgColor, tabBtnInactiveTextColor, tabBtnInactiveBorderColor,
    monthlyCards, yearlyCards
  } = attributes;

  const blockProps = useBlockProps.save({
    className: 'wp-block-zenctuary-zen-memberships-section'
  });

  const renderCard = (card) => (
    <div key={card.uuid} className={`zen-memberships-card ${card.topBgColor === '#d8b354' ? 'zen-card-bg-gold' : 'zen-card-bg-light'}`}>
      {card.tooltipText && (
        <div className="zen-memberships-tooltip" style={{ backgroundColor: card.tooltipOptions?.bgColor || '#d8b354', color: card.tooltipOptions?.textColor || '#3f3d3d' }}>
          <RichText.Content value={card.tooltipText} />
        </div>
      )}
      <div className="zen-card-top" style={{ backgroundColor: card.topBgColor }}>
        {card.iconUrl && <img src={card.iconUrl} className="zen-card-top-icon" alt="" />}
        <RichText.Content tagName="h3" className="zen-card-top-text" value={card.topText} style={{ color: card.topBgColor === '#d8b354' ? '#3f3d3d' : '#d8b354' }} />
      </div>
      
      <div className="zen-card-body">
        <div className="zen-card-price-row">
          <RichText.Content tagName="span" className="zen-card-price" value={card.price} />
          <RichText.Content tagName="span" className="zen-card-currency" value={card.currency} />
          <RichText.Content tagName="span" className="zen-card-duration" value={card.duration} />
        </div>

        <div className="zen-card-zencoins-row">
          <div className="zen-card-zencoins-left">
            <span>ZENCOINS:</span>
            <ZenCoinIcon value={card.zencoinsValue} options={card.zencoinsOptions} />
          </div>
          <RichText.Content tagName="span" value={card.zencoinsPrice} />
        </div>

        <ul className="zen-card-features">
          {card.features.map((feature, index) => (
            <li key={index} className="zen-card-feature-item">
              <div className="zen-card-feature-icon" style={{ backgroundColor: card.topBgColor }}>
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="3" stroke={card.topBgColor === '#d8b354' ? '#3f3d3d' : '#d8b354'} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <RichText.Content tagName="span" value={feature.text} />
            </li>
          ))}
        </ul>

        <div className="zen-card-button-wrap">
          <button className="zen-card-button" style={{ backgroundColor: card.topBgColor, color: card.topBgColor === '#d8b354' ? '#3f3d3d' : '#d8b354' }}>
            <RichText.Content value={card.btnText} />
          </button>
        </div>

        <div className="zen-card-separator" style={{ backgroundColor: '#ccc' }}></div>

        <div className="zen-card-expand-toggle">
           <span className="zen-card-expand-text">more information</span>
           <span className="zen-card-expand-icon">+</span>
        </div>
        
        <div className="zen-card-expanded-content">
          <RichText.Content tagName="p" value={card.expandedContent} />
        </div>
      </div>
    </div>
  );

  return (
    <div {...blockProps} id="memberships">
      <RichText.Content
        tagName="h2"
        className="zen-memberships-heading"
        value={heading}
        style={{ color: headingColor, fontSize: headingFontSize, fontWeight: headingFontWeight, padding: headingPadding, margin: headingMargin }}
      />
      <RichText.Content
        tagName="p"
        className="zen-memberships-paragraph"
        value={paragraph}
        style={{ color: paragraphColor, fontSize: paragraphFontSize, fontWeight: paragraphFontWeight, padding: paragraphPadding, margin: paragraphMargin }}
      />

      <div className="zen-memberships-tabs">
        <button 
          className="zen-memberships-tab-btn zen-tab-monthly active" 
          data-target="monthly"
          data-active-bg={tabBtnActiveBgColor}
          data-active-text={tabBtnActiveTextColor}
          data-active-border-color={tabBtnActiveBorderColor}
          data-active-border-width={tabBtnActiveBorderWidth}
          data-active-border-radius={tabBtnActiveBorderRadius}
          data-inactive-bg={tabBtnInactiveBgColor}
          data-inactive-text={tabBtnInactiveTextColor}
          data-inactive-border-color={tabBtnInactiveBorderColor}
          style={{ backgroundColor: tabBtnActiveBgColor, color: tabBtnActiveTextColor, borderRadius: tabBtnActiveBorderRadius, borderWidth: tabBtnActiveBorderWidth, borderColor: tabBtnActiveBorderColor }}
        >
          Monthly
        </button>
        <button 
          className="zen-memberships-tab-btn zen-tab-yearly" 
          data-target="yearly"
          data-active-bg={tabBtnActiveBgColor}
          data-active-text={tabBtnActiveTextColor}
          data-active-border-color={tabBtnActiveBorderColor}
          data-active-border-width={tabBtnActiveBorderWidth}
          data-active-border-radius={tabBtnActiveBorderRadius}
          data-inactive-bg={tabBtnInactiveBgColor}
          data-inactive-text={tabBtnInactiveTextColor}
          data-inactive-border-color={tabBtnInactiveBorderColor}
          style={{ backgroundColor: tabBtnInactiveBgColor, color: tabBtnInactiveTextColor, borderColor: tabBtnInactiveBorderColor }}
        >
          Yearly
        </button>
      </div>

      <div className="zen-memberships-cards-grid active" id="zen-cards-monthly">
        {monthlyCards.map(renderCard)}
      </div>

      <div className="zen-memberships-cards-grid" id="zen-cards-yearly">
        {yearlyCards.map(renderCard)}
      </div>
    </div>
  );
}
