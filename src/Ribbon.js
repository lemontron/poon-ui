import React, { memo } from 'react';
import { colorHash } from './util/oklab.js';

export const Ribbon = memo(({tag, count, colorize, color}) => {
	const fg = color || (colorize && colorHash(tag));
	return (
		<div className="ribbon-container" style={{backgroundColor: fg}}>
			<div className="ribbon" children={`${tag} ${count || ''}`}/>
		</div>
	);
});