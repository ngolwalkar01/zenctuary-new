import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    RichText,
    MediaPlaceholder,
    MediaUpload,
    MediaUploadCheck,
    InspectorControls,
} from '@wordpress/block-editor';
import { PanelBody, TextControl, Button } from '@wordpress/components';

const buildGalleryImages = (galleryImages = [], fallbackImageUrl, fallbackImageAlt) => {
    if (galleryImages.length) {
        return galleryImages;
    }

    if (fallbackImageUrl) {
        return [
            {
                id: 0,
                url: fallbackImageUrl,
                alt: fallbackImageAlt || 'Gallery image',
            },
        ];
    }

    return [];
};

export default function Edit({ attributes, setAttributes }) {
    const {
        mapEmbedUrl,
        imageUrl,
        imageId,
        imageAlt,
        galleryImages = [],
        logoUrl,
        logoAlt,
        schedule,
        address,
        email,
        phone,
    } = attributes;

    const blockProps = useBlockProps();
    const previewGalleryImages = buildGalleryImages(galleryImages, imageUrl, imageAlt);

    const onSelectGallery = (mediaItems) => {
        const items = Array.isArray(mediaItems) ? mediaItems : [mediaItems];
        const normalizedItems = items
            .filter((item) => item?.url)
            .map((item) => ({
                id: item.id,
                url: item.url,
                alt: item.alt || item.title || '',
            }));

        setAttributes({
            galleryImages: normalizedItems,
            imageUrl: normalizedItems[0]?.url || imageUrl,
            imageId: normalizedItems[0]?.id || imageId,
            imageAlt: normalizedItems[0]?.alt || imageAlt,
        });
    };

    const onSelectLogo = (media) => {
        setAttributes({ logoUrl: media.url, logoId: media.id, logoAlt: media.alt });
    };

    return (
        <div {...blockProps}>
            <InspectorControls>
                <PanelBody title={__('Map Settings', 'zenctuary')}>
                    <TextControl
                        label={__('Google Maps Embed src URL', 'zenctuary')}
                        value={mapEmbedUrl}
                        onChange={(value) => setAttributes({ mapEmbedUrl: value })}
                        help={__('Paste the URL from inside the src="" attribute of your Google Maps Embed code.', 'zenctuary')}
                    />
                </PanelBody>
            </InspectorControls>

            <div style={{ backgroundColor: '#2a2a2a', padding: '40px', borderRadius: '16px', display: 'flex', gap: '32px', flexDirection: 'column' }}>
                <h2 style={{ color: '#fff', margin: 0 }}>Contact Map Configuration</h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ background: '#333', padding: '20px', borderRadius: '8px' }}>
                        <h4 style={{ color: '#aaa', marginTop: 0 }}>Map</h4>
                        <TextControl
                            label={__('Google Maps URL', 'zenctuary')}
                            value={mapEmbedUrl}
                            onChange={(value) => setAttributes({ mapEmbedUrl: value })}
                        />
                        {mapEmbedUrl ? (
                            <iframe title="Map preview" src={mapEmbedUrl} width="100%" height="200" style={{ border: 0 }} />
                        ) : (
                            <div style={{ height: '200px', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
                                No Map URL Provided
                            </div>
                        )}
                    </div>

                    <div style={{ background: '#333', padding: '20px', borderRadius: '8px' }}>
                        <h4 style={{ color: '#aaa', marginTop: 0 }}>Right Side Gallery</h4>
                        {previewGalleryImages.length ? (
                            <div>
                                <div style={{ position: 'relative', height: '200px', borderRadius: '10px', overflow: 'hidden', background: '#222' }}>
                                    {previewGalleryImages.slice(0, 3).map((image, index) => (
                                        <img
                                            key={image.id || image.url}
                                            src={image.url}
                                            alt={image.alt || ''}
                                            style={{
                                                position: index === 0 ? 'relative' : 'absolute',
                                                inset: 0,
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                opacity: index === 0 ? 1 : 0.45 - (index * 0.15),
                                            }}
                                        />
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
                                    <MediaUploadCheck>
                                        <MediaUpload
                                            onSelect={onSelectGallery}
                                            allowedTypes={['image']}
                                            multiple
                                            gallery
                                            value={previewGalleryImages.map((item) => item.id).filter(Boolean)}
                                            render={({ open }) => (
                                                <Button isSecondary onClick={open}>
                                                    Replace Gallery
                                                </Button>
                                            )}
                                        />
                                    </MediaUploadCheck>
                                    <Button
                                        isDestructive
                                        onClick={() => setAttributes({ galleryImages: [], imageUrl: null, imageId: null, imageAlt: '' })}
                                    >
                                        Remove Gallery
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <MediaPlaceholder
                                onSelect={onSelectGallery}
                                allowedTypes={['image']}
                                multiple
                                gallery
                                labels={{ title: 'Select Gallery Images' }}
                            />
                        )}
                    </div>
                </div>

                <div style={{ background: '#333', padding: '30px', borderRadius: '8px' }}>
                    <h4 style={{ color: '#aaa', marginTop: 0 }}>Contact Details (Center Overlay Box)</h4>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', color: '#888', marginBottom: '8px' }}>Logo (replaces "Zenctuary" text)</label>
                        {logoUrl ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <img src={logoUrl} alt={logoAlt} style={{ maxHeight: '60px', maxWidth: '200px', objectFit: 'contain', background: '#111', padding: '8px', borderRadius: '4px' }} />
                                <Button isSecondary isDestructive onClick={() => setAttributes({ logoUrl: null, logoId: null })}>
                                    Remove Logo
                                </Button>
                            </div>
                        ) : (
                            <MediaPlaceholder
                                onSelect={onSelectLogo}
                                allowedTypes={['image']}
                                multiple={false}
                                labels={{ title: 'Upload Logo' }}
                            />
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', color: '#888', marginBottom: '4px' }}>Schedule / Hours</label>
                            <RichText
                                tagName="div"
                                value={schedule}
                                onChange={(val) => setAttributes({ schedule: val })}
                                style={{ background: '#111', color: '#fff', padding: '10px', borderRadius: '4px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: '#888', marginBottom: '4px' }}>Address</label>
                            <RichText
                                tagName="div"
                                value={address}
                                onChange={(val) => setAttributes({ address: val })}
                                style={{ background: '#111', color: '#fff', padding: '10px', borderRadius: '4px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: '#888', marginBottom: '4px' }}>Email</label>
                            <RichText
                                tagName="div"
                                value={email}
                                onChange={(val) => setAttributes({ email: val })}
                                style={{ background: '#111', color: '#fff', padding: '10px', borderRadius: '4px' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: '#888', marginBottom: '4px' }}>Phone</label>
                            <RichText
                                tagName="div"
                                value={phone}
                                onChange={(val) => setAttributes({ phone: val })}
                                style={{ background: '#111', color: '#fff', padding: '10px', borderRadius: '4px' }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
