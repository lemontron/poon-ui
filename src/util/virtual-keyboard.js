import { useEffect } from 'react';

const vk = navigator.virtualKeyboard;

export const useVirtualKeyboard = () => useEffect(() => {
	if (!vk) return;
	vk.overlaysContent = true;
	return () => vk.overlaysContent = false;
}, []);
