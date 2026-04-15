import { useBlockProps } from '@wordpress/block-editor';

const spacingStyle = ( value = {}, property ) => ( {
	[ `${ property }Top` ]: value.top || '0px',
	[ `${ property }Right` ]: value.right || '0px',
	[ `${ property }Bottom` ]: value.bottom || '0px',
	[ `${ property }Left` ]: value.left || '0px',
} );

export default function save( { attributes } ) {
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

	const blockProps = useBlockProps.save( {
		className: 'zen-navigation',
		style: {
			...spacingStyle( sectionPadding, 'padding' ),
			...spacingStyle( sectionMargin, 'margin' ),
			backgroundColor: backgroundColor || 'transparent',
			'--zen-nav-hover-bg': hoverBgColor || '#f5f5f5',
			'--zen-nav-hover-text': hoverTextColor || '#000000',
			'--zen-nav-hover-radius': `${ hoverBorderRadius }px`,
			'--zen-nav-hover-pad-top': hoverPadding?.top || '12px',
			'--zen-nav-hover-pad-right': hoverPadding?.right || '24px',
			'--zen-nav-hover-pad-bottom': hoverPadding?.bottom || '12px',
			'--zen-nav-hover-pad-left': hoverPadding?.left || '24px',
		},
	} );

	return (
		<nav { ...blockProps }>
			<div
				className="zen-navigation__inner"
				style={ {
					gap: `${ itemGap }px`,
				} }
			>
				{ safeNavItems.map( ( item, index ) => {
					const itemStyle = {
						color: textColor || '#000000',
						fontSize: `${ fontSize || 16 }px`,
						fontWeight: fontWeight || '500',
						letterSpacing: `${ letterSpacing || 1 }px`,
						textTransform: 'uppercase',
						transition: 'all 0.3s ease',
					};

					return (
						<a
							key={ index }
							className="zen-navigation__item"
							href={ item.anchor || '#' }
							style={ itemStyle }
						>
							<span>{ item.label || '' }</span>
						</a>
					);
				} ) }
			</div>
		</nav>
	);
}
