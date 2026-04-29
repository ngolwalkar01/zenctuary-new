jQuery(function ($) {
  const frameTitle = 'Select account navigation icon';
  const frameButton = 'Use this icon';

  $('.zen-account-admin__media-row').each(function () {
    const row = $(this);
    const input = $('#' + row.data('target'));
    const preview = row.find('.zen-account-admin__preview');
    let mediaFrame = null;

    const renderPreview = (url) => {
      if (url) {
        preview.removeClass('is-empty').html(`<img src="${url}" alt="">`);
      } else {
        preview.addClass('is-empty').html('<span>No icon selected</span>');
      }
    };

    row.find('.zen-account-admin__select').on('click', function (event) {
      event.preventDefault();

      if (mediaFrame) {
        mediaFrame.open();
        return;
      }

      mediaFrame = wp.media({
        title: frameTitle,
        button: { text: frameButton },
        multiple: false,
        library: { type: 'image' }
      });

      mediaFrame.on('select', function () {
        const attachment = mediaFrame.state().get('selection').first().toJSON();
        input.val(attachment.id);
        renderPreview(attachment.sizes?.thumbnail?.url || attachment.url);
      });

      mediaFrame.open();
    });

    row.find('.zen-account-admin__remove').on('click', function (event) {
      event.preventDefault();
      input.val('');
      renderPreview('');
    });
  });
});
