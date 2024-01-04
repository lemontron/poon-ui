import React from 'react';
import { Touchable } from './Touchable.js';
import { Icon } from './Icon.js';

export const SortFilterButton = ({
	title,
	label = 'Sort by',
	disabled,
	onClick,
}) => (
	<Touchable className="sort-filter" onClick={onClick} disabled={disabled} interactive>
		<div>
			<span className="sort-filter-label">{label} </span>
			<span className="sort-filter-value">{title}</span>
		</div>
		<Icon icon="swap_vertical_circle" size={18}/>
	</Touchable>
);