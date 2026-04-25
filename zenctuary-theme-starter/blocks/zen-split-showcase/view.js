( () => {
	const initShowcase = ( block ) => {
		const images = Array.from( block.querySelectorAll( '.zen-split-showcase__image' ) );

		if ( images.length < 2 ) {
			if ( images[ 0 ] ) {
				images[ 0 ].classList.add( 'is-active' );
			}
		} else {
			let activeIndex = images.findIndex( ( image ) => image.classList.contains( 'is-active' ) );
			activeIndex = activeIndex >= 0 ? activeIndex : 0;
			const speed = Math.max( Number.parseFloat( block.dataset.speed || '4' ), 1 ) * 1000;

			const activate = ( nextIndex ) => {
				images.forEach( ( image, index ) => {
					image.classList.toggle( 'is-active', index === nextIndex );
				} );
			};

			activate( activeIndex );

			window.setInterval( () => {
				activeIndex = ( activeIndex + 1 ) % images.length;
				activate( activeIndex );
			}, speed );
		}

		const lightbox = block.querySelector( '.zen-split-showcase__lightbox' );

		if ( ! lightbox ) {
			return;
		}

		const lightboxImage = lightbox.querySelector( '.zen-split-showcase__lightbox-image' );
		const closeButton = lightbox.querySelector( '.zen-split-showcase__lightbox-close' );
		const backdrop = lightbox.querySelector( '.zen-split-showcase__lightbox-backdrop' );
		const popupButtons = block.querySelectorAll( '[data-button-action="popup-image"]' );

		const closeLightbox = () => {
			lightbox.hidden = true;
			lightbox.classList.remove( 'is-open' );
			document.body.classList.remove( 'zen-split-showcase-lightbox-open' );
			if ( lightboxImage ) {
				lightboxImage.removeAttribute( 'src' );
			}
		};

		const openLightbox = ( imageUrl ) => {
			if ( ! lightboxImage || ! imageUrl ) {
				return;
			}

			lightboxImage.src = imageUrl;
			lightbox.hidden = false;
			lightbox.classList.add( 'is-open' );
			document.body.classList.add( 'zen-split-showcase-lightbox-open' );
		};

		popupButtons.forEach( ( button ) => {
			button.addEventListener( 'click', ( event ) => {
				event.preventDefault();
				openLightbox( button.dataset.popupImage || '' );
			} );
		} );

		closeButton?.addEventListener( 'click', closeLightbox );
		backdrop?.addEventListener( 'click', closeLightbox );

		document.addEventListener( 'keydown', ( event ) => {
			if ( event.key === 'Escape' && lightbox.classList.contains( 'is-open' ) ) {
				closeLightbox();
			}
		} );
	};

	document.addEventListener( 'DOMContentLoaded', () => {
		document.querySelectorAll( '.wp-block-zenctuary-zen-split-showcase, .wp-block-zenctuary-zenctuary-split-showcase' ).forEach( initShowcase );
	} );
} )();
