import { __ } from '@wordpress/i18n';
import { InspectorControls, MediaUpload, MediaUploadCheck, RichText, useBlockProps } from '@wordpress/block-editor';
import {
	Button,
	ColorPalette,
	PanelBody,
	RangeControl,
	SelectControl,
	TextControl,
	ToggleControl,
	__experimentalUnitControl as UnitControl,
} from '@wordpress/components';
import { useEffect, useMemo, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

const FONT_FAMILIES = [
	{ label: 'Montserrat', value: 'var(--wp--preset--font-family--montserrat)' },
	{ label: 'DM Sans', value: 'var(--wp--preset--font-family--dm-sans)' },
	{ label: 'Theme default', value: '' },
];

const WEIGHTS = [ '300', '400', '500', '600', '700', '800', '900' ].map( ( value ) => ( { label: value, value } ) );

const COLOR_CHOICES = [
	{ name: 'Gold', color: '#d8b354' },
	{ name: 'Dark grey', color: '#3f3d3d' },
	{ name: 'Beige', color: '#f1eee7' },
	{ name: 'Muted grey', color: '#b9b9b9' },
	{ name: 'Soft border', color: 'rgba(241, 238, 231, 0.58)' },
	{ name: 'White', color: '#ffffff' },
	{ name: 'Black', color: '#000000' },
];

const ALIGNMENTS = [
	{ label: 'Top', value: 'start' },
	{ label: 'Center', value: 'center' },
	{ label: 'Bottom', value: 'end' },
];

const ICON_OPTIONS = [
	{ label: 'Email', value: 'email' },
	{ label: 'Phone', value: 'phone' },
	{ label: 'Location', value: 'location' },
];

const makeId = ( prefix ) => `${ prefix }-${ Date.now() }-${ Math.floor( Math.random() * 1000 ) }`;
const createContactRow = () => ( { id: makeId( 'contact' ), icon: 'email', text: 'contact@company.com', url: 'mailto:contact@company.com', openInNewTab: false } );

function ColorControl( { label, value, onChange } ) {
	return (
		<div className="zen-static-contact-control">
			<p className="components-base-control__label">{ label }</p>
			<ColorPalette colors={ COLOR_CHOICES } value={ value } onChange={ onChange } enableAlpha />
		</div>
	);
}

function TypographyControls( { title, prefix, attributes, setAttributes, colorDefault } ) {
	const set = ( key, value ) => setAttributes( { [ `${ prefix }${ key }` ]: value } );
	return (
		<PanelBody title={ title } initialOpen={ false }>
			<SelectControl label={ __( 'Font family', 'zenctuary' ) } value={ attributes[ `${ prefix }FontFamily` ] } options={ FONT_FAMILIES } onChange={ ( value ) => set( 'FontFamily', value ) } />
			<UnitControl label={ __( 'Font size', 'zenctuary' ) } value={ attributes[ `${ prefix }FontSize` ] } onChange={ ( value ) => set( 'FontSize', value || '' ) } />
			<SelectControl label={ __( 'Font weight', 'zenctuary' ) } value={ attributes[ `${ prefix }FontWeight` ] } options={ WEIGHTS } onChange={ ( value ) => set( 'FontWeight', value ) } />
			<TextControl label={ __( 'Line height', 'zenctuary' ) } value={ attributes[ `${ prefix }LineHeight` ] || '' } onChange={ ( value ) => set( 'LineHeight', value ) } />
			<UnitControl label={ __( 'Letter spacing', 'zenctuary' ) } value={ attributes[ `${ prefix }LetterSpacing` ] || '' } onChange={ ( value ) => set( 'LetterSpacing', value || '' ) } />
			<ColorControl label={ __( 'Color', 'zenctuary' ) } value={ attributes[ `${ prefix }Color` ] } onChange={ ( value ) => set( 'Color', value || colorDefault ) } />
		</PanelBody>
	);
}

const textStyle = ( attributes, prefix ) => ( {
	fontFamily: attributes[ `${ prefix }FontFamily` ] || undefined,
	fontSize: attributes[ `${ prefix }FontSize` ],
	fontWeight: attributes[ `${ prefix }FontWeight` ],
	lineHeight: attributes[ `${ prefix }LineHeight` ],
	letterSpacing: attributes[ `${ prefix }LetterSpacing` ],
	color: attributes[ `${ prefix }Color` ],
} );

function ContactIcon( { type } ) {
	if ( type === 'phone' ) {
		return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M6.6 10.8c1.7 3.3 3.3 4.9 6.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.3 1.3.4 2.7.6 4.1.6.7 0 1.3.6 1.3 1.3v3.5c0 .7-.6 1.3-1.3 1.3C10.4 22 2 13.6 2 3.3 2 2.6 2.6 2 3.3 2h3.5c.7 0 1.3.6 1.3 1.3 0 1.4.2 2.8.6 4.1.1.4 0 .9-.3 1.2l-1.8 2.2Z" /></svg>;
	}
	if ( type === 'location' ) {
		return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 2a7 7 0 0 0-7 7c0 5.3 7 13 7 13s7-7.7 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" /></svg>;
	}
	return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3 5h18c.6 0 1 .4 1 1v12c0 .6-.4 1-1 1H3c-.6 0-1-.4-1-1V6c0-.6.4-1 1-1Zm9 8.2L4.9 7H19l-7 6.2Zm0 2.6L4 8.8V17h16V8.8l-8 7Z" /></svg>;
}

function normalizeForms( response ) {
	const list = Array.isArray( response ) ? response : ( response?.items || response?.data || [] );
	return list.map( ( form ) => {
		const rawTitle = form.title?.rendered || form.title || form.name || form.slug || '';
		return {
			id: Number( form.id ),
			title: String( rawTitle ).replace( /<[^>]*>/g, '' ),
		};
	} ).filter( ( form ) => form.id && form.title );
}

function FormPreview( { attributes } ) {
	const inputStyle = textStyle( attributes, 'formInput' );
	const labelStyle = textStyle( attributes, 'formLabel' );
	return (
		<div className="zen-static-contact__preview-form" aria-label={ __( 'Contact form preview', 'zenctuary' ) }>
			<label style={ labelStyle }>Name<input style={ inputStyle } readOnly placeholder="example@gmail.com" /></label>
			<label style={ labelStyle }>Name<input style={ inputStyle } readOnly placeholder="example@gmail.com" /></label>
			<label style={ labelStyle }>E-Mail<input style={ inputStyle } readOnly placeholder="example@gmail.com" /></label>
			<label style={ labelStyle }>Number<input style={ inputStyle } readOnly placeholder="example@gmail.com" /></label>
			<label className="zen-static-contact__preview-message" style={ labelStyle }>Message<textarea style={ inputStyle } readOnly placeholder="example@gmail.com" /></label>
			<button type="button" className="zen-static-contact__preview-submit" style={ textStyle( attributes, 'submit' ) }>Send a Message</button>
		</div>
	);
}

function BlockPreview( { attributes, setAttributes } ) {
	const contactRows = Array.isArray( attributes.contactRows ) ? attributes.contactRows : [];
	const blockStyle = {
		'--zen-static-contact-bg': attributes.sectionBackgroundColor,
		'--zen-static-contact-bg-image': attributes.backgroundImageUrl ? `url(${ attributes.backgroundImageUrl })` : undefined,
		'--zen-static-contact-bg-position': attributes.backgroundPosition,
		'--zen-static-contact-overlay': attributes.overlayColor,
		'--zen-static-contact-overlay-opacity': attributes.overlayOpacity,
		'--zen-static-contact-gradient-start': attributes.gradientStartColor,
		'--zen-static-contact-gradient-end': attributes.gradientEndColor,
		'--zen-static-contact-pt': attributes.sectionPaddingTop,
		'--zen-static-contact-pr': attributes.sectionPaddingRight,
		'--zen-static-contact-pb': attributes.sectionPaddingBottom,
		'--zen-static-contact-pl': attributes.sectionPaddingLeft,
		'--zen-static-contact-content-width': attributes.contentMaxWidth,
		'--zen-static-contact-gap': `${ attributes.columnsGap }px`,
		'--zen-static-contact-left-width': `${ attributes.leftWidth }%`,
		'--zen-static-contact-right-width': `${ attributes.rightWidth }%`,
		'--zen-static-contact-form-bg': attributes.formCardBackgroundColor,
		'--zen-static-contact-form-border': attributes.formCardBorderColor,
		'--zen-static-contact-form-border-width': `${ attributes.formCardBorderWidth }px`,
		'--zen-static-contact-form-radius': attributes.formCardBorderRadius,
		'--zen-static-contact-form-pt': attributes.formCardPaddingTop,
		'--zen-static-contact-form-pr': attributes.formCardPaddingRight,
		'--zen-static-contact-form-pb': attributes.formCardPaddingBottom,
		'--zen-static-contact-form-pl': attributes.formCardPaddingLeft,
		'--zen-static-contact-field-gap': `${ attributes.formFieldGap }px`,
		'--zen-static-contact-field-bg': attributes.formFieldBackgroundColor,
		'--zen-static-contact-field-border': attributes.formFieldBorderColor,
		'--zen-static-contact-field-border-width': `${ attributes.formFieldBorderWidth }px`,
		'--zen-static-contact-field-radius': attributes.formFieldBorderRadius,
		'--zen-static-contact-field-pt': attributes.formFieldPaddingTop,
		'--zen-static-contact-field-pr': attributes.formFieldPaddingRight,
		'--zen-static-contact-field-pb': attributes.formFieldPaddingBottom,
		'--zen-static-contact-field-pl': attributes.formFieldPaddingLeft,
		'--zen-static-contact-placeholder-color': attributes.formPlaceholderColor,
		'--zen-static-contact-submit-bg': attributes.submitBackgroundColor,
		'--zen-static-contact-submit-color': attributes.submitTextColor,
		'--zen-static-contact-submit-border': attributes.submitBorderColor,
		'--zen-static-contact-submit-border-width': `${ attributes.submitBorderWidth }px`,
		'--zen-static-contact-submit-radius': attributes.submitBorderRadius,
		'--zen-static-contact-submit-pt': attributes.submitPaddingTop,
		'--zen-static-contact-submit-pr': attributes.submitPaddingRight,
		'--zen-static-contact-submit-pb': attributes.submitPaddingBottom,
		'--zen-static-contact-submit-pl': attributes.submitPaddingLeft,
		'--zen-static-contact-submit-mt': attributes.submitMarginTop,
		'--zen-static-contact-heading-mb': attributes.headingBottomSpacing,
		'--zen-static-contact-description-mb': attributes.descriptionBottomSpacing,
		'--zen-static-contact-rows-gap': `${ attributes.contactRowsGap }px`,
		'--zen-static-contact-icon-size': `${ attributes.contactIconSize }px`,
		'--zen-static-contact-icon-color': attributes.contactIconColor,
		'--zen-static-contact-text-color': attributes.contactTextColor,
	};
	const blockProps = useBlockProps( { className: 'zen-static-contact', style: blockStyle } );
	return (
		<section { ...blockProps }>
			<div className="zen-static-contact__backdrop" aria-hidden="true" />
			<div className="zen-static-contact__inner" style={ { alignItems: attributes.verticalAlignment } }>
				<div className="zen-static-contact__form-card">
					<FormPreview attributes={ attributes } />
					<div className="zen-static-contact__selected-form">{ attributes.formTitle || ( attributes.formId ? `CF7 form #${ attributes.formId }` : __( 'Select a Contact Form 7 form', 'zenctuary' ) ) }</div>
				</div>
				<div className="zen-static-contact__content">
					<RichText tagName="h2" className="zen-static-contact__heading" value={ attributes.heading } onChange={ ( heading ) => setAttributes( { heading } ) } style={ { ...textStyle( attributes, 'heading' ), textTransform: attributes.headingTextTransform, whiteSpace: attributes.headingWrap ? 'normal' : 'nowrap' } } allowedFormats={ [ 'core/bold', 'core/italic' ] } />
					<RichText tagName="div" className="zen-static-contact__description" value={ attributes.description } onChange={ ( description ) => setAttributes( { description } ) } style={ textStyle( attributes, 'description' ) } allowedFormats={ [ 'core/bold', 'core/italic', 'core/link' ] } />
					<div className="zen-static-contact__rows">
						{ contactRows.map( ( row ) => (
							<div key={ row.id } className="zen-static-contact__row" style={ textStyle( attributes, 'contactText' ) }>
								<span className="zen-static-contact__row-icon"><ContactIcon type={ row.icon } /></span>
								<span>{ row.text }</span>
							</div>
						) ) }
					</div>
				</div>
			</div>
		</section>
	);
}

export default function Edit( { attributes, setAttributes } ) {
	const [ forms, setForms ] = useState( [] );
	const [ formsError, setFormsError ] = useState( '' );
	const [ selectedRowIndex, setSelectedRowIndex ] = useState( 0 );
	const contactRows = useMemo( () => Array.isArray( attributes.contactRows ) ? attributes.contactRows : [], [ attributes.contactRows ] );
	const selectedRow = contactRows[ selectedRowIndex ];

	useEffect( () => {
		let active = true;
		async function loadForms() {
			const endpoints = [
				'/contact-form-7/v1/contact-forms',
				'/wp/v2/wpcf7_contact_form?per_page=100&status=any&_fields=id,title',
				'/wp/v2/contact-form-7?per_page=100&status=any&_fields=id,title',
			];

			for ( const path of endpoints ) {
				try {
					const response = await apiFetch( { path } );
					const normalized = normalizeForms( response );
					if ( active && normalized.length ) {
						setForms( normalized );
						setFormsError( '' );
						return;
					}
				} catch ( error ) {
					if ( active ) {
						setFormsError( error?.message || __( 'Unable to load Contact Form 7 forms.', 'zenctuary' ) );
					}
				}
			}
		}
		loadForms();
		return () => { active = false; };
	}, [] );

	useEffect( () => {
		if ( selectedRowIndex > contactRows.length - 1 ) {
			setSelectedRowIndex( Math.max( contactRows.length - 1, 0 ) );
		}
	}, [ contactRows.length, selectedRowIndex ] );

	const updateRow = ( patch ) => {
		setAttributes( { contactRows: contactRows.map( ( row, index ) => index === selectedRowIndex ? { ...row, ...patch } : row ) } );
	};
	const moveRow = ( direction ) => {
		const nextIndex = selectedRowIndex + direction;
		if ( nextIndex < 0 || nextIndex >= contactRows.length ) return;
		const nextRows = [ ...contactRows ];
		[ nextRows[ selectedRowIndex ], nextRows[ nextIndex ] ] = [ nextRows[ nextIndex ], nextRows[ selectedRowIndex ] ];
		setAttributes( { contactRows: nextRows } );
		setSelectedRowIndex( nextIndex );
	};
	const removeRow = () => {
		if ( contactRows.length <= 1 ) return;
		setAttributes( { contactRows: contactRows.filter( ( row, index ) => index !== selectedRowIndex ) } );
		setSelectedRowIndex( Math.max( selectedRowIndex - 1, 0 ) );
	};

	const formOptions = [ { label: __( 'Select a form', 'zenctuary' ), value: 0 }, ...forms.map( ( form ) => ( { label: form.title, value: form.id } ) ) ];

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Contact Form 7', 'zenctuary' ) } initialOpen>
					<SelectControl label={ __( 'Contact form', 'zenctuary' ) } value={ attributes.formId || 0 } options={ formOptions } onChange={ ( value ) => { const formId = Number( value ); const form = forms.find( ( item ) => item.id === formId ); setAttributes( { formId, formTitle: form?.title || '' } ); } } />
					{ ! forms.length && formsError && <p className="zen-static-contact-help">{ formsError }</p> }
					<TextControl label={ __( 'Manual shortcode fallback', 'zenctuary' ) } value={ attributes.manualShortcode } onChange={ ( manualShortcode ) => setAttributes( { manualShortcode } ) } help={ __( 'Used only if no form is selected above.', 'zenctuary' ) } />
				</PanelBody>

				<PanelBody title={ __( 'Section background/layout', 'zenctuary' ) } initialOpen={ false }>
					<MediaUploadCheck>
						<MediaUpload onSelect={ ( media ) => setAttributes( { backgroundImageId: media.id, backgroundImageUrl: media.url } ) } allowedTypes={ [ 'image' ] } value={ attributes.backgroundImageId } render={ ( { open } ) => <Button variant="secondary" onClick={ open }>{ attributes.backgroundImageUrl ? __( 'Replace background image', 'zenctuary' ) : __( 'Select background image', 'zenctuary' ) }</Button> } />
					</MediaUploadCheck>
					{ attributes.backgroundImageUrl && <Button variant="tertiary" isDestructive onClick={ () => setAttributes( { backgroundImageId: 0, backgroundImageUrl: '' } ) }>{ __( 'Remove background image', 'zenctuary' ) }</Button> }
					<TextControl label={ __( 'Background position', 'zenctuary' ) } value={ attributes.backgroundPosition } onChange={ ( backgroundPosition ) => setAttributes( { backgroundPosition } ) } />
					<ColorControl label={ __( 'Fallback background', 'zenctuary' ) } value={ attributes.sectionBackgroundColor } onChange={ ( sectionBackgroundColor ) => setAttributes( { sectionBackgroundColor: sectionBackgroundColor || '#3f3d3d' } ) } />
					<ColorControl label={ __( 'Overlay color', 'zenctuary' ) } value={ attributes.overlayColor } onChange={ ( overlayColor ) => setAttributes( { overlayColor: overlayColor || '#000000' } ) } />
					<RangeControl label={ __( 'Overlay opacity', 'zenctuary' ) } value={ attributes.overlayOpacity } onChange={ ( overlayOpacity ) => setAttributes( { overlayOpacity } ) } min={ 0 } max={ 0.85 } step={ 0.05 } />
					<ColorControl label={ __( 'Gradient start', 'zenctuary' ) } value={ attributes.gradientStartColor } onChange={ ( gradientStartColor ) => setAttributes( { gradientStartColor: gradientStartColor || 'rgba(216, 179, 84, 0.46)' } ) } />
					<ColorControl label={ __( 'Gradient end', 'zenctuary' ) } value={ attributes.gradientEndColor } onChange={ ( gradientEndColor ) => setAttributes( { gradientEndColor: gradientEndColor || 'rgba(16, 29, 21, 0.88)' } ) } />
					<UnitControl label={ __( 'Top padding', 'zenctuary' ) } value={ attributes.sectionPaddingTop } onChange={ ( sectionPaddingTop ) => setAttributes( { sectionPaddingTop: sectionPaddingTop || '0px' } ) } />
					<UnitControl label={ __( 'Right padding', 'zenctuary' ) } value={ attributes.sectionPaddingRight } onChange={ ( sectionPaddingRight ) => setAttributes( { sectionPaddingRight: sectionPaddingRight || '0px' } ) } />
					<UnitControl label={ __( 'Bottom padding', 'zenctuary' ) } value={ attributes.sectionPaddingBottom } onChange={ ( sectionPaddingBottom ) => setAttributes( { sectionPaddingBottom: sectionPaddingBottom || '0px' } ) } />
					<UnitControl label={ __( 'Left padding', 'zenctuary' ) } value={ attributes.sectionPaddingLeft } onChange={ ( sectionPaddingLeft ) => setAttributes( { sectionPaddingLeft: sectionPaddingLeft || '0px' } ) } />
					<UnitControl label={ __( 'Content max width', 'zenctuary' ) } value={ attributes.contentMaxWidth } onChange={ ( contentMaxWidth ) => setAttributes( { contentMaxWidth: contentMaxWidth || '100%' } ) } />
					<RangeControl label={ __( 'Column gap', 'zenctuary' ) } value={ attributes.columnsGap } onChange={ ( columnsGap ) => setAttributes( { columnsGap } ) } min={ 0 } max={ 180 } />
					<RangeControl label={ __( 'Left width', 'zenctuary' ) } value={ attributes.leftWidth } onChange={ ( leftWidth ) => setAttributes( { leftWidth, rightWidth: 100 - leftWidth } ) } min={ 35 } max={ 75 } />
					<SelectControl label={ __( 'Vertical alignment', 'zenctuary' ) } value={ attributes.verticalAlignment } options={ ALIGNMENTS } onChange={ ( verticalAlignment ) => setAttributes( { verticalAlignment } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Form card style', 'zenctuary' ) } initialOpen={ false }>
					<ColorControl label={ __( 'Card background', 'zenctuary' ) } value={ attributes.formCardBackgroundColor } onChange={ ( formCardBackgroundColor ) => setAttributes( { formCardBackgroundColor: formCardBackgroundColor || 'rgba(63, 62, 62, 0.9)' } ) } />
					<ColorControl label={ __( 'Card border', 'zenctuary' ) } value={ attributes.formCardBorderColor } onChange={ ( formCardBorderColor ) => setAttributes( { formCardBorderColor: formCardBorderColor || 'rgba(241, 238, 231, 0.58)' } ) } />
					<RangeControl label={ __( 'Card border width', 'zenctuary' ) } value={ attributes.formCardBorderWidth } onChange={ ( formCardBorderWidth ) => setAttributes( { formCardBorderWidth } ) } min={ 0 } max={ 8 } />
					<UnitControl label={ __( 'Card radius', 'zenctuary' ) } value={ attributes.formCardBorderRadius } onChange={ ( formCardBorderRadius ) => setAttributes( { formCardBorderRadius: formCardBorderRadius || '0px' } ) } />
					<UnitControl label={ __( 'Padding top', 'zenctuary' ) } value={ attributes.formCardPaddingTop } onChange={ ( formCardPaddingTop ) => setAttributes( { formCardPaddingTop: formCardPaddingTop || '0px' } ) } />
					<UnitControl label={ __( 'Padding right', 'zenctuary' ) } value={ attributes.formCardPaddingRight } onChange={ ( formCardPaddingRight ) => setAttributes( { formCardPaddingRight: formCardPaddingRight || '0px' } ) } />
					<UnitControl label={ __( 'Padding bottom', 'zenctuary' ) } value={ attributes.formCardPaddingBottom } onChange={ ( formCardPaddingBottom ) => setAttributes( { formCardPaddingBottom: formCardPaddingBottom || '0px' } ) } />
					<UnitControl label={ __( 'Padding left', 'zenctuary' ) } value={ attributes.formCardPaddingLeft } onChange={ ( formCardPaddingLeft ) => setAttributes( { formCardPaddingLeft: formCardPaddingLeft || '0px' } ) } />
					<RangeControl label={ __( 'Field gap', 'zenctuary' ) } value={ attributes.formFieldGap } onChange={ ( formFieldGap ) => setAttributes( { formFieldGap } ) } min={ 0 } max={ 60 } />
				</PanelBody>
				<PanelBody title={ __( 'Form fields style', 'zenctuary' ) } initialOpen={ false }>
					<ColorControl label={ __( 'Field background', 'zenctuary' ) } value={ attributes.formFieldBackgroundColor } onChange={ ( formFieldBackgroundColor ) => setAttributes( { formFieldBackgroundColor: formFieldBackgroundColor || 'transparent' } ) } />
					<ColorControl label={ __( 'Field border', 'zenctuary' ) } value={ attributes.formFieldBorderColor } onChange={ ( formFieldBorderColor ) => setAttributes( { formFieldBorderColor: formFieldBorderColor || 'rgba(241, 238, 231, 0.58)' } ) } />
					<RangeControl label={ __( 'Field border width', 'zenctuary' ) } value={ attributes.formFieldBorderWidth } onChange={ ( formFieldBorderWidth ) => setAttributes( { formFieldBorderWidth } ) } min={ 0 } max={ 8 } />
					<UnitControl label={ __( 'Field radius', 'zenctuary' ) } value={ attributes.formFieldBorderRadius } onChange={ ( formFieldBorderRadius ) => setAttributes( { formFieldBorderRadius: formFieldBorderRadius || '0px' } ) } />
					<UnitControl label={ __( 'Field padding top', 'zenctuary' ) } value={ attributes.formFieldPaddingTop } onChange={ ( formFieldPaddingTop ) => setAttributes( { formFieldPaddingTop: formFieldPaddingTop || '0px' } ) } />
					<UnitControl label={ __( 'Field padding right', 'zenctuary' ) } value={ attributes.formFieldPaddingRight } onChange={ ( formFieldPaddingRight ) => setAttributes( { formFieldPaddingRight: formFieldPaddingRight || '0px' } ) } />
					<UnitControl label={ __( 'Field padding bottom', 'zenctuary' ) } value={ attributes.formFieldPaddingBottom } onChange={ ( formFieldPaddingBottom ) => setAttributes( { formFieldPaddingBottom: formFieldPaddingBottom || '0px' } ) } />
					<UnitControl label={ __( 'Field padding left', 'zenctuary' ) } value={ attributes.formFieldPaddingLeft } onChange={ ( formFieldPaddingLeft ) => setAttributes( { formFieldPaddingLeft: formFieldPaddingLeft || '0px' } ) } />
					<ColorControl label={ __( 'Placeholder color', 'zenctuary' ) } value={ attributes.formPlaceholderColor } onChange={ ( formPlaceholderColor ) => setAttributes( { formPlaceholderColor: formPlaceholderColor || 'rgba(241, 238, 231, 0.46)' } ) } />
				</PanelBody>
				<TypographyControls title={ __( 'Form label typography', 'zenctuary' ) } prefix="formLabel" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#f1eee7" />
				<TypographyControls title={ __( 'Form input typography', 'zenctuary' ) } prefix="formInput" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#f1eee7" />

				<PanelBody title={ __( 'Submit button style', 'zenctuary' ) } initialOpen={ false }>
					<ColorControl label={ __( 'Button background', 'zenctuary' ) } value={ attributes.submitBackgroundColor } onChange={ ( submitBackgroundColor ) => setAttributes( { submitBackgroundColor: submitBackgroundColor || '#d8b354' } ) } />
					<ColorControl label={ __( 'Button text', 'zenctuary' ) } value={ attributes.submitTextColor } onChange={ ( submitTextColor ) => setAttributes( { submitTextColor: submitTextColor || '#3f3d3d' } ) } />
					<ColorControl label={ __( 'Button border', 'zenctuary' ) } value={ attributes.submitBorderColor } onChange={ ( submitBorderColor ) => setAttributes( { submitBorderColor: submitBorderColor || '#d8b354' } ) } />
					<RangeControl label={ __( 'Border width', 'zenctuary' ) } value={ attributes.submitBorderWidth } onChange={ ( submitBorderWidth ) => setAttributes( { submitBorderWidth } ) } min={ 0 } max={ 8 } />
					<UnitControl label={ __( 'Border radius', 'zenctuary' ) } value={ attributes.submitBorderRadius } onChange={ ( submitBorderRadius ) => setAttributes( { submitBorderRadius: submitBorderRadius || '0px' } ) } />
					<UnitControl label={ __( 'Top margin', 'zenctuary' ) } value={ attributes.submitMarginTop } onChange={ ( submitMarginTop ) => setAttributes( { submitMarginTop: submitMarginTop || '0px' } ) } />
					<UnitControl label={ __( 'Padding top', 'zenctuary' ) } value={ attributes.submitPaddingTop } onChange={ ( submitPaddingTop ) => setAttributes( { submitPaddingTop: submitPaddingTop || '0px' } ) } />
					<UnitControl label={ __( 'Padding right', 'zenctuary' ) } value={ attributes.submitPaddingRight } onChange={ ( submitPaddingRight ) => setAttributes( { submitPaddingRight: submitPaddingRight || '0px' } ) } />
					<UnitControl label={ __( 'Padding bottom', 'zenctuary' ) } value={ attributes.submitPaddingBottom } onChange={ ( submitPaddingBottom ) => setAttributes( { submitPaddingBottom: submitPaddingBottom || '0px' } ) } />
					<UnitControl label={ __( 'Padding left', 'zenctuary' ) } value={ attributes.submitPaddingLeft } onChange={ ( submitPaddingLeft ) => setAttributes( { submitPaddingLeft: submitPaddingLeft || '0px' } ) } />
				</PanelBody>
				<TypographyControls title={ __( 'Submit typography', 'zenctuary' ) } prefix="submit" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#3f3d3d" />

				<TypographyControls title={ __( 'Right heading typography', 'zenctuary' ) } prefix="heading" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#d8b354" />
				<PanelBody title={ __( 'Right heading layout', 'zenctuary' ) } initialOpen={ false }>
					<ToggleControl label={ __( 'Allow heading to wrap', 'zenctuary' ) } checked={ !! attributes.headingWrap } onChange={ ( headingWrap ) => setAttributes( { headingWrap } ) } />
					<SelectControl label={ __( 'Text transform', 'zenctuary' ) } value={ attributes.headingTextTransform } options={ [ { label: 'Uppercase', value: 'uppercase' }, { label: 'None', value: 'none' } ] } onChange={ ( headingTextTransform ) => setAttributes( { headingTextTransform } ) } />
					<UnitControl label={ __( 'Heading/subtext spacing', 'zenctuary' ) } value={ attributes.headingBottomSpacing } onChange={ ( headingBottomSpacing ) => setAttributes( { headingBottomSpacing: headingBottomSpacing || '0px' } ) } />
				</PanelBody>
				<TypographyControls title={ __( 'Right text typography', 'zenctuary' ) } prefix="description" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#f1eee7" />
				<PanelBody title={ __( 'Right text layout', 'zenctuary' ) } initialOpen={ false }>
					<UnitControl label={ __( 'Text/contact spacing', 'zenctuary' ) } value={ attributes.descriptionBottomSpacing } onChange={ ( descriptionBottomSpacing ) => setAttributes( { descriptionBottomSpacing: descriptionBottomSpacing || '0px' } ) } />
				</PanelBody>

				<PanelBody title={ __( 'Contact rows', 'zenctuary' ) } initialOpen>
					<SelectControl label={ __( 'Selected row', 'zenctuary' ) } value={ selectedRowIndex } options={ contactRows.map( ( row, index ) => ( { label: `${ index + 1 }. ${ row.text || 'Contact row' }`, value: index } ) ) } onChange={ ( value ) => setSelectedRowIndex( Number( value ) ) } />
					{ selectedRow && (
						<>
							<SelectControl label={ __( 'Icon', 'zenctuary' ) } value={ selectedRow.icon || 'email' } options={ ICON_OPTIONS } onChange={ ( icon ) => updateRow( { icon } ) } />
							<TextControl label={ __( 'Text', 'zenctuary' ) } value={ selectedRow.text || '' } onChange={ ( text ) => updateRow( { text } ) } />
							<TextControl label={ __( 'Link', 'zenctuary' ) } value={ selectedRow.url || '' } onChange={ ( url ) => updateRow( { url } ) } />
							<ToggleControl label={ __( 'Open in new tab', 'zenctuary' ) } checked={ !! selectedRow.openInNewTab } onChange={ ( openInNewTab ) => updateRow( { openInNewTab } ) } />
						</>
					) }
					<div className="zen-static-contact-actions">
						<Button variant="secondary" onClick={ () => moveRow( -1 ) } disabled={ selectedRowIndex <= 0 }>{ __( 'Move up', 'zenctuary' ) }</Button>
						<Button variant="secondary" onClick={ () => moveRow( 1 ) } disabled={ selectedRowIndex >= contactRows.length - 1 }>{ __( 'Move down', 'zenctuary' ) }</Button>
						<Button variant="tertiary" isDestructive onClick={ removeRow } disabled={ contactRows.length <= 1 }>{ __( 'Remove', 'zenctuary' ) }</Button>
					</div>
					<Button variant="primary" onClick={ () => { setAttributes( { contactRows: [ ...contactRows, createContactRow() ] } ); setSelectedRowIndex( contactRows.length ); } }>{ __( 'Add row', 'zenctuary' ) }</Button>
				</PanelBody>
				<PanelBody title={ __( 'Contact rows style', 'zenctuary' ) } initialOpen={ false }>
					<RangeControl label={ __( 'Rows gap', 'zenctuary' ) } value={ attributes.contactRowsGap } onChange={ ( contactRowsGap ) => setAttributes( { contactRowsGap } ) } min={ 0 } max={ 70 } />
					<RangeControl label={ __( 'Icon size', 'zenctuary' ) } value={ attributes.contactIconSize } onChange={ ( contactIconSize ) => setAttributes( { contactIconSize } ) } min={ 8 } max={ 64 } />
					<ColorControl label={ __( 'Icon color', 'zenctuary' ) } value={ attributes.contactIconColor } onChange={ ( contactIconColor ) => setAttributes( { contactIconColor: contactIconColor || '#d8b354' } ) } />
				</PanelBody>
				<TypographyControls title={ __( 'Contact text typography', 'zenctuary' ) } prefix="contactText" attributes={ attributes } setAttributes={ setAttributes } colorDefault="#f1eee7" />
			</InspectorControls>

			<BlockPreview attributes={ attributes } setAttributes={ setAttributes } />
		</>
	);
}