import React, { Fragment, forwardRef, useEffect, useRef, useImperativeHandle } from 'react';
import { useAnimatedValue } from './util/animated';
import { c } from './util';
import { PullIndicator } from './PullIndicator';
import { useGesture } from './util/gesture.js';

export const ScrollView = forwardRef(({children, className, onRefresh, horizontal}, ref) => {
	const el = useRef();
	const spinnerEl = useRef();
	const refs = useRef({}).current;
	const pull = useAnimatedValue(0);
	const scroll = useAnimatedValue(0);

	useImperativeHandle(ref, () => ({
		scrollToTop() {
			scroll.spring(0);
		},
		scrollToBottom() {
			scroll.spring(el.current.scrollHeight);
		},
	}));

	useGesture(el, {
		onDown() {
			refs.canScrollVertical = (el.current.scrollHeight > el.current.clientHeight);
			refs.canScrollHorizontal = (el.current.scrollWidth > el.current.clientWidth);
			refs.initScrollTop = el.current.scrollTop;
			refs.initScrollLeft = el.current.scrollLeft;
			scroll.end();
		},
		onCapture(e) {
			if (e.direction === 'x') return refs.canScrollHorizontal;
			if (e.direction === 'y') {
				if (onRefresh && el.current.scrollTop === 0 && e.distance > 0) return true; // Capture pull to refresh
				if (!refs.canScrollVertical) return false; // Don't capture if can't scroll
				if (refs.initScrollTop === 0 && e.distance < 0) return true; // beginning to scroll down
				return (refs.initScrollTop > 0);
			}
		},
		onMove(e) {
			if (e.direction === 'y') {
				if (onRefresh && refs.initScrollTop === 0 && e.distance > 0) { // Reveal pull to refresh indicator
					pull.setValue(Math.min(70, e.distance));
				} else {
					scroll.setValue(refs.initScrollTop - e.distance);
				}
			} else if (e.direction === 'x') {
				scroll.setValue(refs.initScrollLeft - e.distance);
			}
		},
		onUp(e) {
			if (e.direction === 'y') {
				if (onRefresh && refs.initScrollTop === 0) { // Pull to refresh
					if (e.distance > 70) {
						pull.spring(0).then(onRefresh);
					} else {
						pull.spring(0);
					}
				} else if (e.velocity) { // Coast scrolling
					scroll.spring(scroll.value - (e.velocity * 1000), 1000);
				}
			} else if (e.direction === 'h') {
				if (e.velocity) scroll.spring(scroll.value - (e.velocity * 1000), 1000); // Coast scrolling
			}
		},
	});

	useEffect(() => {
		return scroll.on(val => {
			if (horizontal) {
				el.current.scrollLeft = val;
			} else {
				el.current.scrollTop = val;
			}
		});
	}, []);

	useEffect(() => {
		if (!onRefresh) return;
		return pull.on(val => {
			const percent = (val / 70);
			spinnerEl.current.style.transform = `translateY(${val}px) rotate(${percent * 360}deg)`;
			spinnerEl.current.style.opacity = percent;
		});
	}, []);

	const handleScroll = () => {
		navigator.virtualKeyboard?.hide();
		document.activeElement.blur();
	};

	return (
		<Fragment>
			{onRefresh ? (
				<div className="list-pull">
					<PullIndicator pull={pull} ref={spinnerEl}/>
				</div>
			) : null}
			<div
				className={c('scroller', className, horizontal ? 'horizontal' : 'vertical')}
				ref={el}
				onScroll={handleScroll}
				children={children}
			/>
		</Fragment>
	);
});