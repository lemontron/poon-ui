import React, { Fragment, forwardRef, useEffect, useRef, useImperativeHandle } from 'react';
import { useAnimatedValue, useSpring } from './util/animated';
import { c } from './util';
import { PullIndicator } from './PullIndicator';
import { Pan } from './Pan.js';

export const ScrollView = forwardRef(({children, className, onRefresh, horizontal}, ref) => {
	const el = useRef();
	const spinnerEl = useRef();
	const refs = useRef({}).current;
	const pull = useAnimatedValue(0);
	const scroll = useAnimatedValue(0);

	const spring = useSpring({
		'getValue': () => horizontal ? el.current.scrollLeft : el.current.scrollTop,
		'setValue': (v) => horizontal ? el.current.scrollLeft = v : el.current.scrollTop = v,
	});

	useImperativeHandle(ref, () => ({
		scrollToTop(duration = 0) {
			spring(0, duration);
		},
		scrollToBottom(duration = 0) {
			spring(el.current.scrollHeight, duration);
		},
	}));

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
			<Pan
				className={c('scroller', className, horizontal ? 'horizontal' : 'vertical')}
				ref={el}
				onScroll={handleScroll}
				children={children}
				onDown={() => {
					refs.canScrollVertical = (el.current.scrollHeight > el.current.clientHeight);
					refs.canScrollHorizontal = (el.current.scrollWidth > el.current.clientWidth);
					refs.initScrollTop = el.current.scrollTop;
					refs.initScrollLeft = el.current.scrollLeft;
				}}
				onCapture={e => {
					if (e.direction === 'x') return refs.canScrollHorizontal;
					if (e.direction === 'y') {
						if (onRefresh && el.current.scrollTop === 0 && e.distance > 0) {
							// console.loc('capture pull to refresh');
							return true;
						}
						if (!refs.canScrollVertical) {
							// console.log('dont capture if cant scroll');
							return false;
						}
						if (refs.initScrollTop === 0 && e.distance < 0) {
							// console.log('beginning to scroll down');
							return true;
						}

						// console.log('capturing');
						return (refs.initScrollTop > 0);
					}
				}}
				onMove={e => {
					if (e.direction === 'y') {
						if (onRefresh && refs.initScrollTop === 0 && e.distance > 0) { // Reveal pull to refresh indicator
							pull.setValue(Math.min(70, e.distance));
						}
					}
				}}
				onUp={e => {
					if (e.direction === 'y') {
						if (onRefresh && refs.initScrollTop === 0) { // Pull to refresh
							if (e.distance > 70) {
								pull.spring(0).then(onRefresh);
							} else {
								pull.spring(0);
							}
						}
					}
				}}
			/>
		</Fragment>
	);
});