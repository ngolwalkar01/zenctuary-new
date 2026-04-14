import { registerBlockType } from '@wordpress/blocks';

// Frontend styles — webpack extracts to style-index.css (loaded on frontend + editor)
import './style.css';

// Editor-only styles — webpack extracts to index.css (loaded only in Gutenberg editor)
import './editor.css';

import Edit from './edit';
import metadata from './block.json';

registerBlockType( metadata.name, {
	edit: Edit,
	save: () => null, // server-side render
} );
