function initContactMapGalleries() {
	document
		.querySelectorAll( '.wp-block-zenctuary-contact-map .zen-contact-gallery' )
		.forEach( ( gallery ) => {
			if ( gallery.dataset.zenGalleryReady === 'true' ) {
				return;
			}

			const items = Array.from(
				gallery.querySelectorAll( '.zen-contact-gallery__item' )
			);

			if ( items.length <= 1 ) {
				if ( items[ 0 ] ) {
					items[ 0 ].classList.add( 'is-active' );
				}
				gallery.dataset.zenGalleryReady = 'true';
				return;
			}

			let activeIndex = 0;
			const interval = Number.parseInt(
				gallery.dataset.galleryInterval || '4000',
				10
			);

			items.forEach( ( item, index ) => {
				item.classList.toggle( 'is-active', index === 0 );
			} );

			window.setInterval( () => {
				items[ activeIndex ].classList.remove( 'is-active' );
				activeIndex = ( activeIndex + 1 ) % items.length;
				items[ activeIndex ].classList.add( 'is-active' );
			}, Number.isNaN( interval ) ? 4000 : interval );

			gallery.dataset.zenGalleryReady = 'true';
		} );
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initContactMapGalleries );
} else {
	initContactMapGalleries();
}
