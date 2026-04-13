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
	const blockProps = useBlockProps.save( {
		className: 'zen-coca-chef',
		style: {
			...spacingStyle( attributes.sectionPadding, 'padding' ),
			...spacingStyle( attributes.sectionMargin, 'margin' ),
		},
	} );

	const imageStyle = {
		backgroundImage: attributes.image?.url ? `url(${ attributes.image.url })` : 'none',
		backgroundSize: attributes.imageFit,
		borderRadius: `${ attributes.imageRadius }px`,
	};

	return (
		<section { ...blockProps }>
			<div className="zen-coca-chef__content" style={ { gap: attributes.columnGap } }>
				<div className="zen-coca-chef__left">
					<div className="zen-coca-chef__image" style={ imageStyle }>
						<div className="zen-coca-chef__image-overlay" />
						<RichText.Content
							tagName="div"
							className="zen-coca-chef__name"
							value={ attributes.nameText }
							style={ {
								color: attributes.nameColor,
								fontSize: `${ attributes.nameFontSize }px`,
								fontWeight: attributes.nameFontWeight,
								letterSpacing: attributes.nameLetterSpacing,
							} }
						/>
						<RichText.Content
							tagName="div"
							className="zen-coca-chef__role"
							value={ attributes.roleText }
							style={ {
								color: attributes.roleColor,
								fontSize: `${ attributes.roleFontSize }px`,
								fontWeight: attributes.roleFontWeight,
								letterSpacing: attributes.roleLetterSpacing,
							} }
						/>
					</div>
				</div>
				<div className="zen-coca-chef__right">
					<RichText.Content
						tagName="h2"
						className="zen-coca-chef__heading"
						value={ attributes.heading }
						style={ {
							color: attributes.headingColor,
							fontSize: `${ attributes.headingFontSize }px`,
							fontWeight: attributes.headingFontWeight,
							letterSpacing: attributes.headingLetterSpacing,
							textTransform: 'uppercase',
							...spacingStyle( attributes.headingMargin, 'margin' ),
						} }
					/>
					<RichText.Content
						tagName="p"
						className="zen-coca-chef__paragraph zen-coca-chef__paragraph--one"
						value={ attributes.paragraphOne }
						style={ {
							color: attributes.paragraphOneColor,
							fontSize: `${ attributes.paragraphOneFontSize }px`,
							fontWeight: attributes.paragraphOneFontWeight,
							lineHeight: attributes.paragraphOneLineHeight,
							...spacingStyle( attributes.paragraphOneMargin, 'margin' ),
						} }
					/>
					<RichText.Content
						tagName="p"
						className="zen-coca-chef__paragraph zen-coca-chef__paragraph--two"
						value={ attributes.paragraphTwo }
						style={ {
							color: attributes.paragraphTwoColor,
							fontSize: `${ attributes.paragraphTwoFontSize }px`,
							fontWeight: attributes.paragraphTwoFontWeight,
							lineHeight: attributes.paragraphTwoLineHeight,
							...spacingStyle( attributes.paragraphTwoMargin, 'margin' ),
						} }
					/>
				</div>
			</div>
		</section>
	);
}
