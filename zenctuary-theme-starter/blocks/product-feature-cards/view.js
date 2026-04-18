const SELECTOR = '.wp-block-zenctuary-product-feature-cards';

function getScrollAmount( viewport ) {
	const card = viewport.querySelector( '.pfc__card' );

	if ( ! card ) {
		return viewport.clientWidth * 0.9;
	}

	const style = window.getComputedStyle( viewport.querySelector( '.pfc__track' ) );
	const gap = parseFloat( style.columnGap || style.gap || 0 );

	return card.getBoundingClientRect().width + gap;
}

function syncToggleState( card, expanded ) {
	const button = card.querySelector( '.pfc__expect-toggle' );
	const panel = card.querySelector( '.pfc__expect-panel' );

	if ( ! button || ! panel ) {
		return;
	}

	card.classList.toggle( 'is-expanded', expanded );
	button.setAttribute( 'aria-expanded', expanded ? 'true' : 'false' );

	if ( expanded ) {
		panel.hidden = false;
	} else {
		panel.hidden = true;
	}
}

function initExpanders( block ) {
	const allowMultiple = block.querySelector( '.pfc__viewport' )?.dataset.allowMultiple === 'true';
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
						syncToggleState( sibling, false );
					}
				} );
			}

			syncToggleState( card, willExpand );
		} );
	} );
}

function initSlider( block ) {
	const viewport = block.querySelector( '.pfc__viewport' );
	const prev = block.querySelector( '.pfc__arrow--prev' );
	const next = block.querySelector( '.pfc__arrow--next' );

	if ( ! viewport ) {
		return;
	}

	const loop = viewport.dataset.loop === 'true';
	const autoplay = viewport.dataset.autoplay === 'true';
	const autoplaySpeed = parseInt( viewport.dataset.autoplaySpeed || '4500', 10 );

	const move = ( direction ) => {
		const amount = getScrollAmount( viewport ) * direction;
		const target = viewport.scrollLeft + amount;
		const maxScroll = viewport.scrollWidth - viewport.clientWidth;

		if ( loop && direction > 0 && viewport.scrollLeft >= maxScroll - 10 ) {
			viewport.scrollTo( { left: 0, behavior: 'smooth' } );
			return;
		}

		if ( loop && direction < 0 && viewport.scrollLeft <= 10 ) {
			viewport.scrollTo( { left: maxScroll, behavior: 'smooth' } );
			return;
		}

		viewport.scrollTo( {
			left: target,
			behavior: 'smooth',
		} );
	};

	prev?.addEventListener( 'click', () => move( -1 ) );
	next?.addEventListener( 'click', () => move( 1 ) );

	if ( autoplay ) {
		let interval = window.setInterval( () => move( 1 ), Math.max( 1500, autoplaySpeed ) );

		block.addEventListener( 'mouseenter', () => {
			window.clearInterval( interval );
		} );

		block.addEventListener( 'mouseleave', () => {
			interval = window.setInterval( () => move( 1 ), Math.max( 1500, autoplaySpeed ) );
		} );
	}
}

function boot() {
	document.querySelectorAll( SELECTOR ).forEach( ( block ) => {
		if ( block.dataset.pfcReady === 'true' ) {
			return;
		}

		block.dataset.pfcReady = 'true';
		initExpanders( block );
		initSlider( block );
	} );
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', boot );
} else {
	boot();
}
