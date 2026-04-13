import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls, MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import {
	PanelBody, RangeControl, TextControl, TextareaControl,
	SelectControl, Button, ColorPicker, Popover, ToggleControl,
} from '@wordpress/components';
import { useState, useRef } from '@wordpress/element';

/* ─── Helpers ─────────────────────────────────────────────────────── */
const Divider = () => <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #444' }} />;

function ColorRow( { label, value, onChange } ) {
	const [open, setOpen] = useState( false );
	const ref = useRef();
	return (
		<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
			<span style={{ fontSize: '13px' }}>{ label }</span>
			<div style={{ position: 'relative' }}>
				<button
					type="button" ref={ ref }
					onClick={ () => setOpen( !open ) }
					style={{ background: 'transparent', border: 'none', padding: 0, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
				>
					<div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: value || 'transparent', border: '1px solid #ccc' }} />
					<span style={{ fontSize: '11px', color: '#aaa', fontFamily: 'monospace' }}>{ value || 'none' }</span>
				</button>
				{ open && (
					<Popover placement="left-start" onClose={ () => setOpen( false ) } anchor={ ref.current }>
						<div style={{ padding: '16px' }}>
							<ColorPicker color={ value } onChange={ onChange } enableAlpha={ false } />
						</div>
					</Popover>
				) }
			</div>
		</div>
	);
}

function MediaField( { label, media, onSelect, onRemove } ) {
	return (
		<div style={{ marginBottom: '12px' }}>
			<MediaUploadCheck>
				<MediaUpload
					onSelect={ m => onSelect({ id: m.id, url: m.url, alt: m.alt || '' }) }
					allowedTypes={ ['image'] }
					value={ media?.id || 0 }
					render={ ({ open }) => (
						<Button variant="secondary" onClick={ open } style={{ width: '100%', justifyContent: 'center', marginBottom: '4px' }}>
							{ media?.url ? `Change ${label}` : `Set ${label}` }
						</Button>
					) }
				/>
			</MediaUploadCheck>
			{ media?.url && (
				<div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
					<img src={ media.url } alt={ media.alt } style={{ width: '40px', height: '40px', objectFit: 'contain', border: '1px solid #555' }} />
					<Button variant="link" isDestructive onClick={ onRemove }>Remove</Button>
				</div>
			) }
		</div>
	);
}

/* ─── Default Cards ────────────────────────────────────────────────── */
const DEFAULT_CARDS = [
	{ title: 'PHASE 1: Activation',    titleIcon: {id:0,url:'',alt:''}, timeText: '3–4 min',   timeIcon: {id:0,url:'',alt:''}, pointsText: 'Breathwork · Presence · Intention', borderColor: '#c6b36a' },
	{ title: 'PHASE 2: Ice Immersion', titleIcon: {id:0,url:'',alt:''}, timeText: '3–5 min',   timeIcon: {id:0,url:'',alt:''}, pointsText: 'Icebath · Presence · Breathing',     borderColor: '#c6b36a' },
	{ title: 'PHASE 3: Afterdrop',     titleIcon: {id:0,url:'',alt:''}, timeText: '10–15 min', timeIcon: {id:0,url:'',alt:''}, pointsText: 'Movement · Presence · Breathing',    borderColor: '#c6b36a' },
	{ title: 'PHASE 4: Fire Integration', titleIcon: {id:0,url:'',alt:''}, timeText: '10–15 min', timeIcon: {id:0,url:'',alt:''}, pointsText: 'Sauna · Heat · Relaxation',        borderColor: '#c6b36a' },
	{ title: 'PHASE 5: Reflection',    titleIcon: {id:0,url:'',alt:''}, timeText: '5 min',     timeIcon: {id:0,url:'',alt:''}, pointsText: 'Sit · Breath · Arrive',             borderColor: '#c6b36a' },
];

const EMPTY_CARD = { title: 'NEW PHASE', titleIcon: {id:0,url:'',alt:''}, timeText: '0 min', timeIcon: {id:0,url:'',alt:''}, pointsText: '', borderColor: '#c6b36a' };

const FW_OPTS = [
	{label:'300',value:'300'},{label:'400',value:'400'},{label:'500',value:'500'},
	{label:'600',value:'600'},{label:'700',value:'700'},
];
const TT_OPTS = [
	{label:'None',value:'none'},{label:'Uppercase',value:'uppercase'},
	{label:'Lowercase',value:'lowercase'},{label:'Capitalize',value:'capitalize'},
];

