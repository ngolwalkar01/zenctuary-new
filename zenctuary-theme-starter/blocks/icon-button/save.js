import { useBlockProps, RichText } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { text, iconUrl, iconAlt, iconPos, iconWidth, url } = attributes;

	const blockProps = useBlockProps.save({
		className: `zen-icon-btn zen-icon-pos-${iconPos}`,
		style: {
			display: 'inline-flex',
			alignItems: 'center',
			justifyContent: 'center',
			flexDirection: iconPos === 'top' ? 'column' : (iconPos === 'right' ? 'row-reverse' : 'row'),
			gap: '8px',
			textDecoration: 'none'
		}
	});

	return (
		<a { ...blockProps } href={ url }>
			{ iconUrl && (
				<img src={ iconUrl } alt={ iconAlt } width={ iconWidth } style={{ width: `${iconWidth}px`, height: 'auto', flexShrink: 0, objectFit: 'contain' }} />
			) }
			<RichText.Content tagName="span" value={ text } />
		</a>
	);
}
