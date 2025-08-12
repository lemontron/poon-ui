import { useEffect, useRef, useImperativeHandle } from 'react';
import { useAnimatedValue } from './util/animated';
import { c } from './util';
import { PullIndicator } from './PullIndicator';
import { Pan } from './Pan';

export const ScrollView = ({
	className,
	onRefresh,
	horizontal,
	safePadding,
	children,
	pad,
	pills,
	ref,
}) => {
	const el = useRef();
	const spinnerEl = useRef();
	const refs = useRef({}).current;
	const pull = useAnimatedValue(0);
	const scroll = useAnimatedValue(0);
	const overscroll = useAnimatedValue(0);

	useImperativeHandle(ref, () => ({
		scrollToTop(duration = 0) {
			scroll.spring(0, duration);
		},
		scrollToBottom(duration = 0) {
			scroll.spring(el.current.scrollHeight, duration);
		},
	}));

	useEffect(() => {
		return overscroll.on(val => {
			if (onRefresh && val > 0) return; // disable overscroll when pulling to refresh
			el.current.style.transform = `${horizontal ? 'translateX' : 'translateY'}(${val / 4}px)`;
		});
	}, [!onRefresh]);

	useEffect(() => {
		return scroll.on((val, remainingTime) => {
			el.current[horizontal ? 'scrollLeft' : 'scrollTop'] = val;
		});
	}, []);

	useEffect(() => {
		if (!onRefresh) return;
		return pull.on(val => {
			const percent = (val / 70);
			spinnerEl.current.style.transform = `translateY(${val}px) rotate(${percent * 360}deg)`;
			spinnerEl.current.style.opacity = percent;
		});
	}, [onRefresh]);

	const handleScroll = () => {
		navigator.virtualKeyboard?.hide();
		document.activeElement.blur();
	};

	return (
		<div className={c('scroller-container', className, horizontal ? 'horizontal' : 'vertical', pills && 'pills')}>
			{onRefresh ? (
				<div className="scroller-pull">
					<PullIndicator pull={pull} ref={spinnerEl}/>
				</div>
			) : null}
			<Pan
				direction={horizontal ? 'x' : 'y'}
				className={c('scroller', safePadding && 'safe-padding', pad && 'pad')}
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
						return (!e.overscrolling && refs.canScrollHorizontal);
					} else if (e.direction === 'y') {
						if (onRefresh && e.overscrolling && e.distance > 0) return true; // Pull to refresh
						return (!e.overscrolling && refs.canScrollVertical);
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
						// Pull to refresh
						if (onRefresh && refs.initScrollTop === 0) {
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
				onOverscroll={val => {
					if (val === null) {
						overscroll.spring(0);
					} else {
						overscroll.setValue(val);
					}
				}}
			/>
		</div>
	);
};