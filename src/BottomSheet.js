import React, { forwardRef, useEffect, useRef } from 'react';
import { usePanGestures } from './util/gestures';
import { c } from './util';

export const BottomSheet = forwardRef(({
	className,
	visible,
	pan,
	children,
	onClose,
	onPress,
	showShade,
	showHandle,
}, ref) => {
	const shadeEl = useRef();
	const sheetEl = useRef();
	const {height} = usePanGestures(sheetEl, {
		onMove: (e) => {
			pan.setValue(e.height - Math.max(e.d.y / 100, e.d.y));
		},
		onUp: e => {
			if (e.flick.y === 1 || e.d.y > (e.height / 2)) {
				close();
			} else {
				pan.spring(e.height);
			}
		},
	});

	const close = () => pan.spring(0).then(onClose);

	useEffect(() => {
		if (!height) return;
		return pan.on(value => {
			sheetEl.current.style.transform = `translateY(-${value}px)`;
			if (shadeEl.current) shadeEl.current.style.opacity = (value / height);
		});
	}, [height]);

	useEffect(() => {
		if (!height) return;
		if (visible) { // show
			pan.spring(height);
		} else { // hide
			pan.spring(0).then(onClose);
		}
	}, [visible, height, onClose]);

	return (
		<div className="layer">
			{visible && showShade ? <div className="shade shade-bottom-sheet" ref={shadeEl} onClick={close}/> : null}
			<div ref={sheetEl} className={c('sheet', className)} onClick={onPress}>
				{showHandle ? <div className="handle"/> : null}
				{children}
			</div>
		</div>
	);
});