( function() {
	function initStaticExperienceSpace( root ) {
		if ( root.dataset.staticExperienceSpaceReady === 'true' ) {
			return;
		}
		root.dataset.staticExperienceSpaceReady = 'true';

		root.querySelectorAll( '.zen-accordion-header' ).forEach( function( button ) {
			button.addEventListener( 'click', function() {
				var item = button.closest( '.zen-accordion-item' );
				if ( ! item ) return;
				var panel = item.querySelector( '.zen-accordion-panel' );
				var isOpen = item.classList.contains( 'zen-accordion-item--open' );
				item.classList.toggle( 'zen-accordion-item--open', ! isOpen );
				button.setAttribute( 'aria-expanded', isOpen ? 'false' : 'true' );
				if ( panel ) {
					if ( isOpen ) panel.setAttribute( 'hidden', '' );
					else panel.removeAttribute( 'hidden' );
				}
			} );
		} );

		root.querySelectorAll( '.pfc__expect-toggle' ).forEach( function( button ) {
			button.addEventListener( 'click', function() {
				var card = button.closest( '.pfc__card' );
				if ( ! card ) return;
				var isOpen = card.classList.contains( 'is-expanded' );
				card.classList.toggle( 'is-expanded', ! isOpen );
				button.setAttribute( 'aria-expanded', isOpen ? 'false' : 'true' );
			} );
		} );
	}
	document.querySelectorAll( '.wp-block-zenctuary-static-experience-space' ).forEach( initStaticExperienceSpace );
} )();
