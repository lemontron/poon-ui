import { useState } from 'react';
import { showActionSheet } from '../overlays/ActionSheet.js';

export class Options {
	constructor(title, options) {
		this.title = title;
		this.options = options;

		// Check validity
		if (!Array.isArray(options)) throw new TypeError('options must be an array');
		options.forEach((option, index) => {
			if (!option || typeof option !== 'object' || Array.isArray(option)) {
				throw new TypeError(`options[${index}] must be an object`);
			} else if (!('_id' in option)) {
				throw new TypeError(`options[${index}] must include _id`);
			} else if (typeof option.name !== 'string') {
				throw new TypeError(`options[${index}].name must be a string`);
			} else if (option.icon != null && typeof option.icon !== 'string') {
				throw new TypeError(`options[${index}].icon must be a string when provided`);
			}
		});
	}

	useOptions = (defaultId) => {
		console.log('Use Options:', this.title, this.options);
		const [id, setId] = useState(defaultId || this.options[0]._id);
		const selected = this.options.find(r => r._id === id);
		const change = () => showActionSheet(this.title, this.options, setId);
		return [selected, change];
	};
}

export const normalizeOptions = (options, title = 'Pick One') => {
	if (options instanceof Options) return options;
	if (Array.isArray(options)) return new Options(title, options);
	if (typeof options === 'object') { // Compact form
		return new Options(title, Object.keys(options).map(key => ({'_id': key, 'name': options[key]})));
	}
	throw new TypeError('options must be an array, Options instance, or object');
};