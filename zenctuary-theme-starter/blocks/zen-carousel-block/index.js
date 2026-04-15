import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText, InspectorControls, MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import {
    Button,
    RangeControl,
    TextControl,
    SelectControl,
    ToggleControl,
    BaseControl,
    ColorPalette,
    PanelBody,
} from '@wordpress/components';
import { useState, useEffect, useMemo, useRef } from '@wordpress/element';
import './style.scss';

// ─── Constants ───
const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB
const PRESET_COLORS = [
    { name: 'White', color: '#ffffff' },
    { name: 'Gold', color: '#d8b354' },
    { name: 'Beige', color: '#f6f2ea' },
    { name: 'Charcoal', color: '#3f3e3e' },
    { name: 'Black', color: '#000000' },
];
const BG_PRESET_COLORS = [
    { name: 'Transparent', color: 'rgba(0,0,0,0)' },
    ...PRESET_COLORS,
];

// ─── Card Type Options ───
const CARD_TYPE_OPTIONS = [
    { label: __( 'Experience Carousel', 'zenctuary' ), value: 'experience' },
    { label: __( 'Teacher / Collective', 'zenctuary' ), value: 'teacher' },
    { label: __( 'Testimonial', 'zenctuary' ), value: 'testimonial' },
];

// ─── Default Card ───
function defaultCard() {
    return {
        title: 'New Card',
        content: 'Describe this slide in a few rich, welcoming lines.',
        clientName: 'Client Name',
        courseName: 'Course Name',
        buttonText: 'Explore',
        buttonUrl: '#',
        backgroundUrl: '',
        videoThumbnailUrl: '',
        profileImageUrl: '',
        videoUrl: '',
        backgroundColor: '#4b4947',
        mediaType: 'image',
        overlayColor: '#111111',
        overlayOpacity: 0.35,
        titleLimit: 48,
        contentLimit: 110,
        courseLimit: 48,
        rating: 4.5,
        starColor: '#d8b355',
    };
}

// ─── Default Cards Per Type ───
function getDefaultCards( type ) {
    const base = [
        Object.assign( defaultCard(), {
            title: 'Evening Reset',
            content: 'Deep recovery sessions, gentle heat, and guided breathwork for a calm finish to the day.',
            backgroundColor: '#4b4947',
        } ),
        Object.assign( defaultCard(), {
            title: 'Strength Ritual',
            content: 'Progressive classes built around intelligent movement and sustainable recovery.',
            backgroundColor: '#58524d',
            rating: 5,
        } ),
        Object.assign( defaultCard(), {
            title: 'Studio Recovery',
            content: 'Contrast therapy, expert-led mobility, and a grounded atmosphere for better restoration.',
            backgroundColor: '#3f3e3e',
            rating: 4,
        } ),
        Object.assign( defaultCard(), {
            title: 'Weekend Unwind',
            content: 'Signature rituals for movement, stillness, and connection in the heart of the city.',
            backgroundColor: '#514c47',
        } ),
    ];

    if ( type === 'teacher' ) {
        return base.map( ( c ) => ( { ...c, courseName: 'Movement Practice' } ) );
    }
    if ( type === 'testimonial' ) {
        return base.map( ( c ) => ( { ...c, clientName: 'A Client' } ) );
    }
    return base;
}

// ─── Block Attributes ───
function getBlockAttributes() {
    return {
        headerText: { type: 'string', default: 'Featured Experiences' },
        headerFontSize: { type: 'string', default: '56px' },
        headerFontWeight: { type: 'string', default: '600' },
        headerColor: { type: 'string', default: 'var(--wp--preset--color--primary-gold)' },
        headerLineHeight: { type: 'string', default: '1.2' },
        headerTextTransform: { type: 'string', default: 'none' },
        headerPadding: { type: 'object', default: { top: '0px', right: '0px', bottom: '32px', left: '0px' } },
        headerMargin: { type: 'object', default: { top: '0px', right: '0px', bottom: '0px', left: '0px' } },
        sectionPadding: { type: 'object', default: { top: '0px', right: '0px', bottom: '0px', left: '0px' } },
        sectionMargin: { type: 'object', default: { top: '0px', right: '0px', bottom: '0px', left: '0px' } },
        sectionBackgroundType: { type: 'string', default: 'color' },
        sectionBackgroundImageUrl: { type: 'string', default: '' },
        sectionBackgroundColor: { type: 'string', default: '#3f3e3e' },
        sectionBackgroundBlur: { type: 'number', default: 0 },
        carouselWidth: { type: 'number', default: 1200 },
        carouselHeight: { type: 'number', default: 971 },
        carouselBorderWidth: { type: 'number', default: 0 },
        carouselBorderColor: { type: 'string', default: '#ffffff' },
        carouselBorderStyle: { type: 'string', default: 'solid' },
        carouselBorderRadius: { type: 'number', default: 0 },
        cardWidth: { type: 'number', default: 370 },
        cardHeight: { type: 'number', default: 483 },
        slideGap: { type: 'number', default: 24 },
        slideSpeed: { type: 'number', default: 450 },
        visibleDesktop: { type: 'number', default: 3.3 },
        visibleTablet: { type: 'number', default: 2 },
        visibleMobile: { type: 'number', default: 1 },
        cardType: { type: 'string', default: 'experience' },
        cards: { type: 'array', default: getDefaultCards( 'experience' ) },
        dotSize: { type: 'number', default: 6 },
        dotSpacing: { type: 'number', default: 8 },
        dotColor: { type: 'string', default: 'var(--wp--preset--color--primary-gold)' },
        buttonTextColor: { type: 'string', default: '#f6f2ea' },
        buttonBackgroundColor: { type: 'string', default: 'rgba(63, 62, 62, 0.85)' },
        buttonBorderColor: { type: 'string', default: '#d8b355' },
        buttonBorderWidth: { type: 'number', default: 1 },
        buttonBorderRadius: { type: 'string', default: '999px' },
        buttonPadding: { type: 'object', default: { top: '12px', right: '20px', bottom: '12px', left: '20px' } },
        buttonMargin: { type: 'object', default: { top: '16px', right: '0px', bottom: '0px', left: '0px' } },
        buttonIconPosition: { type: 'string', default: 'right' },
        buttonShowArrow: { type: 'boolean', default: true },
        arrowSize: { type: 'number', default: 56 },
        arrowBorderWidth: { type: 'number', default: 1 },
        arrowBorderColor: { type: 'string', default: 'rgba(246, 242, 234, 0.35)' },
        arrowBackgroundColor: { type: 'string', default: 'rgba(63, 62, 62, 0.55)' },
        arrowColor: { type: 'string', default: '#f6f2ea' },
        arrowActiveColor: { type: 'string', default: '#d8b354' },
        arrowActiveBackgroundColor: { type: 'string', default: 'rgba(216, 179, 84, 0.2)' },
        arrowRadius: { type: 'string', default: '999px' },
        profileSize: { type: 'number', default: 58 },
        profileBorderWidth: { type: 'number', default: 2 },
        profileBorderColor: { type: 'string', default: '#f6f2ea' },
        profileBorderRadius: { type: 'string', default: '999px' },
        starCount: { type: 'number', default: 5 },
        starSize: { type: 'number', default: 18 },
        starColor: { type: 'string', default: '#d8b355' },
        testimonialTextColor: { type: 'string', default: '#f6f2ea' },
        playButtonColor: { type: 'string', default: '#f6f2ea' },
        playButtonBackground: { type: 'string', default: 'rgba(0, 0, 0, 0.45)' },
    };
}

