import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls, RichText } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';

export default function Edit({ attributes, setAttributes }) {
  const {
    heading, headingColor, headingFontSize, headingFontWeight, headingPadding, headingMargin,
    paragraph, paragraphColor, paragraphFontSize, paragraphFontWeight, paragraphPadding, paragraphMargin
  } = attributes;

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
        </PanelBody>
        <PanelBody title={__('Paragraph Settings', 'zenctuary')} initialOpen={false}>
          <TextControl label="Color" value={paragraphColor} onChange={(val) => setAttributes({ paragraphColor: val })} />
          <TextControl label="Font Size" value={paragraphFontSize} onChange={(val) => setAttributes({ paragraphFontSize: val })} />
          <TextControl label="Font Weight" value={paragraphFontWeight} onChange={(val) => setAttributes({ paragraphFontWeight: val })} />
          <TextControl label="Padding" value={paragraphPadding} onChange={(val) => setAttributes({ paragraphPadding: val })} />
          <TextControl label="Margin" value={paragraphMargin} onChange={(val) => setAttributes({ paragraphMargin: val })} />
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
          margin: headingMargin
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
          margin: paragraphMargin
        }}
        placeholder={__('Enter paragraph text...', 'zenctuary')}
      />
    </div>
  );
}
