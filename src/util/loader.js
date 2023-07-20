const cache = new Map();

export const memoize = (func) => function(...args) {
	const key = args[0];
	if (!cache.has(key)) cache.set(key, func.apply(this, args));
	return cache.get(key);
};

export const loadCss = memoize((url) => new Promise(resolve => {
	const el = document.createElement('link');
	el.setAttribute('rel', 'stylesheet');
	el.setAttribute('href', url);
	el.onload = () => resolve();
	document.head.appendChild(el);
}));

export const loadScript = memoize((url, windowKey) => new Promise(resolve => {
	const script = document.createElement('script');
	script.type = 'text/javascript';
	script.async = true;
	script.src = url;
	script.onload = () => resolve(window[windowKey]);
	document.head.appendChild(script);
}));