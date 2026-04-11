import { RichText, useBlockProps } from '@wordpress/block-editor';

const DEFAULT_HEADING_COLOR = 'var(--wp--preset--color--primary)';
const DEFAULT_TEXT_COLOR = '#ffffff';
const DEFAULT_PARAGRAPH_FONT_SIZE = 18;
const DEFAULT_PARAGRAPH_FONT_WEIGHT = '400';

const spacingStyle = ( value = {}, property ) => ( {
	[ `${ property }Top` ]: value.top || '0px',
	[ `${ property }Right` ]: value.right || '0px',
	[ `${ property }Bottom` ]: value.bottom || '0px',
	[ `${ property }Left` ]: value.left || '0px',
} );

const normalizeParagraphs = ( paragraphs, legacyParagraph, legacyTypography = {} ) => {
	const fallbackTypography = {
		fontSize: legacyTypography.fontSize || DEFAULT_PARAGRAPH_FONT_SIZE,
		color: legacyTypography.color || DEFAULT_TEXT_COLOR,
		fontWeight: legacyTypography.fontWeight || DEFAULT_PARAGRAPH_FONT_WEIGHT,
	};

	if ( Array.isArray( paragraphs ) && paragraphs.length ) {
		return paragraphs.map( ( item ) => {
			if ( typeof item === 'string' ) {
				return { text: item, ...fallbackTypography };
			}

			return {
				text: item?.text || '',
				fontSize: item?.fontSize || fallbackTypography.fontSize,
				color: item?.color || fallbackTypography.color,
				fontWeight: item?.fontWeight || fallbackTypography.fontWeight,
			};
		} );
	}

	return [ { text: legacyParagraph || '', ...fallbackTypography } ];
};

function CheckIcon() {
	return (
		<svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
			<path d="M6.4 11.4 2.9 7.9l1.4-1.4 2.1 2.1 5.3-5.4 1.4 1.5z" />
		</svg>
	);
}

function ArrowIcon() {
	return (
		<svg viewBox="0 0 18 18" aria-hidden="true" focusable="false">
			<path d="M9.7 3.3 15.4 9l-5.7 5.7-1.2-1.2 3.7-3.7H2.6V8.2h9.6L8.5 4.5z" />
		</svg>
	);
}

export default function save( { attributes } ) {
	const {
		reverseLayout,
		heading,
		headingFontSize,
		headingColor,
		headingFontWeight,
		listItems,
		listFontSize,
		listColor,
		listSpacing,
		paragraph,
		paragraphs,
		paragraphFontSize,
		paragraphColor,
		paragraphFontWeight,
		buttonText,
		buttonUrl,
		buttonTextColor,
		buttonBackgroundColor,
		buttonBorderColor,
		buttonBorderWidth,
		buttonBorderRadius,
		buttonFontSize,
		buttonFontWeight,
		buttonPadding,
		showArrow,
		arrowPosition,
		images,
		animationSpeed,
		imageWidth,
		imageHeight,
		sectionPadding,
		sectionMargin,
	} = attributes;

	const safeListItems = Array.isArray( listItems ) ? listItems : [];
	const safeParagraphs = normalizeParagraphs( paragraphs, paragraph, {
		fontSize: paragraphFontSize,
		color: paragraphColor,
		fontWeight: paragraphFontWeight,
	} );
	const safeImages = Array.isArray( images ) ? images : [];

	const blockProps = useBlockProps.save( {
		className: `zen-split-showcase${ reverseLayout ? ' is-reversed' : '' }`,
		style: {
			...spacingStyle( sectionPadding, 'padding' ),
			...spacingStyle( sectionMargin, 'margin' ),
		},
	} );

	const buttonStyle = {
		color: buttonTextColor,
		backgroundColor: buttonBackgroundColor,
		borderColor: buttonBorderColor,
		borderWidth: `${ buttonBorderWidth }px`,
		borderRadius: `${ buttonBorderRadius }px`,
		...( buttonFontSize ? { fontSize: `${ buttonFontSize }px` } : {} ),
		...( buttonFontWeight ? { fontWeight: buttonFontWeight } : {} ),
		...spacingStyle( buttonPadding, 'padding' ),
	};

	return (
		<section { ...blockProps } data-speed={ animationSpeed }>
			<div className="zen-split-showcase__inner">
				<div className="zen-split-showcase__column zen-split-showcase__content-column">
					<div className="zen-split-showcase__content">
						<RichText.Content
							tagName="h2"
							className="zen-split-showcase__heading"
							value={ heading }
							style={ {
								fontSize: `${ headingFontSize }px`,
								color: headingColor || DEFAULT_HEADING_COLOR,
								fontWeight: headingFontWeight,
							} }
						/>

						<div className="zen-split-showcase__list" style={ { gap: `${ listSpacing }px` } }>
							{ safeListItems.map( ( item, index ) => (
								<div className="zen-split-showcase__list-row" key={ index }>
									<span className="zen-split-showcase__tick"><CheckIcon /></span>
									<RichText.Content
										tagName="span"
										className="zen-split-showcase__list-text"
										value={ item }
										style={ { color: listColor || DEFAULT_TEXT_COLOR, fontSize: `${ listFontSize }px` } }
									/>
								</div>
							) ) }
						</div>

						<div className="zen-split-showcase__paragraphs">
							{ safeParagraphs.map( ( item, index ) => (
								<RichText.Content
									tagName="p"
									className="zen-split-showcase__paragraph"
									key={ index }
									value={ item.text }
									style={ {
										color: item.color || DEFAULT_TEXT_COLOR,
										fontSize: `${ item.fontSize || DEFAULT_PARAGRAPH_FONT_SIZE }px`,
										fontWeight: item.fontWeight || DEFAULT_PARAGRAPH_FONT_WEIGHT,
									} }
								/>
							) ) }
						</div>

						<a className={ `zen-split-showcase__button is-arrow-${ arrowPosition }` } href={ buttonUrl || '#' } style={ buttonStyle }>
							{ showArrow && ( arrowPosition === 'left' || arrowPosition === 'top' ) && <span className="zen-split-showcase__button-icon"><ArrowIcon /></span> }
							<RichText.Content tagName="span" value={ buttonText } />
							{ showArrow && ( arrowPosition === 'right' || arrowPosition === 'bottom' ) && <span className="zen-split-showcase__button-icon"><ArrowIcon /></span> }
						</a>
					</div>
				</div>

				<div className="zen-split-showcase__column zen-split-showcase__image-column">
					<div className="zen-split-showcase__media" style={ { maxWidth: `${ imageWidth }px`, aspectRatio: `${ imageWidth } / ${ imageHeight }` } }>
						{ safeImages.map( ( image, index ) => (
							<img
								className={ `zen-split-showcase__image${ index === 0 ? ' is-active' : '' }` }
								key={ image.id || image.url }
								src={ image.url }
								alt={ image.alt || '' }
							/>
						) ) }
					</div>
				</div>
			</div>
		</section>
	);
}
