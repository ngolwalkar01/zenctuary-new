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
import { useEffect, useMemo } from '@wordpress/element';

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
		const records = select( 'core' ).getEntityRecords( 'postType', 'product', query );
		const isResolving = select( 'core' ).isResolving( 'getEntityRecords', [ 'postType', 'product', query ] );
		
		return {
			products: records || [],
			isLoadingProducts: isResolving,
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
		if ( isLoading || ! products || ! allCategories || products.length === 0 ) return [];

		const groups = [];
		products.forEach( ( product ) => {
			const productCats = product.product_cat || [];
			
			productCats.forEach( ( catId ) => {
				let group = groups.find( ( g ) => g.id === catId );
				if ( ! group ) {
					const categoryInfo = allCategories.find( ( c ) => c.id === catId );
					if ( categoryInfo ) {
						group = {
							id: catId,
							name: categoryInfo.name,
							description: categoryInfo.description,
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

	useEffect( () => {
		if ( ! Array.isArray( products ) || products.length === 0 ) {
			return;
		}

		const firstProduct = products[ 0 ];
		const firstKeys = firstProduct ? Object.keys( firstProduct ) : [];
		const hasPriceField =
			!! firstProduct?.price_html ||
			!! firstProduct?.regular_price ||
			!! firstProduct?.price ||
			!! firstProduct?.prices;
		const hasAttributesField = Array.isArray( firstProduct?.attributes ) && firstProduct.attributes.length > 0;

		// eslint-disable-next-line no-console
		console.groupCollapsed( '[zen-soul-kitchen] Product payload debug' );
		// eslint-disable-next-line no-console
		console.log( 'Query source: getEntityRecords(postType, product, { per_page: -1, product_tag: currentTagId })' );
		// eslint-disable-next-line no-console
		console.log( 'Current tag id:', currentTagId );
		// eslint-disable-next-line no-console
		console.log( 'First product full object:', firstProduct );
		// eslint-disable-next-line no-console
		console.log( 'First product keys:', firstKeys );
		// eslint-disable-next-line no-console
		console.log( 'Price present on first product?', hasPriceField );
		// eslint-disable-next-line no-console
		console.log( 'Attributes present on first product?', hasAttributesField );
		// eslint-disable-next-line no-console
		console.log( 'Raw first product price candidates:', {
			price_html: firstProduct?.price_html,
			regular_price: firstProduct?.regular_price,
			price: firstProduct?.price,
			prices: firstProduct?.prices,
		} );
		// eslint-disable-next-line no-console
		console.log( 'Raw first product attributes value:', firstProduct?.attributes );

		const kaffeCategory = ( allCategories || [] ).find(
			( cat ) => String( cat?.slug || '' ).toLowerCase() === 'kaffe' || String( cat?.name || '' ).toLowerCase() === 'kaffe'
		);
		const kaffeProducts = kaffeCategory
			? products.filter( ( product ) => Array.isArray( product?.product_cat ) && product.product_cat.includes( kaffeCategory.id ) )
			: [];

		// eslint-disable-next-line no-console
		console.log( 'Kaffe category object:', kaffeCategory || null );
		// eslint-disable-next-line no-console
		console.log( 'Kaffe products count in current payload:', kaffeProducts.length );
		if ( kaffeProducts.length > 0 ) {
			// eslint-disable-next-line no-console
			console.log( 'First Kaffe product full object:', kaffeProducts[ 0 ] );
			// eslint-disable-next-line no-console
			console.log( 'First Kaffe product fields:', {
				price_html: kaffeProducts[ 0 ]?.price_html,
				regular_price: kaffeProducts[ 0 ]?.regular_price,
				price: kaffeProducts[ 0 ]?.price,
				prices: kaffeProducts[ 0 ]?.prices,
				attributes: kaffeProducts[ 0 ]?.attributes,
			} );
		}

		// eslint-disable-next-line no-console
		console.groupEnd();
	}, [ products, allCategories, currentTagId ] );

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
						<div className="zen-soul-kitchen__category-header" style={ { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: '10px' } }>
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
						{ ( categoryMeta[ group.id ]?.description || group.description ) && (
							<div className="zen-soul-kitchen__category-description" style={ {
								marginTop: '10px',
								color: categoryStyles.descColor,
								fontSize: categoryStyles.descFontSize,
								fontWeight: categoryStyles.descFontWeight || '400'
							} }>
								{ categoryMeta[ group.id ]?.description || group.description }
							</div>
						) }

						{ /* ROW 3 & 4 & 5: PRODUCTS IN CHUNKS */ }
						{ ( () => {
							const productChunks = [];
							for ( let i = 0; i < group.products.length; i += 3 ) {
								productChunks.push( group.products.slice( i, i + 3 ) );
							}

							return productChunks.map( ( rowProducts, rowIndex ) => (
								<div key={ rowIndex }>
									<div className="zen-soul-kitchen__products zen-products-grid" style={ { marginTop: '20px' } }>
										{ rowProducts.map( ( product ) => {
											const fullDesc = product.content?.rendered || '';
											const shortDesc = product.excerpt?.rendered || '';
											
											// Price extraction
											const priceHtml = product.price_html || '';
											const priceLabel = priceHtml.replace( /<\/?[^>]+(>|$)/g, "" );
											
											// Attributes
											const attrString = ( product.attributes || [] )
												.map( attr => attr.options ? attr.options.join(', ') : '' )
												.filter( Boolean )
												.join(' / ');

											const metaParts = [ attrString, priceLabel ].filter( Boolean );
											const metaString = metaParts.join(' / ');

											return (
												<article key={ product.id } className="zen-soul-kitchen__product zen-product-card">
													{ /* ROW 1: PRODUCT NAME */ }
													<h4 style={ {
														margin: 0,
														color: productStyles.nameColor,
														fontSize: productStyles.nameFontSize,
														fontWeight: productStyles.nameFontWeight
													} }>
														{ product.title?.rendered }
													</h4>

													{ /* ROW 2: PRODUCT DESCRIPTION (FULL) */ }
													{ fullDesc && (
														<div className="zen-soul-kitchen__product-description" 
															style={ {
																marginTop: '5px',
																color: productStyles.descColor,
																fontSize: productStyles.descFontSize
															} }
															dangerouslySetInnerHTML={ { __html: fullDesc } } 
														/>
													) }

													{ /* ROW 3: PRODUCT SHORT DESCRIPTION */ }
													{ shortDesc && (
														<div className="zen-soul-kitchen__product-short-description" 
															style={ {
																marginTop: '5px',
																color: productStyles.descColor,
																fontSize: productStyles.descFontSize
															} }
															dangerouslySetInnerHTML={ { __html: shortDesc } } 
														/>
													) }

													{ /* ROW 4: ATTRIBUTE + PRICE ROW */ }
													{ metaString && (
														<div className="zen-soul-kitchen__product-meta" style={ {
															marginTop: '5px',
															color: productStyles.metaColor,
															fontSize: productStyles.metaFontSize
														} }>
															<span>{ metaString }</span>
														</div>
													) }
												</article>
											);
										} ) }
									</div>
									{ rowIndex < productChunks.length - 1 && (
										<hr className="zen-soul-kitchen__row-separator" />
									) }
								</div>
							) );
						} )() }
					</section>
				) ) : (
					<p>{ __( 'No products found for this filter.', 'zenctuary' ) }</p>
				) }
			</div>
		</div>
	);
}
