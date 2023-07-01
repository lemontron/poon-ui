import React from 'react';
import { Icon } from './Icon';
import { Spinner } from './Spinner';

export const ProgressRing = ({color = '#fff', size = 20, percent, spinning, completedIcon = 'check'}) => {
	if (spinning || !percent) return <Spinner/>;
	if (percent === 1) return <Icon icon={completedIcon}/>;

	const r = size / 2;
	const ri = r - 1; // inner radius
	const c = ri * 2 * Math.PI; // circumference
	const strokeDashoffset = c - percent * c;

	return (
		<svg height={size} width={size}>
			<circle stroke={color} opacity={.3} fill="transparent" strokeWidth={2} r={ri} cx={r} cy={r}/>
			<circle
				strokeDasharray={c + ' ' + c}
				style={{strokeDashoffset, transform: 'rotate(-90deg)', transformOrigin: '50% 50%'}}
				stroke={color} fill="transparent" strokeWidth={2} r={ri} cx={r} cy={r}
			/>
		</svg>
	);
};