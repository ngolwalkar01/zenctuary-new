import { 
	InspectorControls, 
	useBlockProps, 
	RichText, 
	PanelColorSettings, 
	AlignmentControl 
} from '@wordpress/block-editor';
import { 
	PanelBody, 
	TextControl, 
	SelectControl, 
	__experimentalUnitControl as UnitControl, 
	FormTokenField,
	BaseControl
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { useMemo } from '@wordpress/element';

export default function Edit( { attributes, setAttributes } ) {
	const {
		heading,
		headingColor,
		headingFontSize,
		headingFontWeight,
		headingAlignment,
		selectedTags,
		inactiveStyles,
		activeStyles,
	} = attributes;

	const blockProps = useBlockProps();

	// Fetch Product Tags
	const allTags = useSelect( ( select ) => {
		return select( 'core' ).getEntityRecords( 'taxonomy', 'product_tag', { per_page: -1 } );
	}, [] );

	const tagOptions = useMemo( () => {
		if ( ! allTags ) return [];
		return allTags.map( ( tag ) => tag.name );
	}, [ allTags ] );

	const onTagsChange = ( tokens ) => {
		const newSelectedTags = tokens.map( ( token ) => {
			const tag = allTags.find( ( t ) => t.name === token );
			if ( ! tag ) return null;

			const existing = selectedTags.find( ( st ) => st.id === tag.id );
			return existing || { id: tag.id, slug: tag.slug, label: tag.name };
		} ).filter( Boolean );

		setAttributes( { selectedTags: newSelectedTags } );
	};

	const updateTagLabel = ( index, newLabel ) => {
		const newTags = [ ...selectedTags ];
		newTags[ index ] = { ...newTags[ index ], label: newLabel };
		setAttributes( { selectedTags: newTags } );
	};

	const updateInactiveStyle = ( key, value ) => {
		setAttributes( {
			inactiveStyles: { ...inactiveStyles, [ key ]: value },
		} );
	};

	const updateActiveStyle = ( key, value ) => {
		setAttributes( {
			activeStyles: { ...activeStyles, [ key ]: value },
		} );
	};

	return (
		<div { ...blockProps }>
			<InspectorControls>
				<PanelBody title={ __( 'Heading Settings', 'zenctuary' ) }>
					<PanelColorSettings
						title={ __( 'Color', 'zenctuary' ) }
						initialOpen={ false }
						colorSettings={ [
							{
								value: headingColor,
								onChange: ( val ) => setAttributes( { headingColor: val } ),
								label: __( 'Heading Color', 'zenctuary' ),
							},
						] }
					/>
					<UnitControl
						label={ __( 'Font Size', 'zenctuary' ) }
						value={ headingFontSize }
						onChange={ ( val ) => setAttributes( { headingFontSize: val } ) }
					/>
					<SelectControl
						label={ __( 'Font Weight', 'zenctuary' ) }
						value={ headingFontWeight }
						options={ [
							{ label: 'Normal', value: '400' },
							{ label: 'Medium', value: '500' },
							{ label: 'Semi Bold', value: '600' },
							{ label: 'Bold', value: '700' },
							{ label: 'Extra Bold', value: '800' },
						] }
						onChange={ ( val ) => setAttributes( { headingFontWeight: val } ) }
					/>
					<BaseControl label={ __( 'Alignment', 'zenctuary' ) }>
						<AlignmentControl
							value={ headingAlignment }
							onChange={ ( val ) => setAttributes( { headingAlignment: val } ) }
						/>
					</BaseControl>
				</PanelBody>

				<PanelBody title={ __( 'Filter Settings', 'zenctuary' ) } initialOpen={ false }>
					<FormTokenField
						label={ __( 'Select Tags', 'zenctuary' ) }
						value={ selectedTags.map( ( t ) => t.label ) }
						suggestions={ tagOptions }
						onChange={ onTagsChange }
					/>
					{ selectedTags.length > 0 && (
						<div className="zen-soul-menu-editor__tag-labels" style={ { marginTop: '20px' } }>
							<p style={ { fontWeight: 'bold', marginBottom: '10px' } }>{ __( 'Override Button Labels', 'zenctuary' ) }</p>
							{ selectedTags.map( ( tag, index ) => (
								<TextControl
									key={ tag.id }
									label={ sprintf( __( 'Label for %s', 'zenctuary' ), tag.slug ) }
									value={ tag.label }
									onChange={ ( val ) => updateTagLabel( index, val ) }
								/>
							) ) }
						</div>
					) }
				</PanelBody>

				<PanelBody title={ __( 'Inactive Button Style', 'zenctuary' ) } initialOpen={ false }>
					<PanelColorSettings
						title={ __( 'Colors', 'zenctuary' ) }
						initialOpen={ true }
						colorSettings={ [
							{
								value: inactiveStyles.backgroundColor,
								onChange: ( val ) => updateInactiveStyle( 'backgroundColor', val ),
								label: __( 'Background Color', 'zenctuary' ),
							},
							{
								value: inactiveStyles.textColor,
								onChange: ( val ) => updateInactiveStyle( 'textColor', val ),
								label: __( 'Text Color', 'zenctuary' ),
							},
							{
								value: inactiveStyles.borderColor,
								onChange: ( val ) => updateInactiveStyle( 'borderColor', val ),
								label: __( 'Border Color', 'zenctuary' ),
							},
						] }
					/>
					<SelectControl
						label={ __( 'Font Weight', 'zenctuary' ) }
						value={ inactiveStyles.fontWeight }
						options={ [
							{ label: 'Normal', value: '400' },
							{ label: 'Medium', value: '500' },
							{ label: 'Semi Bold', value: '600' },
							{ label: 'Bold', value: '700' },
						] }
						onChange={ ( val ) => updateInactiveStyle( 'fontWeight', val ) }
					/>
					<UnitControl
						label={ __( 'Border Width', 'zenctuary' ) }
						value={ inactiveStyles.borderWidth }
						onChange={ ( val ) => updateInactiveStyle( 'borderWidth', val ) }
					/>
					<UnitControl
						label={ __( 'Border Radius', 'zenctuary' ) }
						value={ inactiveStyles.borderRadius }
						onChange={ ( val ) => updateInactiveStyle( 'borderRadius', val ) }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Active Button Style', 'zenctuary' ) } initialOpen={ false }>
					<PanelColorSettings
						title={ __( 'Colors', 'zenctuary' ) }
						initialOpen={ true }
						colorSettings={ [
							{
								value: activeStyles.backgroundColor,
								onChange: ( val ) => updateActiveStyle( 'backgroundColor', val ),
								label: __( 'Background Color', 'zenctuary' ),
							},
							{
								value: activeStyles.textColor,
								onChange: ( val ) => updateActiveStyle( 'textColor', val ),
								label: __( 'Text Color', 'zenctuary' ),
							},
							{
								value: activeStyles.borderColor,
								onChange: ( val ) => updateActiveStyle( 'borderColor', val ),
								label: __( 'Border Color', 'zenctuary' ),
							},
						] }
					/>
				</PanelBody>
			</InspectorControls>

			<RichText
				tagName="h2"
				className="zen-soul-kitchen__heading"
				value={ heading }
				onChange={ ( val ) => setAttributes( { heading: val } ) }
				placeholder={ __( 'SOUL KITCHEN MENU', 'zenctuary' ) }
				style={ {
					color: headingColor,
					fontSize: headingFontSize,
					fontWeight: headingFontWeight,
					textAlign: headingAlignment,
				} }
			/>

			<div className="zen-soul-kitchen__filters" style={ { textAlign: headingAlignment, display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '20px' } }>
				{ selectedTags.length > 0 ? selectedTags.map( ( tag, index ) => {
					// Preview: first button is active, others are inactive
					const isActive = index === 0;
					const styles = isActive ? activeStyles : inactiveStyles;
					return (
						<span
							key={ tag.id }
							className={ `zen-soul-kitchen__filter-button ${ isActive ? 'is-active' : '' }` }
							style={ {
								display: 'inline-block',
								padding: '10px 20px',
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
						</span>
					);
				} ) : (
					<div style={ { padding: '10px', border: '1px dashed #ccc', color: '#999' } }>
						{ __( 'No tags selected. Please select tags in the inspector.', 'zenctuary' ) }
					</div>
				) }
			</div>
		</div>
	);
}
