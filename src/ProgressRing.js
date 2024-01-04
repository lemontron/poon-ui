import React, { memo, Fragment } from 'react';
import { c } from './util/index.js';

export const ProgressRing = memo(({
	color = '#fff',
	backgroundColor = 'rgba(255,255,255,.3)',
	ringWidth = 2,
	size = 20,
	percent,
	children,
}) => {
	const r = size / 2;
	const ri = r - (ringWidth / 2); // inner radius
	const circumference = ri * 2 * Math.PI; // circumference
	const strokeDashoffset = circumference - (percent * circumference) || 0;

	const renderRings = () => {
		if (percent === 1) return (
			<circle stroke={color} fill="transparent" strokeWidth={ringWidth} r={ri} cx={r} cy={r}/>
		);
		return (
			<Fragment>
				<circle stroke={backgroundColor} fill="transparent" strokeWidth={ringWidth} r={ri} cx={r} cy={r}/>
				<circle
					strokeDasharray={circumference}
					style={{strokeDashoffset, transform: 'rotate(-90deg)', transformOrigin: '50% 50%'}}
					stroke={color}
					fill="transparent"
					strokeWidth={ringWidth}
					r={ri}
					cx={r}
					cy={r}
					strokeLinecap="round"
				/>
			</Fragment>
		);
	};

	return (
		<div className="progress-ring">
			<svg height={size} width={size} children={renderRings()}/>
			<div className={c('progress-ring-content', percent === 1 && 'active')}>{children}</div>
		</div>
	);
});