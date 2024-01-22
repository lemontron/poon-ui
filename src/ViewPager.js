import React, { Children, forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useAnimatedValue, useSpring } from './util/animated';
import { c, createClamp, easeOutCubic, toPercent } from './util';
import { useSize } from './util/size.js';
import { Pan } from './Pan.js';

const PagerDot = ({pan, i}) => {
	const el = useRef();

	useEffect(() => {
		return pan.on(value => {
			const dist = Math.abs(i - value);
			el.current.style.opacity = Math.max(.5, 1 - dist);
		});
	}, []);

	return (
		<div
			className="pager-dot"
			ref={el}
			style={{opacity: pan.value === i ? 1 : .5}}
		/>
	);
};

const PagerTabTitle = ({title, i, pan, onPress}) => {
	const el = useRef();
	useEffect(() => {
		return pan.on(value => {
			const dist = Math.abs(i - value);
			el.current.style.opacity = Math.max(0.5, 1 - dist);
		});
	}, []);
	return (
		<div
			children={title}
			className="pager-tabs-title"
			onClick={() => onPress(i)}
			ref={el}
			style={{opacity: (pan.value === i) ? 1 : .5}}
		/>
	);
};

export const ViewPager = forwardRef(({titles, children, vertical, dots, className, page = 0, gap = 0}, ref) => {
	const pan = useAnimatedValue(page);
	const indicatorEl = useRef();
	const scrollerEl = useRef();
	const refs = useRef({}).current;
	const lastIndex = Children.count(children) - 1;
	const clamp = createClamp(0, lastIndex);
	const {width, height} = useSize(scrollerEl);
	const orientation = vertical ? 'y' : 'x';
	const spring = useSpring({
		'getValue': () => scrollerEl.current.scrollLeft,
		'setValue': (v) => scrollerEl.current.scrollLeft = v,
	});

	useImperativeHandle(ref, () => ({
		scrollToPage: (i) => pan.spring(clamp(i)),
	}));

	useEffect(() => { // Sync page change back to scroller
		scrollerEl.current.scrollTo({
			'top': vertical && (height + gap) * page,
			'left': vertical || (width + gap) * page,
			'behavior': 'smooth',
		});
	}, [page]);

	useEffect(() => {
		return pan.on(value => {
			if (indicatorEl.current) indicatorEl.current.style.transform = `translateX(${toPercent(value)})`;
		});
	}, [vertical, height, width]);

	const pressTab = (i) => spring((width + gap) * i);

	return (
		<div className={c('pager', vertical ? 'vertical' : 'horizontal', className)}>
			{titles ? (
				<div className="pager-tabs">
					{titles.map((title, i) => (
						<PagerTabTitle
							key={i}
							title={title}
							pan={pan}
							i={i}
							onPress={pressTab}
						/>
					))}
					{width ? (
						<div
							className="pager-tabs-indicator"
							ref={indicatorEl}
							style={{width: toPercent(1 / titles.length)}}
						/>
					) : null}
				</div>
			) : null}
			<Pan
				className="pager-scroller"
				ref={scrollerEl}
				onCapture={e => {
					if (e.direction === orientation) {
						if (e.distance < 0) return true; // Don't capture at the left edge
						return (refs.initPos - (e.distance / e.size)) > 0;
					}
				}}
				onDown={e => {
					console.log('DOWN:', e);

					pan.end();
					refs.currentPage = Math.round(pan.value);
					refs.initPos = pan.value;
				}}
				onUp={e => {
					console.log('UP:', e);

					if (e.flick) {
						const page = clamp(refs.currentPage + e.flick);
						spring(page * e.size, e.flickMs);
					} else { // Snap back to current page
						const page = clamp(Math.round(pan.value));
						spring(page * e.size);
					}
				}}
				onScroll={e => {
					if (vertical) {
						pan.setValue(clamp(e.currentTarget.scrollTop / height));
					} else {
						pan.setValue(clamp(e.currentTarget.scrollLeft / width));
					}
				}}
			>
				{Children.map(children, (child, i) => (
					<div
						key={i}
						className="pager-page"
						children={child}
						style={gap ? (vertical ? {marginBottom: gap} : {marginRight: gap}) : undefined}
					/>
				))}
			</Pan>
			{dots ? (
				<div className="pager-dots">
					{Children.map(children, (child, i) => (
						<PagerDot key={i} pan={pan} i={i}/>
					))}
				</div>
			) : null}
		</div>
	);
});