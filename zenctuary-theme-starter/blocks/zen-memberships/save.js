import { useBlockProps, RichText } from '@wordpress/block-editor';

export default function save({ attributes }) {
  const {
    heading, headingColor, headingFontSize, headingFontWeight, headingPadding, headingMargin,
    paragraph, paragraphColor, paragraphFontSize, paragraphFontWeight, paragraphPadding, paragraphMargin
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
          margin: headingMargin
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
          margin: paragraphMargin
        }}
      />
    </div>
  );
}
