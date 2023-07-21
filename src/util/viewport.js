import { useEffect } from 'react';

// Sync Viewport Size
const syncSize = ({width, height}) => {
	document.documentElement.style.setProperty('--viewport-width', `${width}px`);
	document.documentElement.style.setProperty('--viewport-height', `${height}px`);
};

syncSize({width: document.documentElement.clientWidth, height: document.documentElement.clientHeight});

new ResizeObserver(entries => {
	syncSize(entries[0].contentRect);
}).observe(document.documentElement);

// Virtual Keyboard API
const vk = navigator.virtualKeyboard;

export const useVirtualKeyboard = () => useEffect(() => {
	if (!vk) return;
	vk.overlaysContent = true;
	return () => vk.overlaysContent = false;
}, []);
