import React from 'react';

const array = new Array(5);

export const ActivityIndicator = ({size = 16, color = '#fff'}) => {
	const renderSegment = (a, i) => {
		const style = {
			'width': 1.7,
			'borderRadius': 1,
			'left': (size / 2) - 1,
			'height': (size / 4),
			'animationDelay': (-1.1 + (.1 * i)).toFixed(1) + 's',
			'transform': `rotate(${30 * i}deg)`,
			'backgroundColor': color,
			'transformOrigin': `50% ${size / 2}px`,
		};
		return <div key={i} style={style}/>;
	};

	return (
		<div
			className="activity-indicator"
			style={{width: size, height: size}}
			children={array.map(renderSegment)}
		/>
	);
};