import { useRef } from 'react';

const FLICK_SPEED = .25; // Pixels per ms
const CUTOFF_INTERVAL = 50; // Milliseconds

const getVelocity = (lastV = 0, newV, elapsedTime) => {
	const w1 = Math.min(elapsedTime, CUTOFF_INTERVAL) / CUTOFF_INTERVAL;
	const w0 = 1 - w1;
	return (lastV * w0) + (newV * w1);
};

let overscrollEl; // The element currently overscrolling

const supportsTouchPointer = () => {
	if (typeof window === 'undefined') return false;
	return 'PointerEvent' in window && (
		navigator.maxTouchPoints > 0 ||
		window.matchMedia?.('(pointer: coarse)').matches
	);
};

const getXY = e => ({'x': e.clientX, 'y': e.clientY});

const cancelTouchable = e => {
	const touchable = e.target?.closest?.('.touchable');
	if (!touchable) return;
	touchable.dispatchEvent(new CustomEvent('touchablecancel'));
};

const getPinch = pointers => {
	const [t0, t1] = [...pointers.values()];
	const dx = (t0.x - t1.x), dy = (t0.y - t1.y);
	return {
		'center': {'x': (t0.x + t1.x) / 2, 'y': (t0.y + t1.y) / 2},
		'distance': Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)),
	};
};

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
	forcePointerEvents = false,
	style,
	ref,
	...props
}) => {
	const el = ref || useRef();
	const refs = useRef({}).current; // Internal key values
	const pointerEventsEnabled = enabled && (forcePointerEvents || supportsTouchPointer());
	const touchAction = direction === 'x' ? 'pan-y' : direction === 'y' ? 'pan-x' : 'none';

	const resetPointer = (pointerId) => {
		if (refs.pointers?.has(pointerId)) refs.pointers.delete(pointerId);
		if (el.current.hasPointerCapture(pointerId)) el.current.releasePointerCapture(pointerId);
		overscrollEl = null;
		if (onOverscroll) onOverscroll(null);
	};

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
		if (!forcePointerEvents && e.pointerType === 'mouse') return;
		if (e.pointerType === 'mouse' && !e.isPrimary) return;

		if (refs.pointers?.size > 0 && !e.isPrimary) {
			refs.pointers.set(e.pointerId, getXY(e));
			if (refs.pointers.size === 2) refs.pinch = {'d0': getPinch(refs.pointers).distance};
			return;
		}

		// Clear previous values
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
			'pointerId': e.pointerId,
			'pointers': new Map([[e.pointerId, {x, y}]]),
			'd': {x: 0, y: 0}, // Distance
			'v': {x: 0, y: 0}, // Velocity
			's': {x: 0, y: 0}, // Speed
			'flick': null,
			'last': {'ts': e.nativeEvent.timeStamp, x, y},
		});

		if (onDown) onDown(refs); // Consider if this needs to stay
	};

	const move = (e) => {
		if (!refs.pointers?.has(e.pointerId)) return;

		if (refs.pinch) { // Pinch mode
			refs.pointers.set(e.pointerId, getXY(e));

			if (refs.pointers.size === 2) {
				refs.locked = 'pinch'; // pinch mode

				const pinch = getPinch(refs.pointers);
				refs.pinch.d = pinch.distance;

				if (onPinch) onPinch({
					'center': pinch.center,
					'scale': (refs.pinch.d / refs.pinch.d0),
				});
			}
		} else { // Single touch mode
			if (e.pointerId !== refs.pointerId) return;

			const {x, y} = getXY(e);

			refs.pointers.set(e.pointerId, {x, y});
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

					// console.log('VERTICAL SCROLLER:', el.current, 'scrollTop:', scrollTop, 'max:', max, 'dist:', refs.d.x);

					if (scrollTop <= 0 && refs.d.y > 0) return true;
					if (scrollTop >= max && refs.d.y < 0) return true;
				} else if (refs.locked === 'x') {
					const scrollLeft = Math.round(el.current.scrollLeft);
					const max = (el.current.scrollWidth - el.current.clientWidth);

					// console.log('HORIZONTAL SCROLLER:', el.current, 'scrollLeft:', scrollLeft, 'max:', max, 'dist:', refs.d.x);

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
				// console.log('activated overscroll:', el.current, 'distance:', refs.distance);
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
				// if (refs.touch) console.log('Responder Activated:', el.current);
			}

			if (refs.overscrolling && onOverscroll && overscrollEl === el.current) { // Callback overscroll handler!
				// console.log('overscrolling');
				cancelTouchable(e);
				onOverscroll(refs.distance - overscrollEl.overscrollStart);
			}

			if (refs.touch) {
				e.preventDefault();
				e.stopPropagation();
				if (!el.current.hasPointerCapture(e.pointerId)) el.current.setPointerCapture(e.pointerId);
				cancelTouchable(e);

				if (onMove) onMove({
					'captured': el.current,
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
		if (!refs.pointers?.has(e.pointerId)) return;
		if (el.current.hasPointerCapture(e.pointerId)) el.current.releasePointerCapture(e.pointerId);

		refs.pointers.delete(e.pointerId);
		if (refs.pointers.size > 0) return; // Still touching, not actually up

		overscrollEl = null; // Reset overscroll element
		if (onOverscroll) onOverscroll(null);

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
				'flickMs': speed ? Math.min((size - Math.abs(distance)) / speed, 300) : 300,
				'direction': refs.locked,
				'velocity': velocity,
				'size': size,
			});
		}
	};

	const cancel = (e) => {
		resetPointer(e.pointerId);
	};

	const lostCapture = (e) => {
		if (e.target !== el.current) return;
		cancel(e);
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
			style={pointerEventsEnabled ? {touchAction, ...style} : style}
			onPointerDown={pointerEventsEnabled ? down : undefined}
			onPointerMove={pointerEventsEnabled ? move : undefined}
			onPointerUp={pointerEventsEnabled ? up : undefined}
			onPointerCancel={pointerEventsEnabled ? cancel : undefined}
			onLostPointerCapture={pointerEventsEnabled ? lostCapture : undefined}
			onWheel={enabled ? wheel : undefined}
			onDoubleClick={onDoubleTap}
		/>
	);
};
