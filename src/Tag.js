import { memo } from 'react';
import { colorHash } from './util/oklab';
import { Icon } from './Icon';
import { ActivityIndicator } from './ActivityIndicator';
import { Touchable } from './Touchable.js';
import { toPercent } from './util/index.js';

export const Tag = memo(({
	icon,
	tag,
	count,
	colorize = true,
	meta,
	color,
	loading,
	onDelete,
	progress,
}) => {
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
				{progress ? <div className="tag-progress" style={{width: toPercent(progress)}}/> : null}
			</div>
			{renderRight()}
			{onDelete ? (
				<Touchable
					className="material-icons"
					children="close"
					onClick={() => onDelete(tag)}
				/>
			) : null}
		</div>
	);
});