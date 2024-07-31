import React, { Children, forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useAnimatedValue } from './util/animated';
import { c, createClamp, lerp, toPercent } from './util';
import { useSize } from './util/size.js';
import { Pan } from './Pan.js';
import { Touchable } from './Touchable.js';

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

const PagerTabTitle = ({title, i, pan, onClick}) => {
	const indicatorEl = useRef();
	const titleEl = useRef();

	const getOpacity = (value) => Math.max(0.5, 1 - Math.abs(i - value));
	const getLeft = (value) => toPercent(value - i);

	useEffect(() => {
		return pan.on(value => {
			titleEl.current.style.opacity = getOpacity(value);
			indicatorEl.current.style.left = getLeft(value);
		});
	}, []);

	return (
		<div className="pager-tab" onClick={() => onClick(i)}>
			<div
				className="pager-tab-title"
				ref={titleEl}
				children={title}
				style={{opacity: getOpacity(pan.value)}}
			/>
			<div className="pager-tab-indicator-track">
				<div
					className="pager-tab-indicator"
					ref={indicatorEl}
					style={{left: getLeft(pan.value)}}
				/>
			</div>
		</div>
	);
};

export const ViewPager = forwardRef(({
	titles,
	children,
	vertical,
	className,
	page = 0,
	gap = 0,
	onChangePage,
	enableScrolling = true,
	showDots = false,
	showButtons = false,
}, ref) => {
	// use internal state or external state!
	const [internalPage, setInternalPage] = useState(page);

	const pan = useAnimatedValue(page);
	const scrollerEl = useRef();
	const tabsEl = useRef();
	const refs = useRef({}).current;
	const numPages = Children.count(children);
	const lastIndex = numPages - 1;
	const orientation = vertical ? 'y' : 'x';
	const clamp = createClamp(0, lastIndex);

	const userInteractionChangePage = (page, flickMs) => {
		page = clamp(page);
		if (onChangePage) onChangePage(page);
		setInternalPage(page);
		pan.spring(page, flickMs);
		return page;
	};

	useImperativeHandle(ref, () => ({
		scrollToPage: userInteractionChangePage,
	}), [onChangePage]);

	const {width, height} = useSize(scrollerEl);

	useEffect(() => {
		setInternalPage(page);
		pan.spring(page);
	}, [page]);

	useEffect(() => {
		return pan.on(value => {
			if (vertical) {
				// console.log('PAN VERT:', value, height);
				scrollerEl.current.scrollTop = (value * height) + (gap * value);
			} else {
				scrollerEl.current.scrollLeft = (value * width) + (gap * value);
				if (tabsEl.current) { // scroll the tabs smoothly as we scroll the pager
					const overflowWidth = (tabsEl.current.scrollWidth - tabsEl.current.clientWidth);
					tabsEl.current.scrollLeft = lerp(value / lastIndex, 0, overflowWidth);
				}
			}
		});
	}, [vertical, height, width]);

	return (
		<div className={c('pager', vertical ? 'vertical' : 'horizontal', className)}>
			{titles ? (
				<div className="pager-tabs" ref={tabsEl}>
					{titles.map((title, i) => (
						<PagerTabTitle
							key={i}
							title={title}
							pan={pan}
							i={i}
							onClick={pan.spring}
						/>
					))}
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
						userInteractionChangePage(refs.currentPage + e.flick, e.flickMs);
					} else { // Snap back to current page
						userInteractionChangePage(Math.round(pan.value));
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
			{showDots ? (
				<div className="pager-dots">
					{Children.map(children, (child, i) => (
						<PagerDot key={i} pan={pan} i={i}/>
					))}
				</div>
			) : null}
			{showButtons ? (
				<div className="pager-buttons">
					<Touchable
						className="material-icons pager-button"
						onClick={() => userInteractionChangePage(pan.value - 1)}
						children="arrow_circle_left"
						disabled={internalPage === 0}
					/>
					<Touchable
						className="material-icons pager-button"
						onClick={() => userInteractionChangePage(pan.value + 1)}
						children="arrow_circle_right"
						disabled={internalPage === lastIndex}
					/>
				</div>
			) : null}
		</div>
	);
});