import React from 'react';
import { Touchable } from './Touchable.js';
import { Icon } from './Icon.js';
import { CheckBox } from './CheckBox.js';

export const PillButton = ({title, LeftComponent, caret = true, checked, active, href, onPress}) => (
	<Touchable className="pill" onClick={onPress} active={active} interactive href={href}>
		{LeftComponent}
		{title ? <div className="pill-title">{title}</div> : null}
		{caret ? (
			<Icon className="pill-caret" icon="expand_more"/>
		) : (
			<CheckBox active={checked}/>
		)}
	</Touchable>
);