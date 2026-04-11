import { useBlockProps, RichText } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const { mapEmbedUrl, imageUrl, imageAlt, logoUrl, logoAlt, schedule, address, email, phone } = attributes;

    const blockProps = useBlockProps.save({
        className: 'wp-block-group alignfull zen-contact-section'
    });

    return (
        <div { ...blockProps }>
            <div className="wp-block-columns alignfull" style={{ gap: 0, margin: 0 }}>
                <div className="wp-block-column" style={{ flexBasis: '50%', margin: 0 }}>
                    {mapEmbedUrl && (
                        <iframe
                            src={mapEmbedUrl}
                            width="100%"
                            height="680"
                            style={{ border: 0, width: '100%', height: '680px', objectFit: 'cover', display: 'block' }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    )}
                </div>
                <div className="wp-block-column" style={{ flexBasis: '50%', margin: 0 }}>
                    <figure className="wp-block-image size-large" style={{ width: '100%', height: '680px', margin: 0 }}>
                        <img
                            src={imageUrl || 'https://placehold.co/720x680/2b3420/fff?text=Buddha+Statue'}
                            alt={imageAlt || 'Buddha Statue'}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                    </figure>
                </div>
            </div>

            <div className="wp-block-group zen-contact-overlay has-primary-beige-color has-primary-grey-background-color has-text-color has-background">

                {/* Logo or fallback heading */}
                {logoUrl ? (
                    <div className="zen-contact-logo">
                        <img src={logoUrl} alt={logoAlt || 'Logo'} />
                    </div>
                ) : (
                    <h2 className="wp-block-heading has-text-align-center has-text-color" style={{ color: 'var(--wp--preset--color--primary-gold)', textTransform: 'uppercase' }}>
                        Zenctuary
                    </h2>
                )}

                <RichText.Content
                    tagName="p"
                    value={schedule}
                    className="has-text-align-center"
                    style={{ fontStyle: 'italic' }}
                />

                <div style={{ height: '24px' }} aria-hidden="true" className="wp-block-spacer"></div>

                <div className="wp-block-group">
                    <div className="zen-contact-item">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/></svg>
                        <RichText.Content tagName="span" value={address} />
                    </div>

                    <div className="zen-contact-item">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM19.6 8.25L12.53 12.67C12.21 12.87 11.79 12.87 11.47 12.67L4.4 8.25C4.15 8.09 4 7.82 4 7.53C4 6.86 4.73 6.46 5.3 6.81L12 11L18.7 6.81C19.27 6.46 20 6.86 20 7.53C20 7.82 19.85 8.09 19.6 8.25Z" fill="currentColor"/></svg>
                        <RichText.Content tagName="span" value={email} />
                    </div>

                    <div className="zen-contact-item">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.62 10.79C8.06 13.62 10.38 15.93 13.21 17.38L15.41 15.18C15.68 14.91 16.08 14.82 16.43 14.94C17.55 15.31 18.76 15.51 20 15.51C20.55 15.51 21 15.96 21 16.51V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.7 6.45 9.07 7.57C9.18 7.92 9.1 8.31 8.82 8.59L6.62 10.79Z" fill="currentColor"/></svg>
                        <RichText.Content tagName="span" value={phone} />
                    </div>
                </div>
            </div>
        </div>
    );
}
