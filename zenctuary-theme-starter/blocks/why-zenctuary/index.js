import { registerBlockType } from '@wordpress/blocks';

// Frontend styles (auto-extracted to style-index.css, loaded on frontend + editor).
import './style.css';

// Editor-only styles (auto-extracted to index.css, loaded only in editor).
import './editor.css';

import Edit from './edit';
import metadata from './block.json';

// Dynamic block — no save() needed; PHP render.php handles output.
registerBlockType( metadata.name, {
    edit: Edit,
    save: () => null,
} );
