import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import metadata from './block.json';

// Dynamic block — no save() needed; PHP render.php handles output.
registerBlockType( metadata.name, {
    edit: Edit,
    save: () => null,
} );
