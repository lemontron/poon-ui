import { createElement, forwardRef, useRef, useState } from 'react';
import { c } from './util';

export const Touchable = forwardRef(({href, onClick, className, active, target, children, style, disableMenu}, ref) => {
	const [touched, setTouched] = useState(false);
	const moved = useRef(false);
	const clickable = (href || onClick);

	const clickButton = (e) => {
		if (moved.current) return e.preventDefault();
		if (onClick) {
			if (!href) {
				e.preventDefault();
				// e.stopPropagation();
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

	// Determine tag name
	let tagName = 'span';
	if (onClick) tagName = 'button';
	if (href) tagName = 'a';

	return createElement(tagName, {
		'href': href,
		'onTouchStart': clickable && touch,
		'onTouchMove': clickable && leave,
		'onTouchEnd': clickable && leave,
		'onMouseDown': clickable && touch,
		'onMouseUp': clickable && leave,
		'onMouseLeave': clickable && leave,
		'onClick': clickable && clickButton,
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