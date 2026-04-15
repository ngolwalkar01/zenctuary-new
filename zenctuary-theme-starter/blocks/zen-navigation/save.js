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
						paddingTop: hoverPadding?.top || '12px',
						paddingRight: hoverPadding?.right || '24px',
						paddingBottom: hoverPadding?.bottom || '12px',
						paddingLeft: hoverPadding?.left || '24px',
						borderRadius: `${ hoverBorderRadius }px`,
						transition: 'all 0.3s ease',
					};

					const hoverStyle = `
						.zen-navigation__item:hover,
						.zen-navigation__item:focus {
							background-color: ${ hoverBgColor || '#f5f5f5' };
							color: ${ hoverTextColor || '#000000' };
							border-radius: ${ hoverBorderRadius }px;
						}
					`;

					return (
						<a
							key={ index }
							className="zen-navigation__item"
							href={ item.anchor || '#' }
							style={ itemStyle }
						>
							<span dangerouslySetInnerHTML={ { __html: item.label || '' } } />
							<style>{ hoverStyle }</style>
						</a>
					);
				} ) }
			</div>
		</nav>
	);
}
