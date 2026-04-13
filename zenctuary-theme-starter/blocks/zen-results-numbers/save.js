import { RichText, useBlockProps } from '@wordpress/block-editor';

const DEFAULT_SPACING = { top: '0px', right: '0px', bottom: '0px', left: '0px' };
const normSpacing = ( value = {} ) => ( { ...DEFAULT_SPACING, ...value } );
const spacingStyle = ( value = {}, prop ) => {
	const spacing = normSpacing( value );
	return {
		[ `${ prop }Top` ]: spacing.top,
		[ `${ prop }Right` ]: spacing.right,
		[ `${ prop }Bottom` ]: spacing.bottom,
		[ `${ prop }Left` ]: spacing.left,
	};
};

export default function save( { attributes } ) {
	const boxes = Array.isArray( attributes.boxes ) ? attributes.boxes : [];
	const blockProps = useBlockProps.save( {
		className: `zen-results-numbers is-width-${ attributes.widthMode || 'full' }`,
		style: {
			backgroundColor: attributes.backgroundColor,
			...spacingStyle( attributes.sectionPadding, 'padding' ),
		},
	} );
	const contentStyle = attributes.widthMode === 'custom' ? { maxWidth: attributes.customWidth || '1200px' } : {};

	return (
		<section { ...blockProps }>
			<div className="zen-results-numbers__content" style={ contentStyle }>
				<RichText.Content
					tagName="h2"
					className="zen-results-numbers__heading"
					value={ attributes.heading }
					style={ { color: attributes.headingColor, fontSize: `${ attributes.headingFontSize }px`, fontWeight: attributes.headingFontWeight, letterSpacing: attributes.headingLetterSpacing, marginBottom: attributes.rowSpacingHeading, ...spacingStyle( attributes.headingMargin, 'margin' ) } }
				/>
				<RichText.Content
					tagName="p"
					className="zen-results-numbers__paragraph"
					value={ attributes.paragraph }
					style={ { color: attributes.paragraphColor, fontSize: `${ attributes.paragraphFontSize }px`, fontWeight: attributes.paragraphFontWeight, letterSpacing: attributes.paragraphLetterSpacing, marginBottom: attributes.rowSpacingParagraph, ...spacingStyle( attributes.paragraphMargin, 'margin' ) } }
				/>
				<div className="zen-results-numbers__boxes" style={ { gap: attributes.boxesGap, ...spacingStyle( attributes.boxesMargin, 'margin' ) } }>
					{ boxes.map( ( box, index ) => (
						<div
							className="zen-results-numbers__box"
							key={ box.id || index }
							style={ {
								...spacingStyle( box.padding, 'padding' ),
								borderColor: box.borderColor,
								borderWidth: `${ box.borderWidth }px`,
								borderRadius: `${ box.borderRadius }px`,
								backgroundColor: box.backgroundColor || 'transparent',
								gap: box.contentGap,
							} }
						>
							<RichText.Content
								tagName="div"
								className="zen-results-numbers__box-top"
								value={ box.topText }
								style={ { color: box.topColor, fontSize: `${ box.topFontSize }px`, fontWeight: box.topFontWeight } }
							/>
							<RichText.Content
								tagName="div"
								className="zen-results-numbers__box-bottom"
								value={ box.bottomText }
								style={ { color: box.bottomColor, fontSize: `${ box.bottomFontSize }px`, fontWeight: box.bottomFontWeight } }
							/>
						</div>
					) ) }
				</div>
			</div>
		</section>
	);
}
