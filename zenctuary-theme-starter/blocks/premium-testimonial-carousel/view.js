import Swiper from 'swiper';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';

function parseNumber( value, fallback ) {
	const parsed = Number( value );
	return Number.isFinite( parsed ) ? parsed : fallback;
}

function parseBoolean( value ) {
	return value === 'true';
}

function mountPremiumTestimonialCarousel( block ) {
	if ( ! block || block.__premiumTestimonialSwiper ) {
		return;
	}

	const swiperElement = block.querySelector( '.premium-testimonial-carousel__swiper' );
	const nextButton = block.querySelector( '.premium-testimonial-carousel__arrow--next' );
	const prevButton = block.querySelector( '.premium-testimonial-carousel__arrow--prev' );
	const pagination = block.querySelector( '.premium-testimonial-carousel__pagination' );

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
		spaceBetween: parseNumber( block.dataset.gap, 36 ),
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
				spaceBetween: parseNumber( block.dataset.gap, 36 ),
			},
			1024: {
				slidesPerView: 'auto',
				slidesOffsetBefore: parseNumber( block.dataset.leftStartDesktop, 80 ),
				spaceBetween: parseNumber( block.dataset.gap, 36 ),
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
	block.__premiumTestimonialSwiper = swiper;
}

function initPremiumTestimonialCarousels() {
	document.querySelectorAll( '.wp-block-zenctuary-premium-testimonial-carousel' ).forEach( mountPremiumTestimonialCarousel );
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initPremiumTestimonialCarousels );
} else {
	initPremiumTestimonialCarousels();
}
