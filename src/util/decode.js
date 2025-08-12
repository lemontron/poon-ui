export const decodeBuffer = (buffer) => {
	return URL.createObjectURL(new Blob([buffer], {type: 'image/png'}));
};

export const simpleHash = (input) => {
	let hash = 0;
	if (!input || input.length === 0) return hash;
	for (let i = 0; i < input.length; i++) {
		hash = ((hash << 5) - hash) + input[i];
		hash |= 0;
	}
	return hash;
};
