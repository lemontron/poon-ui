import { createElement, useState } from 'react';
import { c } from './util';

let ignoreNextClick = false; // Safari glitch fix

export const Touchable = ({
	href,
	onClick,
	className,
	active,
	target,
	children,
	style,
	disabled,
	disableMenu,
	type = 'button',
	ref,
}) => {
	const [touched, setTouched] = useState(false);
	const isClickable = (href || onClick);

	const clickButton = (e) => {
		if (ignoreNextClick) return e.preventDefault(); // Safari glitch fix

		if (onClick) {
			if (!href) e.preventDefault();
			onClick(e);
		}
	};

	const touch = (e) => {
		e.initialType = e.type;
		if (e.type === 'touchstart') ignoreNextClick = false;
		if (e.button && e.button !== 0) return; // If mouse, only process left clicks
		setTouched(true);
	};

	const leave = (e) => {
		if (e.type === 'touchmove') ignoreNextClick = true;
		setTouched(false);
	};

	// Determine tag name
	let tagName = 'span';
	if (onClick) tagName = 'button';
	if (href) tagName = 'a';

	return createElement(tagName, {
		'className': c('touchable', className, touched && 'touched', disableMenu && 'disable-menu', active && 'active', disabled && 'disabled'),
		'href': href,
		'onTouchStart': isClickable && touch,
		'onTouchMove': isClickable && leave,
		'onTouchEnd': isClickable && leave,
		'onMouseDown': isClickable && touch,
		'onMouseUp': isClickable && leave,
		'onMouseLeave': isClickable && leave,
		'onClick': isClickable && clickButton,
		'target': target,
		'draggable': false,
		'onContextMenu': disableMenu ? e => {
			e.preventDefault();
			return false;
		} : undefined,
		'style': style,
		'type': type,
		'ref': ref,
	}, children);
};