// ─── Helpers ──
function normalizeCards( cards, count ) {
    const nextCards = Array.isArray( cards ) ? cards.slice( 0, count ) : [];
    while ( nextCards.length < count ) {
        nextCards.push( defaultCard() );
    }
    return nextCards.map( ( card ) => Object.assign( defaultCard(), card || {} ) );
}

function clampText( value, limit ) {
    if ( ! value || ! limit || value.length <= limit ) return value;
    return value.slice( 0, limit ).trimEnd() + '...';
}

function normalizeRichTextLineBreaks( value ) {
    if ( value === null || value === undefined ) return '';
    return String( value ).replace( /\r\n|\r|\n/g, '<br>' );
}

function clampLineBreakRichText( value, limit ) {
    const normalizedValue = normalizeRichTextLineBreaks( value );
    if ( ! normalizedValue || ! limit ) return normalizedValue;
    const parts = normalizedValue.split( /(<br\s*\/?>)/i );
    const nextParts = [];
    let remaining = limit;
    let truncated = false;
    parts.forEach( ( part ) => {
        if ( ! part ) return;
        if ( /<br\s*\/?>/i.test( part ) ) {
            if ( nextParts.length && remaining > 0 ) nextParts.push( '<br>' );
            return;
        }
        if ( remaining <= 0 ) {
            if ( part.trim() ) truncated = true;
            return;
        }
        if ( part.length <= remaining ) {
            nextParts.push( part );
            remaining -= part.length;
            return;
        }
        nextParts.push( part.slice( 0, remaining ).trimEnd() );
        remaining = 0;
        truncated = true;
    } );
    if ( truncated ) nextParts.push( '...' );
    return nextParts.join( '' );
}

function getRichTextDisplayValue( value, limit ) {
    const normalizedValue = normalizeRichTextLineBreaks( value );
    if ( ! limit ) return normalizedValue;
    const containsHtmlMarkup = /<(?!br\s*\/?)[^>]+>/i.test( normalizedValue );
    if ( containsHtmlMarkup ) return normalizedValue;
    return clampLineBreakRichText( normalizedValue, limit );
}

function getSpacingStyle( spacing, prefix ) {
    const style = {};
    const value = spacing || {};
    style[ prefix + 'Top' ] = value.top || undefined;
    style[ prefix + 'Right' ] = value.right || undefined;
    style[ prefix + 'Bottom' ] = value.bottom || undefined;
    style[ prefix + 'Left' ] = value.left || undefined;
    return style;
}

function getMediaFileSize( media ) {
    if ( ! media || typeof media !== 'object' ) return 0;
    const candidates = [
        media.filesizeInBytes,
        media.filesize,
        media.fileLength,
        media?.media_details?.filesize,
        media?.media_details?.filesizeInBytes,
    ];
    for ( let i = 0; i < candidates.length; i++ ) {
        const c = candidates[ i ];
        if ( typeof c === 'number' && Number.isFinite( c ) ) return c;
        if ( typeof c === 'string' ) {
            const parsed = parseInt( c, 10 );
            if ( Number.isFinite( parsed ) ) return parsed;
        }
    }
    return 0;
}

// ─── Editor UI Helpers ───
function renderFourSideControls( label, value, onChange ) {
    const nextValue = Object.assign( { top: '0px', right: '0px', bottom: '0px', left: '0px' }, value || {} );
    function updateSide( side, sideValue ) {
        onChange( Object.assign( {}, nextValue, { [ side ]: sideValue || '0px' } ) );
    }
    return (
        <BaseControl label={ label }>
            <TextControl label={ __( 'Top', 'zenctuary' ) } value={ nextValue.top } onChange={ ( v ) => updateSide( 'top', v ) } />
            <TextControl label={ __( 'Right', 'zenctuary' ) } value={ nextValue.right } onChange={ ( v ) => updateSide( 'right', v ) } />
            <TextControl label={ __( 'Bottom', 'zenctuary' ) } value={ nextValue.bottom } onChange={ ( v ) => updateSide( 'bottom', v ) } />
            <TextControl label={ __( 'Left', 'zenctuary' ) } value={ nextValue.left } onChange={ ( v ) => updateSide( 'left', v ) } />
        </BaseControl>
    );
}

function renderMediaControl( props ) {
    return (
        <BaseControl label={ props.label }>
            { props.url && (
                <div style={ { marginBottom: '12px' } }>
                    { props.type === 'video'
                        ? <div style={ { fontSize: '12px', opacity: 0.7, wordBreak: 'break-all' } }>{ props.url }</div>
                        : <img src={ props.url } alt="" style={ { width: '100%', maxWidth: '120px', borderRadius: '8px', display: 'block' } } />
                    }
                </div>
            ) }
            { props.url && <Button variant="secondary" onClick={ props.onRemove }>{ __( 'Remove', 'zenctuary' ) }</Button> }
            <MediaUploadCheck>
                <MediaUpload
                    onSelect={ props.onSelect }
                    allowedTypes={ props.allowedTypes || [ 'image' ] }
                    render={ ( openProps ) => (
                        <Button variant="primary" onClick={ openProps.open }>
                            { props.buttonLabel || __( 'Select Media', 'zenctuary' ) }
                        </Button>
                    ) }
                />
            </MediaUploadCheck>
            { props.help && <p style={ { margin: '8px 0 0', fontSize: '12px', opacity: 0.75 } }>{ props.help }</p> }
            { props.error && <p style={ { margin: '8px 0 0', fontSize: '12px', color: '#b32d2e' } }>{ props.error }</p> }
        </BaseControl>
    );
}

// ─── Icon Components ───
function arrowIcon( direction ) {
    const rotate = direction === 'prev' ? 'rotate(180 12 12)' : undefined;
    return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform={ rotate }>
                <path d="M3.5 12H18.5M18.5 12L13.5 7M18.5 12L13.5 17" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </g>
        </svg>
    );
}

function navigationIcon( direction ) {
    return (
        <span className="zen-carousel__arrow-icon" aria-hidden="true">
            { direction === 'prev' ? '<' : '>' }
        </span>
    );
}

function playIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l10-6.86a1 1 0 0 0 0-1.72l-10-6.86A1 1 0 0 0 8 5.14Z" />
        </svg>
    );
}

