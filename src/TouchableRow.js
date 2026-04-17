import { Touchable } from './Touchable';
import { Icon } from './Icon';
import { c } from './util';
import { Row } from './Stack';

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
}) => (
	<div className={c('touchable-highlight touchable-row', disabled && 'disabled', inactive && 'inactive', caret && 'caret')}>
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