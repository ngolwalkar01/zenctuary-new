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

			// Apply hover styles dynamically
			item.addEventListener( 'mouseenter', function() {
				const hoverBg = this.getAttribute( 'data-hover-bg' );
				const hoverColor = this.getAttribute( 'data-hover-color' );
				const hoverRadius = this.getAttribute( 'data-hover-radius' );
				const hoverPadding = this.getAttribute( 'data-hover-padding' );

				if ( hoverBg ) {
					this.style.backgroundColor = hoverBg;
				}
				if ( hoverColor ) {
					this.style.color = hoverColor;
				}
				if ( hoverRadius ) {
					this.style.borderRadius = hoverRadius;
				}
				if ( hoverPadding ) {
					const parts = hoverPadding.split( ' ' );
					if ( parts.length === 4 ) {
						this.style.paddingTop = parts[0];
						this.style.paddingRight = parts[1];
						this.style.paddingBottom = parts[2];
						this.style.paddingLeft = parts[3];
					}
				}
			} );

			// Remove hover styles on mouse leave
			item.addEventListener( 'mouseleave', function() {
				this.style.backgroundColor = 'transparent';
				// Keep the original text color from inline style
				const hoverRadius = this.getAttribute( 'data-hover-radius' );
				const hoverPadding = this.getAttribute( 'data-hover-padding' );

				if ( hoverRadius ) {
					this.style.borderRadius = '0px';
				}
				if ( hoverPadding ) {
					this.style.paddingTop = '0px';
					this.style.paddingRight = '0px';
					this.style.paddingBottom = '0px';
					this.style.paddingLeft = '0px';
				}
			} );
		} );
	} );
} )();
