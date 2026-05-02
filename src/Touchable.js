import { createElement, useEffect, useRef, useState } from 'react';
import { navigation } from 'poon-router';
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
	const el = ref || useRef();
	const pointerRef = useRef(null);
	const isClickable = (href || onClick);

	useEffect(() => {
		if (!el.current) return;
		const cancel = () => {
			ignoreNextClick = true;
			pointerRef.current = null;
			setTouched(false);
		};
		el.current.addEventListener('touchablecancel', cancel);
		return () => el.current?.removeEventListener('touchablecancel', cancel);
	}, []);

	const clickButton = (e) => {
		if (ignoreNextClick) return e.preventDefault(); // Safari glitch fix

		if (onClick) {
			if (!href) e.preventDefault();
			onClick(e);
		}

		if (target === '_blank' || target === '_self' || e.metaKey || e.ctrlKey || e.defaultPrevented || !href) return;

		const url = new URL(href, location.href);
		if (url.hostname === location.hostname) {
			e.preventDefault();
			navigation.go(`${url.pathname}${url.search}${url.hash}`);
		}
	};

	const touch = (e) => {
		if (e.button && e.button !== 0) return; // If mouse, only process left clicks
		pointerRef.current = e.pointerId;
		ignoreNextClick = false;
		e.currentTarget.setPointerCapture(e.pointerId);
		setTouched(true);
	};

	const leave = (e) => {
		if (e.pointerId !== pointerRef.current) return;
		if (e.type === 'lostpointercapture') ignoreNextClick = true;
		if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
		pointerRef.current = null;
		setTouched(false);
	};

	const cancel = (e) => {
		ignoreNextClick = true;
		if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
		pointerRef.current = null;
		setTouched(false);
	};

	const move = (e) => {
		if (e.pointerId !== pointerRef.current) return;
		const rect = e.currentTarget.getBoundingClientRect();
		if (
			e.currentTarget.hasPointerCapture(e.pointerId) &&
			e.clientX >= rect.left &&
			e.clientX <= rect.right &&
			e.clientY >= rect.top &&
			e.clientY <= rect.bottom
		) return;
		cancel(e);
	};

	// Determine tag name
	let tagName = 'span';
	if (onClick) tagName = 'button';
	if (href) tagName = 'a';

	return createElement(tagName, {
		'className': c('touchable', className, touched && 'touched', disableMenu && 'disable-menu', active && 'active', disabled && 'disabled'),
		'href': href,
		'onPointerDown': isClickable && touch,
		'onPointerMove': isClickable && move,
		'onPointerUp': isClickable && leave,
		'onPointerCancel': isClickable && cancel,
		'onLostPointerCapture': isClickable && leave,
		'onClick': isClickable && clickButton,
		'target': target,
		'draggable': false,
		'onContextMenu': disableMenu ? e => {
			e.preventDefault();
			return false;
		} : undefined,
		'style': style,
		'type': type,
		'ref': el,
	}, children);
};
