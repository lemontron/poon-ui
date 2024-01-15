import { useEffect, useRef } from 'react';
import { useSize } from './size.js';

const FLICK_SPEED = .25; // Pixels per ms
const CUTOFF_INTERVAL = 50; // Milliseconds
const LISTENER_OPTIONS = {capture: false, passive: false};

const getVelocity = (lastV = 0, newV, elapsedTime) => {
	const w1 = Math.min(elapsedTime, CUTOFF_INTERVAL) / CUTOFF_INTERVAL;
	const w0 = 1 - w1;
	return (lastV * w0) + (newV * w1);
};

let responderEl; // The element currently capturing input

const getXY = (e, i = 0) => {
	return {
		'x': e.touches ? e.touches[i].clientX : e.clientX,
		'y': e.touches ? e.touches[i].clientY : e.clientY,
	};
};

export const useGesture = (el, opts = {}, deps) => {
	const {width, height} = useSize(el);
	const refs = useRef({}).current; // Internal key values

	useEffect(() => {
		if (!el.current) return;

		const logVelocity = (now) => { // Log instantaneous velocity
			const elapsed = (now - refs.last.ts);
			if (elapsed > 0) {
				const vx = (refs.x - refs.last.x) / elapsed;
				const vy = (refs.y - refs.last.y) / elapsed;
				refs.v = {'x': getVelocity(refs.v.x, vx, elapsed), 'y': getVelocity(refs.v.y, vy, elapsed)};
				refs.last = {'x': refs.x, 'y': refs.y, 'ts': now};
			}
		};

		const down = (e) => {
			if (e.pageX < 10) e.preventDefault();

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
			Object.assign(refs, {
				'x': x,
				'y': y,
				'size': {'x': width, 'y': height}, // Size of the element
				'width': width, // Todo: remove
				'height': height, // Todo: remove
				'locked': false, // Direction
				'touch': false, // Whether we've captured the touch
				'origin': {x, y}, // Initial touch position
				'd': {x: 0, y: 0}, // Distance
				'v': {x: 0, y: 0}, // Velocity
				's': {x: 0, y: 0}, // Speed
				'flick': null,
				'last': {'ts': e.timeStamp, x, y},
			});

			if (opts.onDown) opts.onDown(refs); // Consider if this needs to stay
		};

		const move = (e) => {
			if (responderEl && responderEl !== el.current) return;

			if (refs.pinch) { // Pinch mode
				if (e.touches.length === 2) {
					refs.locked = 'pinch'; // pinch mode

					const t0 = getXY(e, 0), t1 = getXY(e, 1);
					const dx = (t0.x - t1.x), dy = (t0.y - t1.y);
					refs.pinch.d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

					if (opts.onPinch) opts.onPinch({
						'center': {'x': (t0.x + t1.x) / 2, 'y': (t0.y + t1.y) / 2},
						'scale': (refs.pinch.d / refs.pinch.d0),
					});
				}
			} else { // Single touch mode
				const {x, y} = getXY(e);
				refs.x = x;
				refs.y = y;
				logVelocity(e.timeStamp);
				refs.d = {'x': (refs.x - refs.origin.x), 'y': (refs.y - refs.origin.y)};

				if (!refs.locked) { // Consider locking scroll direction
					const absX = Math.abs(refs.d.x), absY = Math.abs(refs.d.y); // Get absolute distance
					if (absY > 10 || absX > 10) refs.locked = (absY > absX) ? 'y' : 'x';
				}
			}

			if (refs.locked) {
				// Reduce information
				if (refs.locked === 'x') {
					refs.distance = refs.d.x;
				} else if (refs.locked === 'y') {
					refs.distance = refs.d.y;
				}

				if (!refs.touch) { // Check if we should start capturing
					refs.touch = opts.onCapture({
						'direction': refs.locked,
						'distance': refs.d[refs.locked],
						'size': refs.size[refs.locked],
						'pinch': refs.pinch,
					});

					// if (refs.touch) console.log('Captured!', el.current);
				}

				if (refs.touch) {
					e.stopPropagation();
					responderEl = el.current; // capture event

					if (opts.onMove) opts.onMove({
						'd': refs.d,
						'direction': refs.locked,
						'distance': refs.d[refs.locked],
						'velocity': refs.v[refs.locked],
						'size': refs.size[refs.locked],
					}, e);
				}
			}
		};

		const up = (e) => {
			if (e.touches.length > 0) return; // Still touching, not actually up
			if (responderEl && responderEl !== el.current) return;

			if (!refs.touch) return;
			logVelocity(e.timeStamp);

			const velocity = refs.v[refs.locked];
			const speed = Math.abs(velocity);
			const distance = refs.d[refs.locked];
			const size = refs.size[refs.locked];

			if (refs.locked) {
				// Detect flick by speed or distance
				const flick = (speed >= FLICK_SPEED && Math.sign(velocity)) ||
					(Math.abs(distance) > (size / 2) && Math.sign(distance));

				if (opts.onUp) opts.onUp({
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
			if (opts.onPan) opts.onPan({
				'x': {'distance': e.deltaX, 'size': width},
				'y': {'distance': e.deltaY, 'size': height},
			});
		};

		el.current.addEventListener('touchstart', down, LISTENER_OPTIONS);
		el.current.addEventListener('touchmove', move, LISTENER_OPTIONS);
		el.current.addEventListener('touchend', up, LISTENER_OPTIONS);
		el.current.addEventListener('wheel', wheel, LISTENER_OPTIONS);
		if (opts.onDoubleTap) el.current.addEventListener('dblclick', opts.onDoubleTap, LISTENER_OPTIONS);

		return () => {
			if (!el.current) return;
			el.current.removeEventListener('touchstart', down);
			el.current.removeEventListener('touchmove', move);
			el.current.removeEventListener('touchend', up);
			el.current.removeEventListener('wheel', wheel);
			if (opts.onDoubleTap) el.current.removeEventListener('dblclick', opts.onDoubleTap);
		};
	}, [el, height, width, deps]);

	return {height, width, };
};