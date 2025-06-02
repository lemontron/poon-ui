import React, { useEffect, useImperativeHandle, useRef } from 'react';
import { navigation } from 'poon-router';
import { useAnimatedValue } from './util/animated';
import { c, toPercent } from './util/index.js';
import { useSize } from './util/size.js';
import { ScreenHeader } from './ScreenHeader';
import { Pan } from './Pan.js';
import { Layer } from './Layer.js';

let origin = {};

export const Reveal = ({
	children,
	title,
	headerRight,
	isVisible,
	animateIn,
	className,
	ref,
}) => {
	const el = useRef();
	const innerEl = useRef();
	const pan = useAnimatedValue(animateIn ? 0 : 1);

	const close = () => navigation.goBack(1);

	useImperativeHandle(ref, () => ({
		close,
	}));

	const {width, height} = useSize(el);

	useEffect(() => {
		if (!animateIn) return;
		if (isVisible) {
			pan.spring(1);
		} else {
			pan.spring(0);
		}
	}, [animateIn, isVisible]);

	useEffect(() => {
		return pan.on(val => {
			const inverse = (1 - val);
			const revealX = (origin.x * inverse);
			const revealY = (origin.y * inverse);

			el.current.style.transform = `translate(${revealX}px, ${revealY}px)`;
			el.current.style.width = toPercent(val);
			el.current.style.height = toPercent(val);
			innerEl.current.style.transform = `translate(${-1 * revealX}px, ${-1 * revealY}px)`;
			innerEl.current.style.opacity = val;

			// el.current.style.borderRadius = lerp(val, 50, 0) + 'px';
		});
	}, [width, height]);

	return (
		<Layer isActive={isVisible} className="reveal" ref={el}>
			<Pan
				className={c('card reveal-content', className)}
				ref={innerEl}
				onCapture={(e) => {
					return (e.direction === 'x' && e.distance > 0);
				}}
				onMove={(e) => {
					pan.setValue(1 - (e.distance / e.size));
				}}
				onUp={(e) => {
					if (e.flick === -1) return close();
					pan.spring(1);
				}}
			>
				<ScreenHeader
					backIcon="apps"
					title={title}
					onClose={close}
					headerRight={headerRight}
					presentation="reveal"
				/>
				<div className="card-body" children={children}/>
			</Pan>
		</Layer>
	);
};

export const setRevealOrigin = (x, y) => Object.assign(origin, {x, y});