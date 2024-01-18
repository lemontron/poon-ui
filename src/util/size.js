import { useEffect, useState } from 'react';

export const getSize = (el) => {
	if (!el) return {};
	return {'width': el.clientWidth, 'height': el.clientHeight};
};

export const useSize = (el) => {
	const [size, setSize] = useState(getSize(el.current));
	useEffect(() => { // Observe size of element
		if (!el.current) return;
		// console.log('el.current', el.current);
		const ro = new ResizeObserver(entries => {
			const e = entries[0].borderBoxSize[0];
			setSize({'height': e.blockSize, 'width': e.inlineSize});
		});
		ro.observe(el.current);
		return ro.disconnect.bind(ro);
	}, []);
	return size;
};
