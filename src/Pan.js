import React, { useRef } from 'react';
// import { isIOS } from './util/index.js';

const FLICK_SPEED = .25; // Pixels per ms
const CUTOFF_INTERVAL = 50; // Milliseconds

const getVelocity = (lastV = 0, newV, elapsedTime) => {
	const w1 = Math.min(elapsedTime, CUTOFF_INTERVAL) / CUTOFF_INTERVAL;
	const w0 = 1 - w1;
	return (lastV * w0) + (newV * w1);
};

let responderEl; // The element currently capturing input
// Will I add support for multiple? Only time will tell!!

const getXY = (e, i = 0) => ({
	'x': e.touches ? e.touches[i].clientX : e.clientX,
	'y': e.touches ? e.touches[i].clientY : e.clientY,
});

export const Pan = ({
	onDown,
	onMove,
	onCapture,
	onDoubleTap,
	onPan,
	onPinch,
	onUp,
	onScroll,
	ref,
	...props
}) => {
	const el = ref || useRef();
	const refs = useRef({}).current; // Internal key values

	const logVelocity = (e) => { // Log instantaneous velocity
		const now = e.nativeEvent.timeStamp;
		const elapsed = (now - refs.last.ts);
		if (elapsed > 0) {
			const vx = (refs.x - refs.last.x) / elapsed;
			const vy = (refs.y - refs.last.y) / elapsed;
			refs.v = {'x': getVelocity(refs.v.x, vx, elapsed), 'y': getVelocity(refs.v.y, vy, elapsed)};
			refs.last = {'x': refs.x, 'y': refs.y, 'ts': now};
		}
	};

	const down = (e) => {
		// Prevent iOS gesture on the edges
		// if (isIOS && e.touches.length === 1) {
		// 	const touch = e.touches[0];
		// 	if (
		// 		touch.clientX < window.innerWidth * 0.1 ||
		// 		touch.clientX > window.innerWidth * 0.9
		// 	) e.preventDefault();
		// }

		// Handle pinch second touch
		if (e.touches.length === 2) { // The first touch already happened
			const t0 = getXY(e, 0), t1 = getXY(e, 1); // Get two touches
			const dx = (t0.x - t1.x), dy = (t0.y - t1.y); // Distance between touches
			refs.pinch = {d0: Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))};
			return;
		}

		// Clear previous values
		responderEl = null;
		for (let key in refs) delete refs[key];

		const {x, y} = getXY(e);
		const {width, height} = el.current.getBoundingClientRect();
		Object.assign(refs, {
			'x': x,
			'y': y,
			'size': {'x': width, 'y': height}, // Size of the element
			'locked': false, // Direction
			'touch': false, // Whether we've captured the touch
			'origin': {x, y}, // Initial touch position
			'd': {x: 0, y: 0}, // Distance
			'v': {x: 0, y: 0}, // Velocity
			's': {x: 0, y: 0}, // Speed
			'flick': null,
			'last': {'ts': e.nativeEvent.timeStamp, x, y},
		});

		if (onDown) onDown(refs); // Consider if this needs to stay
	};

	const move = (e) => {
		if (responderEl && responderEl !== el.current) return;

		if (refs.pinch) { // Pinch mode
			if (e.touches.length === 2) {
				refs.locked = 'pinch'; // pinch mode

				const t0 = getXY(e, 0), t1 = getXY(e, 1);
				const dx = (t0.x - t1.x), dy = (t0.y - t1.y);
				refs.pinch.d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

				if (onPinch) onPinch({
					'center': {'x': (t0.x + t1.x) / 2, 'y': (t0.y + t1.y) / 2},
					'scale': (refs.pinch.d / refs.pinch.d0),
				});
			}
		} else { // Single touch mode
			const {x, y} = getXY(e);

			refs.x = x;
			refs.y = y;
			logVelocity(e);
			refs.d = {'x': (refs.x - refs.origin.x), 'y': (refs.y - refs.origin.y)};

			if (!refs.locked) { // Consider locking scroll direction
				const absX = Math.abs(refs.d.x), absY = Math.abs(refs.d.y); // Get absolute distance
				if (absY > 10 || absX > 10) refs.locked = (absY > absX) ? 'y' : 'x';
			}
		}

		if (refs.locked) {
			refs.distance = refs.d[refs.locked]; // Reduce information

			if (!refs.touch) { // Check if we should start capturing
				refs.touch = onCapture({
					'direction': refs.locked,
					'distance': refs.d[refs.locked],
					'size': refs.size[refs.locked],
					'pinch': refs.pinch,
				});
				// console.log('Touch', refs.touch);
			}

			if (refs.touch) {
				e.stopPropagation();
				responderEl = el.current; // capture event

				if (onMove) onMove({
					'd': refs.d,
					'direction': refs.locked,
					'distance': refs.d[refs.locked],
					'velocity': refs.v[refs.locked],
					'size': refs.size[refs.locked],
				});
			}
		}
	};

	const up = (e) => {
		if (e.touches.length > 0) return; // Still touching, not actually up
		if (responderEl && responderEl !== el.current) return;

		if (!refs.touch) return;
		logVelocity(e);

		const velocity = refs.v[refs.locked];
		const speed = Math.abs(velocity);
		const distance = refs.d[refs.locked];
		const size = refs.size[refs.locked];

		if (refs.locked) {
			// Detect flick by speed or distance
			const flick = (speed >= FLICK_SPEED && Math.sign(velocity)) ||
				(Math.abs(distance) > (size / 2) && Math.sign(distance));

			if (onUp) onUp({
				'distance': distance,
				'flick': flick * -1, // Invert direction for use with pagers
				'flickMs': Math.min((size - Math.abs(distance)) / speed, 300),
				'direction': refs.locked,
				'velocity': velocity,
				'size': size,
			});
		}
	};

	const wheel = (e) => {
		el.current.scrollTop += e.deltaY;
		const {width, height} = el.current.getBoundingClientRect();
		if (onPan) onPan({
			// 'x': {'distance': e.deltaX, 'size': width},
			'x': {'distance': 0, 'size': width}, // Disable horizontal scrolling for now
			'y': {'distance': e.deltaY, 'size': height},
		});
	};

	return (
		<div
			ref={el}
			{...props}
			onTouchStart={down}
			onTouchMove={move}
			onTouchEnd={up}
			onWheel={wheel}
			onDoubleClick={onDoubleTap}
		/>
	);
};