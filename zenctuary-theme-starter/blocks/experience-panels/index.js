import { registerBlockType } from '@wordpress/blocks';
import blockDef from './block.json';
import Edit from './edit';

import './style.css';
import './editor.css';

registerBlockType(blockDef.name, {
    edit: Edit,
    save: () => null, // Dynamic Block
});
