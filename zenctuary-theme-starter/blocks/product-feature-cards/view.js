const SELECTOR = '.wp-block-zenctuary-product-feature-cards';

function syncCardState( card, expanded ) {
	const toggle = card.querySelector( '.pfc__expect-toggle' );
	const panel = card.querySelector( '.pfc__expect-panel' );

	if ( ! toggle || ! panel ) {
		return;
	}

	card.classList.toggle( 'is-expanded', expanded );
	toggle.setAttribute( 'aria-expanded', expanded ? 'true' : 'false' );
	panel.hidden = ! expanded;
}

function initBlock( block ) {
	const allowMultiple = block.dataset.allowMultiple === 'true';
	const cards = [ ...block.querySelectorAll( '.pfc__card' ) ];

	cards.forEach( ( card ) => {
		const toggle = card.querySelector( '.pfc__expect-toggle' );
		if ( ! toggle ) {
			return;
		}

		toggle.addEventListener( 'click', () => {
			const willExpand = ! card.classList.contains( 'is-expanded' );

			if ( willExpand && ! allowMultiple ) {
				cards.forEach( ( sibling ) => {
					if ( sibling !== card ) {
						syncCardState( sibling, false );
					}
				} );
			}

			syncCardState( card, willExpand );
		} );
	} );
}

function boot() {
	document.querySelectorAll( SELECTOR ).forEach( ( block ) => {
		if ( block.dataset.pfcReady === 'true' ) {
			return;
		}

		block.dataset.pfcReady = 'true';
		initBlock( block );
	} );
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', boot );
} else {
	boot();
}
