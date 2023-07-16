import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { navigation } from 'poon-router';
import { usePanGestures } from './util/gestures';
import { useAnimatedValue } from './util/animated';
import { ScreenHeader } from './ScreenHeader';
import { c, toPercent } from './util/index.js';

let origin = {};

export const Reveal = forwardRef(({
	children,
	title,
	headerRight,
	onClose,
	isVisible,
	className,
}, ref) => {
	const el = useRef();
	const innerEl = useRef();
	const pan = useAnimatedValue(0);

	const close = () => navigation.goBack(1);

	useImperativeHandle(ref, () => ({
		close,
	}));

	const {width, height} = usePanGestures(el, {
		onMove: e => {
		},
		onUp: e => {
		},
	});

	useEffect(() => {
		if (isVisible) {
			pan.spring(1);
		} else {
			pan.spring(0);
		}
	}, [isVisible]);

	useEffect(() => {
		return pan.on(value => {
			const inverse = (1 - value);
			const revealX = (origin.x * inverse);
			const revealY = (origin.y * inverse);

			if (el.current) {
				el.current.style.opacity = value * 2;
				el.current.style.transform = `translate(${revealX}px, ${revealY}px)`;
				el.current.style.width = toPercent(value);
				el.current.style.height = toPercent(value);
			}
			if (innerEl.current) {
				innerEl.current.style.transform = `translate(${-1 * revealX}px, ${-1 * revealY}px)`;
			}
		});
	}, [width, height]);

	return (
		<div className="layer">
			<div className={c('reveal', className)} ref={el}>
				<div className="reveal-content" ref={innerEl}>
					<ScreenHeader
						title={title}
						onClose={close}
						headerRight={headerRight}
						presentation="card"
					/>
					<div className="card-body" children={children}/>
				</div>
			</div>
		</div>
	);
});

export const setRevealOrigin = (x, y) => {
	origin.x = x;
	origin.y = y;
};