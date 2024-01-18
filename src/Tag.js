import React, { memo } from 'react';
import { colorHash } from './util/oklab.js';

export const Tag = memo(({tag, count, colorize, color}) => {
	const fg = color || (colorize && colorHash(tag));
	return (
		<div
			className="tag"
			style={{borderColor: fg, color: fg}}
			children={`${tag}  ${count || ''}`}
		/>
	);
});