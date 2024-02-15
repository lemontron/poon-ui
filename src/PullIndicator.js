import React, { forwardRef } from 'react';
import { Icon } from './Icon';

export const PullIndicator = forwardRef(({pull}, ref) => (
	<div className="pull-indicator" ref={ref}>
		<Icon icon="refresh" color="#000"/>
	</div>
));