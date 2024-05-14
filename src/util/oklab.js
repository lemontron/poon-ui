const colors = [
	'#004D81',
	'#017C77',
	'#067101',
	'#FF9400',
	'#B51700',
	'#9A1760',
	'#7F00FF',
	'#402250',
	'#ED230D',
];

const getHash = (str) => {
	let hash = 0; // Simple hash function to generate an index
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	return hash;
};

export const colorHash = (str) => {
	const hash = getHash(str);
	const index = Math.abs(hash) % colors.length;
	return colors[index];
};