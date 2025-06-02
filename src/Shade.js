import React, { useRef, useImperativeHandle } from 'react';

export const Shade = ({ref}) => {
	const el = useRef();

	useImperativeHandle(ref, () => ({
		progress: (value, width) => {
			if (el.current) {
				el.current.style.opacity = 1 - (value / width);
			}
		},
	}));

	return <div className="shade shade-card" ref={el}/>;
};