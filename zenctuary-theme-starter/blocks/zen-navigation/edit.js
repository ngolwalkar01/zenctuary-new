import { __ } from '@wordpress/i18n';
import {
	InspectorControls,
	RichText,
	useBlockProps,
} from '@wordpress/block-editor';
import {
	Button,
	ColorPalette,
	PanelBody,
	RangeControl,
	SelectControl,
	TextControl,
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';

const FONT_WEIGHT_OPTIONS = [
	{ label: 'Regular', value: '400' },
	{ label: 'Medium', value: '500' },
	{ label: 'Semi Bold', value: '600' },
	{ label: 'Bold', value: '700' },
];

const MOBILE_LAYOUT_OPTIONS = [
	{ label: 'Row', value: 'row' },
	{ label: 'Column', value: 'column' },
];

const DEFAULT_TEXT_COLOR = '#000000';
const DEFAULT_HOVER_BG_COLOR = '#f5f5f5';
const DEFAULT_HOVER_TEXT_COLOR = '#000000';
const DEFAULT_FONT_SIZE = 16;
const DEFAULT_FONT_WEIGHT = '500';
const DEFAULT_LETTER_SPACING = 1;

const spacingStyle = ( value = {}, property ) => ( {
	[ `${ property }Top` ]: value.top || '0px',
	[ `${ property }Right` ]: value.right || '0px',
	[ `${ property }Bottom` ]: value.bottom || '0px',
	[ `${ property }Left` ]: value.left || '0px',
} );

function SpacingControls( { label, value = {}, onChange } ) {
	const nextValue = {
		top: value.top || '0px',
		right: value.right || '0px',
		bottom: value.bottom || '0px',
		left: value.left || '0px',
	};

	const updateSide = ( side, sideValue ) => {
		onChange( {
			...nextValue,
			[ side ]: sideValue || '0px',
		} );
	};

	return (
		<div className="zen-navigation-control-grid">
			<p className="components-base-control__label">{ label }</p>
			<UnitControl label={ __( 'Top', 'zenctuary' ) } value={ nextValue.top } onChange={ ( newValue ) => updateSide( 'top', newValue ) } />
			<UnitControl label={ __( 'Right', 'zenctuary' ) } value={ nextValue.right } onChange={ ( newValue ) => updateSide( 'right', newValue ) } />
			<UnitControl label={ __( 'Bottom', 'zenctuary' ) } value={ nextValue.bottom } onChange={ ( newValue ) => updateSide( 'bottom', newValue ) } />
			<UnitControl label={ __( 'Left', 'zenctuary' ) } value={ nextValue.left } onChange={ ( newValue ) => updateSide( 'left', newValue ) } />
		</div>
	);
}

function NavItemControls( { index, item, onUpdate, onRemove, canRemove } ) {
	return (
		<div className="zen-navigation-item-control">
			<TextControl
				label={ `${ __( 'Item', 'zenctuary' ) } ${ index + 1 } - ${ __( 'Label', 'zenctuary' ) }` }
				value={ item.label }
				onChange={ ( value ) => onUpdate( 'label', value ) }
				placeholder={ __( 'Navigation label', 'zenctuary' ) }
			/>
			<TextControl
				label={ `${ __( 'Item', 'zenctuary' ) } ${ index + 1 } - ${ __( 'Anchor', 'zenctuary' ) }` }
				value={ item.anchor }
				onChange={ ( value ) => onUpdate( 'anchor', value ) }
				placeholder={ __( '#section-id', 'zenctuary' ) }
				help={ __( 'Enter the section anchor (e.g., #memberships)', 'zenctuary' ) }
			/>
			{ canRemove && (
				<Button variant="tertiary" isDestructive onClick={ onRemove }>
					{ __( 'Remove Item', 'zenctuary' ) }
				</Button>
			) }
		</div>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const {
		navItems,
		itemGap,
		textColor,
		fontSize,
		fontWeight,
		letterSpacing,
		hoverBgColor,
		hoverTextColor,
		hoverBorderRadius,
		hoverPadding,
		sectionPadding,
		sectionMargin,
		backgroundColor,
		mobileLayout,
	} = attributes;

	const safeNavItems = Array.isArray( navItems ) ? navItems : [];

	const updateNavItem = ( index, key, value ) => {
		setAttributes( {
			navItems: safeNavItems.map( ( item, i ) =>
				i === index ? { ...item, [ key ]: value } : item
			),
		} );
	};

	const addNavItem = () => {
		setAttributes( {
			navItems: [ ...safeNavItems, { label: __( 'New Item', 'zenctuary' ), anchor: '#section' } ],
		} );
	};

	const removeNavItem = ( index ) => {
		setAttributes( {
			navItems: safeNavItems.filter( ( item, i ) => i !== index ),
		} );
	};

	const blockProps = useBlockProps( {
		className: 'zen-navigation',
		style: {
			...spacingStyle( sectionPadding, 'padding' ),
			...spacingStyle( sectionMargin, 'margin' ),
			backgroundColor: backgroundColor || 'transparent',
		},
	} );

	const handleSmoothScroll = ( event, anchor ) => {
		event.preventDefault();
		if ( typeof window !== 'undefined' && anchor ) {
			const targetId = anchor.replace( '#', '' );
			const targetElement = document.getElementById( targetId );
			if ( targetElement ) {
				targetElement.scrollIntoView( { behavior: 'smooth' } );
			}
		}
	};

	const itemStyle = {
		color: textColor || DEFAULT_TEXT_COLOR,
		fontSize: `${ fontSize || DEFAULT_FONT_SIZE }px`,
		fontWeight: fontWeight || DEFAULT_FONT_WEIGHT,
		letterSpacing: `${ letterSpacing || DEFAULT_LETTER_SPACING }px`,
		textTransform: 'uppercase',
	};

	const hoverStyle = {
		backgroundColor: hoverBgColor || DEFAULT_HOVER_BG_COLOR,
		color: hoverTextColor || DEFAULT_HOVER_TEXT_COLOR,
		borderRadius: `${ hoverBorderRadius }px`,
		...spacingStyle( hoverPadding, 'padding' ),
	};

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Navigation Items', 'zenctuary' ) }>
					{ safeNavItems.map( ( item, index ) => (
						<NavItemControls
							key={ index }
							index={ index }
							item={ item }
							onUpdate={ ( key, value ) => updateNavItem( index, key, value ) }
							onRemove={ () => removeNavItem( index ) }
							canRemove={ safeNavItems.length > 1 }
						/>
					) ) }
					<Button variant="primary" onClick={ addNavItem }>
						{ __( 'Add Navigation Item', 'zenctuary' ) }
					</Button>
				</PanelBody>

				<PanelBody title={ __( 'Layout', 'zenctuary' ) }>
					<RangeControl
						label={ __( 'Gap Between Items', 'zenctuary' ) }
						value={ itemGap }
						onChange={ ( value ) => setAttributes( { itemGap: value } ) }
						min={ 0 }
						max={ 120 }
						step={ 4 }
					/>
					<SelectControl
						label={ __( 'Mobile Layout', 'zenctuary' ) }
						value={ mobileLayout }
						options={ MOBILE_LAYOUT_OPTIONS }
						onChange={ ( value ) => setAttributes( { mobileLayout: value } ) }
					/>
					<SpacingControls
						label={ __( 'Section Padding', 'zenctuary' ) }
						value={ sectionPadding }
						onChange={ ( value ) => setAttributes( { sectionPadding: value } ) }
					/>
					<SpacingControls
						label={ __( 'Section Margin', 'zenctuary' ) }
						value={ sectionMargin }
						onChange={ ( value ) => setAttributes( { sectionMargin: value } ) }
					/>
					<p className="components-base-control__label">{ __( 'Background Color', 'zenctuary' ) }</p>
					<ColorPalette
						value={ backgroundColor }
						onChange={ ( value ) => setAttributes( { backgroundColor: value || 'transparent' } ) }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Text Style', 'zenctuary' ) } initialOpen={ false }>
					<p className="components-base-control__label">{ __( 'Text Color', 'zenctuary' ) }</p>
					<ColorPalette
						value={ textColor }
						onChange={ ( value ) => setAttributes( { textColor: value || DEFAULT_TEXT_COLOR } ) }
					/>
					<RangeControl
						label={ __( 'Font Size', 'zenctuary' ) }
						value={ fontSize || DEFAULT_FONT_SIZE }
						onChange={ ( value ) => setAttributes( { fontSize: value } ) }
						min={ 12 }
						max={ 32 }
					/>
					<SelectControl
						label={ __( 'Font Weight', 'zenctuary' ) }
						value={ fontWeight || DEFAULT_FONT_WEIGHT }
						options={ FONT_WEIGHT_OPTIONS }
						onChange={ ( value ) => setAttributes( { fontWeight: value } ) }
					/>
					<RangeControl
						label={ __( 'Letter Spacing', 'zenctuary' ) }
						value={ letterSpacing || DEFAULT_LETTER_SPACING }
						onChange={ ( value ) => setAttributes( { letterSpacing: value } ) }
						min={ 0 }
						max={ 8 }
						step={ 0.5 }
					/>
				</PanelBody>

				<PanelBody title={ __( 'Hover Style', 'zenctuary' ) } initialOpen={ false }>
					<p className="components-base-control__label">{ __( 'Hover Background Color', 'zenctuary' ) }</p>
					<ColorPalette
						value={ hoverBgColor }
						onChange={ ( value ) => setAttributes( { hoverBgColor: value || DEFAULT_HOVER_BG_COLOR } ) }
					/>
					<p className="components-base-control__label">{ __( 'Hover Text Color', 'zenctuary' ) }</p>
					<ColorPalette
						value={ hoverTextColor }
						onChange={ ( value ) => setAttributes( { hoverTextColor: value || DEFAULT_HOVER_TEXT_COLOR } ) }
					/>
					<RangeControl
						label={ __( 'Border Radius', 'zenctuary' ) }
						value={ hoverBorderRadius }
						onChange={ ( value ) => setAttributes( { hoverBorderRadius: value } ) }
						min={ 0 }
						max={ 32 }
					/>
					<SpacingControls
						label={ __( 'Hover Padding', 'zenctuary' ) }
						value={ hoverPadding }
						onChange={ ( value ) => setAttributes( { hoverPadding: value } ) }
					/>
				</PanelBody>
			</InspectorControls>

			<nav { ...blockProps }>
				<div
					className="zen-navigation__inner"
					style={ {
						gap: `${ itemGap }px`,
						flexDirection: mobileLayout === 'column' ? 'column' : 'row',
					} }
				>
					{ safeNavItems.map( ( item, index ) => (
						<a
							key={ index }
							className="zen-navigation__item"
							href={ item.anchor || '#' }
							style={ {
								...itemStyle,
								transition: 'all 0.3s ease',
								cursor: 'pointer',
								textDecoration: 'none',
								display: 'inline-block',
								textAlign: 'center',
							} }
							onMouseEnter={ ( e ) => {
								e.currentTarget.style.backgroundColor = hoverBgColor || DEFAULT_HOVER_BG_COLOR;
								e.currentTarget.style.color = hoverTextColor || DEFAULT_HOVER_TEXT_COLOR;
								e.currentTarget.style.borderRadius = `${ hoverBorderRadius }px`;
								e.currentTarget.style.paddingTop = hoverPadding?.top || '12px';
								e.currentTarget.style.paddingRight = hoverPadding?.right || '24px';
								e.currentTarget.style.paddingBottom = hoverPadding?.bottom || '12px';
								e.currentTarget.style.paddingLeft = hoverPadding?.left || '24px';
							} }
							onMouseLeave={ ( e ) => {
								e.currentTarget.style.backgroundColor = 'transparent';
								e.currentTarget.style.color = textColor || DEFAULT_TEXT_COLOR;
								e.currentTarget.style.borderRadius = '0px';
								e.currentTarget.style.paddingTop = '0px';
								e.currentTarget.style.paddingRight = '0px';
								e.currentTarget.style.paddingBottom = '0px';
								e.currentTarget.style.paddingLeft = '0px';
							} }
							onClick={ ( e ) => handleSmoothScroll( e, item.anchor ) }
						>
							<RichText
								tagName="span"
								value={ item.label }
								onChange={ ( value ) => updateNavItem( index, 'label', value ) }
								placeholder={ __( 'Navigation label', 'zenctuary' ) }
								allowedFormats={ [ 'core/bold', 'core/italic' ] }
							/>
						</a>
					) ) }
				</div>
			</nav>
		</>
	);
}
