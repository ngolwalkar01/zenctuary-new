( function () {
	function setTransform( block, track, index ) {
		if ( window.innerWidth > 781 ) {
			track.style.transform = '';
			return;
		}

		track.style.transform = 'translate3d(-' + ( index * 100 ) + '%, 0, 0)';
		block.setAttribute( 'data-current-index', String( index ) );
	}

	function mountBestSellers( block ) {
		const track = block.querySelector( '.zen-best-sellers__track' );
		const slides = Array.from( block.querySelectorAll( '.zen-best-sellers__slide' ) );
		const prevButton = block.querySelector( '.zen-best-sellers__nav-button--prev' );
		const nextButton = block.querySelector( '.zen-best-sellers__nav-button--next' );
		let currentIndex = 0;

		if ( ! track || slides.length <= 1 ) {
			if ( prevButton ) {
				prevButton.hidden = true;
			}

			if ( nextButton ) {
				nextButton.hidden = true;
			}

			return;
		}

		function syncButtons() {
			if ( ! prevButton || ! nextButton ) {
				return;
			}

			prevButton.disabled = currentIndex <= 0;
			nextButton.disabled = currentIndex >= slides.length - 1;
		}

		function goTo( index ) {
			currentIndex = Math.max( 0, Math.min( slides.length - 1, index ) );
			setTransform( block, track, currentIndex );
			syncButtons();
		}

		if ( prevButton ) {
			prevButton.addEventListener( 'click', function () {
				goTo( currentIndex - 1 );
			} );
		}

		if ( nextButton ) {
			nextButton.addEventListener( 'click', function () {
				goTo( currentIndex + 1 );
			} );
		}

		window.addEventListener( 'resize', function () {
			setTransform( block, track, currentIndex );
		} );

		goTo( 0 );
	}

	document.querySelectorAll( '.wp-block-zenctuary-zen-our-best-sellers' ).forEach( mountBestSellers );
}() );
