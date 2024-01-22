import React, { useEffect, useRef } from 'react';
import { useAnimation } from './util/animation.js';
import { clamp } from './util/index.js';
import { Pan } from './Pan.js';

export const GalleryItem = ({children, onClose}) => {
	const el = useRef(null);
	const anim = useAnimation({zoom: 1, panX: 0, panY: 0});

	useEffect(() => {
		return anim.on(val => {
			el.current.style.transform = `scale(${val.zoom}) translateX(${val.panX / val.zoom}px) translateY(${val.panY / val.zoom}px)`;
		});
	}, []);

	const getLimits = () => {
		const img = el.current.querySelector('img');

		// console.log('Zoomed:', img.clientHeight * anim.values.zoom, 'Regular:', img.clientHeight);

		const width = (img.clientWidth * anim.values.zoom);
		const height = (img.clientHeight * anim.values.zoom);

		return {
			'maxPanX': (width > el.current.clientWidth) ? ((width - el.current.clientWidth) / 2) : 0,
			'maxPanY': (height > el.current.clientHeight) ? ((height - el.current.clientHeight) / 2) : 0,
		};
	};

	return (
		<Pan
			className="gallery-item"
			ref={el}
			children={children}
			onCapture={(e) => {
				const {maxPanX, maxPanY} = getLimits();
				if (e.direction === 'x' && maxPanX > 0) return true;
				if (e.direction === 'y' && maxPanY > 0) return true;
				return !!e.pinch;
			}}
			onPinch={(e) => {
				// console.log('Pinch:', anim.initialValues.zoom, e.scale);
				const {maxPanX, maxPanY} = getLimits();
				const zoom = (anim.initialValues.zoom * e.scale);
				anim.set({
					'zoom': zoom,
					'panX': clamp(anim.initialValues.panX, -maxPanX, maxPanX),
					'panY': clamp(anim.initialValues.panY, -maxPanY, maxPanY),
				}, false);
			}}
			onMove={(e) => {
				if (anim.values.zoom <= 1) return;
				const {maxPanX, maxPanY} = getLimits();
				anim.set({
					'panX': maxPanX && clamp(anim.initialValues.panX + e.d.x, -maxPanX, maxPanX),
					'panY': maxPanY && clamp(anim.initialValues.panY + e.d.y, -maxPanY, maxPanY),
				}, false);
			}}
			onUp={(e) => {
				if (anim.values.zoom < 1) return anim.spring({'zoom': 1, 'panX': 0, 'panY': 0});
				if (anim.values.zoom > 3) return anim.spring({'zoom': 3});
				anim.end();
			}}
			onDoubleClick={() => {
				if (anim.values.zoom === 1) {
					anim.spring({'zoom': 3});
				} else {
					anim.spring({'zoom': 1, 'panX': 0, 'panY': 0});
				}
			}}
		/>
	);
};