import Swiper from 'swiper';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';

function parseNumber( value, fallback ) {
	const parsed = Number( value );
	return Number.isFinite( parsed ) ? parsed : fallback;
}

function parseBoolean( value ) {
	return value === 'true';
}

function syncVideoCardState( card, video, playButton, muteButton ) {
	if ( playButton ) {
		const isPaused = video.paused;
		playButton.classList.toggle( 'is-paused', isPaused );
		playButton.classList.toggle( 'is-playing', ! isPaused );
		playButton.setAttribute( 'aria-label', isPaused ? 'Play testimonial video' : 'Pause testimonial video' );
	}

	if ( muteButton ) {
		muteButton.classList.toggle( 'is-muted', video.muted );
		muteButton.classList.toggle( 'is-unmuted', ! video.muted );
		muteButton.setAttribute( 'aria-label', video.muted ? 'Unmute testimonial video' : 'Mute testimonial video' );
	}

	card.classList.toggle( 'is-video-playing', ! video.paused );
	card.classList.toggle( 'is-video-muted', video.muted );
}

function bindInlineVideoControls( block ) {
	block.querySelectorAll( '.premium-testimonial-carousel__card--video' ).forEach( ( card ) => {
		const video = card.querySelector( '.premium-testimonial-carousel__video' );
		const playButton = card.querySelector( '[data-action="play-pause"]' );
		const muteButton = card.querySelector( '[data-action="mute-toggle"]' );

		if ( ! video ) {
			return;
		}

		video.controls = false;
		video.muted = true;
		video.loop = false;
		video.playsInline = true;

		syncVideoCardState( card, video, playButton, muteButton );

		playButton?.addEventListener( 'click', () => {
			if ( video.paused ) {
				video.play().catch( () => {} );
			} else {
				video.pause();
			}
		} );

		muteButton?.addEventListener( 'click', () => {
			video.muted = ! video.muted;
			syncVideoCardState( card, video, playButton, muteButton );
		} );

		video.addEventListener( 'play', () => syncVideoCardState( card, video, playButton, muteButton ) );
		video.addEventListener( 'pause', () => syncVideoCardState( card, video, playButton, muteButton ) );
		video.addEventListener( 'ended', () => syncVideoCardState( card, video, playButton, muteButton ) );
		video.addEventListener( 'volumechange', () => syncVideoCardState( card, video, playButton, muteButton ) );
	} );
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
	bindInlineVideoControls( block );
}

function initPremiumTestimonialCarousels() {
	document.querySelectorAll( '.wp-block-zenctuary-premium-testimonial-carousel' ).forEach( mountPremiumTestimonialCarousel );
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initPremiumTestimonialCarousels );
} else {
	initPremiumTestimonialCarousels();
}
