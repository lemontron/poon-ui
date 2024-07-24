import React from 'react';
import { Touchable } from './Touchable.js';
import { Icon } from './Icon.js';
import { CheckBox } from './CheckBox.js';

export const FilterButton = ({
	title,
	LeftComponent,
	caret = true,
	checked,
	disabled,
	active,
	href,
	onPress,
}) => (
	<Touchable className="filter-button" onClick={onPress} active={active} interactive href={href} disabled={disabled}>
		{LeftComponent}
		{title ? <div className="filter-button-title">{title}</div> : null}
		{caret ? (
			<Icon className="filter-button-caret" icon="expand_more"/>
		) : (
			<CheckBox active={checked}/>
		)}
	</Touchable>
);