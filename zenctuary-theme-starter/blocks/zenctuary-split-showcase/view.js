( () => {
	const initShowcase = ( block ) => {
		const images = Array.from( block.querySelectorAll( '.zen-split-showcase__image' ) );

		if ( images.length < 2 ) {
			if ( images[ 0 ] ) {
				images[ 0 ].classList.add( 'is-active' );
			}
			return;
		}

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
	};

	document.addEventListener( 'DOMContentLoaded', () => {
		document.querySelectorAll( '.wp-block-zenctuary-zenctuary-split-showcase' ).forEach( initShowcase );
	} );
} )();
