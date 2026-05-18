import { useRef } from 'react';

const FLICK_SPEED = .25; // Pixels per ms
const CUTOFF_INTERVAL = 50; // Milliseconds

const getVelocity = (lastV = 0, newV, elapsedTime) => {
	const w1 = Math.min(elapsedTime, CUTOFF_INTERVAL) / CUTOFF_INTERVAL;
	const w0 = 1 - w1;
	return (lastV * w0) + (newV * w1);
};

let responderEl; // The element currently capturing input
let overscrollEl; // The element currently overscrolling

const getXY = (e, i = 0) => ({
	'x': e.touches ? e.touches[i].clientX : e.clientX,
	'y': e.touches ? e.touches[i].clientY : e.clientY,
});

export const Pan = ({
	direction,
	onDown,
	onMove,
	onCapture,
	onDoubleTap,
	onPan,
	onPinch,
	onUp,
	onScroll,
	onOverscroll,
	enabled = true,
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
		if (e.touches.length === 2) {
			const t0 = getXY(e, 0), t1 = getXY(e, 1);
			const dx = (t0.x - t1.x), dy = (t0.y - t1.y);
			refs.pinch = {'d0': Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))};
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

		const checkOverscroll = () => {
			if (refs.locked === direction) {
				if (refs.locked === 'y') {
					const scrollTop = Math.round(el.current.scrollTop);
					const max = (el.current.scrollHeight - el.current.clientHeight);

					if (scrollTop <= 0 && refs.d.y > 0) return true;
					if (scrollTop >= max && refs.d.y < 0) return true;
				} else if (refs.locked === 'x') {
					const scrollLeft = Math.round(el.current.scrollLeft);
					const max = (el.current.scrollWidth - el.current.clientWidth);

					if (scrollLeft <= 0 && refs.d.x > 0) return true;
					if (scrollLeft >= max && refs.d.x < 0) return true;
				}
			}
			return false;
		};

		if (refs.locked === direction) {
			refs.distance = refs.d[refs.locked]; // Reduce information
			refs.overscrolling = checkOverscroll();

			if (refs.overscrolling && !overscrollEl) { // Focus overscroll element
				overscrollEl = el.current;
				overscrollEl.overscrollStart = refs.distance; // Store initial overscroll position
			}

			if (!refs.touch) {
				refs.touch = onCapture({
					'direction': refs.locked,
					'distance': refs.d[refs.locked],
					'size': refs.size[refs.locked],
					'pinch': refs.pinch,
					'overscrolling': refs.overscrolling,
				});
			}

			if (refs.overscrolling && onOverscroll && overscrollEl === el.current) {
				onOverscroll(refs.distance - overscrollEl.overscrollStart);
			}

			if (refs.touch) {
				e.stopPropagation();
				responderEl = el.current;

				if (onMove) onMove({
					'captured': responderEl,
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

		overscrollEl = null; // Reset overscroll element
		if (onOverscroll) onOverscroll(null);

		if (responderEl && responderEl !== el.current) return;
		if (!refs.touch) return;

		logVelocity(e);

		const velocity = refs.v[refs.locked];
		const speed = Math.abs(velocity);
		const distance = refs.d[refs.locked];
		const size = refs.size[refs.locked];

		if (refs.locked) {
			const flick = (speed >= FLICK_SPEED && Math.sign(velocity)) ||
				(Math.abs(distance) > (size / 2) && Math.sign(distance));

			if (onUp) onUp({
				'distance': distance,
				'flick': flick * -1, // Invert direction for use with pagers
				'flickMs': speed ? Math.min((size - Math.abs(distance)) / speed, 300) : 300,
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
			onTouchStart={enabled ? down : undefined}
			onTouchMove={enabled ? move : undefined}
			onTouchEnd={enabled ? up : undefined}
			onWheel={enabled ? wheel : undefined}
			onDoubleClick={onDoubleTap}
		/>
	);
};
