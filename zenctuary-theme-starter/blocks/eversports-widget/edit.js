import { InspectorControls, PanelColorSettings, useBlockProps, __experimentalUnitControl as UnitControl } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const getStyle = ( attributes ) => ( {
	'--zen-eversports-bg': attributes.sectionBackgroundColor,
	'--zen-eversports-color': attributes.sectionTextColor,
	'--zen-eversports-pt': attributes.sectionPaddingTop,
	'--zen-eversports-pr': attributes.sectionPaddingRight,
	'--zen-eversports-pb': attributes.sectionPaddingBottom,
	'--zen-eversports-pl': attributes.sectionPaddingLeft,
	'--zen-eversports-content-width': attributes.contentMaxWidth || 'var(--wp--style--global--wide-size, 1280px)',
	'--zen-eversports-min-height': attributes.widgetMinHeight,
} );

export default function Edit( { attributes, setAttributes } ) {
	const blockProps = useBlockProps( {
		className: 'zen-eversports-widget',
		style: getStyle( attributes ),
	} );

	return (
		<section { ...blockProps }>
			<InspectorControls>
				<PanelBody title={ __( 'Eversports widget', 'zenctuary' ) } initialOpen>
					<TextControl
						label={ __( 'Widget ID', 'zenctuary' ) }
						value={ attributes.widgetId }
						onChange={ ( widgetId ) => setAttributes( { widgetId } ) }
						help={ __( 'Use the ID from the Eversports embed code.', 'zenctuary' ) }
					/>
					<TextControl
						label={ __( 'Loader URL', 'zenctuary' ) }
						value={ attributes.loaderUrl }
						onChange={ ( loaderUrl ) => setAttributes( { loaderUrl } ) }
						help={ __( 'Default: https://widget-static.eversports.io/loader.js', 'zenctuary' ) }
					/>
					<ToggleControl
						label={ __( 'Show editor placeholder details', 'zenctuary' ) }
						checked={ !! attributes.showPlaceholderDetails }
						onChange={ ( showPlaceholderDetails ) => setAttributes( { showPlaceholderDetails } ) }
					/>
				</PanelBody>
				<PanelBody title={ __( 'Layout', 'zenctuary' ) } initialOpen={ false }>
					<UnitControl label={ __( 'Widget width', 'zenctuary' ) } value={ attributes.contentMaxWidth } onChange={ ( contentMaxWidth ) => setAttributes( { contentMaxWidth: contentMaxWidth || 'var(--wp--style--global--wide-size, 1280px)' } ) } />
					<UnitControl label={ __( 'Widget min height', 'zenctuary' ) } value={ attributes.widgetMinHeight } onChange={ ( widgetMinHeight ) => setAttributes( { widgetMinHeight: widgetMinHeight || '0px' } ) } />
					<UnitControl label={ __( 'Padding top', 'zenctuary' ) } value={ attributes.sectionPaddingTop } onChange={ ( sectionPaddingTop ) => setAttributes( { sectionPaddingTop: sectionPaddingTop || '0px' } ) } />
					<UnitControl label={ __( 'Padding right', 'zenctuary' ) } value={ attributes.sectionPaddingRight } onChange={ ( sectionPaddingRight ) => setAttributes( { sectionPaddingRight: sectionPaddingRight || '0px' } ) } />
					<UnitControl label={ __( 'Padding bottom', 'zenctuary' ) } value={ attributes.sectionPaddingBottom } onChange={ ( sectionPaddingBottom ) => setAttributes( { sectionPaddingBottom: sectionPaddingBottom || '0px' } ) } />
					<UnitControl label={ __( 'Padding left', 'zenctuary' ) } value={ attributes.sectionPaddingLeft } onChange={ ( sectionPaddingLeft ) => setAttributes( { sectionPaddingLeft: sectionPaddingLeft || '0px' } ) } />
				</PanelBody>
				<PanelColorSettings
					title={ __( 'Colors', 'zenctuary' ) }
					initialOpen={ false }
					colorSettings={ [
						{
							label: __( 'Background', 'zenctuary' ),
							value: attributes.sectionBackgroundColor,
							onChange: ( sectionBackgroundColor ) => setAttributes( { sectionBackgroundColor: sectionBackgroundColor || '#3f3d3d' } ),
						},
						{
							label: __( 'Placeholder text', 'zenctuary' ),
							value: attributes.sectionTextColor,
							onChange: ( sectionTextColor ) => setAttributes( { sectionTextColor: sectionTextColor || '#f1eee7' } ),
						},
					] }
				/>
			</InspectorControls>
			<div className="zen-eversports-widget__inner">
				<div className="zen-eversports-widget__placeholder">
					<div className="zen-eversports-widget__placeholder-title">{ __( 'Eversports booking widget', 'zenctuary' ) }</div>
					{ attributes.showPlaceholderDetails && (
						<>
							<p>{ __( 'The real widget loads on the frontend using the Eversports loader script.', 'zenctuary' ) }</p>
							<code>{ attributes.widgetId || __( 'Missing widget ID', 'zenctuary' ) }</code>
						</>
					) }
				</div>
			</div>
		</section>
	);
}