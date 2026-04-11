( () => {
	const initMenu = ( block ) => {
		const buttons = Array.from( block.querySelectorAll( '.zen-soul-menu__filter-button' ) );
		const panels = Array.from( block.querySelectorAll( '.zen-soul-menu__filter-panel' ) );

		const activate = ( filter ) => {
			buttons.forEach( ( button ) => {
				const isActive = button.dataset.filter === filter;
				button.classList.toggle( 'is-active', isActive );
				button.setAttribute( 'aria-pressed', String( isActive ) );
			} );

			panels.forEach( ( panel ) => {
				panel.hidden = panel.dataset.filter !== filter;
			} );
		};

		buttons.forEach( ( button ) => {
			button.addEventListener( 'click', () => activate( button.dataset.filter ) );
		} );

		const activeButton = buttons.find( ( button ) => button.classList.contains( 'is-active' ) ) || buttons[ 0 ];
		if ( activeButton ) {
			activate( activeButton.dataset.filter );
		}
	};

	document.addEventListener( 'DOMContentLoaded', () => {
		document.querySelectorAll( '.wp-block-zenctuary-zen-soul-kitchen-menu' ).forEach( initMenu );
	} );
} )();
