import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { navigation } from 'poon-router';
import { useAnimatedValue } from './util/animated';
import { useGesture } from './util/gesture';
import { ScreenHeader } from './ScreenHeader';
import { Placeholder } from './Placeholder';
import { Shade } from './Shade';
import { c } from './util/index.js';

export const Card = forwardRef(({
	title,
	subtitle,
	children,
	footer,
	headerRight,
	SearchComponent,
	disableGestures,
	onDrop,
	isVisible = true,
	animateIn = true,
	ShadeComponent = Shade,
	HeaderComponent,
	className,
}, el) => {
	el = el || useRef();
	const allowBack = useRef(history.length > 1).current;
	const [dropping, setDropping] = useState(false);
	const shadeEl = useRef();
	const pan = useAnimatedValue(animateIn ? document.body.clientWidth : 0);

	const close = () => pan.spring(width).then(() => {
		if (allowBack) navigation.goBack();
	});

	const {width} = useGesture(el, {
		onCapture: e => {
			if (!allowBack) return;
			if (disableGestures) return;
			return (e.direction === 'x' && e.distance > 0);
		},
		onMove: e => {
			pan.setValue(Math.max(0, e.distance));
		},
		onUp: e => {
			if (e.flick === -1) return close();
			pan.spring(0); // Return to start
		},
	});

	// Trigger animation on visibility change
	useEffect(() => {
		if (!width || !animateIn) return;
		pan.spring(isVisible ? 0 : width);
	}, [animateIn, isVisible, width]);

	useEffect(() => {
		return pan.on(value => {
			if (el.current) el.current.style.transform = `translateX(${value}px)`;
			if (shadeEl.current) shadeEl.current.progress(value, width);
		});
	}, [width]);

	const dragOver = (e) => {
		e.preventDefault();
	};

	const startDrag = (e) => {
		setDropping(true);
	};

	const cancelDrag = (e) => {
		setDropping(false);
	};

	const drop = (e) => {
		setDropping(false);
		onDrop(e);
	};

	const renderHeader = () => {
		if (HeaderComponent === null) return null;
		if (HeaderComponent) return HeaderComponent;
		return (
			<ScreenHeader
				title={title}
				subtitle={subtitle}
				presentation="card"
				SearchComponent={SearchComponent}
				onClose={close}
				headerRight={headerRight}
			/>
		);
	};

	return (
		<div className="layer">
			{ShadeComponent ? <ShadeComponent ref={shadeEl}/> : null}
			<div
				className={c('card', animateIn && 'animate', className)}
				ref={el}
				onDragOver={onDrop && dragOver}
				onDragEnter={onDrop && startDrag}
				onDragLeave={onDrop && cancelDrag}
				onDrop={onDrop && drop}
			>
				{renderHeader()}
				<div className="card-body" children={children}/>
				{footer}
				{dropping ? (
					<Placeholder className="drop-zone" icon="upload" title="Upload"/>
				) : null}
			</div>
		</div>
	);
});