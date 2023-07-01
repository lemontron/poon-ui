import React from 'react';

export const TabularRow = ({leftText, rightText}) => (
	<div className="tabular-row">
		<div className="tabular-row-left">{leftText}</div>
		<div className="tabular-row-right">{rightText}</div>
	</div>
);