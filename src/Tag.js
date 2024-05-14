import React, { memo } from 'react';
import { colorHash } from './util/oklab.js';
import { Icon } from './Icon.js';
import { ActivityIndicator } from './ActivityIndicator.js';

export const Tag = memo(({icon, tag, count, colorize = true, meta, color, loading}) => {
	const fg = color || (colorize && colorHash(tag));
	const renderCount = () => {
		if (count === 0) return <Icon icon="add"/>;
		if (count) return <div className="tag-count">{count}</div>;
	};
	const renderRight = () => {
		if (loading) return <ActivityIndicator/>;
		if (meta) return <div className="tag-meta">{meta}</div>;
	};
	return (
		<div className="tag-container">
			<div className="tag" style={{backgroundColor: fg}}>
				{icon ? <Icon icon={icon}/> : null}
				{tag}
				{renderCount()}
			</div>
			{renderRight()}
		</div>
	);
});