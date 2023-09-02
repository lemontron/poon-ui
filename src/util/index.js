export const c = (...rest) => rest.filter(Boolean).join(' ');

export const toPercent = val => `${val * 100}%`;

export const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

export const clone = (obj) => Object.assign({}, obj);

export const sameObject = (a, b) => Object.keys(a).every(key => a[key] === b[key]);

export const bounce = (num, min, max) => {
	if (num > max) return max + ((max + num) / 50);
	if (num < min) return min - ((min - num) / 50);
	return num;
};

export const easeOutCubic = (t) => (--t) * t * t + 1;

export const createClamp = (min, max) => {
	return val => clamp(val, min, max);
};

export const lerp = (val, v0, v1) => {
	return (1 - val) * v0 + val * v1;
};