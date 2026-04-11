import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import metadata from './block.json';

registerBlockType( metadata.name, {
    edit: Edit,
    save: () => null, // dynamic block — server renders via render.php
} );
