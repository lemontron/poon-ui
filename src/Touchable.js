import { createElement, forwardRef, useRef, useState } from 'react';
import { c } from './util';

export const Touchable = forwardRef(({href, onClick, className, active, target, children, style, disableMenu}, ref) => {
	const touchedRef = useRef(false);
	const [touched, setTouched] = useState(false);
	const isClickable = (href || onClick);

	const clickButton = (e) => {
		if (e.button !== 0 && !touchedRef.current) return e.preventDefault();
		if (onClick) {
			if (!href) e.preventDefault();
			onClick(e);
		}
	};

	const touch = (e) => {
		if (e.type === 'touchstart') touchedRef.current = true;
		if (e.button && e.button !== 0) return; // If mouse, only process left clicks
		e.stopPropagation();
		setTouched(true);
	};

	const leave = (e) => {
		if (e.type === 'touchmove') touchedRef.current = false;
		setTouched(false);
	};

	// Determine tag name
	let tagName = 'span';
	if (onClick) tagName = 'button';
	if (href) tagName = 'a';

	return createElement(tagName, {
		'href': href,
		'onTouchStart': isClickable && touch,
		'onTouchMove': isClickable && leave,
		'onTouchEnd': isClickable && leave,
		'onMouseDown': isClickable && touch,
		'onMouseUp': isClickable && leave,
		'onMouseLeave': isClickable && leave,
		'onClick': isClickable && clickButton,
		'className': c('touchable', className, touched && 'touched', disableMenu && 'disable-menu', active && 'active'),
		'target': target,
		'draggable': false,
		'onContextMenu': disableMenu ? e => {
			e.preventDefault();
			return false;
		} : undefined,
		'style': style,
		'type': 'button',
		'ref': ref,
	}, children);
});