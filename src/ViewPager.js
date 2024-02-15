import React, { Children, forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { useAnimatedValue } from './util/animated';
import { c, createClamp, toPercent } from './util';
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

export const ViewPager = forwardRef(({
	titles,
	children,
	vertical,
	dots,
	className,
	page = 0,
	gap = 0,
	enableScrolling = true,
}, ref) => {
	const pan = useAnimatedValue(page);
	const indicatorEl = useRef();
	const scrollerEl = useRef();
	const refs = useRef({}).current;
	const lastIndex = Children.count(children) - 1;
	const orientation = vertical ? 'y' : 'x';
	const clamp = createClamp(0, lastIndex);

	useImperativeHandle(ref, () => ({
		scrollToPage: (i) => pan.spring(clamp(i)),
	}));

	const {width, height} = useSize(scrollerEl);

	useEffect(() => {
		pan.spring(page);
	}, [page]);

	useEffect(() => {
		return pan.on(value => {
			if (vertical) {
				console.log('PAN VERT:', value, height);
				scrollerEl.current.scrollTop = (value * height) + (gap * value);
			} else {
				scrollerEl.current.scrollLeft = (value * width) + (gap * value);
			}
			if (indicatorEl.current) indicatorEl.current.style.transform = `translateX(${toPercent(value)})`;
		});
	}, [vertical, height, width]);

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
							onPress={pan.spring}
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
				onCapture={(e) => {
					if (e.direction === orientation) {
						if (e.distance < 0) return true; // Don't capture at the left edge
						return (refs.initPan - (e.distance / e.size)) > 0;
					}
				}}
				onDown={(e) => {
					pan.end();
					refs.currentPage = Math.round(pan.value);
					refs.initPan = pan.value;
				}}
				onMove={(e) => {
					const val = clamp(refs.initPan - (e.distance / e.size));
					pan.setValue(val);
				}}
				onPan={enableScrolling && ((components) => { // ScrollWheel
					const e = components[orientation];
					const pos = pan.value - (e.distance / e.size);
					pan.setValue(clamp(pos));
				})}
				onUp={(e) => {
					if (e.flick) {
						const page = clamp(refs.currentPage + e.flick);
						pan.spring(page, e.flickMs);
					} else { // Snap back to current page
						const page = clamp(Math.round(pan.value));
						pan.spring(page);
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