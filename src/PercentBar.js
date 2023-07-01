import React from 'react';

export const PercentBar = ({percent}) => (
	<div className="percent-bar">
		<div className="percent-bar-inner" style={{width: `${percent * 100}%`}}/>
	</div>
);