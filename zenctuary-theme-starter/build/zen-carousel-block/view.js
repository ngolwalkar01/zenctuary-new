(function () {
	let sharedVideoModalController = null;

	function createVideoModalController() {
		const overlay = document.createElement('div');
		const dialog = document.createElement('div');
		const closeButton = document.createElement('button');
		const video = document.createElement('video');
		let lastFocused = null;

		overlay.className = 'zen-carousel__video-modal';
		overlay.hidden = true;

		dialog.className = 'zen-carousel__video-modal-dialog';
		dialog.setAttribute('role', 'dialog');
		dialog.setAttribute('aria-modal', 'true');
		dialog.setAttribute('aria-label', 'Video player');
		dialog.tabIndex = -1;

		closeButton.type = 'button';
		closeButton.className = 'zen-carousel__video-modal-close';
		closeButton.setAttribute('aria-label', 'Close video popup');
		closeButton.textContent = '\u00d7';

		video.className = 'zen-carousel__video-modal-video';
		video.controls = true;
		video.playsInline = true;
		video.preload = 'metadata';

		dialog.appendChild(closeButton);
		dialog.appendChild(video);
		overlay.appendChild(dialog);
		document.body.appendChild(overlay);

		function getFocusableElements() {
			return Array.from(
				dialog.querySelectorAll(
					'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
				)
			).filter(function (item) {
				return !item.hasAttribute('disabled') && item.getAttribute('aria-hidden') !== 'true';
			});
		}

		function isOpen() {
			return !overlay.hidden;
		}

		function close() {
			if (!isOpen()) {
				return;
			}

			video.pause();
			video.removeAttribute('src');
			video.load();
			overlay.hidden = true;
			document.body.classList.remove('zen-carousel-modal-open');

			if (lastFocused && typeof lastFocused.focus === 'function') {
				lastFocused.focus();
			}
		}

		function open(videoUrl, focusSource) {
			if (!videoUrl) {
				return;
			}

			lastFocused = focusSource || document.activeElement;
			video.src = videoUrl;
			video.currentTime = 0;
			video.muted = false;
			video.volume = 1;
			overlay.hidden = false;
			document.body.classList.add('zen-carousel-modal-open');
			closeButton.focus();

			const playPromise = video.play();
			if (playPromise && typeof playPromise.catch === 'function') {
				playPromise.catch(function () { });
			}
		}

		overlay.addEventListener('click', function (event) {
			if (event.target === overlay) {
				close();
			}
		});

		closeButton.addEventListener('click', function () {
			close();
		});

		document.addEventListener('keydown', function (event) {
			if (!isOpen()) {
				return;
			}

			if (event.key === 'Escape') {
				event.preventDefault();
				close();
				return;
			}

			if (event.key !== 'Tab') {
				return;
			}

			const focusable = getFocusableElements();
			if (!focusable.length) {
				event.preventDefault();
				dialog.focus();
				return;
			}

			const first = focusable[0];
			const last = focusable[focusable.length - 1];
			const active = document.activeElement;

			if (event.shiftKey && active === first) {
				event.preventDefault();
				last.focus();
				return;
			}

			if (!event.shiftKey && active === last) {
				event.preventDefault();
				first.focus();
			}
		});

		return { open: open, close: close, isOpen: isOpen };
	}

	function getVideoModalController() {
		if (!sharedVideoModalController) {
			sharedVideoModalController = createVideoModalController();
		}

		return sharedVideoModalController;
	}

	function getSnapOffsets(viewport, slides) {
		if (!viewport || !slides.length) {
			return [0];
		}

		const maxOffset = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
		const offsets = slides
			.map(function (slide) {
				return Math.min(slide.offsetLeft, maxOffset);
			})
			.filter(function (offset, index, values) {
				return index === 0 || Math.abs(offset - values[index - 1]) > 1;
			});

		if (!offsets.length) {
			offsets.push(0);
		}

		if (Math.abs(offsets[offsets.length - 1] - maxOffset) > 1) {
			offsets.push(maxOffset);
		}

		return offsets;
	}

	function mountCarousel(block) {
		const track = block.querySelector('.zen-carousel__track');
		const slides = Array.from(block.querySelectorAll('.zen-carousel__slide'));
		const prevButton = block.querySelector('.zen-carousel__arrow--prev');
		const nextButton = block.querySelector('.zen-carousel__arrow--next');
		const viewport = block.querySelector('.zen-carousel__viewport');
		const videoCards = Array.from(block.querySelectorAll('.zen-carousel__card[data-video-url]'));
		const videoModal = videoCards.length ? getVideoModalController() : null;
		let currentIndex = 0;
		let snapOffsets = [];
		let startX = 0;
		let isDragging = false;
		let lastSwipeAt = 0;

		videoCards.forEach(function (card) {
			card.setAttribute('role', 'button');
			card.setAttribute('tabindex', '0');
			card.setAttribute('aria-label', 'Open video popup');

			function openVideo(event) {
				if (!videoModal) {
					return;
				}

				if (Date.now() - lastSwipeAt < 220) {
					return;
				}

				event.preventDefault();
				videoModal.open(card.getAttribute('data-video-url'), card);
			}

			card.addEventListener('click', openVideo);
			card.addEventListener('keydown', function (event) {
				if (event.key === 'Enter' || event.key === ' ') {
					openVideo(event);
				}
			});
		});

		if (!track || slides.length < 2) {
			if (prevButton) {
				prevButton.disabled = true;
			}

			if (nextButton) {
				nextButton.disabled = true;
			}

			return;
		}

		function updateButtons() {
			const maxIndex = Math.max(0, snapOffsets.length - 1);

			if (prevButton) {
				prevButton.disabled = currentIndex <= 0;
				prevButton.classList.toggle('is-active', currentIndex > 0);
			}

			if (nextButton) {
				nextButton.disabled = currentIndex >= maxIndex;
				nextButton.classList.toggle('is-active', currentIndex < maxIndex);
			}
		}

		function render() {
			const offset = snapOffsets[currentIndex] + 100 || 0;

			track.style.transform = 'translate3d(-' + offset + 'px, 0, 0)';
			updateButtons();
		}

		function refreshSnapOffsets() {
			snapOffsets = getSnapOffsets(viewport, slides);
			currentIndex = Math.max(0, Math.min(currentIndex, snapOffsets.length - 1));
		}

		function goTo(nextIndex) {
			const maxIndex = Math.max(0, snapOffsets.length - 1);
			currentIndex = Math.max(0, Math.min(nextIndex, maxIndex));
			render();
		}

		if (prevButton) {
			prevButton.addEventListener('click', function () {
				goTo(currentIndex - 1);
			});
		}

		if (nextButton) {
			nextButton.addEventListener('click', function () {
				goTo(currentIndex + 1);
			});
		}

		if (viewport) {
			viewport.addEventListener('pointerdown', function (event) {
				isDragging = true;
				startX = event.clientX;
			});

			viewport.addEventListener('pointerup', function (event) {
				if (!isDragging) {
					return;
				}

				const delta = event.clientX - startX;
				isDragging = false;

				if (Math.abs(delta) < 40) {
					return;
				}

				if (delta < 0) {
					lastSwipeAt = Date.now();
					goTo(currentIndex + 1);
					return;
				}

				lastSwipeAt = Date.now();
				goTo(currentIndex - 1);
			});

			viewport.addEventListener('pointerleave', function () {
				isDragging = false;
			});
		}

		window.addEventListener('resize', function () {
			refreshSnapOffsets();
			render();
		});
		refreshSnapOffsets();
		render();
	}

	document.addEventListener('DOMContentLoaded', function () {
		document.querySelectorAll('.wp-block-zenctuary-zen-carousel-block').forEach(mountCarousel);
	});
})();
