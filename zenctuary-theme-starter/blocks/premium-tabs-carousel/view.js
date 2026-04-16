import Swiper from 'swiper';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';

function parseNumber( value, fallback ) {
	const parsed = Number( value );
	return Number.isFinite( parsed ) ? parsed : fallback;
}

function parseBoolean( value ) {
	return value === 'true';
}

function getVisibleSlides( block, activeTabId, tabsEnabled ) {
	return Array.from( block.querySelectorAll( '.premium-tabs-carousel__slide' ) ).filter( ( slide ) => {
		const matches = ! tabsEnabled || ! activeTabId || slide.dataset.tabId === activeTabId;
		slide.hidden = ! matches;
		slide.classList.toggle( 'is-hidden', ! matches );
		return matches;
	} );
}

function createSwiper( block ) {
	const swiperElement = block.querySelector( '.premium-tabs-carousel__swiper' );
	const nextButton = block.querySelector( '.premium-tabs-carousel__arrow--next' );
	const prevButton = block.querySelector( '.premium-tabs-carousel__arrow--prev' );
	const pagination = block.querySelector( '.premium-tabs-carousel__pagination' );
	const showPagination = parseBoolean( block.dataset.showPagination );
	const modules = [ Navigation ];
	const options = {
		modules,
		slidesPerView: 3,
		slidesPerGroup: 1,
		spaceBetween: parseNumber( block.dataset.gap, 24 ),
		speed: parseNumber( block.dataset.speed, 450 ),
		loop: parseBoolean( block.dataset.loop ),
		watchOverflow: true,
		grabCursor: true,
		navigation: nextButton && prevButton ? {
			nextEl: nextButton,
			prevEl: prevButton,
		} : undefined,
		breakpoints: {
			0: { slidesPerView: 1, spaceBetween: parseNumber( block.dataset.gap, 24 ) },
			640: { slidesPerView: 2, spaceBetween: parseNumber( block.dataset.gap, 24 ) },
			1024: { slidesPerView: 3, spaceBetween: parseNumber( block.dataset.gap, 24 ) },
		},
	};

	if ( showPagination && pagination ) {
		modules.push( Pagination );
		options.pagination = {
			el: pagination,
			clickable: true,
		};
	}

	if ( parseBoolean( block.dataset.autoplay ) ) {
		modules.push( Autoplay );
		options.autoplay = {
			delay: parseNumber( block.dataset.autoplayDelay, 4000 ),
			disableOnInteraction: false,
			pauseOnMouseEnter: true,
		};
	}

	return new Swiper( swiperElement, options );
}

function mountPremiumTabsCarousel( block ) {
	if ( ! block ) {
		return;
	}

	const swiperElement = block.querySelector( '.premium-tabs-carousel__swiper' );
	if ( ! swiperElement ) {
		return;
	}

	const tabsEnabled = parseBoolean( block.dataset.tabsEnabled );
	const tabButtons = Array.from( block.querySelectorAll( '.premium-tabs-carousel__tab' ) );
	let activeTabId = block.dataset.activeTab || tabButtons[ 0 ]?.dataset.tabId || '';

	function syncTabs() {
		tabButtons.forEach( ( button ) => {
			const isActive = button.dataset.tabId === activeTabId;
			button.classList.toggle( 'is-active', isActive );
			button.setAttribute( 'aria-pressed', isActive ? 'true' : 'false' );
		} );
	}

	function rebuild() {
		if ( block.__premiumTabsSwiper ) {
			block.__premiumTabsSwiper.destroy( true, true );
			block.__premiumTabsSwiper = null;
		}

		getVisibleSlides( block, activeTabId, tabsEnabled );
		syncTabs();
		block.__premiumTabsSwiper = createSwiper( block );
	}

	if ( block.__premiumTabsHandlersBound ) {
		rebuild();
		return;
	}

	tabButtons.forEach( ( button ) => {
		button.addEventListener( 'click', () => {
			activeTabId = button.dataset.tabId || '';
			block.dataset.activeTab = activeTabId;
			rebuild();
		} );
	} );

	block.__premiumTabsHandlersBound = true;
	rebuild();
}

function initPremiumTabsCarousels() {
	document.querySelectorAll( '.wp-block-zenctuary-premium-tabs-carousel' ).forEach( mountPremiumTabsCarousel );
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initPremiumTabsCarousels );
} else {
	initPremiumTabsCarousels();
}
