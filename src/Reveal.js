import { useEffect, useImperativeHandle, useRef } from 'react';
import { navigation } from 'poon-router';
import { useAnimatedValue } from './util/animated';
import { c, lerp, toPercent } from './util';
import { ScreenHeader } from './ScreenHeader';
import { Pan } from './Pan';
import { Layer } from './Layer';

let origin = {};

export const Reveal = ({
	children,
	title,
	headerRight,
	isVisible,
	animateIn,
	className,
	SearchComponent,
	ref,
}) => {
	const layerEl = useRef();
	const innerEl = useRef();
	const pan = useAnimatedValue(animateIn ? 0 : 1);

	const close = () => navigation.goBack(1);

	useImperativeHandle(ref, () => ({
		close,
	}));

	useEffect(() => {
		if (!animateIn) return;
		if (isVisible) {
			pan.spring(1);
		} else {
			pan.spring(0);
		}
	}, [animateIn, isVisible]);

	useEffect(() => {
		const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
		const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

		return pan.on(val => {
			if (val > 1) val = 1;
			if (val < 0) val = 0;

			const h = lerp(val, 48, vh);
			const w = lerp(val, 48, vw);

			const inverse = (1 - val);
			const revealX = (origin.left * inverse);
			const revealY = (origin.top * inverse);

			layerEl.current.style.transform = `translate(${revealX}px, ${revealY}px)`;
			layerEl.current.style.width = w + 'px';
			layerEl.current.style.height = h + 'px';
			layerEl.current.style.borderRadius = lerp(val, 48, 0) + 'px';
			// layerEl.current.style.opacity = val;
			layerEl.current.style.display = val ? 'flex' : 'none';

			innerEl.current.style.transform = `translate(${-1 * revealX}px, ${-1 * revealY}px) scale(${lerp(val, 0.95, 1)})`;
			innerEl.current.style.opacity = val;
		});
	}, []);

	return (
		<Layer isActive={isVisible} className="reveal" ref={layerEl}>
			<Pan
				direction="x"
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
					SearchComponent={SearchComponent}
				/>
				<div className="card-body" children={children}/>
			</Pan>
		</Layer>
	);
};

export const setRevealOrigin = (rect) => origin = rect;