import React, { useEffect, useRef, useState } from 'react';
import { navigation } from 'focus-router';
import { useAnimatedValue } from './util/animated';
import { usePanGestures } from './util/gestures';
import { ScrollView } from './ScrollView';
import { ScreenHeader } from './ScreenHeader';
import { Placeholder } from './Placeholder';
import { Shade } from './Shade';

export const Card = ({
	title,
	subtitle,
	children,
	footer,
	headerRight,
	hasScrollView = true,
	SearchComponent,
	scrollerRef,
	disableGestures,
	onDrop,
	isVisible = true,
	showHeader = true,
	animateIn = true,
	ShadeComponent = Shade,
}) => {
	const allowBack = useRef(history.length > 1).current;
	const [dropping, setDropping] = useState(false);
	const shadeEl = useRef();
	const el = useRef();
	const pan = useAnimatedValue(document.body.clientWidth);

	const close = () => pan.spring(width).then(() => {
		if (allowBack) navigation.goBack();
	});

	const {width} = usePanGestures(el, {
		onCapture: e => {
			if (disableGestures) return;
			return (e.locked === 'h' && e.d.x > 0);
		},
		onMove: e => {
			pan.setValue(Math.max(0, e.d.x));
		},
		onUp: e => {
			if (e.flick.x === 1 || e.d.x > (e.width / 2)) {
				close();
			} else {
				pan.spring(0);
			}
		},
	});

	// Trigger animation on visibility change
	useEffect(() => {
		if (!width) return;

		if (isVisible) {
			pan.spring(0);
		} else {
			pan.spring(width);
		}
	}, [isVisible, width]);

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

	return (
		<div className="layer">
			<ShadeComponent ref={shadeEl}/>
			<div
				className="card"
				ref={el}
				onDragOver={onDrop && dragOver}
				onDragEnter={onDrop && startDrag}
				onDragLeave={onDrop && cancelDrag}
				onDrop={onDrop && drop}
			>
				<ScreenHeader
					title={title}
					subtitle={subtitle}
					presentation="card"
					SearchComponent={SearchComponent}
					onClose={close}
					headerRight={headerRight}
				/>
				{hasScrollView ? (
					<ScrollView className="card-body" ref={scrollerRef} children={children}/>
				) : (
					<div className="card-body" children={children}/>
				)}
				{footer}
				{dropping ? (
					<Placeholder className="drop-zone" icon="upload" title="Upload"/>
				) : null}
			</div>
		</div>
	);
};

Card.defaultProps = {};