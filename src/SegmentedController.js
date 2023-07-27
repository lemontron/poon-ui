import React, { forwardRef, Fragment, useEffect, useRef } from 'react';
import { Touchable } from './Touchable.js';
import { useAnimatedValue } from './util/animated.js';

const SegmentedItem = forwardRef(({item, isLast, active, onChange, index}, ref) => (
	<Fragment>
		<Touchable
			children={item.name}
			onClick={() => onChange(item.value)}
			active={active}
			ref={ref}
		/>
		{isLast ? null : <div className="separator"/>}
	</Fragment>
));

export const SegmentedController = ({options, value, onChange}) => {
	const refs = useRef([]);
	const indicator = useRef();
	const index = options.findIndex(item => item.value === value);
	const left = useAnimatedValue(0);
	const width = useAnimatedValue(0);

	useEffect(() => {
		left.on(val => indicator.current.style.transform = `translateX(${val}px)`);
		width.on(val => indicator.current.style.width = `${val}px`);
	}, []);

	useEffect(() => {
		const el = refs.current[index]; // element to copy attributes from
		if (width.value === 0) {
			left.setValue(el.offsetLeft);
			width.setValue(el.offsetWidth);
		} else {
			left.spring(el.offsetLeft);
			width.spring(el.offsetWidth);
		}
	}, [index]);

	return (
		<div className="segmented">
			<div className="segmented-indicator" ref={indicator}/>
			{options.map((item, i) => (
				<SegmentedItem
					key={item.value}
					item={item}
					index={i}
					isLast={i === options.length - 1}
					active={index === i}
					onChange={onChange}
					ref={el => refs.current[i] = el}
				/>
			))}
		</div>
	);
};