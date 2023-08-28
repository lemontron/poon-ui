import React from 'react';
import { Icon } from './Icon';
import { c } from './util';

export const CheckBox = ({active, undetermined}) => (
	<div className={c('toggle-check', active && 'active', undetermined && 'undetermined')}>
		<Icon icon={undetermined ? 'horizontal_rule' : active ? 'check' : null}/>
	</div>
);