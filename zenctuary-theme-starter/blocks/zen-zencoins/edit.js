import { __ } from '@wordpress/i18n';
import { InspectorControls, RichText, useBlockProps } from '@wordpress/block-editor';
import { Button, ColorPalette, PanelBody, RangeControl, SelectControl, TextControl, ToggleControl, __experimentalUnitControl as UnitControl } from '@wordpress/components';
import { useEffect, useMemo, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

const WEIGHTS = [ '400', '500', '600', '700', '800' ].map( ( value ) => ( { label: value, value } ) );
const ARROWS = [ 'left', 'right', 'top', 'bottom' ].map( ( value ) => ( { label: value, value } ) );
const TYPES = [
	{ label: 'Taxonomy + Price Row', value: 'taxonomy' },
	{ label: 'Separator', value: 'separator' },
	{ label: 'Paragraph', value: 'paragraph' },
];
const DEFAULT_SPACING = { top: '0px', right: '0px', bottom: '0px', left: '0px' };

const norm = ( value = {} ) => ( { ...DEFAULT_SPACING, ...value } );
const spacingStyle = ( value = {}, prop ) => {
	const s = norm( value );
	return { [ `${ prop }Top` ]: s.top, [ `${ prop }Right` ]: s.right, [ `${ prop }Bottom` ]: s.bottom, [ `${ prop }Left` ]: s.left };
};

function SpacingControls( { label, value, onChange } ) {
	const s = norm( value );
	const set = ( side, sideValue ) => onChange( { ...s, [ side ]: sideValue || '0px' } );
	return (
		<div className="zen-zencoins-control-grid">
			<p className="components-base-control__label">{ label }</p>
			<UnitControl label="Top" value={ s.top } onChange={ ( v ) => set( 'top', v ) } />
			<UnitControl label="Right" value={ s.right } onChange={ ( v ) => set( 'right', v ) } />
			<UnitControl label="Bottom" value={ s.bottom } onChange={ ( v ) => set( 'bottom', v ) } />
			<UnitControl label="Left" value={ s.left } onChange={ ( v ) => set( 'left', v ) } />
		</div>
	);
}

function Coin( { value = '', size = 52, className = '' } ) {
	const hasValue = value !== undefined && value !== null && `${ value }` !== '';
	return (
		<span className={ `zen-zencoins-coin ${ className }` } style={ { width: `${ size }px`, height: `${ size }px`, fontSize: `${ Math.max( 12, Math.round( size * 0.34 ) ) }px` } }>
			<span className="zen-zencoins-coin__ring" />
			{ hasValue && <span className="zen-zencoins-coin__value">{ value }</span> }
		</span>
	);
}

function CoinStack( { coins = [], size = 52 } ) {
	return (
		<span className="zen-zencoins-coin-stack" style={ { '--zen-zencoins-overlap': `${ Math.round( size * -0.34 ) }px` } }>
			{ coins.map( ( coin, index ) => <Coin key={ index } value={ coin?.value ?? coin ?? '' } size={ size } className="zen-zencoins-coin-stack__coin" /> ) }
		</span>
	);
}

function ArrowIcon() {
	return <svg viewBox="0 0 18 18" aria-hidden="true" focusable="false"><path d="M9.7 3.3 15.4 9l-5.7 5.7-1.2-1.2 3.7-3.7H2.6V8.2h9.6L8.5 4.5z" /></svg>;
}

const newRow = ( type ) => {
	const id = `${ type }-${ Date.now() }`;
	if ( type === 'separator' ) return { id, type, width: 100, thickness: 3, color: '#949494' };
	if ( type === 'paragraph' ) return { id, type, text: '', color: '#b9b9b9', fontSize: 17, fontWeight: '400', margin: { ...DEFAULT_SPACING, top: '8px' }, padding: DEFAULT_SPACING };
	return { id, type: 'taxonomy', termIds: [], termNames: [], coinSize: 50, labelFontSize: 18, labelFontWeight: '800', labelColor: '#f1eee7', priceLabelColor: '#d8b354', priceFontSize: 18, priceFontWeight: '800' };
};

export default function Edit( { attributes, setAttributes } ) {
	const [ terms, setTerms ] = useState( [] );
	const [ selectedRowIndex, setSelectedRowIndex ] = useState( 0 );
	const rows = Array.isArray( attributes.rows ) ? attributes.rows : [];
	const selectedRow = rows[ selectedRowIndex ];
	const headingCoins = Array.isArray( attributes.headingCoins ) ? attributes.headingCoins : [];

	useEffect( () => {
		apiFetch( { path: '/wp/v2/experience_category?per_page=100&_fields=id,name' } )
			.then( ( data ) => setTerms( data.map( ( term ) => ( { label: term.name, value: String( term.id ), id: term.id, name: term.name } ) ) ) )
			.catch( () => setTerms( [] ) );
	}, [] );

	useEffect( () => {
		if ( selectedRowIndex > rows.length - 1 ) setSelectedRowIndex( Math.max( rows.length - 1, 0 ) );
	}, [ rows.length, selectedRowIndex ] );

	const termNames = useMemo( () => Object.fromEntries( terms.map( ( term ) => [ term.value, term.name ] ) ), [ terms ] );
	const setRow = ( index, patch ) => setAttributes( { rows: rows.map( ( row, rowIndex ) => rowIndex === index ? { ...row, ...patch } : row ) } );
	const addRow = ( type ) => { setAttributes( { rows: [ ...rows, newRow( type ) ] } ); setSelectedRowIndex( rows.length ); };
	const removeRow = () => { setAttributes( { rows: rows.filter( ( row, index ) => index !== selectedRowIndex ) } ); setSelectedRowIndex( Math.max( selectedRowIndex - 1, 0 ) ); };
	const changeType = ( type ) => selectedRow && setRow( selectedRowIndex, { ...newRow( type ), id: selectedRow.id } );
	const moveRow = ( amount ) => {
		const nextIndex = selectedRowIndex + amount;
		if ( nextIndex < 0 || nextIndex >= rows.length ) return;
		const nextRows = [ ...rows ];
		const [ row ] = nextRows.splice( selectedRowIndex, 1 );
		nextRows.splice( nextIndex, 0, row );
		setAttributes( { rows: nextRows } );
		setSelectedRowIndex( nextIndex );
	};
	const setTermsForRow = ( values ) => {
		const ids = ( Array.isArray( values ) ? values : [ values ] ).filter( Boolean ).slice( 0, 2 );
		setRow( selectedRowIndex, { termIds: ids.map( Number ), termNames: ids.map( ( id ) => termNames[ id ] ).filter( Boolean ) } );
	};

	const blockProps = useBlockProps( {
		className: 'zen-zencoins',
		style: { ...spacingStyle( attributes.sectionPadding, 'padding' ), '--zen-zencoins-column-gap': `${ attributes.columnGap }px` },
	} );
	const buttonStyle = { backgroundColor: attributes.buttonBackgroundColor, color: attributes.buttonTextColor, fontSize: `${ attributes.buttonFontSize }px`, fontWeight: attributes.buttonFontWeight, borderRadius: `${ attributes.buttonBorderRadius }px`, ...spacingStyle( attributes.buttonPadding, 'padding' ) };
	const renderCoins = ( row ) => row.id === 'taxonomy-2' ? [ { value: '6' }, { value: '8' } ] : [ { value: '5' } ];

	const renderRow = ( row, index ) => {
		if ( row.type === 'separator' ) {
			return <div className="zen-zencoins__row-control" key={ row.id || index } onClick={ () => setSelectedRowIndex( index ) }><span className="zen-zencoins__separator" style={ { width: `${ row.width || 100 }%`, borderTopColor: row.color, borderTopWidth: `${ row.thickness || 1 }px` } } /></div>;
		}
		if ( row.type === 'paragraph' ) {
			return <RichText key={ row.id || index } tagName="p" className="zen-zencoins__right-paragraph" value={ row.text } onChange={ ( text ) => setRow( index, { text } ) } onFocus={ () => setSelectedRowIndex( index ) } placeholder="Description..." style={ { color: row.color, fontSize: `${ row.fontSize }px`, fontWeight: row.fontWeight, ...spacingStyle( row.margin, 'margin' ), ...spacingStyle( row.padding, 'padding' ) } } allowedFormats={ [ 'core/bold', 'core/italic', 'core/link' ] } />;
		}
		const names = row.termNames?.length ? row.termNames : ( row.termIds || [] ).map( ( id ) => termNames[ String( id ) ] ).filter( Boolean );
		return (
			<div className="zen-zencoins__data-row" key={ row.id || index } onClick={ () => setSelectedRowIndex( index ) }>
				<div className="zen-zencoins__term-label" style={ { color: row.labelColor, fontSize: `${ row.labelFontSize }px`, fontWeight: row.labelFontWeight } }>{ ( names.length ? names.join( ' + ' ) : 'Select experience category' ).toUpperCase() }</div>
				<div className="zen-zencoins__price" style={ { fontSize: `${ row.priceFontSize }px`, fontWeight: row.priceFontWeight } }><span style={ { color: row.priceLabelColor } }>ZENCOINS:</span><CoinStack coins={ renderCoins( row ) } size={ row.coinSize || 50 } /></div>
			</div>
		);
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title="Layout" initialOpen>
					<SpacingControls label="Section padding" value={ attributes.sectionPadding } onChange={ ( sectionPadding ) => setAttributes( { sectionPadding } ) } />
					<RangeControl label="Column gap" value={ attributes.columnGap } onChange={ ( columnGap ) => setAttributes( { columnGap } ) } min={ 20 } max={ 180 } />
				</PanelBody>
				<PanelBody title="Heading and coins" initialOpen={ false }>
					<RangeControl label="Heading size" value={ attributes.headingFontSize } onChange={ ( headingFontSize ) => setAttributes( { headingFontSize } ) } min={ 18 } max={ 80 } />
					<SelectControl label="Heading weight" value={ attributes.headingFontWeight } options={ WEIGHTS } onChange={ ( headingFontWeight ) => setAttributes( { headingFontWeight } ) } />
					<p className="components-base-control__label">Heading color</p><ColorPalette value={ attributes.headingColor } onChange={ ( headingColor ) => setAttributes( { headingColor: headingColor || '#d8b354' } ) } />
					<RangeControl label="Coin size" value={ attributes.headingCoinSize } onChange={ ( headingCoinSize ) => setAttributes( { headingCoinSize } ) } min={ 28 } max={ 110 } />
					{ headingCoins.map( ( coin, index ) => <TextControl key={ index } label={ `Coin ${ index + 1 } value` } value={ coin?.value || '' } onChange={ ( value ) => setAttributes( { headingCoins: headingCoins.map( ( c, i ) => i === index ? { value } : c ) } ) } help="Leave empty for a blank coin." /> ) }
				</PanelBody>
				<PanelBody title="Paragraph" initialOpen={ false }>
					<RangeControl label="Font size" value={ attributes.paragraphFontSize } onChange={ ( paragraphFontSize ) => setAttributes( { paragraphFontSize } ) } min={ 12 } max={ 40 } />
					<SelectControl label="Font weight" value={ attributes.paragraphFontWeight } options={ WEIGHTS } onChange={ ( paragraphFontWeight ) => setAttributes( { paragraphFontWeight } ) } />
					<p className="components-base-control__label">Color</p><ColorPalette value={ attributes.paragraphColor } onChange={ ( paragraphColor ) => setAttributes( { paragraphColor: paragraphColor || '#f1eee7' } ) } />
				</PanelBody>
				<PanelBody title="Button" initialOpen={ false }>
					<TextControl label="URL" value={ attributes.buttonUrl } onChange={ ( buttonUrl ) => setAttributes( { buttonUrl } ) } />
					<ToggleControl label="Show arrow" checked={ attributes.showArrow } onChange={ ( showArrow ) => setAttributes( { showArrow } ) } />
					{ attributes.showArrow && <SelectControl label="Arrow position" value={ attributes.arrowPosition } options={ ARROWS } onChange={ ( arrowPosition ) => setAttributes( { arrowPosition } ) } /> }
					<RangeControl label="Font size" value={ attributes.buttonFontSize } onChange={ ( buttonFontSize ) => setAttributes( { buttonFontSize } ) } min={ 12 } max={ 32 } />
					<SelectControl label="Font weight" value={ attributes.buttonFontWeight } options={ WEIGHTS } onChange={ ( buttonFontWeight ) => setAttributes( { buttonFontWeight } ) } />
					<RangeControl label="Border radius" value={ attributes.buttonBorderRadius } onChange={ ( buttonBorderRadius ) => setAttributes( { buttonBorderRadius } ) } min={ 0 } max={ 60 } />
					<p className="components-base-control__label">Text color</p><ColorPalette value={ attributes.buttonTextColor } onChange={ ( buttonTextColor ) => setAttributes( { buttonTextColor: buttonTextColor || '#3f3d3d' } ) } />
					<p className="components-base-control__label">Background</p><ColorPalette value={ attributes.buttonBackgroundColor } onChange={ ( buttonBackgroundColor ) => setAttributes( { buttonBackgroundColor: buttonBackgroundColor || '#d8b354' } ) } />
					<SpacingControls label="Padding" value={ attributes.buttonPadding } onChange={ ( buttonPadding ) => setAttributes( { buttonPadding } ) } />
				</PanelBody>
				<PanelBody title="Right panel" initialOpen={ false }>
					<RangeControl label="Border width" value={ attributes.panelBorderWidth } onChange={ ( panelBorderWidth ) => setAttributes( { panelBorderWidth } ) } min={ 0 } max={ 10 } />
					<RangeControl label="Border radius" value={ attributes.panelBorderRadius } onChange={ ( panelBorderRadius ) => setAttributes( { panelBorderRadius } ) } min={ 0 } max={ 60 } />
					<p className="components-base-control__label">Border color</p><ColorPalette value={ attributes.panelBorderColor } onChange={ ( panelBorderColor ) => setAttributes( { panelBorderColor: panelBorderColor || '#f1eee7' } ) } />
					<TextControl label="Conversion coin value" value={ attributes.conversionCoinValue } onChange={ ( conversionCoinValue ) => setAttributes( { conversionCoinValue } ) } />
					<RangeControl label="Conversion coin size" value={ attributes.conversionCoinSize } onChange={ ( conversionCoinSize ) => setAttributes( { conversionCoinSize } ) } min={ 28 } max={ 100 } />
					<TextControl label="Conversion label" value={ attributes.conversionLabel } onChange={ ( conversionLabel ) => setAttributes( { conversionLabel } ) } />
					<TextControl label="Conversion value" value={ attributes.conversionValue } onChange={ ( conversionValue ) => setAttributes( { conversionValue } ) } />
					<RangeControl label="Conversion size" value={ attributes.conversionFontSize } onChange={ ( conversionFontSize ) => setAttributes( { conversionFontSize } ) } min={ 12 } max={ 44 } />
					<SelectControl label="Conversion weight" value={ attributes.conversionFontWeight } options={ WEIGHTS } onChange={ ( conversionFontWeight ) => setAttributes( { conversionFontWeight } ) } />
					<RangeControl label="Separator width" value={ attributes.separatorWidth } onChange={ ( separatorWidth ) => setAttributes( { separatorWidth } ) } min={ 10 } max={ 100 } />
					<RangeControl label="Separator thickness" value={ attributes.separatorThickness } onChange={ ( separatorThickness ) => setAttributes( { separatorThickness } ) } min={ 1 } max={ 10 } />
					<p className="components-base-control__label">Separator color</p><ColorPalette value={ attributes.separatorColor } onChange={ ( separatorColor ) => setAttributes( { separatorColor: separatorColor || '#949494' } ) } />
				</PanelBody>
				<PanelBody title="Dynamic rows" initialOpen>
					{ rows.length > 0 && <SelectControl label="Selected row" value={ selectedRowIndex } options={ rows.map( ( row, index ) => ( { label: `${ index + 1 }. ${ row.type }`, value: index } ) ) } onChange={ ( value ) => setSelectedRowIndex( Number( value ) ) } /> }
					{ selectedRow && <SelectControl label="Row type" value={ selectedRow.type } options={ TYPES } onChange={ changeType } /> }
					{ selectedRow?.type === 'taxonomy' && <>
						<SelectControl multiple label="Experience categories (max 2)" value={ ( selectedRow.termIds || [] ).map( String ) } options={ terms } onChange={ setTermsForRow } />
						<RangeControl label="Coin size" value={ selectedRow.coinSize } onChange={ ( coinSize ) => setRow( selectedRowIndex, { coinSize } ) } min={ 28 } max={ 90 } />
						<RangeControl label="Label size" value={ selectedRow.labelFontSize } onChange={ ( labelFontSize ) => setRow( selectedRowIndex, { labelFontSize } ) } min={ 12 } max={ 36 } />
						<SelectControl label="Label weight" value={ selectedRow.labelFontWeight } options={ WEIGHTS } onChange={ ( labelFontWeight ) => setRow( selectedRowIndex, { labelFontWeight } ) } />
						<RangeControl label="Price size" value={ selectedRow.priceFontSize } onChange={ ( priceFontSize ) => setRow( selectedRowIndex, { priceFontSize } ) } min={ 12 } max={ 36 } />
						<p className="components-base-control__label">Label color</p><ColorPalette value={ selectedRow.labelColor } onChange={ ( labelColor ) => setRow( selectedRowIndex, { labelColor: labelColor || '#f1eee7' } ) } />
					</> }
					{ selectedRow?.type === 'separator' && <>
						<RangeControl label="Width" value={ selectedRow.width } onChange={ ( width ) => setRow( selectedRowIndex, { width } ) } min={ 10 } max={ 100 } />
						<RangeControl label="Thickness" value={ selectedRow.thickness } onChange={ ( thickness ) => setRow( selectedRowIndex, { thickness } ) } min={ 1 } max={ 10 } />
						<p className="components-base-control__label">Color</p><ColorPalette value={ selectedRow.color } onChange={ ( color ) => setRow( selectedRowIndex, { color: color || '#949494' } ) } />
					</> }
					{ selectedRow?.type === 'paragraph' && <>
						<RangeControl label="Font size" value={ selectedRow.fontSize } onChange={ ( fontSize ) => setRow( selectedRowIndex, { fontSize } ) } min={ 12 } max={ 36 } />
						<SelectControl label="Weight" value={ selectedRow.fontWeight } options={ WEIGHTS } onChange={ ( fontWeight ) => setRow( selectedRowIndex, { fontWeight } ) } />
						<p className="components-base-control__label">Color</p><ColorPalette value={ selectedRow.color } onChange={ ( color ) => setRow( selectedRowIndex, { color: color || '#b9b9b9' } ) } />
						<SpacingControls label="Margin" value={ selectedRow.margin } onChange={ ( margin ) => setRow( selectedRowIndex, { margin } ) } />
						<SpacingControls label="Padding" value={ selectedRow.padding } onChange={ ( padding ) => setRow( selectedRowIndex, { padding } ) } />
					</> }
					<div className="zen-zencoins-actions"><Button variant="secondary" onClick={ () => moveRow( -1 ) }>Move up</Button><Button variant="secondary" onClick={ () => moveRow( 1 ) }>Move down</Button><Button variant="tertiary" isDestructive onClick={ removeRow }>Remove</Button></div>
					<div className="zen-zencoins-actions"><Button variant="primary" onClick={ () => addRow( 'taxonomy' ) }>Add taxonomy row</Button><Button variant="secondary" onClick={ () => addRow( 'separator' ) }>Add separator</Button><Button variant="secondary" onClick={ () => addRow( 'paragraph' ) }>Add paragraph</Button></div>
				</PanelBody>
			</InspectorControls>
			<section { ...blockProps }>
				<div className="zen-zencoins__inner">
					<div className="zen-zencoins__left">
						<div className="zen-zencoins__heading-row">
							<RichText tagName="h2" className="zen-zencoins__heading" value={ attributes.heading } onChange={ ( heading ) => setAttributes( { heading } ) } style={ { color: attributes.headingColor, fontSize: `${ attributes.headingFontSize }px`, fontWeight: attributes.headingFontWeight } } allowedFormats={ [ 'core/bold', 'core/italic' ] } />
							<CoinStack coins={ headingCoins } size={ attributes.headingCoinSize } />
						</div>
						<RichText tagName="p" className="zen-zencoins__paragraph" value={ attributes.paragraph } onChange={ ( paragraph ) => setAttributes( { paragraph } ) } style={ { color: attributes.paragraphColor, fontSize: `${ attributes.paragraphFontSize }px`, fontWeight: attributes.paragraphFontWeight } } allowedFormats={ [ 'core/bold', 'core/italic', 'core/link' ] } />
						<a className={ `zen-zencoins__button is-arrow-${ attributes.arrowPosition }` } href={ attributes.buttonUrl || '#' } style={ buttonStyle } onClick={ ( event ) => event.preventDefault() }>
							{ attributes.showArrow && [ 'left', 'top' ].includes( attributes.arrowPosition ) && <span className="zen-zencoins__button-icon"><ArrowIcon /></span> }
							<RichText tagName="span" value={ attributes.buttonText } onChange={ ( buttonText ) => setAttributes( { buttonText } ) } allowedFormats={ [ 'core/bold', 'core/italic' ] } />
							{ attributes.showArrow && [ 'right', 'bottom' ].includes( attributes.arrowPosition ) && <span className="zen-zencoins__button-icon"><ArrowIcon /></span> }
						</a>
					</div>
					<div className="zen-zencoins__panel" style={ { borderColor: attributes.panelBorderColor, borderWidth: `${ attributes.panelBorderWidth }px`, borderRadius: `${ attributes.panelBorderRadius }px` } }>
						<div className="zen-zencoins__conversion" style={ { fontSize: `${ attributes.conversionFontSize }px`, fontWeight: attributes.conversionFontWeight } }>
							<span className="zen-zencoins__conversion-accent" style={ { color: attributes.conversionAccentColor } }><Coin value={ attributes.conversionCoinValue } size={ attributes.conversionCoinSize } />{ attributes.conversionLabel }</span>
							<span style={ { color: attributes.conversionValueColor } }>{ attributes.conversionValue }</span>
						</div>
						<span className="zen-zencoins__separator" style={ { width: `${ attributes.separatorWidth }%`, borderTopColor: attributes.separatorColor, borderTopWidth: `${ attributes.separatorThickness }px` } } />
						<div className="zen-zencoins__rows">{ rows.map( renderRow ) }</div>
					</div>
				</div>
			</section>
		</>
	);
}
