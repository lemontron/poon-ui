import React from 'react';

export const PercentBar = ({percent, children}) => (
	<div className="percent-bar">
		{percent ? (
			<div
				className="percent-bar-inner"
				style={{width: `${percent * 100}%`}}
			/>
		) : null}
		{children}
	</div>
);

export const PercentBarSegment = ({start, end, color}) => (
	<div
		className="percent-bar-segment"
		style={{
			'left': `${start * 100}%`,
			'width': `${(end - start) * 100}%`,
			'backgroundColor': color,
		}}
	/>
);