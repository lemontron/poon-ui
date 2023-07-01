import React from 'react';
import { Spinner } from './Spinner';

export const ConnectionIndicator = ({status}) => {
	if (status === 'connected') return null;
	return (
		<div className="connection-indicator">
			<div className="bubble">
				<Spinner/>
				{status}
			</div>
		</div>
	);
};