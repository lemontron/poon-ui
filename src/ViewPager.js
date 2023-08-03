import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { usePanGestures } from './util/gestures';
import { clamp, useAnimatedValue } from './util/animated';
import { c } from './util';

const PagerDot = ({pan, i, width}) => {
	const el = useRef();

	useEffect(() => {
		if (!width) return;
		const stop = (i * width);
		const tabWidth = (width / 3);

		return pan.on(value => {
			const d = Math.min(Math.abs(stop - value), tabWidth);
			el.current.style.opacity = Math.min(1, 1.5 - (d / tabWidth));
		});
	}, [width]);

	return <div className="pager-dot" ref={el} style={{opacity: pan.value === i ? 1 : .5}}/>;
};

const PagerTabTitle = ({title, i, pan, width, onPress}) => {
	const el = useRef();
	useEffect(() => {
		if (!width) return;
		const stop = (i * width);
		const tabWidth = (width / 3);

		return pan.on(value => {
			const d = Math.min(Math.abs(stop - value), tabWidth);
			el.current.style.opacity = 1.5 - (d / tabWidth);
		});
	}, [width]);
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

export const ViewPager = forwardRef(({titles, children, vertical, dots, className}, ref) => {
	const pan = useAnimatedValue(0);
	const indicatorEl = useRef();
	const scrollerEl = useRef();
	const refs = useRef({}).current;

	useImperativeHandle(ref, () => ({
		scrollToPage: (i) => {
			if (vertical) {
				pan.spring(i * height);
			} else {
				pan.spring(i * width);
			}
		},
	}));

	const {width, height} = usePanGestures(scrollerEl, {
		enablePointerControls: true,
		onCapture: e => { // release control when scrolled to left edge
			if (vertical) {
				if (e.locked === 'v') {
					if (e.d.y < 0) return true;
					return (refs.initPan - e.d.y) > 0;
				}
			} else {
				if (e.locked === 'h') {
					if (e.d.x < 0) return true;
					return (refs.initPan - e.d.x) > 0;
				}
			}
		},
		onDown: e => {
			if (vertical) {
				refs.currentPage = Math.round(pan.value / e.height);
				refs.initPan = pan.value;
			} else {
				refs.currentPage = Math.round(pan.value / e.width);
				refs.initPan = pan.value;
			}
		},
		onMove: e => {
			if (vertical) {
				const val = clamp(refs.initPan - e.d.y, 0, e.height * (children.length - 1));
				pan.setValue(val);
			} else {
				const val = clamp(refs.initPan - e.d.x, 0, e.width * (children.length - 1));
				pan.setValue(val);
			}
		},
		onUp: e => {
			if (vertical) {
				if (e.flick.y < 0) { // increment page
					pan.spring(height * clamp(refs.currentPage + 1, 0, children.length - 1));
				} else if (e.flick.y > 0) { // decrement page
					pan.spring(height * clamp(refs.currentPage - 1, 0, children.length - 1));
				} else {
					const landingPage = clamp(Math.round(pan.value / e.height), 0, children.length - 1);
					pan.spring(landingPage * height);
				}
			} else {
				if (e.flick.x < 0) { // increment page
					pan.spring(width * clamp(refs.currentPage + 1, 0, children.length - 1));
				} else if (e.flick.x > 0) { // decrement page
					pan.spring(width * clamp(refs.currentPage - 1, 0, children.length - 1));
				} else {
					const landingPage = clamp(Math.round(pan.value / e.width), 0, children.length - 1);
					pan.spring(landingPage * width);
				}
			}
		},
		onPan: e => {
			console.log('Pan:', e.d.x, e.d.y);
			pan.setValue(clamp(pan.value + e.d.x, 0, width * (children.length - 1)));
		},
	}, [children]);

	useEffect(() => {
		return pan.on(value => {
			scrollerEl.current.style.transform = `translate${vertical ? 'Y' : 'X'}(-${value}px)`;
			if (indicatorEl.current) indicatorEl.current.style.transform = `translateX(${value / children.length}px)`;
		});
	}, [width]);

	const changeTab = (i) => {
		pan.spring(i * width);
	};

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
							width={width}
							onPress={changeTab}
						/>
					))}
					{width ? (
						<div
							className="pager-tabs-indicator"
							ref={indicatorEl}
							style={{width: width / titles.length}}
						/>
					) : null}
				</div>
			) : null}
			<div className="pager-scroller">
				<div
					className="pager-canvas"
					ref={scrollerEl}
					style={{transform: vertical ? 'translateX(0px)' : 'translateY(0px)'}}
				>
					{React.Children.map(children, (child, i) => (
						<div key={i} className="pager-page" children={child}/>
					))}
				</div>
			</div>
			{dots ? (
				<div className="pager-dots">
					{React.Children.map(children, (child, i) => (
						<PagerDot key={i} pan={pan} width={width} i={i}/>
					))}
				</div>
			) : null}
		</div>
	);
});