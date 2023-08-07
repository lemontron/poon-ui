import { useEffect, useRef } from 'react';
import { randomId } from 'poon-router/util.js';
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

const getXY = (e, i = 0) => ({
    'x': e.touches ? e.touches[i].clientX : e.clientX,
    'y': e.touches ? e.touches[i].clientY : e.clientY,
});

export const useGesture = (el, opts = {}, deps) => {
    const {width, height} = useSize(el);
    const refs = useRef({'id': randomId()}).current;

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
            responderEl = null;

            const {x, y} = getXY(e);
            Object.assign(refs, {
                'width': width,
                'height': height,
                'locked': false, // Direction
                'touch': true,
                'origin': {x, y}, // Initial touch position
                'current': {x, y}, // Current touch position
                'v': {x: 0, y: 0}, // Velocity
                's': {x: 0, y: 0}, // Speed
                'd': {x: 0, y: 0}, // Distance
                'flick': null,
                'last': {ts: performance.now(), x, y},
            });

            if (e.touches.length === 2) {
                const touch1 = getXY(e, 1);
                const dx = (x - touch1.x), dy = (y - touch1.y);
                refs.pinch = {d0: Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))};
                return;
            }

            if (opts.onDown) opts.onDown(refs);
        };

        const shouldCapture = (e) => {
            if (opts.onCapture) return opts.onCapture({
                'direction': refs.locked,
                'distance': refs.distance,
                'size': refs.locked === 'x' ? refs.width : refs.height,
            });
            return true;
        };

        const move = (e) => {
            if (responderEl && responderEl !== el.current) return;

            const {x, y} = getXY(e);

            if (refs.pinch) {
                if (e.touches.length === 2) {
                    refs.locked = 'pinch'; // pinch mode

                    const touch1 = getXY(e, 1);

                    const dx = (x - touch1.x);
                    const dy = (y - touch1.y);

                    refs.pinch.d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
                    refs.pinch.scale = (refs.pinch.d / refs.pinch.d0);
                    refs.pinch.center = {
                        x: (x + touch1.x) / 2,
                        y: (y + touch1.y) / 2,
                    };
                    if (opts.onPinch) opts.onPinch(refs);
                } else {
                    delete refs.pinch;
                }
            } else {
                refs.x = x;
                refs.y = y;
                logVelocity(e.timeStamp);
                refs.d = {'x': (refs.x - refs.origin.x), 'y': (refs.y - refs.origin.y)};
                refs.abs = {'x': Math.abs(refs.d.x), 'y': Math.abs(refs.d.y)};

                if (!refs.locked && (refs.abs.y > 10 || refs.abs.x > 10)) { // lock scroll direction
                    refs.locked = (refs.abs.y > refs.abs.x) ? 'y' : 'x';
                }
            }

            if (refs.locked) {
                // Reduce information
                if (refs.locked === 'x') {
                    refs.distance = refs.d.x;
                    refs.size = refs.width;
                }
                if (refs.locked === 'y') {
                    refs.distance = refs.d.y;
                    refs.size = refs.height;
                }

                refs.touch = shouldCapture(e);
                if (!refs.touch) return; // Let browser handle touch
                responderEl = el.current; // capture event

                if (opts.onMove) opts.onMove({
                    'd': refs.d,
                    'direction': refs.locked,
                    'distance': refs.distance,
                    'velocity': refs.v[refs.locked],
                    'size': refs.size,
                }, e);
            }
        };

        const up = (e) => {
            if (responderEl && responderEl !== el.current) return;
            if (!refs.touch || !refs.locked) return;
            logVelocity(e.timeStamp);

            const velocity = refs.v[refs.locked];
            const speed = Math.abs(velocity);
            const distance = refs.d[refs.locked];

            // Detect flick by speed or distance
            const flick = (speed >= FLICK_SPEED && Math.sign(velocity)) ||
                (Math.abs(distance) > (refs.size / 2) && Math.sign(distance));

            if (opts.onUp) opts.onUp({
                'direction': refs.locked,
                'velocity': velocity,
                'flick': flick,
                'flickedLeft': (refs.locked === 'x' && flick === -1),
                'flickedRight': (refs.locked === 'x' && flick === 1),
                'flickedUp': (refs.locked === 'y' && flick === -1),
                'flickedDown': (refs.locked === 'y' && flick === 1),
                'springMs': (speed > FLICK_SPEED) ? (refs.size - Math.abs(distance) / speed) : 300,
                'size': refs.size,
            });
        };

        const wheel = (e) => {
            el.current.scrollTop += e.deltaY;
            if (opts.onPan) opts.onPan({d: {x: e.deltaX, y: e.deltaY}});
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

    return {height, width};
};