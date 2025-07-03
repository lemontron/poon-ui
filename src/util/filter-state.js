import { useState } from 'react';
import { showActionSheet } from '../overlays/ActionSheet.js';

export const useFilterState = (initialKeys, allKeys) => {
	const [keys, setKeys] = useState(initialKeys.length ? initialKeys : null);
	const toggleKey = (key) => {
		let res = keys;
		if (!res) { // first interaction fills array
			res = allKeys.filter(k => k !== key);
		} else {
			if (res.includes(key)) {
				res = res.filter(k => k !== key);
			} else {
				res = [...res, key];
			}
		}
		// check if operation adds all ids, if so, just remove filter instead!
		if (res.length === allKeys.length) {
			setKeys(null);
		} else {
			setKeys(res);
		}
	};

	const toggleAll = () => setKeys(keys ? null : []);

	return [keys, toggleKey, toggleAll];
};

export const useOptions = (title, options, defaultValue) => {
	const [value, setValue] = useState(defaultValue);
	const selected = options.find(r => r.value === value);
	const change = () => showActionSheet(title, options, setValue);
	return [selected, change];
};
