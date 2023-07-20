import React from 'react';
import { Touchable } from './Touchable';
import { c } from './util';

export const TouchableHighlight = ({
	href,
	onClick,
	children,
	disabled,
	className,
}) => (
	<Touchable
		className={c('touchable-highlight', disabled && 'disabled', className)}
		onClick={onClick}
		href={href}
		children={children}
	/>
);