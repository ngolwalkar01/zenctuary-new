import { __ } from '@wordpress/i18n';
import { InspectorControls, RichText, useBlockProps } from '@wordpress/block-editor';
import {
	BaseControl,
	Button,
	CheckboxControl,
	ColorPalette,
	PanelBody,
	RangeControl,
	SelectControl,
	Spinner,
	TextControl,
	ToggleControl,
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';
import { useEffect, useMemo, useRef, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

const PRESET_COLORS = [
	{ name: 'Sand', color: '#f4efe7' },
	{ name: 'Ink', color: '#1b1b1b' },
	{ name: 'White', color: '#ffffff' },
	{ name: 'Clay', color: '#7a5d4b' },
	{ name: 'Olive', color: '#4d5a47' },
	{ name: 'Gold', color: '#d8b355' },
];

const FONT_FAMILIES = [
	{ label: __( 'Montserrat', 'zenctuary' ), value: 'var(--wp--preset--font-family--montserrat)' },
	{ label: __( 'DM Sans', 'zenctuary' ), value: 'var(--wp--preset--font-family--dm-sans)' },
];

function getSpacingStyle( value = {}, property ) {
	return {
		[ `${ property }Top` ]: value.top || '0px',
		[ `${ property }Right` ]: value.right || '0px',
		[ `${ property }Bottom` ]: value.bottom || '0px',
		[ `${ property }Left` ]: value.left || '0px',
	};
}

function SpacingControls( { label, value = {}, onChange } ) {
	const nextValue = {
		top: value.top || '0px',
		right: value.right || '0px',
		bottom: value.bottom || '0px',
		left: value.left || '0px',
	};

	function updateSide( side, sideValue ) {
		onChange( { ...nextValue, [ side ]: sideValue || '0px' } );
	}

	return (
		<div className="premium-tabs-carousel__spacing-control">
			<p className="components-base-control__label">{ label }</p>
			<UnitControl label={ __( 'Top', 'zenctuary' ) } value={ nextValue.top } onChange={ ( newValue ) => updateSide( 'top', newValue ) } />
			<UnitControl label={ __( 'Right', 'zenctuary' ) } value={ nextValue.right } onChange={ ( newValue ) => updateSide( 'right', newValue ) } />
			<UnitControl label={ __( 'Bottom', 'zenctuary' ) } value={ nextValue.bottom } onChange={ ( newValue ) => updateSide( 'bottom', newValue ) } />
			<UnitControl label={ __( 'Left', 'zenctuary' ) } value={ nextValue.left } onChange={ ( newValue ) => updateSide( 'left', newValue ) } />
		</div>
	);
}

function arrowIcon() {
	return (
		<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path d="M3.5 12H18.5M18.5 12L13.5 7M18.5 12L13.5 17" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	);
}

function navigationIcon( iconSet = 'line-arrow', direction = 'next' ) {
	const isNext = direction === 'next';

	if ( iconSet === 'dashicons-arrow-alt2' ) {
		return <span className={ `premium-tabs-carousel__arrow-icon dashicons ${ isNext ? 'dashicons-arrow-right-alt2' : 'dashicons-arrow-left-alt2' }` } aria-hidden="true" />;
	}

	if ( iconSet === 'dashicons-controls' ) {
		return <span className={ `premium-tabs-carousel__arrow-icon dashicons ${ isNext ? 'dashicons-controls-forward' : 'dashicons-controls-back' }` } aria-hidden="true" />;
	}

	if ( iconSet === 'chevron' ) {
		return (
			<svg className="premium-tabs-carousel__arrow-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
				<path d={ isNext ? 'M9 5L16 12L9 19' : 'M15 5L8 12L15 19' } stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		);
	}

	if ( iconSet === 'caret' ) {
		return (
			<svg className="premium-tabs-carousel__arrow-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
				<path d={ isNext ? 'M10 7L15 12L10 17' : 'M14 7L9 12L14 17' } stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		);
	}

	return <span className="premium-tabs-carousel__arrow-icon" aria-hidden="true">{ isNext ? '\u2192' : '\u2190' }</span>;
}

function stripHtml( value = '' ) {
	return String( value )
		.replace( /<[^>]*>/g, ' ' )
		.replace( /&nbsp;/g, ' ' )
		.replace( /&amp;/g, '&' )
		.replace( /&#8211;/g, '-' )
		.replace( /&#8212;/g, '-' )
		.replace( /\s+/g, ' ' )
		.trim();
}

function getEmbeddedImage( post ) {
	return post?._embedded?.[ 'wp:featuredmedia' ]?.[ 0 ]?.source_url || '';
}

function getTeacherTitle( post ) {
	return stripHtml( post?.title?.rendered ) || __( 'Teacher', 'zenctuary' );
}

export default function Edit( { attributes, setAttributes } ) {
	const [ teachers, setTeachers ] = useState( [] );
	const [ isLoading, setIsLoading ] = useState( true );
	const [ fetchError, setFetchError ] = useState( '' );
	const editorTrackRef = useRef( null );
	const excludedIds = Array.isArray( attributes.excludedTeacherIds ) ? attributes.excludedTeacherIds.map( Number ) : [];

	useEffect( () => {
		let isMounted = true;
		setIsLoading( true );
		setFetchError( '' );

		apiFetch( { path: '/wp/v2/teacher?per_page=100&orderby=title&order=asc&_embed=1' } )
			.then( ( posts ) => {
				if ( isMounted ) {
					setTeachers( Array.isArray( posts ) ? posts : [] );
					setIsLoading( false );
				}
			} )
			.catch( () => {
				if ( isMounted ) {
					setTeachers( [] );
					setFetchError( __( 'Teacher posts could not be loaded. Make sure the Zen Teachers plugin is active.', 'zenctuary' ) );
					setIsLoading( false );
				}
			} );

		return () => {
			isMounted = false;
		};
	}, [] );

	const visibleTeachers = useMemo(
		() => teachers.filter( ( teacher ) => ! excludedIds.includes( Number( teacher.id ) ) ),
		[ teachers, excludedIds ]
	);

	function toggleTeacher( teacherId, enabled ) {
		const id = Number( teacherId );
		const nextExcluded = enabled
			? excludedIds.filter( ( currentId ) => currentId !== id )
			: Array.from( new Set( [ ...excludedIds, id ] ) );

		setAttributes( { excludedTeacherIds: nextExcluded } );
	}

	function scrollEditor( direction ) {
		const track = editorTrackRef.current;
		if ( ! track ) {
			return;
		}

		const firstSlide = track.querySelector( '.premium-tabs-carousel__slide' );
		const gap = Number.parseFloat( window.getComputedStyle( track ).columnGap || window.getComputedStyle( track ).gap || '24' ) || 24;
		const distance = firstSlide ? firstSlide.getBoundingClientRect().width + gap : track.clientWidth * 0.85;
		track.scrollBy( { left: direction * distance, behavior: 'smooth' } );
	}

	const blockProps = useBlockProps( {
		className: 'premium-tabs-carousel is-editor-preview',
		style: {
			backgroundColor: attributes.backgroundColor,
			...getSpacingStyle( attributes.sectionPadding, 'padding' ),
			'--premium-tabs-content-max-width': `${ attributes.contentMaxWidth || 1320 }px`,
			'--premium-tabs-gap': `${ attributes.gap || 24 }px`,
			'--premium-tabs-card-radius': `${ attributes.cardBorderRadius || 20 }px`,
			'--premium-tabs-card-padding': `${ attributes.cardContentPadding || 24 }px`,
			'--premium-tabs-heading-max-width': `${ attributes.headingMaxWidth || 760 }px`,
			'--premium-tabs-heading-family': attributes.headingFontFamily || 'var(--wp--preset--font-family--montserrat)',
			'--premium-tabs-heading-size': attributes.headingFontSize || 'clamp(2rem, 4vw, 3.75rem)',
			'--premium-tabs-heading-weight': attributes.headingFontWeight || '700',
			'--premium-tabs-heading-line-height': attributes.headingLineHeight || '0.98',
			'--premium-tabs-heading-color': attributes.headingColor || '#171717',
			'--premium-tabs-subheading-family': attributes.subheadingFontFamily || 'var(--wp--preset--font-family--dm-sans)',
			'--premium-tabs-subheading-size': attributes.subheadingFontSize || '1rem',
			'--premium-tabs-subheading-weight': attributes.subheadingFontWeight || '400',
			'--premium-tabs-subheading-line-height': attributes.subheadingLineHeight || '1.6',
			'--premium-tabs-subheading-color': attributes.subheadingColor || 'rgba(23, 23, 23, 0.72)',
			'--premium-tabs-heading-tabs-gap': `${ attributes.headingTabsGap || 24 }px`,
			'--premium-tabs-tabs-nav-gap': `${ attributes.tabsNavGap || 28 }px`,
			'--premium-tabs-header-nav-gap': `${ attributes.headerNavGap || 24 }px`,
			'--premium-tabs-card-title-family': attributes.cardTitleFontFamily || 'var(--wp--preset--font-family--montserrat)',
			'--premium-tabs-card-title-size': attributes.cardTitleFontSize || 'clamp(1.5rem, 2.4vw, 2rem)',
			'--premium-tabs-card-title-weight': attributes.cardTitleFontWeight || '700',
			'--premium-tabs-card-title-line-height': attributes.cardTitleLineHeight || '1.04',
			'--premium-tabs-card-title-color': attributes.cardTitleColor || '#ffffff',
			'--premium-tabs-card-body-family': attributes.cardBodyFontFamily || 'var(--wp--preset--font-family--dm-sans)',
			'--premium-tabs-card-body-size': attributes.cardBodyFontSize || '1rem',
			'--premium-tabs-card-body-weight': attributes.cardBodyFontWeight || '400',
			'--premium-tabs-card-body-line-height': attributes.cardBodyLineHeight || '1.5',
			'--premium-tabs-card-body-color': attributes.cardBodyColor || '#ffffff',
			'--premium-tabs-card-text-transform': attributes.cardTextUppercase ? 'uppercase' : 'none',
			'--premium-tabs-dots-size': attributes.dotsFontSize || '1.35rem',
			'--premium-tabs-dots-spacing': attributes.dotsLetterSpacing || '0.22em',
			'--premium-tabs-dots-color': attributes.dotsColor || 'rgba(255, 255, 255, 0.86)',
			'--premium-tabs-button-family': attributes.buttonFontFamily || 'var(--wp--preset--font-family--montserrat)',
			'--premium-tabs-button-size': attributes.buttonFontSize || '0.95rem',
			'--premium-tabs-button-weight': attributes.buttonFontWeight || '600',
			'--premium-tabs-button-line-height': attributes.buttonLineHeight || '1.2',
			'--premium-tabs-button-color': attributes.buttonTextColor || '#ffffff',
			'--premium-tabs-button-bg': attributes.buttonBackgroundColor || 'rgba(255, 255, 255, 0.16)',
			'--premium-tabs-button-border-color': attributes.buttonBorderColor || 'rgba(255, 255, 255, 0.38)',
			'--premium-tabs-button-border-width': `${ attributes.buttonBorderWidth || 1 }px`,
			'--premium-tabs-button-radius': attributes.buttonBorderRadius || '999px',
			'--premium-tabs-button-width': attributes.buttonWidth || 'fit-content',
			'--premium-tabs-button-pad-top': attributes.buttonPadding?.top || '13px',
			'--premium-tabs-button-pad-right': attributes.buttonPadding?.right || '20px',
			'--premium-tabs-button-pad-bottom': attributes.buttonPadding?.bottom || '13px',
			'--premium-tabs-button-pad-left': attributes.buttonPadding?.left || '20px',
			'--premium-tabs-nav-size': `${ attributes.navButtonSize || 54 }px`,
			'--premium-tabs-nav-icon-size': `${ attributes.navIconSize || 20 }px`,
			'--premium-tabs-nav-border-width': `${ attributes.navBorderWidth || 1 }px`,
			'--premium-tabs-nav-radius': attributes.navBorderRadius || '999px',
			'--premium-tabs-nav-border-color': attributes.navBorderColor || 'rgba(23, 23, 23, 0.16)',
			'--premium-tabs-nav-bg': attributes.navBackgroundColor || 'rgba(255, 255, 255, 0.78)',
			'--premium-tabs-nav-icon-color': attributes.navIconColor || '#171717',
			'--premium-tabs-nav-hover-bg': attributes.navHoverBackgroundColor || '#171717',
			'--premium-tabs-nav-hover-icon-color': attributes.navHoverIconColor || '#f4efe7',
			'--premium-tabs-card-scale-desktop': String( attributes.cardWidthScaleDesktop || 100 ),
			'--premium-tabs-card-scale-tablet': String( attributes.cardWidthScaleTablet || 100 ),
			'--premium-tabs-card-scale-mobile': String( attributes.cardWidthScaleMobile || 100 ),
			'--premium-tabs-tab-family': attributes.tabFontFamily || 'var(--wp--preset--font-family--montserrat)',
			'--premium-tabs-tab-size': attributes.tabFontSize || '0.95rem',
			'--premium-tabs-tab-weight': attributes.tabFontWeight || '600',
			'--premium-tabs-tab-color': attributes.tabTextColor || 'rgba(23, 23, 23, 0.72)',
			'--premium-tabs-tab-active-color': attributes.tabActiveTextColor || '#171717',
			'--premium-tabs-tab-border-color': attributes.tabBorderColor || 'rgba(23, 23, 23, 0.14)',
			'--premium-tabs-tab-active-border-color': attributes.tabActiveBorderColor || '#171717',
			'--premium-tabs-tab-bg': attributes.tabBackgroundColor || 'rgba(255, 255, 255, 0.82)',
			'--premium-tabs-tab-active-bg': attributes.tabActiveBackgroundColor || '#ffffff',
		},
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Teacher Cards', 'zenctuary' ) } initialOpen>
					<TextControl label={ __( 'Button Text', 'zenctuary' ) } value={ attributes.teacherButtonText } onChange={ ( value ) => setAttributes( { teacherButtonText: value } ) } />
					<ToggleControl label={ __( 'Open Teacher Links In New Tab', 'zenctuary' ) } checked={ attributes.teacherButtonOpenInNewTab } onChange={ ( value ) => setAttributes( { teacherButtonOpenInNewTab: value } ) } />
					{ isLoading && <Spinner /> }
					{ fetchError && <p>{ fetchError }</p> }
					{ ! isLoading && ! fetchError && (
						<BaseControl label={ __( 'Visible Teachers', 'zenctuary' ) } help={ __( 'Uncheck a teacher to hide that card for this block instance.', 'zenctuary' ) }>
							{ teachers.map( ( teacher ) => (
								<CheckboxControl
									key={ teacher.id }
									label={ getTeacherTitle( teacher ) }
									checked={ ! excludedIds.includes( Number( teacher.id ) ) }
									onChange={ ( checked ) => toggleTeacher( teacher.id, checked ) }
								/>
							) ) }
						</BaseControl>
					) }
				</PanelBody>

				<PanelBody title={ __( 'Section Settings', 'zenctuary' ) } initialOpen>
					<RangeControl label={ __( 'Content Max Width', 'zenctuary' ) } value={ attributes.contentMaxWidth } onChange={ ( value ) => setAttributes( { contentMaxWidth: value } ) } min={ 960 } max={ 1600 } step={ 20 } />
					<SpacingControls label={ __( 'Section Padding', 'zenctuary' ) } value={ attributes.sectionPadding } onChange={ ( value ) => setAttributes( { sectionPadding: value } ) } />
					<p className="components-base-control__label">{ __( 'Background Color', 'zenctuary' ) }</p>
					<ColorPalette colors={ PRESET_COLORS } value={ attributes.backgroundColor } onChange={ ( value ) => setAttributes( { backgroundColor: value || '#f4efe7' } ) } />
					<TextControl label={ __( 'Custom Background Color', 'zenctuary' ) } value={ attributes.backgroundColor } onChange={ ( value ) => setAttributes( { backgroundColor: value || '#f4efe7' } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Main Title', 'zenctuary' ) }>
					<RangeControl label={ __( 'Heading Width', 'zenctuary' ) } value={ attributes.headingMaxWidth } onChange={ ( value ) => setAttributes( { headingMaxWidth: value } ) } min={ 320 } max={ 1200 } step={ 10 } />
					<SelectControl label={ __( 'Heading Font Family', 'zenctuary' ) } value={ attributes.headingFontFamily } options={ FONT_FAMILIES } onChange={ ( value ) => setAttributes( { headingFontFamily: value } ) } />
					<TextControl label={ __( 'Heading Font Size', 'zenctuary' ) } value={ attributes.headingFontSize } onChange={ ( value ) => setAttributes( { headingFontSize: value } ) } />
					<TextControl label={ __( 'Heading Font Weight', 'zenctuary' ) } value={ attributes.headingFontWeight } onChange={ ( value ) => setAttributes( { headingFontWeight: value } ) } />
					<TextControl label={ __( 'Heading Line Height', 'zenctuary' ) } value={ attributes.headingLineHeight } onChange={ ( value ) => setAttributes( { headingLineHeight: value } ) } />
					<p className="components-base-control__label">{ __( 'Heading Color', 'zenctuary' ) }</p>
					<ColorPalette colors={ PRESET_COLORS } value={ attributes.headingColor } onChange={ ( value ) => setAttributes( { headingColor: value || '#171717' } ) } />
					<SelectControl label={ __( 'Subheading Font Family', 'zenctuary' ) } value={ attributes.subheadingFontFamily } options={ FONT_FAMILIES } onChange={ ( value ) => setAttributes( { subheadingFontFamily: value } ) } />
					<TextControl label={ __( 'Subheading Font Size', 'zenctuary' ) } value={ attributes.subheadingFontSize } onChange={ ( value ) => setAttributes( { subheadingFontSize: value } ) } />
					<TextControl label={ __( 'Subheading Font Weight', 'zenctuary' ) } value={ attributes.subheadingFontWeight } onChange={ ( value ) => setAttributes( { subheadingFontWeight: value } ) } />
					<TextControl label={ __( 'Subheading Line Height', 'zenctuary' ) } value={ attributes.subheadingLineHeight } onChange={ ( value ) => setAttributes( { subheadingLineHeight: value } ) } />
					<p className="components-base-control__label">{ __( 'Subheading Color', 'zenctuary' ) }</p>
					<ColorPalette colors={ PRESET_COLORS } value={ attributes.subheadingColor } onChange={ ( value ) => setAttributes( { subheadingColor: value || 'rgba(23, 23, 23, 0.72)' } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Carousel Settings', 'zenctuary' ) }>
					<RangeControl label={ __( 'Gap', 'zenctuary' ) } value={ attributes.gap } onChange={ ( value ) => setAttributes( { gap: value } ) } min={ 0 } max={ 60 } step={ 1 } />
					<ToggleControl label={ __( 'Loop', 'zenctuary' ) } checked={ attributes.loop } onChange={ ( value ) => setAttributes( { loop: value } ) } />
					<ToggleControl label={ __( 'Show Pagination', 'zenctuary' ) } checked={ attributes.showPagination } onChange={ ( value ) => setAttributes( { showPagination: value } ) } />
					<ToggleControl label={ __( 'Enable Activity Tabs On Frontend', 'zenctuary' ) } checked={ attributes.enableTabs } onChange={ ( value ) => setAttributes( { enableTabs: value } ) } help={ __( 'Tabs are generated from linked product Activity Type terms.', 'zenctuary' ) } />
				</PanelBody>

				<PanelBody title={ __( 'Card Style', 'zenctuary' ) }>
					<RangeControl label={ __( 'Card Radius', 'zenctuary' ) } value={ attributes.cardBorderRadius } onChange={ ( value ) => setAttributes( { cardBorderRadius: value } ) } min={ 0 } max={ 48 } step={ 1 } />
					<RangeControl label={ __( 'Card Content Padding', 'zenctuary' ) } value={ attributes.cardContentPadding } onChange={ ( value ) => setAttributes( { cardContentPadding: value } ) } min={ 8 } max={ 64 } step={ 1 } />
					<ToggleControl label={ __( 'Uppercase Card Text', 'zenctuary' ) } checked={ attributes.cardTextUppercase } onChange={ ( value ) => setAttributes( { cardTextUppercase: value } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Card Typography', 'zenctuary' ) }>
					<SelectControl label={ __( 'Title Font Family', 'zenctuary' ) } value={ attributes.cardTitleFontFamily } options={ FONT_FAMILIES } onChange={ ( value ) => setAttributes( { cardTitleFontFamily: value } ) } />
					<TextControl label={ __( 'Title Font Size', 'zenctuary' ) } value={ attributes.cardTitleFontSize } onChange={ ( value ) => setAttributes( { cardTitleFontSize: value } ) } />
					<TextControl label={ __( 'Title Font Weight', 'zenctuary' ) } value={ attributes.cardTitleFontWeight } onChange={ ( value ) => setAttributes( { cardTitleFontWeight: value } ) } />
					<TextControl label={ __( 'Title Line Height', 'zenctuary' ) } value={ attributes.cardTitleLineHeight } onChange={ ( value ) => setAttributes( { cardTitleLineHeight: value } ) } />
					<SelectControl label={ __( 'Body Font Family', 'zenctuary' ) } value={ attributes.cardBodyFontFamily } options={ FONT_FAMILIES } onChange={ ( value ) => setAttributes( { cardBodyFontFamily: value } ) } />
					<TextControl label={ __( 'Body Font Size', 'zenctuary' ) } value={ attributes.cardBodyFontSize } onChange={ ( value ) => setAttributes( { cardBodyFontSize: value } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Button Style', 'zenctuary' ) }>
					<SelectControl label={ __( 'Button Font Family', 'zenctuary' ) } value={ attributes.buttonFontFamily } options={ FONT_FAMILIES } onChange={ ( value ) => setAttributes( { buttonFontFamily: value } ) } />
					<TextControl label={ __( 'Button Font Size', 'zenctuary' ) } value={ attributes.buttonFontSize } onChange={ ( value ) => setAttributes( { buttonFontSize: value } ) } />
					<TextControl label={ __( 'Button Font Weight', 'zenctuary' ) } value={ attributes.buttonFontWeight } onChange={ ( value ) => setAttributes( { buttonFontWeight: value } ) } />
					<TextControl label={ __( 'Button Width', 'zenctuary' ) } value={ attributes.buttonWidth } onChange={ ( value ) => setAttributes( { buttonWidth: value } ) } />
					<SpacingControls label={ __( 'Button Padding', 'zenctuary' ) } value={ attributes.buttonPadding } onChange={ ( value ) => setAttributes( { buttonPadding: value } ) } />
					<ToggleControl label={ __( 'Show Button Icon', 'zenctuary' ) } checked={ attributes.buttonShowIcon } onChange={ ( value ) => setAttributes( { buttonShowIcon: value } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Navigation Style', 'zenctuary' ) }>
					<RangeControl label={ __( 'Button Size', 'zenctuary' ) } value={ attributes.navButtonSize } onChange={ ( value ) => setAttributes( { navButtonSize: value } ) } min={ 28 } max={ 96 } step={ 1 } />
					<RangeControl label={ __( 'Icon Size', 'zenctuary' ) } value={ attributes.navIconSize } onChange={ ( value ) => setAttributes( { navIconSize: value } ) } min={ 12 } max={ 40 } step={ 1 } />
					<SelectControl label={ __( 'Icon Set', 'zenctuary' ) } value={ attributes.navIconSet } options={ [ { label: __( 'Line Arrow', 'zenctuary' ), value: 'line-arrow' }, { label: __( 'Chevron', 'zenctuary' ), value: 'chevron' }, { label: __( 'Caret', 'zenctuary' ), value: 'caret' }, { label: __( 'Dashicons Arrow Alt2', 'zenctuary' ), value: 'dashicons-arrow-alt2' }, { label: __( 'Dashicons Controls', 'zenctuary' ), value: 'dashicons-controls' } ] } onChange={ ( value ) => setAttributes( { navIconSet: value } ) } />
				</PanelBody>
			</InspectorControls>

			<section { ...blockProps }>
				<div className="premium-tabs-carousel__inner">
					<div className="premium-tabs-carousel__header">
						<div className="premium-tabs-carousel__copy">
							<RichText tagName="h2" className="premium-tabs-carousel__heading" value={ attributes.heading } onChange={ ( value ) => setAttributes( { heading: value } ) } placeholder={ __( 'Add heading', 'zenctuary' ) } />
							<RichText tagName="p" className="premium-tabs-carousel__subheading" value={ attributes.subheading } onChange={ ( value ) => setAttributes( { subheading: value } ) } placeholder={ __( 'Add subheading', 'zenctuary' ) } />
						</div>

						<div className="premium-tabs-carousel__nav">
							<button type="button" className="premium-tabs-carousel__arrow premium-tabs-carousel__arrow--prev" onClick={ () => scrollEditor( -1 ) }>{ navigationIcon( attributes.navIconSet, 'prev' ) }</button>
							<button type="button" className="premium-tabs-carousel__arrow premium-tabs-carousel__arrow--next" onClick={ () => scrollEditor( 1 ) }>{ navigationIcon( attributes.navIconSet, 'next' ) }</button>
						</div>
					</div>

					<div className="premium-tabs-carousel__stage">
						<div className="premium-tabs-carousel__editor-track" ref={ editorTrackRef }>
							{ visibleTeachers.map( ( teacher ) => {
								const imageUrl = getEmbeddedImage( teacher );
								const excerpt = stripHtml( teacher?.excerpt?.rendered );

								return (
									<div key={ teacher.id } className="premium-tabs-carousel__slide">
										<article className="premium-tabs-carousel__card" style={ { backgroundImage: imageUrl ? `url("${ imageUrl }")` : undefined, backgroundColor: ! imageUrl ? '#c8bfb2' : undefined } }>
											<div className="premium-tabs-carousel__overlay" style={ { backgroundColor: '#1f1d1a', opacity: 0.48 } } />
											<div className="premium-tabs-carousel__card-content">
												<div className="premium-tabs-carousel__card-top">
													<h3 className="premium-tabs-carousel__card-title">{ getTeacherTitle( teacher ) }</h3>
												</div>
												<div className="premium-tabs-carousel__card-bottom">
													{ excerpt && <p className="premium-tabs-carousel__card-items">{ excerpt }</p> }
													{ attributes.teacherButtonText && (
														<span className={ `premium-tabs-carousel__button premium-tabs-carousel__button--icon-${ attributes.buttonIconPosition || 'right' }` }>
															{ attributes.buttonShowIcon && <span className="premium-tabs-carousel__button-icon">{ arrowIcon() }</span> }
															<span>{ attributes.teacherButtonText }</span>
														</span>
													) }
												</div>
											</div>
										</article>
									</div>
								);
							} ) }
							{ ! isLoading && ! visibleTeachers.length && <p>{ __( 'No visible teachers found.', 'zenctuary' ) }</p> }
						</div>
						{ attributes.showPagination && <div className="premium-tabs-carousel__pagination" /> }
					</div>
				</div>
			</section>
		</>
	);
}