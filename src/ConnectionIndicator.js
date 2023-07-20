import React from 'react';
import { ActivityIndicator } from './ActivityIndicator.js';

export const ConnectionIndicator = ({status}) => {
	if (status === 'connected') return null;
	return (
		<div className="connection-indicator">
			<div className="bubble">
				<ActivityIndicator/>
				{status}
			</div>
		</div>
	);
};