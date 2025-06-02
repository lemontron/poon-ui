import React, { useEffect, useRef, useImperativeHandle } from 'react';
import { useAnimatedValue } from './util/animated';
import { c } from './util';
import { PullIndicator } from './PullIndicator';
import { Pan } from './Pan.js';

export const ScrollView = ({children, className, onRefresh, horizontal, safePadding, ref}) => {
	const el = useRef();
	const spinnerEl = useRef();
	const refs = useRef({}).current;
	const pull = useAnimatedValue(0);
	const scroll = useAnimatedValue(0);

	useImperativeHandle(ref, () => ({
		scrollToTop(duration = 0) {
			scroll.spring(0, duration);
		},
		scrollToBottom(duration = 0) {
			scroll.spring(el.current.scrollHeight, duration);
		},
	}));

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
		<div className={c('scroller-container', className)}>
			{onRefresh ? (
				<div className="list-pull">
					<PullIndicator pull={pull} ref={spinnerEl}/>
				</div>
			) : null}
			<Pan
				className={c('scroller', horizontal ? 'horizontal' : 'vertical', safePadding && 'safe-padding')}
				ref={el}
				onScroll={handleScroll}
				children={children}
				onDown={() => {
					refs.canScrollVertical = (el.current.scrollHeight > el.current.clientHeight);
					refs.canScrollHorizontal = (el.current.scrollWidth > el.current.clientWidth);
					refs.initScrollTop = el.current.scrollTop;
					refs.initScrollLeft = el.current.scrollLeft;
					scroll.end();
				}}
				onCapture={e => {
					if (e.direction === 'x') {
						return refs.canScrollHorizontal;
					}
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

						return (refs.initScrollTop > 0);
					}
				}}
				onMove={e => {
					if (e.direction === 'y') {
						if (onRefresh && refs.initScrollTop === 0 && e.distance > 0) { // Reveal pull to refresh indicator
							pull.setValue(Math.min(70, e.distance));
						} else {
							scroll.setValue(refs.initScrollTop - e.distance);
						}
					} else if (e.direction === 'x') {
						scroll.setValue(refs.initScrollLeft - e.distance);
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
						} else if (e.velocity) { // Coast scrolling
							scroll.spring(scroll.value - (e.velocity * 1000), 1000);
						}
					} else if (e.direction === 'h') {
						if (e.velocity) scroll.spring(scroll.value - (e.velocity * 1000), 1000); // Coast scrolling
					}
				}}
			/>
		</div>
	);
};