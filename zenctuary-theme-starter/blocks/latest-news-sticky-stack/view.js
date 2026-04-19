const SELECTOR = '.wp-block-zenctuary-latest-news-sticky-stack';
const CARD_SELECTOR = '.latest-news-sticky-stack__card';
const CTA_SELECTOR = '.latest-news-sticky-stack__cta, .latest-news-sticky-stack__header-button';
const CLOSE_SELECTOR = '.latest-news-sticky-stack__mobile-close';

function closeSiblingCards(section, currentCard) {
	section.querySelectorAll(`${ CARD_SELECTOR }.is-expanded`).forEach((card) => {
		if (card !== currentCard) {
			card.classList.remove('is-expanded');
		}
	});
}

function initStickyStack(section) {
	const interaction = section.dataset.mobileInteraction || 'tap-expand';
	const cards = section.querySelectorAll(CARD_SELECTOR);

	if (!cards.length) {
		return;
	}

	if (interaction === 'always-expanded') {
		cards.forEach((card) => card.classList.add('is-expanded'));
		return;
	}

	if (interaction !== 'tap-expand' || !window.matchMedia('(hover: none), (pointer: coarse)').matches) {
		return;
	}

	cards.forEach((card) => {
		card.addEventListener('click', (event) => {
			if (event.target.closest(CLOSE_SELECTOR)) {
				event.preventDefault();
				event.stopPropagation();
				card.classList.remove('is-expanded');
				return;
			}

			if (event.target.closest(CTA_SELECTOR)) {
				return;
			}

			if (!card.classList.contains('is-expanded')) {
				event.preventDefault();
				closeSiblingCards(section, card);
				card.classList.add('is-expanded');
				return;
			}

			event.preventDefault();
		});
	});

	document.addEventListener('click', (event) => {
		if (section.contains(event.target)) {
			return;
		}

		section.querySelectorAll(`${ CARD_SELECTOR }.is-expanded`).forEach((card) => {
			card.classList.remove('is-expanded');
		});
	});
}

function bootStickyStacks() {
	document.querySelectorAll(SELECTOR).forEach((section) => {
		if (section.dataset.lnssReady === 'true') {
			return;
		}

		section.dataset.lnssReady = 'true';
		initStickyStack(section);
	});
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', bootStickyStacks);
} else {
	bootStickyStacks();
}
