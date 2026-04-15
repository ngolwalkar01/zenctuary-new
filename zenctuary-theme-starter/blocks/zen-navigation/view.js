// Frontend view script for Zen-Navigation block
// Handles smooth scrolling functionality

( function() {
	'use strict';

	// Wait for DOM to be ready
	document.addEventListener( 'DOMContentLoaded', function() {
		const navItems = document.querySelectorAll( '.zen-navigation__item' );

		navItems.forEach( function( item ) {
			item.addEventListener( 'click', function( e ) {
				e.preventDefault();

				const href = this.getAttribute( 'href' );
				if ( ! href || href === '#' ) {
					return;
				}

				// Extract the anchor ID
				const targetId = href.replace( '#', '' );
				const targetElement = document.getElementById( targetId );

				if ( targetElement ) {
					// Smooth scroll to target
					targetElement.scrollIntoView( {
						behavior: 'smooth',
						block: 'start',
					} );

					// Update URL without page reload
					if ( history.pushState ) {
						history.pushState( null, null, href );
					}
				}
			} );
		} );
	} );
} )();
