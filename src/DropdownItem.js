import React from 'react';
import { TouchableRow } from './TouchableRow';

export const DropdownItem = ({title, icon, onClick, href, disabled, children, active}) => (
	<TouchableRow
		className="dropdown-item"
		onClick={onClick}
		disabled={disabled}
		active={active}
		children={children}
		href={href}
		leftIcon={icon}
		title={title}
	/>
);