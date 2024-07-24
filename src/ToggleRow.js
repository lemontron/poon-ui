import React from 'react';
import { Icon } from './Icon';
import { c } from './util';
import { CheckBox } from './CheckBox.js';
import { Touchable } from './Touchable.js';

export const ToggleRow = ({title, onChange, active}) => (
	<Touchable className="toggle-row" onClick={() => onChange(!active)}>
		<CheckBox active={active}/>
		<div>{title}</div>
	</Touchable>
);