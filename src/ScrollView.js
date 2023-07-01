import React, { forwardRef, Fragment, useEffect, useRef } from 'react';
import { usePanGestures } from './util/gestures';
import { useAnimatedValue } from './util/animated';
import { c } from './util';
import { PullIndicator } from './PullIndicator';

export const ScrollView = forwardRef(({children, className, onRefresh, horizontal}, ref) => {
	const el = ref || useRef();
	const spinnerEl = useRef();
	const refs = useRef({}).current;
	const pull = useAnimatedValue(0);

	usePanGestures(el, {
		onDown: () => {
			refs.canScrollVertical = (el.current.scrollHeight > el.current.clientHeight);
			refs.canScrollHorizontal = (el.current.scrollWidth > el.current.clientWidth);
			refs.initScrollTop = el.current.scrollTop;
			refs.initScrollLeft = el.current.scrollLeft;
		},
		onCapture: (e) => {
			if (e.locked === 'v') {
				if (onRefresh && el.current.scrollTop === 0 && e.d.y > 0) return true; // pull to refresh
				if (!refs.canScrollVertical) return false; // not a scroller
				if (refs.initScrollTop === 0 && e.d.y < 0) return true; // beginning to scroll down
				return (refs.initScrollTop > 0);
			}
			if (e.locked === 'h') {
				if (!refs.canScrollHorizontal) return false;
				return (refs.initScrollLeft > 0);
			}
		},
		onMove: (e) => {
			if (onRefresh && refs.initScrollTop === 0) pull.setValue(Math.min(70, e.d.y));
		},
		onUp: (e) => {
			if (onRefresh && refs.initScrollTop === 0) {
				if (e.d.y > 70) {
					pull.spring(0).then(onRefresh);
				} else {
					pull.spring(0);
				}
			}
		},
	});

	useEffect(() => {
		if (!onRefresh) return;
		return pull.on(val => {
			const percent = (val / 70);
			spinnerEl.current.style.transform = `translateY(${val}px) rotate(${percent * 360}deg)`;
			spinnerEl.current.style.opacity = percent;
		});
	}, []);

	const scroll = () => {
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
				onScroll={scroll}
				children={children}
			/>
		</Fragment>
	);
});