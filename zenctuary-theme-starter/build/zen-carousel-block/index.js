( function ( blocks, blockEditor, components, element, i18n ) {
	const el = element.createElement;
	const Fragment = element.Fragment;
	const useState = element.useState;
	const useEffect = element.useEffect;
	const useMemo = element.useMemo;
	const useRef = element.useRef;
	const registerBlockType = blocks.registerBlockType;
	const useBlockProps = blockEditor.useBlockProps;
	const RichText = blockEditor.RichText;
	const InspectorControls = blockEditor.InspectorControls;
	const MediaUpload = blockEditor.MediaUpload;
	const MediaUploadCheck = blockEditor.MediaUploadCheck;
	const PanelBody = components.PanelBody;
	const Button = components.Button;
	const RangeControl = components.RangeControl;
	const TextControl = components.TextControl;
	const SelectControl = components.SelectControl;
	const ToggleControl = components.ToggleControl;
	const BaseControl = components.BaseControl;
	const ColorPalette = components.ColorPalette;
	const UnitControl = components.__experimentalUnitControl || components.UnitControl || TextControl;
	const __ = i18n.__;

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
			starColor: '#d8b355'
		};
	}

	function getDefaultCards() {
		return [
			Object.assign( defaultCard(), {
				title: 'Evening Reset',
				content: 'Deep recovery sessions, gentle heat, and guided breathwork for a calm finish to the day.',
				clientName: 'Ava Collins',
				courseName: 'Breath & Balance'
			} ),
			Object.assign( defaultCard(), {
				title: 'Strength Ritual',
				content: 'Progressive classes built around intelligent movement and sustainable recovery.',
				clientName: 'Noah Hart',
				courseName: 'Athletic Flow',
				buttonText: 'Discover',
				backgroundColor: '#58524d',
				rating: 5
			} ),
			Object.assign( defaultCard(), {
				title: 'Studio Recovery',
				content: 'Contrast therapy, expert-led mobility, and a grounded atmosphere for better restoration.',
				clientName: 'Mila Stone',
				courseName: 'Recovery Lab',
				buttonText: 'Join Now',
				backgroundColor: '#3f3e3e',
				rating: 4
			} ),
			Object.assign( defaultCard(), {
				title: 'Weekend Unwind',
				content: 'Signature rituals for movement, stillness, and connection in the heart of the city.',
				clientName: 'Lena Brooks',
				courseName: 'Weekend Restore',
				buttonText: 'Reserve',
				backgroundColor: '#514c47'
			} )
		];
	}

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
			slideGap: { type: 'number', default: 28 },
			slideSpeed: { type: 'number', default: 450 },
			visibleDesktop: { type: 'number', default: 3.3 },
			visibleTablet: { type: 'number', default: 2 },
			visibleMobile: { type: 'number', default: 1 },
			cardType: { type: 'string', default: 'product' },
			cards: { type: 'array', default: getDefaultCards() },
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
			playButtonBackground: { type: 'string', default: 'rgba(0, 0, 0, 0.45)' }
		};
	}

	function normalizeCards( cards, count ) {
		const nextCards = Array.isArray( cards ) ? cards.slice( 0, count ) : [];

		while ( nextCards.length < count ) {
			nextCards.push( defaultCard() );
		}

		return nextCards.map( function ( card ) {
			return Object.assign( defaultCard(), card || {} );
		} );
	}

	function clampText( value, limit ) {
		if ( ! value || ! limit || value.length <= limit ) {
			return value;
		}

		return value.slice( 0, limit ).trimEnd() + '...';
	}

	function normalizeRichTextLineBreaks( value ) {
		if ( value === null || value === undefined ) {
			return '';
		}

		return String( value ).replace( /\r\n|\r|\n/g, '<br>' );
	}

	function clampLineBreakRichText( value, limit ) {
		const normalizedValue = normalizeRichTextLineBreaks( value );

		if ( ! normalizedValue || ! limit ) {
			return normalizedValue;
		}

		const parts = normalizedValue.split( /(<br\s*\/?>)/i );
		const nextParts = [];
		let remaining = limit;
		let truncated = false;

		parts.forEach( function ( part ) {
			if ( ! part ) {
				return;
			}

			if ( /<br\s*\/?>/i.test( part ) ) {
				if ( nextParts.length && remaining > 0 ) {
					nextParts.push( '<br>' );
				}
				return;
			}

			if ( remaining <= 0 ) {
				if ( part.trim() ) {
					truncated = true;
				}
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

		if ( truncated ) {
			nextParts.push( '...' );
		}

		return nextParts.join( '' );
	}

	function getRichTextDisplayValue( value, limit ) {
		const normalizedValue = normalizeRichTextLineBreaks( value );

		if ( ! limit ) {
			return normalizedValue;
		}

		const containsHtmlMarkup = /<(?!br\s*\/?)[^>]+>/i.test( normalizedValue );

		if ( containsHtmlMarkup ) {
			return normalizedValue;
		}

		return clampLineBreakRichText( normalizedValue, limit );
	}

	function renderRichTextContent( tagName, className, value, limit ) {
		return el( RichText.Content, {
			tagName: tagName,
			className: className,
			value: getRichTextDisplayValue( value, limit )
		} );
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

	function getSlidesPerView( attributes, viewportWidth ) {
		if ( viewportWidth <= 781 ) {
			return parseFloat( attributes.visibleMobile || 1 );
		}

		if ( viewportWidth <= 1023 ) {
			return parseFloat( attributes.visibleTablet || 2 );
		}

		return parseFloat( attributes.visibleDesktop || 3.3 );
	}

	function getSnapOffsets( viewportNode, slideNodes ) {
		if ( ! viewportNode || ! slideNodes.length ) {
			return [ 0 ];
		}

		const maxOffset = Math.max( 0, viewportNode.scrollWidth - viewportNode.clientWidth );
		const offsets = slideNodes
			.map( function ( slideNode ) {
				return Math.min( slideNode.offsetLeft, maxOffset );
			} )
			.filter( function ( offset, index, values ) {
				return index === 0 || Math.abs( offset - values[ index - 1 ] ) > 1;
			} );

		if ( ! offsets.length ) {
			offsets.push( 0 );
		}

		if ( Math.abs( offsets[ offsets.length - 1 ] - maxOffset ) > 1 ) {
			offsets.push( maxOffset );
		}

		return offsets;
	}

	function getCarouselStyle( attributes ) {
		return Object.assign(
			{
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
				backgroundColor: attributes.sectionBackgroundColor
			},
			getSpacingStyle( attributes.sectionPadding, 'padding' ),
			getSpacingStyle( attributes.sectionMargin, 'margin' )
		);
	}

	function getSectionBackgroundLayer( attributes ) {
		if ( attributes.sectionBackgroundType !== 'image' || ! attributes.sectionBackgroundImageUrl ) {
			return null;
		}

		return el(
			'div',
			{ className: 'zen-carousel__background', 'aria-hidden': 'true' },
			el( 'div', {
				className: 'zen-carousel__background-image',
				style: {
					backgroundImage: 'linear-gradient(' + attributes.sectionBackgroundColor + ', ' + attributes.sectionBackgroundColor + '), url("' + attributes.sectionBackgroundImageUrl + '")',
					filter: 'blur(' + ( attributes.sectionBackgroundBlur || 0 ) + 'px)'
				}
			} )
		);
	}

	function arrowIcon( direction ) {
		const rotate = direction === 'prev' ? 'rotate(180 12 12)' : undefined;

		return el(
			'svg',
			{ viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg' },
			el(
				'g',
				rotate ? { transform: rotate } : {},
				el( 'path', {
					d: 'M3.5 12H18.5M18.5 12L13.5 7M18.5 12L13.5 17',
					stroke: 'currentColor',
					'stroke-width': '1.75',
					'stroke-linecap': 'round',
					'stroke-linejoin': 'round'
				} )
			)
		);
	}

	function navigationIcon( direction ) {
		return el(
			'span',
			{ className: 'zen-carousel__arrow-icon', 'aria-hidden': 'true' },
			direction === 'prev' ? '<' : '>'
		);
	}

	function playIcon() {
		return el(
			'svg',
			{ viewBox: '0 0 24 24', fill: 'currentColor', xmlns: 'http://www.w3.org/2000/svg' },
			el( 'path', { d: 'M8 5.14v13.72a1 1 0 0 0 1.5.86l10-6.86a1 1 0 0 0 0-1.72l-10-6.86A1 1 0 0 0 8 5.14Z' } )
		);
	}

	function renderFourSideControls( label, value, onChange ) {
		const nextValue = Object.assign(
			{ top: '0px', right: '0px', bottom: '0px', left: '0px' },
			value || {}
		);

		function updateSide( side, sideValue ) {
			onChange( Object.assign( {}, nextValue, { [ side ]: sideValue || '0px' } ) );
		}

		return el(
			BaseControl,
			{ label: label },
			el( UnitControl, { label: __( 'Top', 'zenctuary' ), value: nextValue.top, onChange: function ( sideValue ) { updateSide( 'top', sideValue ); } } ),
			el( UnitControl, { label: __( 'Right', 'zenctuary' ), value: nextValue.right, onChange: function ( sideValue ) { updateSide( 'right', sideValue ); } } ),
			el( UnitControl, { label: __( 'Bottom', 'zenctuary' ), value: nextValue.bottom, onChange: function ( sideValue ) { updateSide( 'bottom', sideValue ); } } ),
			el( UnitControl, { label: __( 'Left', 'zenctuary' ), value: nextValue.left, onChange: function ( sideValue ) { updateSide( 'left', sideValue ); } } )
		);
	}

	function renderMediaControl( props ) {
		return el(
			BaseControl,
			{ label: props.label },
			props.url
				? el(
						Fragment,
						null,
						el(
							'div',
							{ style: { marginBottom: '12px' } },
							props.type === 'video'
								? el( 'div', { style: { fontSize: '12px', opacity: 0.7, wordBreak: 'break-all' } }, props.url )
								: el( 'img', { src: props.url, alt: '', style: { width: '100%', maxWidth: '120px', borderRadius: '8px', display: 'block' } } )
						),
						el( Button, { variant: 'secondary', onClick: props.onRemove }, __( 'Remove', 'zenctuary' ) )
				  )
				: null,
			el(
				MediaUploadCheck,
				null,
				el( MediaUpload, {
					onSelect: props.onSelect,
					allowedTypes: props.allowedTypes || [ 'image' ],
					render: function ( openProps ) {
						return el( Button, { variant: 'primary', onClick: openProps.open }, props.buttonLabel || __( 'Select Media', 'zenctuary' ) );
					}
				} )
			),
			props.help
				? el( 'p', { style: { margin: '8px 0 0', fontSize: '12px', opacity: 0.75 } }, props.help )
				: null,
			props.error
				? el( 'p', { style: { margin: '8px 0 0', fontSize: '12px', color: '#b32d2e' } }, props.error )
				: null
		);
	}

	function getMediaFileSize( media ) {
		if ( ! media || typeof media !== 'object' ) {
			return 0;
		}

		const candidates = [
			media.filesizeInBytes,
			media.filesize,
			media.fileLength,
			media?.media_details?.filesize,
			media?.media_details?.filesizeInBytes
		];

		for ( let index = 0; index < candidates.length; index += 1 ) {
			const candidate = candidates[ index ];

			if ( typeof candidate === 'number' && Number.isFinite( candidate ) ) {
				return candidate;
			}

			if ( typeof candidate === 'string' ) {
				const parsed = parseInt( candidate, 10 );

				if ( Number.isFinite( parsed ) ) {
					return parsed;
				}
			}
		}

		return 0;
	}

	function renderStars( card, attributes ) {
		const totalStars = Math.max( 1, parseInt( attributes.starCount, 10 ) || 5 );
		const rating = Math.round( Math.max( 0, Math.min( parseFloat( card.rating ) || 0, totalStars ) ) * 2 ) / 2;
		const starColor = card.starColor || '#d8b355';

		return el(
			'div',
			{
				className: 'zen-carousel__stars',
				style: { '--zen-card-star-color': starColor },
				'aria-label': String( rating ) + ' out of ' + String( totalStars )
			},
			new Array( totalStars ).fill( null ).map( function ( value, index ) {
				const starFill = Math.max( 0, Math.min( rating - index, 1 ) ) * 100;

				return el(
					'span',
					{ key: index, className: 'zen-carousel__star', 'aria-hidden': 'true' },
					el(
						'svg',
						{ viewBox: '0 0 24 24', fill: 'currentColor', xmlns: 'http://www.w3.org/2000/svg' },
						el( 'path', { d: 'M12 2.6 14.88 8.42 21.31 9.35 16.65 13.9 17.75 20.3 12 17.28 6.25 20.3 7.35 13.9 2.69 9.35 9.12 8.42 12 2.6Z' } )
					),
					el(
						'span',
						{ className: 'zen-carousel__star-fill', style: { width: starFill + '%' } },
						el(
							'svg',
							{ viewBox: '0 0 24 24', fill: 'currentColor', xmlns: 'http://www.w3.org/2000/svg' },
							el( 'path', { d: 'M12 2.6 14.88 8.42 21.31 9.35 16.65 13.9 17.75 20.3 12 17.28 6.25 20.3 7.35 13.9 2.69 9.35 9.12 8.42 12 2.6Z' } )
						)
					)
				);
			} )
		);
	}

	function renderButton( card, attributes, editable, onTextChange, onUrlChange ) {
		const buttonStyle = Object.assign( {}, getSpacingStyle( attributes.buttonPadding, 'padding' ), getSpacingStyle( attributes.buttonMargin, 'margin' ) );
		const className = 'zen-carousel__button zen-carousel__button--icon-' + attributes.buttonIconPosition;
		const arrow = attributes.buttonShowArrow ? el( 'span', { className: 'zen-carousel__button-icon zen-carousel__button-icon--' + attributes.buttonIconPosition }, arrowIcon( 'next' ) ) : null;

		if ( editable ) {
			return el(
				'div',
				{ className: className, style: buttonStyle },
				arrow,
				el( RichText, { tagName: 'span', value: card.buttonText, allowedFormats: [], placeholder: __( 'Button text', 'zenctuary' ), onChange: onTextChange } ),
				el( TextControl, { label: __( 'URL', 'zenctuary' ), value: card.buttonUrl, onChange: onUrlChange, help: __( 'Visible in editor only while the card is selected.', 'zenctuary' ) } )
			);
		}

		return el( 'a', { className: className, style: buttonStyle, href: card.buttonUrl || '#' }, arrow, el( 'span', null, card.buttonText || __( 'Explore', 'zenctuary' ) ) );
	}

	function renderCardBody( params ) {
		const card = params.card;
		const attributes = params.attributes;
		const editable = params.editable;
		const updateCard = params.updateCard;
		const cardType = attributes.cardType;
		const course = clampText( card.courseName, card.courseLimit );
		const overlayStyle = { background: card.overlayColor, opacity: card.overlayOpacity };

		function renderBackground() {
			if ( card.mediaType === 'color' ) {
				return null;
			}

			if ( card.mediaType === 'video' ) {
				return el(
					'div',
					{ className: 'zen-carousel__card-media zen-carousel__card-media--video' },
					card.videoThumbnailUrl
						? el( 'img', { src: card.videoThumbnailUrl, alt: '' } )
						: el( 'div', { className: 'zen-carousel__video-preview', 'aria-hidden': 'true' } )
				);
			}

			if ( card.backgroundUrl ) {
				return el( 'div', { className: 'zen-carousel__card-media' }, el( 'img', { src: card.backgroundUrl, alt: '' } ) );
			}

			return null;
		}

		const innerStyle = {
			background:
				card.mediaType === 'color' || ( card.mediaType === 'image' && ! card.backgroundUrl )
					? card.backgroundColor
					: 'transparent'
		};

		if ( cardType === 'testimonial' ) {
			return el(
				Fragment,
				null,
				renderBackground(),
				el( 'div', { className: 'zen-carousel__card-overlay', style: overlayStyle } ),
				el(
					'div',
					{ className: 'zen-carousel__card-inner', style: innerStyle },
					el(
						'div',
						{ className: 'zen-carousel__testimonial-top' },
						el( 'div', { className: 'zen-carousel__profile' }, card.profileImageUrl ? el( 'img', { src: card.profileImageUrl, alt: '' } ) : null ),
						renderStars( card, attributes )
					),
					el(
						'div',
						{ className: 'zen-carousel__testimonial-body' },
						editable
							? el( RichText, { tagName: 'p', className: 'zen-carousel__content', value: card.content, onChange: function ( nextValue ) { updateCard( { content: nextValue } ); }, placeholder: __( 'Write testimonial text...', 'zenctuary' ) } )
							: renderRichTextContent( 'p', 'zen-carousel__content', card.content, card.contentLimit )
					),
					editable
						? el( RichText, { tagName: 'p', className: 'zen-carousel__client', value: card.clientName, onChange: function ( nextValue ) { updateCard( { clientName: nextValue } ); }, placeholder: __( 'Client name', 'zenctuary' ) } )
						: el( 'p', { className: 'zen-carousel__client' }, card.clientName )
				),
				card.mediaType === 'video' && card.videoUrl
					? el( 'span', { className: 'zen-carousel__video-play', 'aria-hidden': 'true' }, playIcon() )
					: null
			);
		}

		return el(
			Fragment,
			null,
			renderBackground(),
			el( 'div', { className: 'zen-carousel__card-overlay', style: overlayStyle } ),
			el(
				'div',
				{ className: 'zen-carousel__card-inner', style: innerStyle },
				editable
					? el( RichText, { tagName: 'h3', className: 'zen-carousel__title', value: card.title, onChange: function ( nextValue ) { updateCard( { title: nextValue } ); }, placeholder: __( 'Card title', 'zenctuary' ) } )
					: renderRichTextContent( 'h3', 'zen-carousel__title', card.title, card.titleLimit ),
				el(
					'div',
					{ className: 'zen-carousel__footer' },
					cardType === 'product'
						? el(
								Fragment,
								null,
								editable
									? el( RichText, { tagName: 'p', className: 'zen-carousel__content', value: card.content, onChange: function ( nextValue ) { updateCard( { content: nextValue } ); }, placeholder: __( 'Write supporting copy...', 'zenctuary' ) } )
									: renderRichTextContent( 'p', 'zen-carousel__content', card.content, card.contentLimit ),
								el( 'div', { className: 'zen-carousel__dots', 'aria-hidden': 'true' }, el( 'span', null ), el( 'span', null ), el( 'span', null ) )
						  )
						: editable
						? el( RichText, { tagName: 'p', className: 'zen-carousel__course', value: card.courseName, onChange: function ( nextValue ) { updateCard( { courseName: nextValue } ); }, placeholder: __( 'Course name', 'zenctuary' ) } )
						: el( 'p', { className: 'zen-carousel__course' }, course ),
					renderButton(
						card,
						attributes,
						editable,
						function ( nextValue ) {
							updateCard( { buttonText: nextValue } );
						},
						function ( nextValue ) {
							updateCard( { buttonUrl: nextValue } );
						}
					)
				)
			),
			card.mediaType === 'video' && card.videoUrl
				? el( 'span', { className: 'zen-carousel__video-play', 'aria-hidden': 'true' }, playIcon() )
				: null
		);
	}

	function Edit( props ) {
		const attributes = props.attributes;
		const setAttributes = props.setAttributes;
		const [ selectedCardIndex, setSelectedCardIndex ] = useState( 0 );
		const [ currentSlide, setCurrentSlide ] = useState( 0 );
		const [ viewportWidth, setViewportWidth ] = useState( window.innerWidth );
		const [ snapOffsets, setSnapOffsets ] = useState( [ 0 ] );
		const [ videoValidationError, setVideoValidationError ] = useState( '' );
		const viewportRef = useRef( null );
		const slideRefs = useRef( [] );
		const cards = useMemo( function () {
			return normalizeCards( attributes.cards, Math.max( 1, ( attributes.cards || [] ).length ) );
		}, [ attributes.cards ] );
		const maxVideoSizeInBytes = 10 * 1024 * 1024;

		useEffect( function () {
			function handleResize() {
				setViewportWidth( window.innerWidth );
			}

			window.addEventListener( 'resize', handleResize );

			return function () {
				window.removeEventListener( 'resize', handleResize );
			};
		}, [] );

		useEffect( function () {
			const nextOffsets = getSnapOffsets( viewportRef.current, slideRefs.current.filter( Boolean ) );
			setSnapOffsets( nextOffsets );
			setCurrentSlide( function ( previousSlide ) {
				return Math.max( 0, Math.min( previousSlide, nextOffsets.length - 1 ) );
			} );
		}, [ cards.length, viewportWidth, attributes.slideGap, attributes.visibleDesktop, attributes.visibleTablet, attributes.visibleMobile, attributes.carouselWidth, attributes.carouselBorderWidth ] );

		useEffect( function () {
			setVideoValidationError( '' );
		}, [ selectedCardIndex ] );

		function updateCard( index, patch ) {
			const nextCards = cards.slice();
			nextCards[ index ] = Object.assign( {}, nextCards[ index ], patch );
			setAttributes( { cards: nextCards } );
		}

		function handleVideoSelect( media ) {
			const fileSize = getMediaFileSize( media );

			if ( fileSize > maxVideoSizeInBytes ) {
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

		const maxIndex = Math.max( 0, snapOffsets.length - 1 );
		const selectedCard = cards[ selectedCardIndex ] || cards[ 0 ];
		const blockProps = useBlockProps( {
			className: 'is-editor-preview',
			style: getCarouselStyle( attributes ),
			'data-visible-desktop': attributes.visibleDesktop,
			'data-visible-tablet': attributes.visibleTablet,
			'data-visible-mobile': attributes.visibleMobile
		} );
		const headerStyle = Object.assign(
			{
				fontSize: attributes.headerFontSize,
				fontWeight: attributes.headerFontWeight,
				color: attributes.headerColor,
				lineHeight: attributes.headerLineHeight,
				textTransform: attributes.headerTextTransform
			},
			getSpacingStyle( attributes.headerPadding, 'padding' ),
			getSpacingStyle( attributes.headerMargin, 'margin' )
		);

		return el(
			Fragment,
			null,
			el(
				InspectorControls,
				null,
				el(
					PanelBody,
					{ title: __( 'Carousel Layout', 'zenctuary' ), initialOpen: true },
					el( RangeControl, { label: __( 'Carousel Width (px)', 'zenctuary' ), value: attributes.carouselWidth, onChange: function ( value ) { setAttributes( { carouselWidth: value } ); }, min: 320, max: 1800 } ),
					el( RangeControl, { label: __( 'Carousel Height (px)', 'zenctuary' ), value: attributes.carouselHeight, onChange: function ( value ) { setAttributes( { carouselHeight: value } ); }, min: 300, max: 1400 } ),
					el( RangeControl, { label: __( 'Border Width', 'zenctuary' ), value: attributes.carouselBorderWidth, onChange: function ( value ) { setAttributes( { carouselBorderWidth: value } ); }, min: 0, max: 20 } ),
					el(
						BaseControl,
						{ label: __( 'Border Color', 'zenctuary' ) },
						el( ColorPalette, {
							value: attributes.carouselBorderColor,
							onChange: function ( value ) {
								setAttributes( { carouselBorderColor: value || '#ffffff' } );
							},
							colors: [
								{ name: 'White', color: '#ffffff' },
								{ name: 'Gold', color: '#d8b354' },
								{ name: 'Beige', color: '#f6f2ea' },
								{ name: 'Charcoal', color: '#3f3e3e' },
								{ name: 'Gray', color: '#545454' }
							]
						} )
					),
					el( SelectControl, { label: __( 'Border Style', 'zenctuary' ), value: attributes.carouselBorderStyle, options: [ { label: __( 'Solid', 'zenctuary' ), value: 'solid' }, { label: __( 'Dashed', 'zenctuary' ), value: 'dashed' }, { label: __( 'Dotted', 'zenctuary' ), value: 'dotted' }, { label: __( 'None', 'zenctuary' ), value: 'none' } ], onChange: function ( value ) { setAttributes( { carouselBorderStyle: value } ); } } ),
					el( RangeControl, { label: __( 'Border Radius', 'zenctuary' ), value: attributes.carouselBorderRadius, onChange: function ( value ) { setAttributes( { carouselBorderRadius: value } ); }, min: 0, max: 100 } ),
					el( RangeControl, { label: __( 'Card Width (px)', 'zenctuary' ), value: attributes.cardWidth, onChange: function ( value ) { setAttributes( { cardWidth: value } ); }, min: 220, max: 600 } ),
					el( RangeControl, { label: __( 'Card Height (px)', 'zenctuary' ), value: attributes.cardHeight, onChange: function ( value ) { setAttributes( { cardHeight: value } ); }, min: 240, max: 800 } ),
					el( RangeControl, { label: __( 'Gap Between Cards', 'zenctuary' ), value: attributes.slideGap, onChange: function ( value ) { setAttributes( { slideGap: value } ); }, min: 0, max: 80 } ),
					el( RangeControl, { label: __( 'Slide Speed (ms)', 'zenctuary' ), value: attributes.slideSpeed, onChange: function ( value ) { setAttributes( { slideSpeed: value } ); }, min: 100, max: 2000 } ),
					el( RangeControl, { label: __( 'Visible Cards Desktop', 'zenctuary' ), value: attributes.visibleDesktop, onChange: function ( value ) { setAttributes( { visibleDesktop: value } ); }, min: 1, max: 4, step: 0.1 } ),
					el( RangeControl, { label: __( 'Visible Cards Tablet', 'zenctuary' ), value: attributes.visibleTablet, onChange: function ( value ) { setAttributes( { visibleTablet: value } ); }, min: 1, max: 3, step: 0.1 } ),
					el( RangeControl, { label: __( 'Visible Cards Mobile', 'zenctuary' ), value: attributes.visibleMobile, onChange: function ( value ) { setAttributes( { visibleMobile: value } ); }, min: 1, max: 2, step: 0.1 } ),
					el( SelectControl, { label: __( 'Background Type', 'zenctuary' ), value: attributes.sectionBackgroundType, options: [ { label: __( 'Solid Color', 'zenctuary' ), value: 'color' }, { label: __( 'Image', 'zenctuary' ), value: 'image' } ], onChange: function ( value ) { setAttributes( { sectionBackgroundType: value } ); } } ),
					attributes.sectionBackgroundType === 'image' ? renderMediaControl( { label: __( 'Background Image', 'zenctuary' ), type: 'image', allowedTypes: [ 'image' ], url: attributes.sectionBackgroundImageUrl, buttonLabel: __( 'Choose Background Image', 'zenctuary' ), onSelect: function ( media ) { setAttributes( { sectionBackgroundImageUrl: media.url } ); }, onRemove: function () { setAttributes( { sectionBackgroundImageUrl: '' } ); } } ) : null,
					el(
						BaseControl,
						{ label: __( 'Background Color', 'zenctuary' ) },
						el( ColorPalette, {
							value: attributes.sectionBackgroundColor,
							onChange: function ( value ) {
								setAttributes( { sectionBackgroundColor: value || '#3f3e3e' } );
							},
							colors: [
								{ name: 'Transparent', color: 'rgba(0,0,0,0)' },
								{ name: 'White', color: '#ffffff' },
								{ name: 'Gold', color: '#d8b354' },
								{ name: 'Beige', color: '#f6f2ea' },
								{ name: 'Charcoal', color: '#3f3e3e' },
								{ name: 'Black', color: '#000000' }
							]
						} ),
						el( TextControl, { label: __( 'Custom Color', 'zenctuary' ), value: attributes.sectionBackgroundColor, onChange: function ( value ) { setAttributes( { sectionBackgroundColor: value || '#3f3e3e' } ); }, help: __( 'Supports hex, rgb, or rgba values for solid backgrounds or image tinting.', 'zenctuary' ) } )
					),
					attributes.sectionBackgroundType === 'image' && attributes.sectionBackgroundImageUrl ? el( RangeControl, { label: __( 'Background Blur', 'zenctuary' ), value: attributes.sectionBackgroundBlur, onChange: function ( value ) { setAttributes( { sectionBackgroundBlur: value } ); }, min: 0, max: 30 } ) : null,
					renderFourSideControls( __( 'Section Padding', 'zenctuary' ), attributes.sectionPadding, function ( value ) { setAttributes( { sectionPadding: value } ); } ),
					renderFourSideControls( __( 'Section Margin', 'zenctuary' ), attributes.sectionMargin, function ( value ) { setAttributes( { sectionMargin: value } ); } )
				),
				el(
					PanelBody,
					{ title: __( 'Header', 'zenctuary' ), initialOpen: false },
					el( UnitControl, { label: __( 'Font Size', 'zenctuary' ), value: attributes.headerFontSize, onChange: function ( value ) { setAttributes( { headerFontSize: value || '56px' } ); } } ),
					el( TextControl, { label: __( 'Font Weight', 'zenctuary' ), value: attributes.headerFontWeight, onChange: function ( value ) { setAttributes( { headerFontWeight: value } ); } } ),
					el( TextControl, { label: __( 'Color', 'zenctuary' ), value: attributes.headerColor, onChange: function ( value ) { setAttributes( { headerColor: value } ); } } ),
					el( TextControl, { label: __( 'Line Height', 'zenctuary' ), value: attributes.headerLineHeight, onChange: function ( value ) { setAttributes( { headerLineHeight: value } ); } } ),
					el( SelectControl, { label: __( 'Text Transform', 'zenctuary' ), value: attributes.headerTextTransform, options: [ { label: __( 'None', 'zenctuary' ), value: 'none' }, { label: __( 'Uppercase', 'zenctuary' ), value: 'uppercase' }, { label: __( 'Capitalize', 'zenctuary' ), value: 'capitalize' }, { label: __( 'Lowercase', 'zenctuary' ), value: 'lowercase' } ], onChange: function ( value ) { setAttributes( { headerTextTransform: value } ); } } ),
					renderFourSideControls( __( 'Header Padding', 'zenctuary' ), attributes.headerPadding, function ( value ) { setAttributes( { headerPadding: value } ); } ),
					renderFourSideControls( __( 'Header Margin', 'zenctuary' ), attributes.headerMargin, function ( value ) { setAttributes( { headerMargin: value } ); } )
				),
				el(
					PanelBody,
					{ title: __( 'Cards', 'zenctuary' ), initialOpen: false },
					el( SelectControl, { label: __( 'Card Type', 'zenctuary' ), value: attributes.cardType, options: [ { label: __( 'Product Card', 'zenctuary' ), value: 'product' }, { label: __( 'Testimonial Card', 'zenctuary' ), value: 'testimonial' }, { label: __( 'Teacher Card', 'zenctuary' ), value: 'teacher' } ], onChange: function ( value ) { setAttributes( { cardType: value } ); } } ),
					el( RangeControl, { label: __( 'Number of Cards', 'zenctuary' ), value: cards.length, onChange: setCardCount, min: 1, max: 10 } ),
					el( RangeControl, { label: __( 'Select Card', 'zenctuary' ), value: selectedCardIndex + 1, onChange: function ( value ) { setSelectedCardIndex( Math.max( 0, value - 1 ) ); }, min: 1, max: cards.length } ),
					el( Button, { variant: 'secondary', onClick: function () { const nextCards = cards.concat( [ defaultCard() ] ); setAttributes( { cards: nextCards } ); setSelectedCardIndex( nextCards.length - 1 ); } }, __( 'Add Card', 'zenctuary' ) ),
					cards.length > 1 ? el( Button, { variant: 'tertiary', onClick: function () { const nextCards = cards.filter( function ( item, index ) { return index !== selectedCardIndex; } ); setAttributes( { cards: nextCards } ); setSelectedCardIndex( Math.max( 0, selectedCardIndex - 1 ) ); }, style: { marginLeft: '8px' } }, __( 'Remove Selected', 'zenctuary' ) ) : null
				),
				selectedCard ? el(
					PanelBody,
					{ title: __( 'Selected Card Content', 'zenctuary' ), initialOpen: false },
					el( SelectControl, { label: __( 'Background Type', 'zenctuary' ), value: selectedCard.mediaType, options: [ { label: __( 'Image', 'zenctuary' ), value: 'image' }, { label: __( 'Video', 'zenctuary' ), value: 'video' }, { label: __( 'Solid Color', 'zenctuary' ), value: 'color' } ], onChange: function ( value ) { setVideoValidationError( '' ); updateCard( selectedCardIndex, { mediaType: value } ); } } ),
					selectedCard.mediaType !== 'color' ? renderMediaControl( { label: __( 'Background Media', 'zenctuary' ), type: selectedCard.mediaType, allowedTypes: selectedCard.mediaType === 'video' ? [ 'video' ] : [ 'image' ], url: selectedCard.mediaType === 'video' ? selectedCard.videoUrl : selectedCard.backgroundUrl, buttonLabel: selectedCard.mediaType === 'video' ? __( 'Choose Video', 'zenctuary' ) : __( 'Choose Background', 'zenctuary' ), help: selectedCard.mediaType === 'video' ? __( 'Maximum allowed video size is 10MB', 'zenctuary' ) : '', error: selectedCard.mediaType === 'video' ? videoValidationError : '', onSelect: function ( media ) { if ( selectedCard.mediaType === 'video' ) { handleVideoSelect( media ); return; } updateCard( selectedCardIndex, { backgroundUrl: media.url } ); }, onRemove: function () { setVideoValidationError( '' ); updateCard( selectedCardIndex, selectedCard.mediaType === 'video' ? { videoUrl: '' } : { backgroundUrl: '' } ); } } ) : null,
					selectedCard.mediaType === 'video' ? renderMediaControl( { label: __( 'Video Thumbnail', 'zenctuary' ), type: 'image', allowedTypes: [ 'image' ], url: selectedCard.videoThumbnailUrl, buttonLabel: __( 'Choose Thumbnail', 'zenctuary' ), onSelect: function ( media ) { updateCard( selectedCardIndex, { videoThumbnailUrl: media.url } ); }, onRemove: function () { updateCard( selectedCardIndex, { videoThumbnailUrl: '' } ); } } ) : null,
					attributes.cardType === 'testimonial' ? renderMediaControl( { label: __( 'Profile Image', 'zenctuary' ), type: 'image', url: selectedCard.profileImageUrl, buttonLabel: __( 'Choose Profile', 'zenctuary' ), onSelect: function ( media ) { updateCard( selectedCardIndex, { profileImageUrl: media.url } ); }, onRemove: function () { updateCard( selectedCardIndex, { profileImageUrl: '' } ); } } ) : null,
					el( TextControl, { label: __( 'Background Color', 'zenctuary' ), value: selectedCard.backgroundColor, onChange: function ( value ) { updateCard( selectedCardIndex, { backgroundColor: value } ); } } ),
					el( TextControl, { label: __( 'Overlay Color', 'zenctuary' ), value: selectedCard.overlayColor, onChange: function ( value ) { updateCard( selectedCardIndex, { overlayColor: value } ); } } ),
					el( RangeControl, { label: __( 'Overlay Opacity', 'zenctuary' ), value: selectedCard.overlayOpacity, onChange: function ( value ) { updateCard( selectedCardIndex, { overlayOpacity: value } ); }, min: 0, max: 1, step: 0.05 } ),
					el( RangeControl, { label: __( 'Title Character Limit', 'zenctuary' ), value: selectedCard.titleLimit, onChange: function ( value ) { updateCard( selectedCardIndex, { titleLimit: value } ); }, min: 10, max: 120 } ),
					el( RangeControl, { label: __( 'Content Character Limit', 'zenctuary' ), value: selectedCard.contentLimit, onChange: function ( value ) { updateCard( selectedCardIndex, { contentLimit: value } ); }, min: 20, max: 240 } ),
					attributes.cardType === 'teacher' ? el( RangeControl, { label: __( 'Course Name Character Limit', 'zenctuary' ), value: selectedCard.courseLimit, onChange: function ( value ) { updateCard( selectedCardIndex, { courseLimit: value } ); }, min: 10, max: 120 } ) : null,
					attributes.cardType === 'testimonial' ? el( RangeControl, { label: __( 'Rating', 'zenctuary' ), value: selectedCard.rating, onChange: function ( value ) { updateCard( selectedCardIndex, { rating: value } ); }, min: 0, max: attributes.starCount, step: 0.5 } ) : null,
					attributes.cardType === 'testimonial' ? el( TextControl, { label: __( 'Star Color (Selected Card)', 'zenctuary' ), value: selectedCard.starColor || '#d8b355', onChange: function ( value ) { updateCard( selectedCardIndex, { starColor: value || '#d8b355' } ); } } ) : null
				) : null,
				el(
					PanelBody,
					{ title: __( 'Button Design', 'zenctuary' ), initialOpen: false },
					el( TextControl, { label: __( 'Text Color', 'zenctuary' ), value: attributes.buttonTextColor, onChange: function ( value ) { setAttributes( { buttonTextColor: value } ); } } ),
					el( TextControl, { label: __( 'Background Color', 'zenctuary' ), value: attributes.buttonBackgroundColor, onChange: function ( value ) { setAttributes( { buttonBackgroundColor: value } ); } } ),
					el( TextControl, { label: __( 'Border Color', 'zenctuary' ), value: attributes.buttonBorderColor, onChange: function ( value ) { setAttributes( { buttonBorderColor: value } ); } } ),
					el( RangeControl, { label: __( 'Button Border Width', 'zenctuary' ), value: attributes.buttonBorderWidth, onChange: function ( value ) { setAttributes( { buttonBorderWidth: value } ); }, min: 0, max: 12 } ),
					el( UnitControl, { label: __( 'Border Radius', 'zenctuary' ), value: attributes.buttonBorderRadius, onChange: function ( value ) { setAttributes( { buttonBorderRadius: value || '999px' } ); } } ),
					el( SelectControl, { label: __( 'Icon Position', 'zenctuary' ), value: attributes.buttonIconPosition, options: [ { label: __( 'Left', 'zenctuary' ), value: 'left' }, { label: __( 'Right', 'zenctuary' ), value: 'right' }, { label: __( 'Top', 'zenctuary' ), value: 'top' }, { label: __( 'Bottom', 'zenctuary' ), value: 'bottom' } ], onChange: function ( value ) { setAttributes( { buttonIconPosition: value } ); } } ),
					el( ToggleControl, { label: __( 'Show Arrow Icon', 'zenctuary' ), checked: attributes.buttonShowArrow, onChange: function ( value ) { setAttributes( { buttonShowArrow: value } ); } } ),
					renderFourSideControls( __( 'Button Padding', 'zenctuary' ), attributes.buttonPadding, function ( value ) { setAttributes( { buttonPadding: value } ); } ),
					renderFourSideControls( __( 'Button Margin', 'zenctuary' ), attributes.buttonMargin, function ( value ) { setAttributes( { buttonMargin: value } ); } )
				),
				el(
					PanelBody,
					{ title: __( 'Dots, Arrows & Testimonial Styling', 'zenctuary' ), initialOpen: false },
					el( RangeControl, { label: __( 'Dot Size', 'zenctuary' ), value: attributes.dotSize, onChange: function ( value ) { setAttributes( { dotSize: value } ); }, min: 2, max: 20 } ),
					el( RangeControl, { label: __( 'Dot Spacing', 'zenctuary' ), value: attributes.dotSpacing, onChange: function ( value ) { setAttributes( { dotSpacing: value } ); }, min: 2, max: 30 } ),
					el( TextControl, { label: __( 'Dot Color', 'zenctuary' ), value: attributes.dotColor, onChange: function ( value ) { setAttributes( { dotColor: value } ); } } ),
					el( RangeControl, { label: __( 'Navigation Size', 'zenctuary' ), value: attributes.arrowSize, onChange: function ( value ) { setAttributes( { arrowSize: value } ); }, min: 28, max: 120 } ),
					el( RangeControl, { label: __( 'Navigation Border Width', 'zenctuary' ), value: attributes.arrowBorderWidth, onChange: function ( value ) { setAttributes( { arrowBorderWidth: value } ); }, min: 0, max: 8 } ),
					el( TextControl, { label: __( 'Navigation Border Color', 'zenctuary' ), value: attributes.arrowBorderColor, onChange: function ( value ) { setAttributes( { arrowBorderColor: value } ); } } ),
					el( TextControl, { label: __( 'Navigation Background', 'zenctuary' ), value: attributes.arrowBackgroundColor, onChange: function ( value ) { setAttributes( { arrowBackgroundColor: value } ); } } ),
					el( TextControl, { label: __( 'Arrow Color', 'zenctuary' ), value: attributes.arrowColor, onChange: function ( value ) { setAttributes( { arrowColor: value } ); } } ),
					el( TextControl, { label: __( 'Arrow Active Color', 'zenctuary' ), value: attributes.arrowActiveColor, onChange: function ( value ) { setAttributes( { arrowActiveColor: value } ); } } ),
					el( TextControl, { label: __( 'Active Navigation Background Color', 'zenctuary' ), value: attributes.arrowActiveBackgroundColor, onChange: function ( value ) { setAttributes( { arrowActiveBackgroundColor: value } ); } } ),
					el( UnitControl, { label: __( 'Arrow Radius', 'zenctuary' ), value: attributes.arrowRadius, onChange: function ( value ) { setAttributes( { arrowRadius: value || '999px' } ); } } ),
					el( RangeControl, { label: __( 'Profile Size', 'zenctuary' ), value: attributes.profileSize, onChange: function ( value ) { setAttributes( { profileSize: value } ); }, min: 24, max: 120 } ),
					el( RangeControl, { label: __( 'Profile Border Width', 'zenctuary' ), value: attributes.profileBorderWidth, onChange: function ( value ) { setAttributes( { profileBorderWidth: value } ); }, min: 0, max: 8 } ),
					el( TextControl, { label: __( 'Profile Border Color', 'zenctuary' ), value: attributes.profileBorderColor, onChange: function ( value ) { setAttributes( { profileBorderColor: value } ); } } ),
					el( UnitControl, { label: __( 'Profile Radius', 'zenctuary' ), value: attributes.profileBorderRadius, onChange: function ( value ) { setAttributes( { profileBorderRadius: value || '999px' } ); } } ),
					el( RangeControl, { label: __( 'Star Count', 'zenctuary' ), value: attributes.starCount, onChange: function ( value ) { setAttributes( { starCount: value } ); }, min: 1, max: 10 } ),
					el( RangeControl, { label: __( 'Star Size', 'zenctuary' ), value: attributes.starSize, onChange: function ( value ) { setAttributes( { starSize: value } ); }, min: 10, max: 32 } ),
					el( TextControl, { label: __( 'Testimonial Text Color', 'zenctuary' ), value: attributes.testimonialTextColor, onChange: function ( value ) { setAttributes( { testimonialTextColor: value } ); } } ),
					el( TextControl, { label: __( 'Play Button Color', 'zenctuary' ), value: attributes.playButtonColor, onChange: function ( value ) { setAttributes( { playButtonColor: value } ); } } ),
					el( TextControl, { label: __( 'Play Button Background', 'zenctuary' ), value: attributes.playButtonBackground, onChange: function ( value ) { setAttributes( { playButtonBackground: value } ); } } )
				)
			),
			el(
				'section',
				blockProps,
				getSectionBackgroundLayer( attributes ),
				el(
					'div',
					{ className: 'zen-carousel__content' },
					el(
						'div',
						{ className: 'zen-carousel__header', style: headerStyle },
						el( RichText, { tagName: 'h2', className: 'zen-carousel__heading', value: attributes.headerText, onChange: function ( value ) { setAttributes( { headerText: value } ); }, placeholder: __( 'Add a heading...', 'zenctuary' ) } ),
						el(
							'div',
							{ className: 'zen-carousel__nav' },
							el( 'button', { type: 'button', className: 'zen-carousel__arrow zen-carousel__arrow--prev' + ( currentSlide > 0 ? ' is-active' : '' ), onClick: function () { setCurrentSlide( Math.max( 0, currentSlide - 1 ) ); }, disabled: currentSlide <= 0 }, navigationIcon( 'prev' ) ),
							el( 'button', { type: 'button', className: 'zen-carousel__arrow zen-carousel__arrow--next' + ( currentSlide < maxIndex ? ' is-active' : '' ), onClick: function () { setCurrentSlide( Math.min( maxIndex, currentSlide + 1 ) ); }, disabled: currentSlide >= maxIndex }, navigationIcon( 'next' ) )
						)
					),
					el(
						'div',
						{ className: 'zen-carousel__viewport', ref: viewportRef },
						el(
							'div',
							{ className: 'zen-carousel__track', style: { transform: 'translate3d(-' + ( snapOffsets[ currentSlide ] || 0 ) + 'px, 0, 0)' } },
							cards.map( function ( card, index ) {
								const isVideoCard = card.mediaType === 'video' && !! card.videoUrl;
								return el(
									'div',
									{ key: index, ref: function ( node ) { slideRefs.current[ index ] = node; }, className: 'zen-carousel__slide' + ( index === selectedCardIndex ? ' is-selected' : '' ), onClick: function () { setSelectedCardIndex( index ); } },
									el(
										'article',
										{
											className: 'zen-carousel__card' + ( isVideoCard ? ' zen-carousel__card--video' : '' ),
											style: { background: card.backgroundColor, height: attributes.cardHeight + 'px' },
											'data-video-url': isVideoCard ? card.videoUrl : undefined
										},
										renderCardBody( { card: card, attributes: attributes, editable: index === selectedCardIndex, updateCard: function ( patch ) { updateCard( index, patch ); } } )
									)
								);
							} )
						)
					)
				)
			)
		);
	}

	function Save( props ) {
		const attributes = props.attributes;
		const cards = normalizeCards( attributes.cards, Math.max( 1, ( attributes.cards || [] ).length ) );
		const blockProps = useBlockProps.save( {
			style: getCarouselStyle( attributes ),
			'data-visible-desktop': attributes.visibleDesktop,
			'data-visible-tablet': attributes.visibleTablet,
			'data-visible-mobile': attributes.visibleMobile
		} );
		const headerStyle = Object.assign(
			{ fontSize: attributes.headerFontSize, fontWeight: attributes.headerFontWeight, color: attributes.headerColor, lineHeight: attributes.headerLineHeight, textTransform: attributes.headerTextTransform },
			getSpacingStyle( attributes.headerPadding, 'padding' ),
			getSpacingStyle( attributes.headerMargin, 'margin' )
		);

		return el(
			'section',
			blockProps,
			getSectionBackgroundLayer( attributes ),
			el(
				'div',
				{ className: 'zen-carousel__content' },
				el(
					'div',
					{ className: 'zen-carousel__header', style: headerStyle },
					el( RichText.Content, { tagName: 'h2', className: 'zen-carousel__heading', value: attributes.headerText } ),
					el(
						'div',
						{ className: 'zen-carousel__nav' },
						el( 'button', { type: 'button', className: 'zen-carousel__arrow zen-carousel__arrow--prev', 'aria-label': __( 'Previous slide', 'zenctuary' ) }, navigationIcon( 'prev' ) ),
						el( 'button', { type: 'button', className: 'zen-carousel__arrow zen-carousel__arrow--next', 'aria-label': __( 'Next slide', 'zenctuary' ) }, navigationIcon( 'next' ) )
					)
				),
				el(
					'div',
					{ className: 'zen-carousel__viewport' },
					el(
						'div',
						{ className: 'zen-carousel__track' },
						cards.map( function ( card, index ) {
							const isVideoCard = card.mediaType === 'video' && !! card.videoUrl;
							return el(
								'div',
								{ key: index, className: 'zen-carousel__slide' },
								el(
									'article',
									{
										className: 'zen-carousel__card' + ( isVideoCard ? ' zen-carousel__card--video' : '' ),
										style: { background: card.backgroundColor, height: attributes.cardHeight + 'px' },
										'data-video-url': isVideoCard ? card.videoUrl : undefined
									},
									renderCardBody( { card: card, attributes: attributes, editable: false, updateCard: function () {} } )
								)
							);
						} )
					)
				)
			)
		);
	}

	registerBlockType( 'zenctuary/zen-carousel-block', {
		apiVersion: 3,
		title: 'Zen Carousel Block',
		category: 'design',
		icon: 'images-alt2',
		attributes: getBlockAttributes(),
		supports: {
			html: false,
			anchor: true,
			align: [ 'wide', 'full' ],
			border: {
				color: true,
				radius: true,
				style: true,
				width: true
			}
		},
		edit: Edit,
		save: Save
	} );
} )( window.wp.blocks, window.wp.blockEditor, window.wp.components, window.wp.element, window.wp.i18n );
