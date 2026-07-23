const SELECTOR = '.wp-block-zenctuary-latest-news-sticky-stack';
const CARD_SELECTOR = '.latest-news-sticky-stack__card';
const OPEN_SELECTOR = '.latest-news-sticky-stack__mobile-open';
const CLOSE_SELECTOR = '.latest-news-sticky-stack__mobile-close';
const HOVER_STATE_SELECTOR = '.latest-news-sticky-stack__hover-state';
const INTERACTIVE_SELECTOR = 'a, button, input, textarea, select, [role="button"]';
const MOBILE_QUERY = '(hover: none), (pointer: coarse)';

function setCardExpanded(card, expanded) {
	const openButton = card.querySelector(OPEN_SELECTOR);
	const hoverState = card.querySelector(HOVER_STATE_SELECTOR);

	card.classList.toggle('is-expanded', expanded);

	if (openButton) {
		openButton.setAttribute('aria-expanded', expanded ? 'true' : 'false');
	}

	if (hoverState) {
		hoverState.setAttribute('aria-hidden', expanded ? 'false' : 'true');
	}
}

function closeSiblingCards(section, currentCard) {
	section.querySelectorAll(`${ CARD_SELECTOR }.is-expanded`).forEach((card) => {
		if (card !== currentCard) {
			setCardExpanded(card, false);
		}
	});
}

function openCard(section, card) {
	closeSiblingCards(section, card);
	setCardExpanded(card, true);
}

function initStickyStack(section) {
	const interaction = section.dataset.mobileInteraction || 'tap-expand';
	const cards = section.querySelectorAll(CARD_SELECTOR);

	if (!cards.length) {
		return;
	}

	if (interaction === 'always-expanded') {
		cards.forEach((card) => setCardExpanded(card, true));
		return;
	}

	if (interaction !== 'tap-expand' || !window.matchMedia(MOBILE_QUERY).matches) {
		return;
	}

	cards.forEach((card) => setCardExpanded(card, false));

	cards.forEach((card) => {
		const openButton = card.querySelector(OPEN_SELECTOR);
		const closeButton = card.querySelector(CLOSE_SELECTOR);

		if (openButton) {
			openButton.addEventListener('click', (event) => {
				event.preventDefault();
				event.stopPropagation();
				openCard(section, card);
			});
		}


		card.addEventListener('click', (event) => {
			if (card.classList.contains('is-expanded') || event.target.closest(INTERACTIVE_SELECTOR)) {
				return;
			}

			event.preventDefault();
			openCard(section, card);
		});

		if (closeButton) {
			closeButton.addEventListener('click', (event) => {
				event.preventDefault();
				event.stopPropagation();
				setCardExpanded(card, false);
			});
		}
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
