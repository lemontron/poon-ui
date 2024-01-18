export const oklabToLinearSrgb = (L, a, b) => {
	const l = (L + a * +0.3963377774 + b * +0.2158037573) ** 3;
	const m = (L + a * -0.1055613458 + b * -0.0638541728) ** 3;
	const s = (L + a * -0.0894841775 + b * -1.2914855480) ** 3;
	return {
		r: l * +4.0767245293 + m * -3.3072168827 + s * +0.2307590544,
		g: l * -1.2681437731 + m * +2.6093323231 + s * -0.3411344290,
		b: l * -0.0041119885 + m * -0.7034763098 + s * +1.7068625689,
	};
};

export const cyrb53 = (str, seed = 0) => {
	let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
	for (let i = 0, ch; i < str.length; i++) {
		ch = str.charCodeAt(i);
		h1 = Math.imul(h1 ^ ch, 2654435761);
		h2 = Math.imul(h2 ^ ch, 1597334677);
	}
	h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
	h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
	h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
	h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

	return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

const intMax = Math.pow(2, 53);

export const colorHash = (tag) => {
	const rand = (cyrb53(tag) / intMax) - .5;
	const {r, g, b} = oklabToLinearSrgb(0.5, rand, rand);
	return `rgb(${r * 256},${g * 256},${b * 256})`;
};