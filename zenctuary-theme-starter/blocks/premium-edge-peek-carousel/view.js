import Swiper from 'swiper';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';

function parseNumber( value, fallback ) {
	const parsed = Number( value );
	return Number.isFinite( parsed ) ? parsed : fallback;
}

function parseBoolean( value ) {
	return value === 'true';
}

function mountPremiumEdgePeekCarousel( block ) {
	if ( ! block || block.__premiumEdgePeekSwiper ) {
		return;
	}

	const swiperElement = block.querySelector( '.premium-edge-peek-carousel__swiper' );
	const nextButton = block.querySelector( '.premium-edge-peek-carousel__arrow--next' );
	const prevButton = block.querySelector( '.premium-edge-peek-carousel__arrow--prev' );
	const pagination = block.querySelector( '.premium-edge-peek-carousel__pagination' );

	if ( ! swiperElement ) {
		return;
	}

	const showPagination = parseBoolean( block.dataset.showPagination );
	const modules = [ Navigation ];
	const swiperOptions = {
		modules,
		slidesPerView: 'auto',
		slidesPerGroup: 1,
		slidesOffsetBefore: parseNumber( block.dataset.leftStartMobile, 20 ),
		slidesOffsetAfter: 0,
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
			782: {
				slidesPerView: 'auto',
				slidesOffsetBefore: parseNumber( block.dataset.leftStartTablet, 48 ),
				spaceBetween: parseNumber( block.dataset.gap, 24 ),
			},
			1024: {
				slidesPerView: 'auto',
				slidesOffsetBefore: parseNumber( block.dataset.leftStartDesktop, 80 ),
				spaceBetween: parseNumber( block.dataset.gap, 24 ),
			},
		},
	};

	if ( showPagination && pagination ) {
		modules.push( Pagination );
		swiperOptions.pagination = {
			el: pagination,
			clickable: true,
		};
	}

	if ( parseBoolean( block.dataset.autoplay ) ) {
		modules.push( Autoplay );
		swiperOptions.autoplay = {
			delay: parseNumber( block.dataset.autoplayDelay, 4000 ),
			disableOnInteraction: false,
			pauseOnMouseEnter: true,
		};
	}

	const swiper = new Swiper( swiperElement, swiperOptions );

	block.__premiumEdgePeekSwiper = swiper;
}

function initPremiumEdgePeekCarousels() {
	document.querySelectorAll( '.wp-block-zenctuary-premium-edge-peek-carousel' ).forEach( mountPremiumEdgePeekCarousel );
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initPremiumEdgePeekCarousels );
} else {
	initPremiumEdgePeekCarousels();
}
