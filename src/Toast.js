import React, { useEffect } from 'react';
import { createBus, useBus } from '@poon/router/util.js';

const state = createBus();

export const Toast = () => {
	const message = useBus(state);

	useEffect(() => {
		if (!message) return;
		const timeout = setTimeout(() => state.update(null), 2000);
		return () => clearTimeout(timeout);
	}, [message]);

	if (!message) return null;
	return (
		<div className="toast-container">
			<div className="toast" children={message}/>
		</div>
	);
};

export const toast = state.update;