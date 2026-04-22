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
		activeTagId,
		categoryMeta,
		categoryStyles,
		productStyles,
		inactiveStyles,
		activeStyles,
	} = attributes;

	const blockProps = useBlockProps();

	// Active Tag Logic
	const currentTagId = activeTagId || ( selectedTags.length > 0 ? selectedTags[ 0 ].id : 0 );

	// Fetch Product Tags (for the filter buttons)
	const allTags = useSelect( ( select ) => {
		return select( 'core' ).getEntityRecords( 'taxonomy', 'product_tag', { per_page: -1 } );
	}, [] );

	// Fetch Products for the Active Tag
	const { products, isLoadingProducts } = useSelect( ( select ) => {
		if ( ! currentTagId ) return { products: [], isLoadingProducts: false };
		const query = {
			per_page: -1,
			product_tag: currentTagId,
		};
		return {
			products: select( 'core' ).getEntityRecords( 'postType', 'product', query ) || [],
			isLoadingProducts: select( 'core' ).isResolving( 'getEntityRecords', [ 'postType', 'product', query ] ),
		};
	}, [ currentTagId ] );

	// Fetch Categories
	const { allCategories, isLoadingCategories } = useSelect( ( select ) => {
		const query = { per_page: -1 };
		return {
			allCategories: select( 'core' ).getEntityRecords( 'taxonomy', 'product_cat', query ) || [],
			isLoadingCategories: select( 'core' ).isResolving( 'getEntityRecords', [ 'taxonomy', 'product_cat', query ] ),
		};
	}, [] );

	const isLoading = isLoadingProducts || isLoadingCategories;

	const groupedData = useMemo( () => {
		if ( isLoading || ! products || ! allCategories ) return [];

		const groups = [];
		products.forEach( ( product ) => {
			// WC REST API returns product.categories as an array of objects: [{ id, name, slug }]
			// But sometimes custom endpoints or layers might return just IDs.
			const productCats = product.categories || [];
			productCats.forEach( ( catOrId ) => {
				const catId = typeof catOrId === 'object' ? catOrId.id : catOrId;
				let group = groups.find( ( g ) => g.id === catId );
				if ( ! group ) {
					const categoryInfo = allCategories.find( ( c ) => c.id === catId );
					if ( categoryInfo ) {
						group = {
							id: catId,
							name: categoryInfo.name,
							products: [],
						};
						groups.push( group );
					}
				}
				if ( group && ! group.products.find( ( p ) => p.id === product.id ) ) {
					group.products.push( product );
				}
			} );
		} );

		return groups.sort( ( a, b ) => a.name.localeCompare( b.name ) );
	}, [ products, allCategories, isLoading ] );

	const tagOptions = useMemo( () => {
		if ( ! allTags ) return [];
		return allTags.map( ( tag ) => tag.name );
	}, [ allTags ] );

	const updateCategoryStyle = ( key, value ) => {
		setAttributes( {
			categoryStyles: { ...categoryStyles, [ key ]: value },
		} );
	};

	const updateProductStyle = ( key, value ) => {
		setAttributes( {
			productStyles: { ...productStyles, [ key ]: value },
		} );
	};

	const updateCategoryMeta = ( catId, key, value ) => {
		setAttributes( {
			categoryMeta: {
				...categoryMeta,
				[ catId ]: {
					...( categoryMeta[ catId ] || {} ),
					[ key ]: value,
				},
			},
		} );
	};

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

				<PanelBody title={ __( 'Category Styling', 'zenctuary' ) } initialOpen={ false }>
					<PanelColorSettings
						title={ __( 'Category Title', 'zenctuary' ) }
						initialOpen={ false }
						colorSettings={ [
							{
								value: categoryStyles.titleColor,
								onChange: ( val ) => updateCategoryStyle( 'titleColor', val ),
								label: __( 'Title Color', 'zenctuary' ),
							},
						] }
					/>
					<UnitControl
						label={ __( 'Title Font Size', 'zenctuary' ) }
						value={ categoryStyles.titleFontSize }
						onChange={ ( val ) => updateCategoryStyle( 'titleFontSize', val ) }
					/>
					<SelectControl
						label={ __( 'Title Font Weight', 'zenctuary' ) }
						value={ categoryStyles.titleFontWeight }
						options={ [
							{ label: 'Normal', value: '400' },
							{ label: 'Bold', value: '700' },
						] }
						onChange={ ( val ) => updateCategoryStyle( 'titleFontWeight', val ) }
					/>

					<PanelColorSettings
						title={ __( 'Category Description', 'zenctuary' ) }
						initialOpen={ false }
						colorSettings={ [
							{
								value: categoryStyles.descColor,
								onChange: ( val ) => updateCategoryStyle( 'descColor', val ),
								label: __( 'Description Color', 'zenctuary' ),
							},
						] }
					/>
					<UnitControl
						label={ __( 'Description Font Size', 'zenctuary' ) }
						value={ categoryStyles.descFontSize }
						onChange={ ( val ) => updateCategoryStyle( 'descFontSize', val ) }
					/>

					<PanelColorSettings
						title={ __( 'Category Price Text', 'zenctuary' ) }
						initialOpen={ false }
						colorSettings={ [
							{
								value: categoryStyles.priceColor,
								onChange: ( val ) => updateCategoryStyle( 'priceColor', val ),
								label: __( 'Price Color', 'zenctuary' ),
							},
						] }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Category Content Overrides', 'zenctuary' ) } initialOpen={ false }>
					{ groupedData.map( ( group ) => (
						<div key={ group.id } style={ { marginBottom: '20px', borderBottom: '1px solid #eee' } }>
							<p style={ { fontWeight: 'bold' } }>{ group.name }</p>
							<TextControl
								label={ __( 'Custom Price Text', 'zenctuary' ) }
								value={ categoryMeta[ group.id ]?.priceText || '' }
								placeholder={ __( 'e.g. 10.00€', 'zenctuary' ) }
								onChange={ ( val ) => updateCategoryMeta( group.id, 'priceText', val ) }
							/>
							<TextControl
								label={ __( 'Manual Description', 'zenctuary' ) }
								value={ categoryMeta[ group.id ]?.description || '' }
								onChange={ ( val ) => updateCategoryMeta( group.id, 'description', val ) }
							/>
						</div>
					) ) }
				</PanelBody>

				<PanelBody title={ __( 'Product Styling', 'zenctuary' ) } initialOpen={ false }>
					<PanelColorSettings
						title={ __( 'Product Name', 'zenctuary' ) }
						initialOpen={ false }
						colorSettings={ [
							{
								value: productStyles.nameColor,
								onChange: ( val ) => updateProductStyle( 'nameColor', val ),
								label: __( 'Name Color', 'zenctuary' ),
							},
						] }
					/>
					<UnitControl
						label={ __( 'Name Font Size', 'zenctuary' ) }
						value={ productStyles.nameFontSize }
						onChange={ ( val ) => updateProductStyle( 'nameFontSize', val ) }
					/>
					<PanelColorSettings
						title={ __( 'Product Description', 'zenctuary' ) }
						initialOpen={ false }
						colorSettings={ [
							{
								value: productStyles.descColor,
								onChange: ( val ) => updateProductStyle( 'descColor', val ),
								label: __( 'Description Color', 'zenctuary' ),
							},
						] }
					/>
					<UnitControl
						label={ __( 'Description Font Size', 'zenctuary' ) }
						value={ productStyles.descFontSize }
						onChange={ ( val ) => updateProductStyle( 'descFontSize', val ) }
					/>
					<PanelColorSettings
						title={ __( 'Attribute + Price Styling', 'zenctuary' ) }
						initialOpen={ false }
						colorSettings={ [
							{
								value: productStyles.metaColor,
								onChange: ( val ) => updateProductStyle( 'metaColor', val ),
								label: __( 'Color', 'zenctuary' ),
							},
						] }
					/>
					<UnitControl
						label={ __( 'Font Size', 'zenctuary' ) }
						value={ productStyles.metaFontSize }
						onChange={ ( val ) => updateProductStyle( 'metaFontSize', val ) }
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
				{ selectedTags.length > 0 ? selectedTags.map( ( tag ) => {
					const isActive = currentTagId === tag.id;
					const styles = isActive ? activeStyles : inactiveStyles;
					return (
						<span
							key={ tag.id }
							className={ `zen-soul-kitchen__filter-button ${ isActive ? 'is-active' : '' }` }
							onClick={ () => setAttributes( { activeTagId: tag.id } ) }
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

			<div className="zen-soul-kitchen__menu-content" style={ { marginTop: '40px' } }>
				{ isLoading ? (
					<p>{ __( 'Loading products and categories...', 'zenctuary' ) }</p>
				) : groupedData.length > 0 ? groupedData.map( ( group ) => (
					<section key={ group.id } className="zen-soul-kitchen__category" style={ { marginBottom: '40px' } }>
						{ /* ROW 1: CATEGORY HEADER */ }
						<div className="zen-soul-kitchen__category-header" style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid #eee', paddingBottom: '10px' } }>
							<h3 style={ { 
								margin: 0, 
								color: categoryStyles.titleColor,
								fontSize: categoryStyles.titleFontSize,
								fontWeight: categoryStyles.titleFontWeight
							} }>
								{ group.name }
							</h3>
							<span style={ { 
								color: categoryStyles.priceColor,
								fontSize: categoryStyles.priceFontSize,
								textAlign: 'right'
							} }>
								{ categoryMeta[ group.id ]?.priceText || '' }
							</span>
						</div>

						{ /* ROW 2: CATEGORY DESCRIPTION */ }
						{ categoryMeta[ group.id ]?.description && (
							<p className="zen-soul-kitchen__category-description" style={ {
								marginTop: '10px',
								color: categoryStyles.descColor,
								fontSize: categoryStyles.descFontSize,
								fontWeight: categoryStyles.descFontWeight
							} }>
								{ categoryMeta[ group.id ].description }
							</p>
						) }

						{ /* ROW 3 & 4 & 5: PRODUCTS */ }
						<div className="zen-soul-kitchen__products" style={ { marginTop: '20px' } }>
							{ group.products.map( ( product ) => {
								const shortDesc = product.short_description?.rendered || '';
								// Extract price from price_html
								const priceHtml = product.price_html || '';
								const price = priceHtml.replace( /<\/?[^>]+(>|$)/g, "" );
								
								return (
									<article key={ product.id } className="zen-soul-kitchen__product" style={ { marginBottom: '20px' } }>
										{ /* ROW 3: PRODUCT NAME */ }
										<h4 style={ {
											margin: 0,
											color: productStyles.nameColor,
											fontSize: productStyles.nameFontSize,
											fontWeight: productStyles.nameFontWeight
										} }>
											{ product.title?.rendered }
										</h4>

										{ /* ROW 4: PRODUCT DESCRIPTION */ }
										{ shortDesc && (
											<div className="zen-soul-kitchen__product-description" 
												style={ {
													marginTop: '5px',
													color: productStyles.descColor,
													fontSize: productStyles.descFontSize
												} }
												dangerouslySetInnerHTML={ { __html: shortDesc } } 
											/>
										) }

										{ /* ROW 5: CONDITIONAL ROW */ }
										<div className="zen-soul-kitchen__product-meta" style={ {
											marginTop: '5px',
											color: productStyles.metaColor,
											fontSize: productStyles.metaFontSize
										} }>
											{ price ? (
												<span>{ price }</span>
											) : (
												shortDesc && <div dangerouslySetInnerHTML={ { __html: shortDesc } } />
											) }
										</div>
									</article>
								);
							} ) }
						</div>
					</section>
				) ) : (
					<p>{ __( 'No products found for this filter.', 'zenctuary' ) }</p>
				) }
			</div>
		</div>
	);
}
