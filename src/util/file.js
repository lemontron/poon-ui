/**
 * @typedef {object} SelectFileOptions
 * @property {string[] | string} [accept]
 * @property {'base64' | 'dataUrl' | 'arrayBuffer' | 'text' | 'file'} [returnFormat]
 */

/** @param {{accept?: string[] | string}} [options] */
export const showOpenFilePicker = (accept = {}) => new Promise((resolve) => {
	const input = document.createElement('input');
	let focusTimeout;
	const cleanup = () => {
		window.removeEventListener('focus', handleFocus);
		clearTimeout(focusTimeout);
		input.remove();
	};
	const handleFocus = () => {
		focusTimeout = setTimeout(() => {
			if (!input.files.length) {
				cleanup();
				resolve(null);
			}
		}, 500);
	};
	input.type = 'file';
	input.style.display = 'none';
	if (accept) input.accept = Array.isArray(accept) ? accept.join(',') : accept;
	input.onchange = () => {
		const file = input.files[0];
		cleanup();
		resolve(file || null);
	};
	window.addEventListener('focus', handleFocus);
	document.body.appendChild(input);
	input.click();
});

export const convertFileAsync = (file, returnFormat = 'base64') => new Promise((resolve, reject) => {
	if (returnFormat === 'file') return resolve(file);
	const reader = new FileReader();
	reader.onload = () => {
		if (returnFormat === 'base64') return resolve(reader.result.split(',')[1]);
		resolve(reader.result);
	};
	reader.onerror = () => reject(reader.error || new Error('Failed to read file'));
	if (returnFormat === 'arrayBuffer') return reader.readAsArrayBuffer(file);
	if (returnFormat === 'text') return reader.readAsText(file);
	reader.readAsDataURL(file);
});

/** @param {SelectFileOptions} [options] */
export const selectFileAsync = async ({accept, returnFormat = 'base64'}) => {
	const file = await showOpenFilePicker(accept);
	if (file) return convertFileAsync(file, returnFormat);
};
