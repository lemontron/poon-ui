import { useEffect, useMemo, useRef, useState } from 'react';
import { randomId } from 'poon-router/util.js';

export const FLICK_SPEED = .25; // pixels per ms
const CUTOFF_INTERVAL = 50; // ms
const listenerOptions = {capture: false, passive: false};

const getVelocity = (lastV = 0, newV, elapsedTime) => {
	const w1 = Math.min(elapsedTime, CUTOFF_INTERVAL) / CUTOFF_INTERVAL;
	const w0 = 1 - w1;
	return (lastV * w0) + (newV * w1);
};

export const useSize = (el) => {
	// console.log('SIZE:', el);
	const [size, setSize] = useState({
		'width': el.current?.clientWidth,
		'height': el.current?.clientHeight,
	});
	useEffect(() => { // observe size of element
		if (!el.current) return;

		const ro = new ResizeObserver(entries => {
			const e = entries[0].borderBoxSize[0];
			setSize({'height': e.blockSize, 'width': e.inlineSize});
		});
		ro.observe(el.current);
		return () => ro.disconnect();
	}, [el.current]);
	return size;
};

let responderEl; // The element currently capturing input

export const usePanGestures = (el, opts = {}, deps) => {
	const {width, height} = useSize(el);
	const refs = useRef({'id': randomId()}).current;

	const handlers = useMemo(() => {
		if (!el.current) return {};

		const logVelocity = () => { // Log instantaneous velocity
			const now = Date.now();
			const elapsedTime = (now - refs.last.ts);
			if (elapsedTime > 0) {
				const vx = (refs.x - refs.last.x) / elapsedTime;
				const vy = (refs.y - refs.last.y) / elapsedTime;
				refs.v = {'x': getVelocity(refs.v.x, vx, elapsedTime), 'y': getVelocity(refs.v.y, vy, elapsedTime)};
				refs.last = {'x': refs.x, 'y': refs.y, 'ts': now};
			}
		};

		const down = (e) => {
			responderEl = null;

			if (e.touches.length > 1) {
				const dx = (e.touches[0].clientX - e.touches[1].clientX);
				const dy = (e.touches[0].clientY - e.touches[1].clientY);
				refs.pinch = {d0: Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))};
				return;
			}

			const x = e.touches ? e.touches[0].clientX : e.clientX;
			const y = e.touches ? e.touches[0].clientY : e.clientY;
			Object.assign(refs, {
				'width': width,
				'height': height,
				'current': {x, y},
				'touch': true,
				'origin': {x, y},
				'locked': false,
				'v': {x: 0, y: 0},
				's': {x: 0, y: 0},
				'd': {x: 0, y: 0},
				'flick': null,
				'last': {ts: Date.now(), x, y},
			});
			if (opts.onDown) opts.onDown(refs);
		};

		const shouldCapture = (e) => {
			if (opts.onCapture) return opts.onCapture(refs, e);
			return true;
		};

		const move = (e) => {
			if (responderEl && responderEl !== el.current) {
				if (!responderEl.className.includes('scroller')) e.preventDefault();
				return;
			}

			if (refs.pinch) {
				if (e.touches.length === 2) {
					const dx = (e.touches[0].clientX - e.touches[1].clientX);
					const dy = (e.touches[0].clientY - e.touches[1].clientY);

					refs.pinch.d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
					refs.pinch.ratio = (refs.pinch.d / refs.pinch.d0);
				} else {
					delete refs.pinch;
				}
			}

			refs.x = e.touches ? e.touches[0].clientX : e.clientX;
			refs.y = e.touches ? e.touches[0].clientY : e.clientY;
			logVelocity();
			refs.d = {'x': (refs.x - refs.origin.x), 'y': (refs.y - refs.origin.y)};
			refs.abs = {'x': Math.abs(refs.d.x), 'y': Math.abs(refs.d.y)};

			if (!refs.locked && (refs.abs.y > 10 || refs.abs.x > 10)) { // lock scroll direction
				refs.locked = (refs.abs.y > refs.abs.x) ? 'v' : 'h';
			}

			if (refs.locked) {
				refs.touch = shouldCapture(e);
				if (!refs.touch) return; // Let browser handle touch
				responderEl = el.current; // capture event
				if (opts.onMove) opts.onMove(refs, e);
			}
		};

		const up = () => {
			if (responderEl && responderEl !== el.current) return;
			if (!refs.touch || !refs.locked) return;
			logVelocity();
			refs.s = {'x': Math.abs(refs.v.x), 'y': Math.abs(refs.v.y)};
			refs.flick = {
				'x': refs.locked === 'h' && refs.s.x >= FLICK_SPEED && Math.sign(refs.v.x),
				'y': refs.locked === 'v' && refs.s.y >= FLICK_SPEED && Math.sign(refs.v.y),
			};
			if (opts.onUp) opts.onUp(refs);
		};

		const wheel = (e) => {
			el.current.scrollTop += e.deltaY;
			if (opts.onPan) opts.onPan({d: {x: e.deltaX, y: e.deltaY}});
		};

		return {
			onTouchStart: down,
			onTouchMove: move,
			onTouchEnd: up,
			onWheel: wheel,
		};
	}, [el, height, width, deps]);

	useEffect(() => {
		if (!el.current) return;
		el.current.addEventListener('touchstart', handlers.onTouchStart, listenerOptions);
		el.current.addEventListener('touchmove', handlers.onTouchMove, listenerOptions);
		el.current.addEventListener('touchend', handlers.onTouchEnd, listenerOptions);
		el.current.addEventListener('wheel', handlers.onWheel, listenerOptions);

		return () => {
			if (!el.current) return;
			el.current.removeEventListener('touchstart', handlers.onTouchStart);
			el.current.removeEventListener('touchmove', handlers.onTouchMove);
			el.current.removeEventListener('touchend', handlers.onTouchEnd);
			el.current.removeEventListener('wheel', handlers.onWheel);
		};
	}, [handlers, deps]);

	return {height, width};
};