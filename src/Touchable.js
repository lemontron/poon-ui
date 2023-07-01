import React, { useRef, useState } from 'react';
import { c } from './util';

export const Touchable = ({href, onClick, className, target, children, disableMenu}) => {
	const [touched, setTouched] = useState(false);
	const moved = useRef(false);

	const clickButton = (e) => {
		if (moved.current) return e.preventDefault();
		if (onClick) {
			if (!href) {
				e.preventDefault();
				e.stopPropagation();
			}
			onClick(e);
		}
	};

	const touch = (e) => {
		if (e.button && e.button !== 0) return; // If mouse, only process left clicks
		e.stopPropagation();
		moved.current = false;
		setTouched(true);
	};

	const leave = () => {
		setTouched(false);
	};

	return React.createElement(href ? 'a' : 'button', {
		'href': href,
		'onTouchStart': touch,
		'onTouchMove': leave,
		'onTouchEnd': leave,
		'onMouseDown': touch,
		'onMouseUp': leave,
		'onMouseLeave': leave,
		'onClick': clickButton,
		'className': c('touchable', className, touched && 'active', disableMenu && 'disable-menu'),
		'target': target,
		'draggable': false,
		'onContextMenu': disableMenu ? e => {
			e.preventDefault();
			return false;
		} : undefined,
	}, children);
};