import { useBlockProps, RichText } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const {
		heading,
		headingColor,
		headingFontSize,
		headingFontWeight,
		headingAlignment,
		selectedTags,
		inactiveStyles,
		activeStyles,
		categoryStyles,
		productStyles,
		categoryMeta,
	} = attributes;

	const blockProps = useBlockProps.save();

	return (
		<div { ...blockProps }>
			<RichText.Content
				tagName="h2"
				className="zen-soul-kitchen__heading"
				value={ heading }
				style={ {
					color: headingColor,
					fontSize: headingFontSize,
					fontWeight: headingFontWeight,
					textAlign: headingAlignment,
				} }
			/>
			<div 
				className="zen-soul-kitchen__filters" 
				style={ { 
					textAlign: headingAlignment,
					display: 'flex',
					gap: '10px',
					flexWrap: 'wrap',
					marginTop: '20px'
				} }
			>
				{ selectedTags.length > 0 && selectedTags.map( ( tag, index ) => {
					const isActive = index === 0;
					const styles = isActive ? activeStyles : inactiveStyles;
					return (
						<button
							key={ tag.id }
							className={ `zen-soul-kitchen__filter-button ${ isActive ? 'is-active' : '' }` }
							data-tag-id={ tag.id }
							data-slug={ tag.slug }
							style={ {
								display: 'inline-block',
								padding: '10px 24px',
								backgroundColor: styles.backgroundColor,
								color: styles.textColor,
								borderColor: styles.borderColor,
								borderWidth: isActive ? '1px' : styles.borderWidth,
								borderRadius: isActive ? '25px' : styles.borderRadius,
								fontWeight: isActive ? '700' : styles.fontWeight,
								borderStyle: 'solid',
								cursor: 'pointer'
							} }
						>
							{ tag.label }
						</button>
					);
				} ) }
			</div>

			{ /* The actual menu content will be rendered dynamically on the frontend in later steps */ }
			{ /* For now, we provide the container */ }
			<div className="zen-soul-kitchen__menu-content" style={ { marginTop: '40px' } }></div>
		</div>
	);
}
