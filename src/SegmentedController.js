import React, { Fragment, useEffect, useRef } from 'react';
import { Touchable } from './Touchable.js';
import { useAnimatedValue } from './util/animated.js';

const SegmentedItem = ({item, isLast, active, onChange, index, pan}) => {
	return (
		<Fragment>
			<Touchable children={item} onClick={() => onChange(item)} active={active} id={`item-${index}`}/>
			{isLast ? null : <div className="separator"/>}
		</Fragment>
	);
};

export const SegmentedController = ({children, items, value, onChange}) => {
	if (children) return <div className="segmented" children={children}/>;

	const el = useRef();
	const indicatorEl = useRef();
	const pan = useAnimatedValue(items.indexOf(value));

	useEffect(() => {
		const i = items.indexOf(value);
		pan.spring(i);
	}, [value]);

	useEffect(() => {
		pan.on(val => {
			const i = Math.floor(val);

			const button = el.current.querySelectorAll('.touchable')[i];
			const last = el.current.querySelectorAll('.touchable')[items.length - 1];
			indicatorEl.current.style.width = `${button.offsetWidth}px`;
			indicatorEl.current.style.transform = `translateX(${(val / items.length) * (el.current.offsetWidth - last.offsetWidth)}px)`;
		});
	}, []);

	return (
		<div className="segmented" ref={el}>
			<div className="segmented-indicator" ref={indicatorEl}/>
			{items.map((item, i) => (
				<SegmentedItem
					key={item}
					item={item}
					index={i}
					isLast={i === items.length - 1}
					active={value === item}
					pan={pan}
					onChange={onChange}
				/>
			))}
		</div>
	);
};