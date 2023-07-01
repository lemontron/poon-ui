import React, { forwardRef } from 'react';
import { Icon } from './Icon';

export const PullIndicator = forwardRef(({pull}, ref) => {
	return (
		<div className="pull-indicator center" ref={ref}>
			<Icon icon="refresh" color="#000"/>
		</div>
	);
});