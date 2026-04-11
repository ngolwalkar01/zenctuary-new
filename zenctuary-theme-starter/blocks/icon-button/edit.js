import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls, MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { PanelBody, SelectControl, RangeControl, Button, TextControl } from '@wordpress/components';

export default function Edit( { attributes, setAttributes } ) {
	const { text, iconId, iconUrl, iconAlt, iconPos, iconWidth, url } = attributes;
	
	const blockProps = useBlockProps({
		className: `zen-icon-btn zen-icon-pos-${iconPos}`,
		style: {
			display: 'inline-flex',
			alignItems: 'center',
			justifyContent: 'center',
			flexDirection: iconPos === 'top' ? 'column' : (iconPos === 'right' ? 'row-reverse' : 'row'),
			gap: '8px',
			textDecoration: 'none'
		},
		onClick: (e) => e.preventDefault()
	});

	const onSelectImage = ( media ) => {
		setAttributes( {
			iconUrl: media.url,
			iconId: media.id,
			iconAlt: media.alt
		} );
	};

	const removeImage = () => {
		setAttributes( {
			iconUrl: '',
			iconId: 0,
			iconAlt: ''
		} );
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Icon Settings', 'zenctuary' ) }>
					<div className="components-base-control">
						{ iconUrl && (
							<div style={{ marginBottom: '16px' }}>
								<img src={iconUrl} alt={iconAlt} style={{ width: '100%', maxWidth: '100px', display: 'block', marginBottom: '8px' }} />
								<Button variant="destructive" onClick={removeImage}>Remove Icon</Button>
							</div>
						)}
						<MediaUploadCheck>
							<MediaUpload
								onSelect={ onSelectImage }
								allowedTypes={ [ 'image' ] }
								value={ iconId }
								render={ ( { open } ) => (
									<Button variant="primary" onClick={ open }>
										{ iconUrl ? __( 'Replace Icon', 'zenctuary' ) : __( 'Upload Icon', 'zenctuary' ) }
									</Button>
								) }
							/>
						</MediaUploadCheck>
					</div>

					{ iconUrl && (
						<>
							<SelectControl
								label={ __( 'Icon Position', 'zenctuary' ) }
								value={ iconPos }
								options={ [
									{ label: 'Left', value: 'left' },
									{ label: 'Right', value: 'right' },
									{ label: 'Top', value: 'top' },
								] }
								onChange={ ( value ) => setAttributes( { iconPos: value } ) }
							/>
							<RangeControl
								label={ __( 'Icon Width (px)', 'zenctuary' ) }
								value={ iconWidth }
								onChange={ ( value ) => setAttributes( { iconWidth: value } ) }
								min={ 10 }
								max={ 150 }
							/>
						</>
					)}
				</PanelBody>
				<PanelBody title={ __( 'Button Link', 'zenctuary' ) }>
					<TextControl
						label={ __( 'URL', 'zenctuary' ) }
						value={ url }
						onChange={ ( value ) => setAttributes( { url: value } ) }
					/>
				</PanelBody>
			</InspectorControls>

			<a { ...blockProps } href={ url }>
				{ iconUrl && (
					<img src={ iconUrl } alt={ iconAlt } width={ iconWidth } style={{ width: `${iconWidth}px`, height: 'auto', flexShrink: 0, objectFit: 'contain' }} />
				) }
				<RichText
					tagName="span"
					value={ text }
					allowedFormats={ [ 'core/bold', 'core/italic' ] }
					onChange={ ( value ) => setAttributes( { text: value } ) }
					placeholder={ __( 'Button Text...', 'zenctuary' ) }
				/>
			</a>
		</>
	);
}
