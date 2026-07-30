(function () {
	var blockCounter = 0;

	function assignIds(block) {
		var blockId = 'zen-static-faqs-' + (++blockCounter);

		block.querySelectorAll('[data-faq-tab]').forEach(function (button) {
			var tabId = button.getAttribute('data-faq-tab');
			var buttonId = blockId + '-tab-' + tabId;
			var panelId = blockId + '-panel-' + tabId;
			button.id = buttonId;
			button.setAttribute('aria-controls', panelId);

			var panel = block.querySelector('[data-faq-panel="' + tabId + '"]');
			if (panel) {
				panel.id = panelId;
				panel.setAttribute('aria-labelledby', buttonId);
			}
		});

		block.querySelectorAll('[data-faq-panel]').forEach(function (panel, panelIndex) {
			var panelId = panel.id || (blockId + '-panel-' + panelIndex);
			panel.id = panelId;
			panel.querySelectorAll('[data-faq-item]').forEach(function (item, itemIndex) {
				var button = item.querySelector('[data-faq-toggle]');
				var content = item.querySelector('[data-faq-content]');
				if (!button || !content) {
					return;
				}
				var buttonId = panelId + '-faq-' + itemIndex + '-button';
				var contentId = panelId + '-faq-' + itemIndex + '-content';
				button.id = buttonId;
				button.setAttribute('aria-controls', contentId);
				content.id = contentId;
				content.setAttribute('aria-labelledby', buttonId);
			});
		});
	}

	function setTab(block, tabId) {
		block.querySelectorAll('[data-faq-tab]').forEach(function (button) {
			var active = button.getAttribute('data-faq-tab') === tabId;
			button.classList.toggle('is-active', active);
			button.setAttribute('aria-selected', active ? 'true' : 'false');
		});

		block.querySelectorAll('[data-faq-panel]').forEach(function (panel) {
			var active = panel.getAttribute('data-faq-panel') === tabId;
			panel.classList.toggle('is-active', active);
			panel.hidden = !active;
		});
	}

	function setFaqOpen(item, open) {
		var button = item.querySelector('[data-faq-toggle]');
		var content = item.querySelector('[data-faq-content]');

		item.classList.toggle('is-open', open);
		if (button) {
			button.setAttribute('aria-expanded', open ? 'true' : 'false');
		}
		if (content) {
			content.hidden = !open;
		}
	}

	function initBlock(block) {
		if (block.dataset.staticFaqsReady === 'true') {
			return;
		}
		block.dataset.staticFaqsReady = 'true';
		assignIds(block);

		block.querySelectorAll('[data-faq-tab]').forEach(function (button) {
			button.addEventListener('click', function () {
				setTab(block, button.getAttribute('data-faq-tab'));
			});
		});

		block.querySelectorAll('[data-faq-toggle]').forEach(function (button) {
			button.addEventListener('click', function () {
				var item = button.closest('[data-faq-item]');
				if (!item) {
					return;
				}
				setFaqOpen(item, !item.classList.contains('is-open'));
			});
		});
	}

	function init() {
		document.querySelectorAll('[data-static-faqs]').forEach(initBlock);
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();