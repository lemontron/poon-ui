import React from 'react';
import { Icon } from './Icon.js';
import { c } from './util/index.js';

export const CircleCheck = ({active}) => {
	return (
		<div className={c('circle-check', active && 'active')}>
			<Icon icon="check"/>
		</div>
	);
};