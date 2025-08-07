import React from 'react';
import { Icon } from './Icon';
import { c } from './util';
import { ActivityIndicator } from './ActivityIndicator.js';

export const ValidIcon = ({checked = true, active, loading, hiddenWhenInactive}) => {
	if (loading) return <ActivityIndicator/>;
	if (hiddenWhenInactive && !active) return null;

	const icon = checked ? 'check' : 'close';
	return (
		<div className={c('valid-icon', checked ? 'valid' : 'invalid', active && 'active')}>
			<Icon icon={icon}/>
		</div>
	);
};