// ─── Stars (Testimonial) ───
function renderStars( card, attributes ) {
    const totalStars = Math.max( 1, parseInt( attributes.starCount, 10 ) || 5 );
    const rating = Math.round( Math.max( 0, Math.min( parseFloat( card.rating ) || 0, totalStars ) ) * 2 ) / 2;
    const starColor = card.starColor || '#d8b355';
    return (
        <div className="zen-carousel__stars" style={ { '--zen-card-star-color': starColor } } aria-label={ String( rating ) + ' out of ' + String( totalStars ) }>
            { new Array( totalStars ).fill( null ).map( ( _, index ) => {
                const starFill = Math.max( 0, Math.min( rating - index, 1 ) ) * 100;
                return (
                    <span key={ index } className="zen-carousel__star" aria-hidden="true">
                        <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2.6 14.88 8.42 21.31 9.35 16.65 13.9 17.75 20.3 12 17.28 6.25 20.3 7.35 13.9 2.69 9.35 9.12 8.42 12 2.6Z" />
                        </svg>
                        <span className="zen-carousel__star-fill" style={ { width: starFill + '%' } }>
                            <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2.6 14.88 8.42 21.31 9.35 16.65 13.9 17.75 20.3 12 17.28 6.25 20.3 7.35 13.9 2.69 9.35 9.12 8.42 12 2.6Z" />
                            </svg>
                        </span>
                    </span>
                );
            } ) }
        </div>
    );
}

// ─── Button Component ───
function renderButton( card, attributes, editable, onTextChange, onUrlChange ) {
    const buttonStyle = {
        ...getSpacingStyle( attributes.buttonPadding, 'padding' ),
        ...getSpacingStyle( attributes.buttonMargin, 'margin' ),
    };
    const className = `zen-carousel__button zen-carousel__button--icon-${ attributes.buttonIconPosition }`;
    const arrow = attributes.buttonShowArrow
        ? <span className={ `zen-carousel__button-icon zen-carousel__button-icon--${ attributes.buttonIconPosition }` }>{ arrowIcon( 'next' ) }</span>
        : null;

    if ( editable ) {
        return (
            <div className={ className } style={ buttonStyle }>
                { arrow }
                <RichText tagName="span" value={ card.buttonText } allowedFormats={ [] } placeholder={ __( 'Button text', 'zenctuary' ) } onChange={ onTextChange } />
                <TextControl label={ __( 'URL', 'zenctuary' ) } value={ card.buttonUrl } onChange={ onUrlChange } help={ __( 'Visible in editor only.', 'zenctuary' ) } />
            </div>
        );
    }
    return (
        <a className={ className } style={ buttonStyle } href={ card.buttonUrl || '#' }>
            { arrow }
            <span>{ card.buttonText || __( 'Explore', 'zenctuary' ) }</span>
        </a>
    );
}

// ─── Card Body Renderer (type-aware) ───
function renderCardBody( { card, attributes, editable, updateCard } ) {
    const { cardType } = attributes;
    const course = clampText( card.courseName, card.courseLimit );
    const overlayStyle = { background: card.overlayColor, opacity: card.overlayOpacity };

    function renderBackground() {
        if ( card.mediaType === 'color' ) return null;
        if ( card.mediaType === 'video' ) {
            return (
                <div className="zen-carousel__card-media zen-carousel__card-media--video">
                    { card.videoThumbnailUrl
                        ? <img src={ card.videoThumbnailUrl } alt="" />
                        : <div className="zen-carousel__video-preview" aria-hidden="true" />
                    }
                </div>
            );
        }
        if ( card.backgroundUrl ) {
            return (
                <div className="zen-carousel__card-media">
                    <img src={ card.backgroundUrl } alt="" />
                </div>
            );
        }
        return null;
    }

    const innerStyle = {
        background: card.mediaType === 'color' || ( card.mediaType === 'image' && ! card.backgroundUrl )
            ? card.backgroundColor
            : 'transparent',
    };

    // ── Testimonial Card ──
    if ( cardType === 'testimonial' ) {
        return (
            <>
                { renderBackground() }
                <div className="zen-carousel__card-overlay" style={ overlayStyle } />
                <div className="zen-carousel__card-inner" style={ innerStyle }>
                    <div className="zen-carousel__testimonial-top">
                        <div className="zen-carousel__profile">
                            { card.profileImageUrl && <img src={ card.profileImageUrl } alt="" /> }
                        </div>
                        { renderStars( card, attributes ) }
                    </div>
                    <div className="zen-carousel__testimonial-body">
                        { editable
                            ? <RichText tagName="p" className="zen-carousel__content" value={ card.content } onChange={ ( v ) => updateCard( { content: v } ) } placeholder={ __( 'Write testimonial text...', 'zenctuary' ) } />
                            : <p className="zen-carousel__content">{ getRichTextDisplayValue( card.content, card.contentLimit ) }</p>
                        }
                    </div>
                    { editable
                        ? <RichText tagName="p" className="zen-carousel__client" value={ card.clientName } onChange={ ( v ) => updateCard( { clientName: v } ) } placeholder={ __( 'Client name', 'zenctuary' ) } />
                        : <p className="zen-carousel__client">{ card.clientName }</p>
                    }
                </div>
                { card.mediaType === 'video' && card.videoUrl && (
                    <span className="zen-carousel__video-play" aria-hidden="true">{ playIcon() }</span>
                ) }
            </>
        );
    }

    // ── Experience / Teacher Card (image-overlay with title + text + CTA) ──
    return (
        <>
            { renderBackground() }
            <div className="zen-carousel__card-overlay" style={ overlayStyle } />
            <div className="zen-carousel__card-inner" style={ innerStyle }>
                { editable
                    ? <RichText tagName="h3" className="zen-carousel__title" value={ card.title } onChange={ ( v ) => updateCard( { title: v } ) } placeholder={ __( 'Card title', 'zenctuary' ) } />
                    : <h3 className="zen-carousel__title">{ getRichTextDisplayValue( card.title, card.titleLimit ) }</h3>
                }
                <div className="zen-carousel__footer">
                    { cardType === 'experience' ? (
                        <>
                            { editable
                                ? <RichText tagName="p" className="zen-carousel__content" value={ card.content } onChange={ ( v ) => updateCard( { content: v } ) } placeholder={ __( 'Supporting text...', 'zenctuary' ) } />
                                : <p className="zen-carousel__content">{ getRichTextDisplayValue( card.content, card.contentLimit ) }</p>
                            }
                            <div className="zen-carousel__dots" aria-hidden="true">
                                <span /><span /><span />
                            </div>
                        </>
                    ) : (
                        editable
                            ? <RichText tagName="p" className="zen-carousel__course" value={ card.courseName } onChange={ ( v ) => updateCard( { courseName: v } ) } placeholder={ __( 'Specialty / Practice', 'zenctuary' ) } />
                            : <p className="zen-carousel__course">{ course }</p>
                    ) }
                    { renderButton(
                        card,
                        attributes,
                        editable,
                        ( v ) => updateCard( { buttonText: v } ),
                        ( v ) => updateCard( { buttonUrl: v } )
                    ) }
                </div>
            </div>
            { card.mediaType === 'video' && card.videoUrl && (
                <span className="zen-carousel__video-play" aria-hidden="true">{ playIcon() }</span>
            ) }
        </>
    );
}

