import { useContext } from 'react';
import { Touchable } from './Touchable';
import { Icon } from './Icon';
import { c } from './util';
import { Row } from './Stack';
import { ListReorderContext } from './useReorder.js';

export const TouchableRow = ({
	LeftComponent,
	onPressMore,
	href,
	onClick,
	target,
	disabled,
	inactive,
	caret,
	active,
	...props
}) => {
	const reorder = useContext(ListReorderContext);

	return (
		<div
			className={c('touchable-highlight touchable-row', disabled && 'disabled', inactive && 'inactive', caret && 'caret', reorder?.dragging && 'dragging', reorder?.position && `drop-${reorder.position}`)}
			data-index={reorder?.index}
		>
			{reorder?.onReorder ? (
				<span
					className="touchable-row-drag-handle material-icons"
					children="drag_indicator"
					{...reorder.onReorder}
				/>
			) : null}
			{LeftComponent}
			<Touchable
				className="touchable-row-button"
				onClick={onClick}
				href={href}
				target={target}
				active={active}
			>
				<Row {...props}/>
				{caret ? <Icon icon="chevron_right"/> : null}
			</Touchable>
			{onPressMore ? (
				<Touchable
					onClick={onPressMore}
					children={<Icon icon="more_vert"/>}
				/>
			) : null}
		</div>
	);
};