/* ─── Edit Component ─────────────────────────────────────────────── */
export default function Edit( { attributes, setAttributes } ) {
	const {
		cardsData = '',
		sectionBgColor = '#3a3b38',
		sectionPaddingTop = 80, sectionPaddingBottom = 80,
		sectionPaddingX = 60, sectionMaxWidth = 1200,

		headingText = 'FREE FLOW SESSION',
		headingColor = '#c6b36a', headingFontSize = 36,
		headingFontWeight = '600', headingLineHeight = 1.2,
		headingTextTransform = 'uppercase', headingMaxWidth = 800,
		gapBelowHeading = 24,

		descText = '', descColor = '#e5e5e5',
		descFontSize = 16, descFontWeight = '400',
		descLineHeight = 1.5, descMaxWidth = 1000,
		gapBelowDesc = 48,

		cardsGap = 24, cardBorderRadius = 12,
		cardPadding = 24, cardBorderWidth = 1,
		cardBgColor = 'transparent', cardMinHeight = 200,

		titleFontSize = 18, titleFontWeight = '600',
		titleLineHeight = 1.3, titleColor = '#c6b36a',
		titleMaxWidth = 150, gapTitleIcon = 12, titleIconSize = 40,

		timeFontSize = 14, timeFontWeight = '400',
		timeColor = '#e5e5e5', timeIconSize = 16, gapTimeIconText = 8,

		pointsFontSize = 14, pointsFontWeight = '400',
		pointsLineHeight = 1.5, pointsColor = '#ffffff',

		gapTitleRowTimeRow = 16, gapTimeRowPointsRow = 12,
	} = attributes;

	let cards = [];
	try { cards = cardsData ? JSON.parse( cardsData ) : DEFAULT_CARDS; }
	catch(e) { cards = DEFAULT_CARDS; }

	const setCards = newArr => setAttributes({ cardsData: JSON.stringify( newArr ) });

	const updateCard = ( idx, key, val ) => {
		const next = [ ...cards ];
		next[ idx ] = { ...next[ idx ], [key]: val };
		setCards( next );
	};

	const blockProps = useBlockProps({
		className: 'zenctuary-session-phases',
		style: {
			'--zsp-bg': sectionBgColor,
			'--zsp-pt': `${sectionPaddingTop}px`,
			'--zsp-pb': `${sectionPaddingBottom}px`,
			'--zsp-px': `${sectionPaddingX}px`,
			'--zsp-max-w': `${sectionMaxWidth}px`,

			'--zsp-h-fs': `${headingFontSize}px`,
			'--zsp-h-fw': headingFontWeight,
			'--zsp-h-lh': headingLineHeight,
			'--zsp-h-tt': headingTextTransform,
			'--zsp-h-c': headingColor,
			'--zsp-h-mw': `${headingMaxWidth}px`,
			'--zsp-gap-hd': `${gapBelowHeading}px`,

			'--zsp-d-fs': `${descFontSize}px`,
			'--zsp-d-fw': descFontWeight,
			'--zsp-d-lh': descLineHeight,
			'--zsp-d-c': descColor,
			'--zsp-d-mw': `${descMaxWidth}px`,
			'--zsp-gap-dd': `${gapBelowDesc}px`,

			'--zsp-cards-gap': `${cardsGap}px`,
			'--zsp-card-br': `${cardBorderRadius}px`,
			'--zsp-card-pad': `${cardPadding}px`,
			'--zsp-card-bw': `${cardBorderWidth}px`,
			'--zsp-card-bg': cardBgColor || 'transparent',
			'--zsp-card-mh': `${cardMinHeight}px`,

			'--zsp-t-fs': `${titleFontSize}px`,
			'--zsp-t-fw': titleFontWeight,
			'--zsp-t-lh': titleLineHeight,
			'--zsp-t-c': titleColor,
			'--zsp-t-mw': `${titleMaxWidth}px`,
			'--zsp-gap-ti': `${gapTitleIcon}px`,
			'--zsp-ti-sz': `${titleIconSize}px`,

			'--zsp-time-fs': `${timeFontSize}px`,
			'--zsp-time-fw': timeFontWeight,
			'--zsp-time-c': timeColor,
			'--zsp-tii-sz': `${timeIconSize}px`,
			'--zsp-gap-tit': `${gapTimeIconText}px`,

			'--zsp-p-fs': `${pointsFontSize}px`,
			'--zsp-p-fw': pointsFontWeight,
			'--zsp-p-lh': pointsLineHeight,
			'--zsp-p-c': pointsColor,

			'--zsp-gap-tr': `${gapTitleRowTimeRow}px`,
			'--zsp-gap-tp': `${gapTimeRowPointsRow}px`,
		},
	});

	return (
		<div { ...blockProps }>
			<InspectorControls>

				{/* ── Section Global ── */}
				<PanelBody title="1. Section Styling" initialOpen={ true }>
					<ColorRow label="Background Color" value={ sectionBgColor } onChange={ v => setAttributes({ sectionBgColor: v }) } />
					<Divider />
					<RangeControl label="Padding Top (px)"    value={ sectionPaddingTop }    min={0} max={200} onChange={ v => setAttributes({ sectionPaddingTop: v }) } />
					<RangeControl label="Padding Bottom (px)" value={ sectionPaddingBottom } min={0} max={200} onChange={ v => setAttributes({ sectionPaddingBottom: v }) } />
					<RangeControl label="Padding X (px)"      value={ sectionPaddingX }      min={0} max={120} onChange={ v => setAttributes({ sectionPaddingX: v }) } />
					<Divider />
					<RangeControl label="Content Max Width (px)" value={ sectionMaxWidth } min={600} max={1800} onChange={ v => setAttributes({ sectionMaxWidth: v }) } />
				</PanelBody>

				{/* ── Heading / Description ── */}
				<PanelBody title="2. Heading & Description" initialOpen={ false }>
					<h3 style={{ fontSize:'11px', textTransform:'uppercase', color:'#888', margin:'0 0 8px' }}>Heading</h3>
					<TextControl label="Heading Text" value={ headingText } onChange={ v => setAttributes({ headingText: v }) } />
					<ColorRow label="Heading Color" value={ headingColor } onChange={ v => setAttributes({ headingColor: v }) } />
					<RangeControl label="Font Size" value={ headingFontSize } min={16} max={96} onChange={ v => setAttributes({ headingFontSize: v }) } />
					<SelectControl label="Font Weight" value={ headingFontWeight } options={ FW_OPTS } onChange={ v => setAttributes({ headingFontWeight: v }) } />
					<SelectControl label="Text Transform" value={ headingTextTransform } options={ TT_OPTS } onChange={ v => setAttributes({ headingTextTransform: v }) } />
					<RangeControl label="Heading Max Width (px)" value={ headingMaxWidth } min={200} max={1600} onChange={ v => setAttributes({ headingMaxWidth: v }) } />
					<RangeControl label="Gap Below Heading (px)" value={ gapBelowHeading } min={0} max={100} onChange={ v => setAttributes({ gapBelowHeading: v }) } />

					<Divider />
					<h3 style={{ fontSize:'11px', textTransform:'uppercase', color:'#888', margin:'0 0 8px' }}>Description</h3>
					<TextareaControl label="Description Text" value={ descText } onChange={ v => setAttributes({ descText: v }) } />
					<ColorRow label="Description Color" value={ descColor } onChange={ v => setAttributes({ descColor: v }) } />
					<RangeControl label="Font Size" value={ descFontSize } min={10} max={32} onChange={ v => setAttributes({ descFontSize: v }) } />
					<SelectControl label="Font Weight" value={ descFontWeight } options={ FW_OPTS } onChange={ v => setAttributes({ descFontWeight: v }) } />
					<RangeControl label="Line Height" value={ descLineHeight } min={1} max={3} step={0.05} onChange={ v => setAttributes({ descLineHeight: v }) } />
					<RangeControl label="Description Max Width (px)" value={ descMaxWidth } min={200} max={1600} onChange={ v => setAttributes({ descMaxWidth: v }) } />
					<RangeControl label="Gap Below Description (px)" value={ gapBelowDesc } min={0} max={120} onChange={ v => setAttributes({ gapBelowDesc: v }) } />
				</PanelBody>

				{/* ── Cards Layout Defaults ── */}
				<PanelBody title="3. Cards Layout & Defaults" initialOpen={ false }>
					<h3 style={{ fontSize:'11px', textTransform:'uppercase', color:'#888', margin:'0 0 8px' }}>Card Shell</h3>
					<RangeControl label="Cards Gap (px)"        value={ cardsGap }       min={0}  max={80}  onChange={ v => setAttributes({ cardsGap: v }) } />
					<RangeControl label="Border Radius (px)"    value={ cardBorderRadius } min={0} max={40}  onChange={ v => setAttributes({ cardBorderRadius: v }) } />
					<RangeControl label="Border Width (px)"     value={ cardBorderWidth }  min={0} max={8}   onChange={ v => setAttributes({ cardBorderWidth: v }) } />
					<RangeControl label="Card Padding (px)"     value={ cardPadding }     min={8}  max={80}  onChange={ v => setAttributes({ cardPadding: v }) } />
					<RangeControl label="Card Min Height (px)"  value={ cardMinHeight }   min={80} max={500} onChange={ v => setAttributes({ cardMinHeight: v }) } />
					<ColorRow label="Card Background" value={ cardBgColor } onChange={ v => setAttributes({ cardBgColor: v }) } />

					<Divider />
					<h3 style={{ fontSize:'11px', textTransform:'uppercase', color:'#888', margin:'0 0 8px' }}>Title Typography (Global)</h3>
					<ColorRow label="Title Color"  value={ titleColor }  onChange={ v => setAttributes({ titleColor: v }) } />
					<RangeControl label="Title Font Size"   value={ titleFontSize }   min={10} max={48} onChange={ v => setAttributes({ titleFontSize: v }) } />
					<SelectControl label="Title Font Weight" value={ titleFontWeight } options={ FW_OPTS } onChange={ v => setAttributes({ titleFontWeight: v }) } />
					<RangeControl label="Title Line Height"  value={ titleLineHeight } min={1} max={2.5} step={0.05} onChange={ v => setAttributes({ titleLineHeight: v }) } />
					<RangeControl label="Title Max Width (px)" value={ titleMaxWidth } min={60} max={400} onChange={ v => setAttributes({ titleMaxWidth: v }) } />

					<Divider />
					<h3 style={{ fontSize:'11px', textTransform:'uppercase', color:'#888', margin:'0 0 8px' }}>Title Icon (Global Size)</h3>
					<RangeControl label="Title Icon Size (px)" value={ titleIconSize } min={16} max={120} step={2} onChange={ v => setAttributes({ titleIconSize: v }) } />
					<RangeControl label="Gap: Title ↔ Icon"   value={ gapTitleIcon }  min={0}  max={60}  onChange={ v => setAttributes({ gapTitleIcon: v }) } />

					<Divider />
					<h3 style={{ fontSize:'11px', textTransform:'uppercase', color:'#888', margin:'0 0 8px' }}>Time Row (Global)</h3>
					<ColorRow label="Time Text Color" value={ timeColor } onChange={ v => setAttributes({ timeColor: v }) } />
					<RangeControl label="Time Font Size"    value={ timeFontSize }   min={10} max={32}  onChange={ v => setAttributes({ timeFontSize: v }) } />
					<SelectControl label="Time Font Weight" value={ timeFontWeight } options={ FW_OPTS } onChange={ v => setAttributes({ timeFontWeight: v }) } />
					<RangeControl label="Time Icon Size (px)" value={ timeIconSize } min={10} max={48}  step={2} onChange={ v => setAttributes({ timeIconSize: v }) } />
					<RangeControl label="Gap: Time Icon ↔ Text" value={ gapTimeIconText } min={0} max={40} onChange={ v => setAttributes({ gapTimeIconText: v }) } />

					<Divider />
					<h3 style={{ fontSize:'11px', textTransform:'uppercase', color:'#888', margin:'0 0 8px' }}>Points Text (Global)</h3>
					<ColorRow label="Points Color" value={ pointsColor } onChange={ v => setAttributes({ pointsColor: v }) } />
					<RangeControl label="Points Font Size"   value={ pointsFontSize }   min={10} max={28} onChange={ v => setAttributes({ pointsFontSize: v }) } />
					<SelectControl label="Points Font Weight" value={ pointsFontWeight } options={ FW_OPTS } onChange={ v => setAttributes({ pointsFontWeight: v }) } />
					<RangeControl label="Points Line Height"  value={ pointsLineHeight } min={1} max={3} step={0.05} onChange={ v => setAttributes({ pointsLineHeight: v }) } />

					<Divider />
					<h3 style={{ fontSize:'11px', textTransform:'uppercase', color:'#888', margin:'0 0 8px' }}>Vertical Spacing (Global)</h3>
					<RangeControl label="Gap: Title Row → Time Row (px)"   value={ gapTitleRowTimeRow }  min={0} max={60} onChange={ v => setAttributes({ gapTitleRowTimeRow: v }) } />
					<RangeControl label="Gap: Time Row → Points Row (px)"  value={ gapTimeRowPointsRow } min={0} max={60} onChange={ v => setAttributes({ gapTimeRowPointsRow: v }) } />
				</PanelBody>

				{/* ── Card Repeater ── */}
				<PanelBody title="4. Manage Cards" initialOpen={ false }>
					{ cards.map( ( card, idx ) => (
						<div key={ idx } style={{ border: '1px solid #555', borderRadius: '4px', padding: '12px', marginBottom: '16px', background: '#1e1e1e' }}>
							<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
								<strong style={{ fontSize: '13px', color: '#c6b36a' }}>Card { idx + 1 }</strong>
								<Button isDestructive variant="link" onClick={ () => {
									const next = [ ...cards ];
									next.splice( idx, 1 );
									setCards( next );
								} }>Remove</Button>
							</div>

							<TextControl
								label="Title"
								value={ card.title || '' }
								onChange={ v => updateCard( idx, 'title', v ) }
							/>
							<TextControl
								label="Time Text (e.g. 3–4 min)"
								value={ card.timeText || '' }
								onChange={ v => updateCard( idx, 'timeText', v ) }
							/>
							<TextareaControl
								label="Points / Description Text"
								value={ card.pointsText || '' }
								onChange={ v => updateCard( idx, 'pointsText', v ) }
							/>

							<Divider />
							<ColorRow
								label="Border Color"
								value={ card.borderColor || '#c6b36a' }
								onChange={ v => updateCard( idx, 'borderColor', v ) }
							/>

							<Divider />
							<MediaField
								label="Title Icon"
								media={ card.titleIcon }
								onSelect={ m => updateCard( idx, 'titleIcon', m ) }
								onRemove={ () => updateCard( idx, 'titleIcon', {id:0,url:'',alt:''} ) }
							/>
							<MediaField
								label="Time Icon"
								media={ card.timeIcon }
								onSelect={ m => updateCard( idx, 'timeIcon', m ) }
								onRemove={ () => updateCard( idx, 'timeIcon', {id:0,url:'',alt:''} ) }
							/>
						</div>
					) ) }

					<Button variant="primary" onClick={ () => setCards( [ ...cards, { ...EMPTY_CARD } ] ) }
						style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
					>
						+ Add Card
					</Button>
				</PanelBody>

			</InspectorControls>

			{/* ── Preview Canvas ── */}
			<div className="zsp-inner">
				<div className="zsp-content">
					{ headingText && <h2 className="zsp-heading">{ headingText }</h2> }
					{ descText    && <p  className="zsp-desc">{ descText }</p> }

					<div className="zsp-grid">
						{ cards.map( ( card, idx ) => (
							<article
								key={ idx }
								className="zsp-card"
								style={{ borderColor: card.borderColor || '#c6b36a' }}
							>
								{/* Title Row */}
								<div className="zsp-card__title-row">
									{ card.title && <h3 className="zsp-card__title">{ card.title }</h3> }
									{ card.titleIcon?.url && (
										<img className="zsp-card__title-icon" src={ card.titleIcon.url } alt={ card.titleIcon.alt || '' } />
									) }
								</div>

								{/* Time Row */}
								{ card.timeText && (
									<div className="zsp-card__time-row">
										{ card.timeIcon?.url && (
											<img className="zsp-card__time-icon" src={ card.timeIcon.url } alt={ card.timeIcon.alt || '' } />
										) }
										<p className="zsp-card__time-text">{ card.timeText }</p>
									</div>
								) }

								{/* Points */}
								{ card.pointsText && <p className="zsp-card__points">{ card.pointsText }</p> }
							</article>
						) ) }
					</div>
				</div>
			</div>
		</div>
	);
}
