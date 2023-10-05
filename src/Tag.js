import React, { memo } from 'react';
import { cyrb53 } from './util/hash.js';

const f = 360 / Math.pow(2, 53);

export const Tag = memo(({tag, count, colorize}) => {
	const fg = colorize && `hsl(${180 - (f * cyrb53(tag))}, 100%, 50%)`;
	return (
		<div
			className="tag"
			style={{borderColor: fg, color: fg}}
			children={`${tag}  ${count || ''}`}
		/>
	);
});