// ─── Save Component ───
function Save( { attributes } ) {
    const cards = normalizeCards( attributes.cards, Math.max( 1, ( attributes.cards || [] ).length ) );
    const blockProps = useBlockProps.save( {
        style: getCarouselStyle( attributes ),
        'data-visible-desktop': attributes.visibleDesktop,
        'data-visible-tablet': attributes.visibleTablet,
        'data-visible-mobile': attributes.visibleMobile,
    } );
    const headerStyle = {
        fontSize: attributes.headerFontSize,
        fontWeight: attributes.headerFontWeight,
        color: attributes.headerColor,
        lineHeight: attributes.headerLineHeight,
        textTransform: attributes.headerTextTransform,
        ...getSpacingStyle( attributes.headerPadding, 'padding' ),
        ...getSpacingStyle( attributes.headerMargin, 'margin' ),
    };

    return (
        <section { ...blockProps }>
            { getSectionBackgroundLayer( attributes ) }
            <div className="zen-carousel__content">
                <div className="zen-carousel__header" style={ headerStyle }>
                    <RichText.Content tagName="h2" className="zen-carousel__heading" value={ attributes.headerText } />
                    <div className="zen-carousel__nav">
                        <button type="button" className="zen-carousel__arrow zen-carousel__arrow--prev" aria-label={ __( 'Previous', 'zenctuary' ) }>
                            { navigationIcon( 'prev' ) }
                        </button>
                        <button type="button" className="zen-carousel__arrow zen-carousel__arrow--next" aria-label={ __( 'Next', 'zenctuary' ) }>
                            { navigationIcon( 'next' ) }
                        </button>
                    </div>
                </div>
                <div className="zen-carousel__viewport">
                    <div className="zen-carousel__track">
                        { cards.map( ( card, index ) => {
                            const isVideoCard = card.mediaType === 'video' && !! card.videoUrl;
                            return (
                                <div key={ index } className="zen-carousel__slide">
                                    <article
                                        className={ `zen-carousel__card${ isVideoCard ? ' zen-carousel__card--video' : '' }` }
                                        style={ { background: card.backgroundColor, height: attributes.cardHeight + 'px' } }
                                        data-video-url={ isVideoCard ? card.videoUrl : undefined }
                                    >
                                        { renderCardBody( { card, attributes, editable: false, updateCard: () => {} } ) }
                                    </article>
                                </div>
                            );
                        } ) }
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── Style Helpers ───
function getCarouselStyle( attributes ) {
    return {
        '--zen-carousel-height': attributes.carouselHeight + 'px',
        '--zen-carousel-card-height': attributes.cardHeight + 'px',
        '--zen-carousel-gap': attributes.slideGap + 'px',
        '--zen-carousel-speed': attributes.slideSpeed + 'ms',
        borderWidth: attributes.carouselBorderWidth + 'px',
        borderColor: attributes.carouselBorderColor,
        borderStyle: attributes.carouselBorderStyle,
        borderRadius: attributes.carouselBorderRadius + 'px',
        '--zen-visible-desktop': String( attributes.visibleDesktop ),
        '--zen-visible-tablet': String( attributes.visibleTablet ),
        '--zen-visible-mobile': String( attributes.visibleMobile ),
        '--zen-arrow-size': attributes.arrowSize + 'px',
        '--zen-arrow-border-width': attributes.arrowBorderWidth + 'px',
        '--zen-arrow-border-color': attributes.arrowBorderColor,
        '--zen-arrow-bg': attributes.arrowBackgroundColor,
        '--zen-arrow-color': attributes.arrowColor,
        '--zen-arrow-active-color': attributes.arrowActiveColor,
        '--zen-arrow-active-bg': attributes.arrowActiveBackgroundColor,
        '--zen-arrow-radius': attributes.arrowRadius,
        '--zen-dot-size': attributes.dotSize + 'px',
        '--zen-dot-spacing': attributes.dotSpacing + 'px',
        '--zen-dot-color': attributes.dotColor,
        '--zen-profile-size': attributes.profileSize + 'px',
        '--zen-profile-border-width': attributes.profileBorderWidth + 'px',
        '--zen-profile-border-color': attributes.profileBorderColor,
        '--zen-profile-border-radius': attributes.profileBorderRadius,
        '--zen-star-size': attributes.starSize + 'px',
        '--zen-button-text-color': attributes.buttonTextColor,
        '--zen-button-bg': attributes.buttonBackgroundColor,
        '--zen-button-border-color': attributes.buttonBorderColor,
        '--zen-button-border-width': attributes.buttonBorderWidth + 'px',
        '--zen-button-radius': attributes.buttonBorderRadius,
        '--zen-testimonial-text-color': attributes.testimonialTextColor,
        '--zen-play-button-color': attributes.playButtonColor,
        '--zen-play-button-bg': attributes.playButtonBackground,
        backgroundColor: attributes.sectionBackgroundColor,
        ...getSpacingStyle( attributes.sectionPadding, 'padding' ),
        ...getSpacingStyle( attributes.sectionMargin, 'margin' ),
    };
}

function getSectionBackgroundLayer( attributes ) {
    if ( attributes.sectionBackgroundType !== 'image' || ! attributes.sectionBackgroundImageUrl ) return null;
    return (
        <div className="zen-carousel__background" aria-hidden="true">
            <div
                className="zen-carousel__background-image"
                style={ {
                    backgroundImage: `linear-gradient(${ attributes.sectionBackgroundColor }, ${ attributes.sectionBackgroundColor }), url("${ attributes.sectionBackgroundImageUrl }")`,
                    filter: `blur(${ attributes.sectionBackgroundBlur || 0 }px)`,
                } }
            />
        </div>
    );
}

// ─── Snap Offsets ───
function getSnapOffsets( viewportNode, slideNodes ) {
    if ( ! viewportNode || ! slideNodes.length ) return [ 0 ];
    const maxOffset = Math.max( 0, viewportNode.scrollWidth - viewportNode.clientWidth );
    const offsets = slideNodes
        .map( ( slideNode ) => Math.min( slideNode.offsetLeft, maxOffset ) )
        .filter( ( offset, index, values ) => index === 0 || Math.abs( offset - values[ index - 1 ] ) > 1 );
    if ( ! offsets.length ) offsets.push( 0 );
    if ( Math.abs( offsets[ offsets.length - 1 ] - maxOffset ) > 1 ) offsets.push( maxOffset );
    return offsets;
}

// ─── Edit Component ───
export default function Edit( { attributes, setAttributes } ) {
    const [ selectedCardIndex, setSelectedCardIndex ] = useState( 0 );
    const [ currentSlide, setCurrentSlide ] = useState( 0 );
    const [ viewportWidth, setViewportWidth ] = useState( window.innerWidth );
    const [ snapOffsets, setSnapOffsets ] = useState( [ 0 ] );
    const [ videoValidationError, setVideoValidationError ] = useState( '' );
    const viewportRef = useRef( null );
    const slideRefs = useRef( [] );

    const cards = useMemo( () => normalizeCards( attributes.cards, Math.max( 1, ( attributes.cards || [] ).length ) ), [ attributes.cards ] );
    const maxIndex = Math.max( 0, snapOffsets.length - 1 );
    const selectedCard = cards[ selectedCardIndex ] || cards[ 0 ];

    // Resize handler
    useEffect( () => {
        function handleResize() { setViewportWidth( window.innerWidth ); }
        window.addEventListener( 'resize', handleResize );
        return () => window.removeEventListener( 'resize', handleResize );
    }, [] );

    // Snap offsets
    useEffect( () => {
        const nextOffsets = getSnapOffsets( viewportRef.current, slideRefs.current.filter( Boolean ) );
        setSnapOffsets( nextOffsets );
        setCurrentSlide( ( prev ) => Math.max( 0, Math.min( prev, nextOffsets.length - 1 ) ) );
    }, [ cards.length, viewportWidth, attributes.slideGap, attributes.visibleDesktop, attributes.visibleTablet, attributes.visibleMobile ] );

    // Clear video error on card switch
    useEffect( () => { setVideoValidationError( '' ); }, [ selectedCardIndex ] );

    function updateCard( index, patch ) {
        const nextCards = cards.slice();
        nextCards[ index ] = { ...nextCards[ index ], ...patch };
        setAttributes( { cards: nextCards } );
    }

    function handleVideoSelect( media ) {
        const fileSize = getMediaFileSize( media );
        if ( fileSize > MAX_VIDEO_SIZE ) {
            setVideoValidationError( __( 'Selected video exceeds the 10MB limit. Please choose a smaller file.', 'zenctuary' ) );
            return;
        }
        setVideoValidationError( '' );
        updateCard( selectedCardIndex, { videoUrl: media && media.url ? media.url : '' } );
    }

    function setCardCount( count ) {
        const safeCount = Math.max( 1, count );
        const nextCards = normalizeCards( cards, safeCount );
        setAttributes( { cards: nextCards } );
        setSelectedCardIndex( Math.min( selectedCardIndex, safeCount - 1 ) );
        setCurrentSlide( Math.min( currentSlide, safeCount - 1 ) );
    }

    const blockProps = useBlockProps( {
        className: 'is-editor-preview',
        style: getCarouselStyle( attributes ),
        'data-visible-desktop': attributes.visibleDesktop,
        'data-visible-tablet': attributes.visibleTablet,
        'data-visible-mobile': attributes.visibleMobile,
    } );

    const headerStyle = {
        fontSize: attributes.headerFontSize,
        fontWeight: attributes.headerFontWeight,
        color: attributes.headerColor,
        lineHeight: attributes.headerLineHeight,
        textTransform: attributes.headerTextTransform,
        ...getSpacingStyle( attributes.headerPadding, 'padding' ),
        ...getSpacingStyle( attributes.headerMargin, 'margin' ),
    };

    return (
        <>
            <InspectorControls>
                {/* ── Carousel Layout ── */}
                <PanelBody title={ __( 'Carousel Layout', 'zenctuary' ) } initialOpen>
                    <RangeControl label={ __( 'Carousel Width (px)', 'zenctuary' ) } value={ attributes.carouselWidth } onChange={ ( v ) => setAttributes( { carouselWidth: v } ) } min={ 320 } max={ 1800 } />
                    <RangeControl label={ __( 'Carousel Height (px)', 'zenctuary' ) } value={ attributes.carouselHeight } onChange={ ( v ) => setAttributes( { carouselHeight: v } ) } min={ 300 } max={ 1400 } />
                    <RangeControl label={ __( 'Border Width', 'zenctuary' ) } value={ attributes.carouselBorderWidth } onChange={ ( v ) => setAttributes( { carouselBorderWidth: v } ) } min={ 0 } max={ 20 } />
                    <BaseControl label={ __( 'Border Color', 'zenctuary' ) }>
                        <ColorPalette value={ attributes.carouselBorderColor } onChange={ ( v ) => setAttributes( { carouselBorderColor: v || '#ffffff' } ) } colors={ PRESET_COLORS } />
                    </BaseControl>
                    <SelectControl
                        label={ __( 'Border Style', 'zenctuary' ) }
                        value={ attributes.carouselBorderStyle }
                        options={ [
                            { label: __( 'Solid', 'zenctuary' ), value: 'solid' },
                            { label: __( 'Dashed', 'zenctuary' ), value: 'dashed' },
                            { label: __( 'Dotted', 'zenctuary' ), value: 'dotted' },
                            { label: __( 'None', 'zenctuary' ), value: 'none' },
                        ] }
                        onChange={ ( v ) => setAttributes( { carouselBorderStyle: v } ) }
                    />
                    <RangeControl label={ __( 'Border Radius', 'zenctuary' ) } value={ attributes.carouselBorderRadius } onChange={ ( v ) => setAttributes( { carouselBorderRadius: v } ) } min={ 0 } max={ 100 } />
                    <RangeControl label={ __( 'Card Width (px)', 'zenctuary' ) } value={ attributes.cardWidth } onChange={ ( v ) => setAttributes( { cardWidth: v } ) } min={ 220 } max={ 600 } />
                    <RangeControl label={ __( 'Card Height (px)', 'zenctuary' ) } value={ attributes.cardHeight } onChange={ ( v ) => setAttributes( { cardHeight: v } ) } min={ 240 } max={ 800 } />
                    <RangeControl label={ __( 'Gap Between Cards', 'zenctuary' ) } value={ attributes.slideGap } onChange={ ( v ) => setAttributes( { slideGap: v } ) } min={ 0 } max={ 80 } />
                    <RangeControl label={ __( 'Slide Speed (ms)', 'zenctuary' ) } value={ attributes.slideSpeed } onChange={ ( v ) => setAttributes( { slideSpeed: v } ) } min={ 100 } max={ 2000 } />
                    <RangeControl label={ __( 'Visible Cards Desktop', 'zenctuary' ) } value={ attributes.visibleDesktop } onChange={ ( v ) => setAttributes( { visibleDesktop: v } ) } min={ 1 } max={ 4 } step={ 0.1 } />
                    <RangeControl label={ __( 'Visible Cards Tablet', 'zenctuary' ) } value={ attributes.visibleTablet } onChange={ ( v ) => setAttributes( { visibleTablet: v } ) } min={ 1 } max={ 3 } step={ 0.1 } />
                    <RangeControl label={ __( 'Visible Cards Mobile', 'zenctuary' ) } value={ attributes.visibleMobile } onChange={ ( v ) => setAttributes( { visibleMobile: v } ) } min={ 1 } max={ 2 } step={ 0.1 } />
                    <SelectControl
                        label={ __( 'Background Type', 'zenctuary' ) }
                        value={ attributes.sectionBackgroundType }
                        options={ [ { label: __( 'Solid Color', 'zenctuary' ), value: 'color' }, { label: __( 'Image', 'zenctuary' ), value: 'image' } ] }
                        onChange={ ( v ) => setAttributes( { sectionBackgroundType: v } ) }
                    />
                    { attributes.sectionBackgroundType === 'image' && renderMediaControl( {
                        label: __( 'Background Image', 'zenctuary' ),
                        type: 'image',
                        allowedTypes: [ 'image' ],
                        url: attributes.sectionBackgroundImageUrl,
                        buttonLabel: __( 'Choose Background Image', 'zenctuary' ),
                        onSelect: ( media ) => setAttributes( { sectionBackgroundImageUrl: media.url } ),
                        onRemove: () => setAttributes( { sectionBackgroundImageUrl: '' } ),
                    } ) }
                    <BaseControl label={ __( 'Background Color', 'zenctuary' ) }>
                        <ColorPalette value={ attributes.sectionBackgroundColor } onChange={ ( v ) => setAttributes( { sectionBackgroundColor: v || '#3f3e3e' } ) } colors={ BG_PRESET_COLORS } />
                        <TextControl label={ __( 'Custom Color', 'zenctuary' ) } value={ attributes.sectionBackgroundColor } onChange={ ( v ) => setAttributes( { sectionBackgroundColor: v || '#3f3e3e' } ) } help={ __( 'Supports hex, rgb, or rgba.', 'zenctuary' ) } />
                    </BaseControl>
                    { attributes.sectionBackgroundType === 'image' && attributes.sectionBackgroundImageUrl && (
                        <RangeControl label={ __( 'Background Blur', 'zenctuary' ) } value={ attributes.sectionBackgroundBlur } onChange={ ( v ) => setAttributes( { sectionBackgroundBlur: v } ) } min={ 0 } max={ 30 } />
                    ) }
                    { renderFourSideControls( __( 'Section Padding', 'zenctuary' ), attributes.sectionPadding, ( v ) => setAttributes( { sectionPadding: v } ) ) }
                    { renderFourSideControls( __( 'Section Margin', 'zenctuary' ), attributes.sectionMargin, ( v ) => setAttributes( { sectionMargin: v } ) ) }
                </PanelBody>

                {/* ── Header ── */}
                <PanelBody title={ __( 'Header', 'zenctuary' ) } initialOpen={ false }>
                    <TextControl label={ __( 'Font Size', 'zenctuary' ) } value={ attributes.headerFontSize } onChange={ ( v ) => setAttributes( { headerFontSize: v || '56px' } ) } />
                    <TextControl label={ __( 'Font Weight', 'zenctuary' ) } value={ attributes.headerFontWeight } onChange={ ( v ) => setAttributes( { headerFontWeight: v } ) } />
                    <TextControl label={ __( 'Color', 'zenctuary' ) } value={ attributes.headerColor } onChange={ ( v ) => setAttributes( { headerColor: v } ) } />
                    <TextControl label={ __( 'Line Height', 'zenctuary' ) } value={ attributes.headerLineHeight } onChange={ ( v ) => setAttributes( { headerLineHeight: v } ) } />
                    <SelectControl
                        label={ __( 'Text Transform', 'zenctuary' ) }
                        value={ attributes.headerTextTransform }
                        options={ [
                            { label: __( 'None', 'zenctuary' ), value: 'none' },
                            { label: __( 'Uppercase', 'zenctuary' ), value: 'uppercase' },
                            { label: __( 'Capitalize', 'zenctuary' ), value: 'capitalize' },
                            { label: __( 'Lowercase', 'zenctuary' ), value: 'lowercase' },
                        ] }
                        onChange={ ( v ) => setAttributes( { headerTextTransform: v } ) }
                    />
                    { renderFourSideControls( __( 'Header Padding', 'zenctuary' ), attributes.headerPadding, ( v ) => setAttributes( { headerPadding: v } ) ) }
                    { renderFourSideControls( __( 'Header Margin', 'zenctuary' ), attributes.headerMargin, ( v ) => setAttributes( { headerMargin: v } ) ) }
                </PanelBody>

                {/* ── Cards ── */}
                <PanelBody title={ __( 'Cards', 'zenctuary' ) } initialOpen={ false }>
                    <SelectControl
                        label={ __( 'Carousel Type', 'zenctuary' ) }
                        value={ attributes.cardType }
                        options={ CARD_TYPE_OPTIONS }
                        onChange={ ( v ) => {
                            setAttributes( { cardType: v, cards: getDefaultCards( v ) } );
                            setSelectedCardIndex( 0 );
                        } }
                    />
                    <RangeControl label={ __( 'Number of Cards', 'zenctuary' ) } value={ cards.length } onChange={ setCardCount } min={ 1 } max={ 10 } />
                    <RangeControl label={ __( 'Select Card to Edit', 'zenctuary' ) } value={ selectedCardIndex + 1 } onChange={ ( v ) => setSelectedCardIndex( Math.max( 0, v - 1 ) ) } min={ 1 } max={ cards.length } />
                    <Button variant="secondary" onClick={ () => {
                        const nextCards = [ ...cards, defaultCard() ];
                        setAttributes( { cards: nextCards } );
                        setSelectedCardIndex( nextCards.length - 1 );
                    } }>
                        { __( 'Add Card', 'zenctuary' ) }
                    </Button>
                    { cards.length > 1 && (
                        <Button variant="tertiary" onClick={ () => {
                            const nextCards = cards.filter( ( _, i ) => i !== selectedCardIndex );
                            setAttributes( { cards: nextCards } );
                            setSelectedCardIndex( Math.max( 0, selectedCardIndex - 1 ) );
                        } } style={ { marginLeft: '8px' } }>
                            { __( 'Remove Selected', 'zenctuary' ) }
                        </Button>
                    ) }
                </PanelBody>

                {/* ── Selected Card Content ── */}
                { selectedCard && (
                    <PanelBody title={ __( 'Selected Card Content', 'zenctuary' ) } initialOpen={ false }>
                        <SelectControl
                            label={ __( 'Background Type', 'zenctuary' ) }
                            value={ selectedCard.mediaType }
                            options={ [
                                { label: __( 'Image', 'zenctuary' ), value: 'image' },
                                { label: __( 'Video', 'zenctuary' ), value: 'video' },
                                { label: __( 'Solid Color', 'zenctuary' ), value: 'color' },
                            ] }
                            onChange={ ( v ) => {
                                setVideoValidationError( '' );
                                updateCard( selectedCardIndex, { mediaType: v } );
                            } }
                        />
                        { selectedCard.mediaType !== 'color' && renderMediaControl( {
                            label: __( 'Background Media', 'zenctuary' ),
                            type: selectedCard.mediaType,
                            allowedTypes: selectedCard.mediaType === 'video' ? [ 'video' ] : [ 'image' ],
                            url: selectedCard.mediaType === 'video' ? selectedCard.videoUrl : selectedCard.backgroundUrl,
                            buttonLabel: selectedCard.mediaType === 'video' ? __( 'Choose Video', 'zenctuary' ) : __( 'Choose Background', 'zenctuary' ),
                            help: selectedCard.mediaType === 'video' ? __( 'Maximum 10MB.', 'zenctuary' ) : '',
                            error: selectedCard.mediaType === 'video' ? videoValidationError : '',
                            onSelect: ( media ) => {
                                if ( selectedCard.mediaType === 'video' ) {
                                    handleVideoSelect( media );
                                } else {
                                    updateCard( selectedCardIndex, { backgroundUrl: media.url } );
                                }
                            },
                            onRemove: () => {
                                setVideoValidationError( '' );
                                updateCard( selectedCardIndex, selectedCard.mediaType === 'video' ? { videoUrl: '' } : { backgroundUrl: '' } );
                            },
                        } ) }
                        { selectedCard.mediaType === 'video' && renderMediaControl( {
                            label: __( 'Video Thumbnail', 'zenctuary' ),
                            type: 'image',
                            url: selectedCard.videoThumbnailUrl,
                            buttonLabel: __( 'Choose Thumbnail', 'zenctuary' ),
                            onSelect: ( media ) => updateCard( selectedCardIndex, { videoThumbnailUrl: media.url } ),
                            onRemove: () => updateCard( selectedCardIndex, { videoThumbnailUrl: '' } ),
                        } ) }
                        { attributes.cardType === 'testimonial' && renderMediaControl( {
                            label: __( 'Profile Image', 'zenctuary' ),
                            type: 'image',
                            url: selectedCard.profileImageUrl,
                            buttonLabel: __( 'Choose Profile', 'zenctuary' ),
                            onSelect: ( media ) => updateCard( selectedCardIndex, { profileImageUrl: media.url } ),
                            onRemove: () => updateCard( selectedCardIndex, { profileImageUrl: '' } ),
                        } ) }
                        <TextControl label={ __( 'Background Color', 'zenctuary' ) } value={ selectedCard.backgroundColor } onChange={ ( v ) => updateCard( selectedCardIndex, { backgroundColor: v } ) } />
                        <TextControl label={ __( 'Overlay Color', 'zenctuary' ) } value={ selectedCard.overlayColor } onChange={ ( v ) => updateCard( selectedCardIndex, { overlayColor: v } ) } />
                        <RangeControl label={ __( 'Overlay Opacity', 'zenctuary' ) } value={ selectedCard.overlayOpacity } onChange={ ( v ) => updateCard( selectedCardIndex, { overlayOpacity: v } ) } min={ 0 } max={ 1 } step={ 0.05 } />
                        <RangeControl label={ __( 'Title Limit', 'zenctuary' ) } value={ selectedCard.titleLimit } onChange={ ( v ) => updateCard( selectedCardIndex, { titleLimit: v } ) } min={ 10 } max={ 120 } />
                        <RangeControl label={ __( 'Content Limit', 'zenctuary' ) } value={ selectedCard.contentLimit } onChange={ ( v ) => updateCard( selectedCardIndex, { contentLimit: v } ) } min={ 20 } max={ 240 } />
                        { attributes.cardType === 'teacher' && (
                            <RangeControl label={ __( 'Specialty Limit', 'zenctuary' ) } value={ selectedCard.courseLimit } onChange={ ( v ) => updateCard( selectedCardIndex, { courseLimit: v } ) } min={ 10 } max={ 120 } />
                        ) }
                        { attributes.cardType === 'testimonial' && (
                            <RangeControl label={ __( 'Rating', 'zenctuary' ) } value={ selectedCard.rating } onChange={ ( v ) => updateCard( selectedCardIndex, { rating: v } ) } min={ 0 } max={ attributes.starCount } step={ 0.5 } />
                        ) }
                        { attributes.cardType === 'testimonial' && (
                            <TextControl label={ __( 'Star Color', 'zenctuary' ) } value={ selectedCard.starColor || '#d8b355' } onChange={ ( v ) => updateCard( selectedCardIndex, { starColor: v || '#d8b355' } ) } />
                        ) }
                    </PanelBody>
                ) }

                {/* ── Button Design ── */}
                <PanelBody title={ __( 'Button Design', 'zenctuary' ) } initialOpen={ false }>
                    <TextControl label={ __( 'Text Color', 'zenctuary' ) } value={ attributes.buttonTextColor } onChange={ ( v ) => setAttributes( { buttonTextColor: v } ) } />
                    <TextControl label={ __( 'Background Color', 'zenctuary' ) } value={ attributes.buttonBackgroundColor } onChange={ ( v ) => setAttributes( { buttonBackgroundColor: v } ) } />
                    <TextControl label={ __( 'Border Color', 'zenctuary' ) } value={ attributes.buttonBorderColor } onChange={ ( v ) => setAttributes( { buttonBorderColor: v } ) } />
                    <RangeControl label={ __( 'Border Width', 'zenctuary' ) } value={ attributes.buttonBorderWidth } onChange={ ( v ) => setAttributes( { buttonBorderWidth: v } ) } min={ 0 } max={ 12 } />
                    <TextControl label={ __( 'Border Radius', 'zenctuary' ) } value={ attributes.buttonBorderRadius } onChange={ ( v ) => setAttributes( { buttonBorderRadius: v || '999px' } ) } />
                    <SelectControl
                        label={ __( 'Icon Position', 'zenctuary' ) }
                        value={ attributes.buttonIconPosition }
                        options={ [
                            { label: __( 'Left', 'zenctuary' ), value: 'left' },
                            { label: __( 'Right', 'zenctuary' ), value: 'right' },
                            { label: __( 'Top', 'zenctuary' ), value: 'top' },
                            { label: __( 'Bottom', 'zenctuary' ), value: 'bottom' },
                        ] }
                        onChange={ ( v ) => setAttributes( { buttonIconPosition: v } ) }
                    />
                    <ToggleControl label={ __( 'Show Arrow Icon', 'zenctuary' ) } checked={ attributes.buttonShowArrow } onChange={ ( v ) => setAttributes( { buttonShowArrow: v } ) } />
                    { renderFourSideControls( __( 'Button Padding', 'zenctuary' ), attributes.buttonPadding, ( v ) => setAttributes( { buttonPadding: v } ) ) }
                    { renderFourSideControls( __( 'Button Margin', 'zenctuary' ), attributes.buttonMargin, ( v ) => setAttributes( { buttonMargin: v } ) ) }
                </PanelBody>

                {/* ── Dots, Arrows & Testimonial Styling ── */}
                <PanelBody title={ __( 'Dots, Arrows & Testimonial', 'zenctuary' ) } initialOpen={ false }>
                    <RangeControl label={ __( 'Dot Size', 'zenctuary' ) } value={ attributes.dotSize } onChange={ ( v ) => setAttributes( { dotSize: v } ) } min={ 2 } max={ 20 } />
                    <RangeControl label={ __( 'Dot Spacing', 'zenctuary' ) } value={ attributes.dotSpacing } onChange={ ( v ) => setAttributes( { dotSpacing: v } ) } min={ 2 } max={ 30 } />
                    <TextControl label={ __( 'Dot Color', 'zenctuary' ) } value={ attributes.dotColor } onChange={ ( v ) => setAttributes( { dotColor: v } ) } />
                    <RangeControl label={ __( 'Arrow Size', 'zenctuary' ) } value={ attributes.arrowSize } onChange={ ( v ) => setAttributes( { arrowSize: v } ) } min={ 28 } max={ 120 } />
                    <RangeControl label={ __( 'Arrow Border Width', 'zenctuary' ) } value={ attributes.arrowBorderWidth } onChange={ ( v ) => setAttributes( { arrowBorderWidth: v } ) } min={ 0 } max={ 8 } />
                    <TextControl label={ __( 'Arrow Border Color', 'zenctuary' ) } value={ attributes.arrowBorderColor } onChange={ ( v ) => setAttributes( { arrowBorderColor: v } ) } />
                    <TextControl label={ __( 'Arrow Background', 'zenctuary' ) } value={ attributes.arrowBackgroundColor } onChange={ ( v ) => setAttributes( { arrowBackgroundColor: v } ) } />
                    <TextControl label={ __( 'Arrow Color', 'zenctuary' ) } value={ attributes.arrowColor } onChange={ ( v ) => setAttributes( { arrowColor: v } ) } />
                    <TextControl label={ __( 'Arrow Active Color', 'zenctuary' ) } value={ attributes.arrowActiveColor } onChange={ ( v ) => setAttributes( { arrowActiveColor: v } ) } />
                    <TextControl label={ __( 'Active Arrow Background', 'zenctuary' ) } value={ attributes.arrowActiveBackgroundColor } onChange={ ( v ) => setAttributes( { arrowActiveBackgroundColor: v } ) } />
                    <TextControl label={ __( 'Arrow Radius', 'zenctuary' ) } value={ attributes.arrowRadius } onChange={ ( v ) => setAttributes( { arrowRadius: v || '999px' } ) } />
                    <RangeControl label={ __( 'Profile Size', 'zenctuary' ) } value={ attributes.profileSize } onChange={ ( v ) => setAttributes( { profileSize: v } ) } min={ 24 } max={ 120 } />
                    <RangeControl label={ __( 'Profile Border Width', 'zenctuary' ) } value={ attributes.profileBorderWidth } onChange={ ( v ) => setAttributes( { profileBorderWidth: v } ) } min={ 0 } max={ 8 } />
                    <TextControl label={ __( 'Profile Border Color', 'zenctuary' ) } value={ attributes.profileBorderColor } onChange={ ( v ) => setAttributes( { profileBorderColor: v } ) } />
                    <TextControl label={ __( 'Profile Radius', 'zenctuary' ) } value={ attributes.profileBorderRadius } onChange={ ( v ) => setAttributes( { profileBorderRadius: v || '999px' } ) } />
                    <RangeControl label={ __( 'Star Count', 'zenctuary' ) } value={ attributes.starCount } onChange={ ( v ) => setAttributes( { starCount: v } ) } min={ 1 } max={ 10 } />
                    <RangeControl label={ __( 'Star Size', 'zenctuary' ) } value={ attributes.starSize } onChange={ ( v ) => setAttributes( { starSize: v } ) } min={ 10 } max={ 32 } />
                    <TextControl label={ __( 'Testimonial Text Color', 'zenctuary' ) } value={ attributes.testimonialTextColor } onChange={ ( v ) => setAttributes( { testimonialTextColor: v } ) } />
                    <TextControl label={ __( 'Play Button Color', 'zenctuary' ) } value={ attributes.playButtonColor } onChange={ ( v ) => setAttributes( { playButtonColor: v } ) } />
                    <TextControl label={ __( 'Play Button Background', 'zenctuary' ) } value={ attributes.playButtonBackground } onChange={ ( v ) => setAttributes( { playButtonBackground: v } ) } />
                </PanelBody>
            </InspectorControls>

            {/* ── Editor Preview ── */}
            <section { ...blockProps }>
                { getSectionBackgroundLayer( attributes ) }
                <div className="zen-carousel__content">
                    <div className="zen-carousel__header" style={ headerStyle }>
                        <RichText tagName="h2" className="zen-carousel__heading" value={ attributes.headerText } onChange={ ( v ) => setAttributes( { headerText: v } ) } placeholder={ __( 'Add a heading...', 'zenctuary' ) } />
                        <div className="zen-carousel__nav">
                            <button type="button" className={ `zen-carousel__arrow zen-carousel__arrow--prev${ currentSlide > 0 ? ' is-active' : '' }` } onClick={ () => setCurrentSlide( Math.max( 0, currentSlide - 1 ) ) } disabled={ currentSlide <= 0 }>
                                { navigationIcon( 'prev' ) }
                            </button>
                            <button type="button" className={ `zen-carousel__arrow zen-carousel__arrow--next${ currentSlide < maxIndex ? ' is-active' : '' }` } onClick={ () => setCurrentSlide( Math.min( maxIndex, currentSlide + 1 ) ) } disabled={ currentSlide >= maxIndex }>
                                { navigationIcon( 'next' ) }
                            </button>
                        </div>
                    </div>
                    <div className="zen-carousel__viewport" ref={ viewportRef }>
                        <div className="zen-carousel__track" style={ { transform: `translate3d(-${ snapOffsets[ currentSlide ] || 0 }px, 0, 0)` } }>
                            { cards.map( ( card, index ) => {
                                const isVideoCard = card.mediaType === 'video' && !! card.videoUrl;
                                return (
                                    <div
                                        key={ index }
                                        ref={ ( node ) => { slideRefs.current[ index ] = node; } }
                                        className={ `zen-carousel__slide${ index === selectedCardIndex ? ' is-selected' : '' }` }
                                        onClick={ () => setSelectedCardIndex( index ) }
                                    >
                                        <article
                                            className={ `zen-carousel__card${ isVideoCard ? ' zen-carousel__card--video' : '' }` }
                                            style={ { background: card.backgroundColor, height: attributes.cardHeight + 'px' } }
                                            data-video-url={ isVideoCard ? card.videoUrl : undefined }
                                        >
                                            { renderCardBody( { card, attributes, editable: index === selectedCardIndex, updateCard: ( patch ) => updateCard( index, patch ) } ) }
                                        </article>
                                    </div>
                                );
                            } ) }
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

registerBlockType( 'zenctuary/zen-carousel-block', { edit: Edit, save: Save } );
