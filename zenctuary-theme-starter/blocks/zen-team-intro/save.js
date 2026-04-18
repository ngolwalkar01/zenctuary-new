import { RichText, useBlockProps } from '@wordpress/block-editor';

function getOverlayPositionStyle( x, y, offsetX, offsetY ) {
	const style = {};

	if ( x === 'left' ) {
		style.left = '0';
		style.transform = `translate(${ offsetX }px, ${ offsetY }px)`;
		style.textAlign = 'left';
	} else if ( x === 'center' ) {
		style.left = '50%';
		style.transform = `translate(calc(-50% + ${ offsetX }px), ${ offsetY }px)`;
		style.textAlign = 'center';
	} else {
		style.right = '0';
		style.transform = `translate(${ offsetX }px, ${ offsetY }px)`;
		style.textAlign = 'right';
	}

	if ( y === 'top' ) {
		style.top = '0';
	} else if ( y === 'center' ) {
		style.top = '50%';
		style.transform = `${ style.transform } translateY(-50%)`;
	} else {
		style.bottom = '0';
	}

	return style;
}

export default function save( { attributes } ) {
	const blockProps = useBlockProps.save( {
		className: 'zti',
		style: {
			'--zti-section-bg': attributes.sectionBackgroundColor,
			'--zti-section-text': attributes.sectionTextColor,
			'--zti-section-max-width': `${ attributes.sectionMaxWidth }px`,
			'--zti-pt': `${ attributes.sectionPaddingTop }px`,
			'--zti-pr': `${ attributes.sectionPaddingRight }px`,
			'--zti-pb': `${ attributes.sectionPaddingBottom }px`,
			'--zti-pl': `${ attributes.sectionPaddingLeft }px`,
			'--zti-gap': `${ attributes.columnGap }px`,
			'--zti-image-width': `${ attributes.imageWidth }px`,
			'--zti-image-min-height': `${ attributes.imageMinHeight }px`,
			'--zti-image-radius': `${ attributes.imageBorderRadius }px`,
			'--zti-overlay-pt': `${ attributes.imageOverlayPaddingTop }px`,
			'--zti-overlay-pr': `${ attributes.imageOverlayPaddingRight }px`,
			'--zti-overlay-pb': `${ attributes.imageOverlayPaddingBottom }px`,
			'--zti-overlay-pl': `${ attributes.imageOverlayPaddingLeft }px`,
			'--zti-name-color': attributes.nameColor,
			'--zti-name-size': `${ attributes.nameFontSize }px`,
			'--zti-name-weight': attributes.nameFontWeight,
			'--zti-name-line': attributes.nameLineHeight,
			'--zti-name-ls': `${ attributes.nameLetterSpacing }px`,
			'--zti-name-transform': attributes.nameTextTransform,
			'--zti-role-color': attributes.roleColor,
			'--zti-role-size': `${ attributes.roleFontSize }px`,
			'--zti-role-weight': attributes.roleFontWeight,
			'--zti-role-line': attributes.roleLineHeight,
			'--zti-role-ls': `${ attributes.roleLetterSpacing }px`,
			'--zti-role-transform': attributes.roleTextTransform,
			'--zti-content-title-color': attributes.contentTitleColor,
			'--zti-content-title-size': `${ attributes.contentTitleFontSize }px`,
			'--zti-content-title-weight': attributes.contentTitleFontWeight,
			'--zti-content-title-line': attributes.contentTitleLineHeight,
			'--zti-content-title-ls': `${ attributes.contentTitleLetterSpacing }px`,
			'--zti-content-title-transform': attributes.contentTitleTextTransform,
			'--zti-content-title-bottom': `${ attributes.contentTitleBottomSpacing }px`,
			'--zti-body-color': attributes.contentBodyColor,
			'--zti-body-size': `${ attributes.contentBodyFontSize }px`,
			'--zti-body-weight': attributes.contentBodyFontWeight,
			'--zti-body-line': attributes.contentBodyLineHeight,
			'--zti-body-ls': `${ attributes.contentBodyLetterSpacing }px`,
			'--zti-body-max': `${ attributes.contentBodyMaxWidth }px`,
		},
	} );

	return (
		<div { ...blockProps }>
			<div className="zti__inner">
				<div className="zti__media">
					{ attributes.imageUrl && (
						<img className="zti__image" src={ attributes.imageUrl } alt={ attributes.imageAlt || '' } />
					) }
					<div className="zti__overlay">
						<RichText.Content
							tagName="div"
							className="zti__name"
							value={ attributes.nameText }
							style={ getOverlayPositionStyle(
								attributes.nameHorizontal,
								attributes.nameVertical,
								attributes.nameOffsetX,
								attributes.nameOffsetY
							) }
						/>
						<RichText.Content
							tagName="div"
							className="zti__role"
							value={ attributes.roleText }
							style={ getOverlayPositionStyle(
								attributes.roleHorizontal,
								attributes.roleVertical,
								attributes.roleOffsetX,
								attributes.roleOffsetY
							) }
						/>
					</div>
				</div>

				<div className="zti__content">
					<RichText.Content tagName="h2" className="zti__content-title" value={ attributes.contentTitle } />
					<RichText.Content tagName="div" className="zti__content-body" value={ attributes.contentBody } />
				</div>
			</div>
		</div>
	);
}
