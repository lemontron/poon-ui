import { toast } from '../overlays/Toast.js';

export const copyToClipboard = async (text) => {
	try {
		await navigator.clipboard.writeText(text);
		toast(`Copied "${text.slice(0, 20)}"`);
	} catch (err) {
		toast(err.toString());
	}
};
