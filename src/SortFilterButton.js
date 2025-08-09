import { Touchable } from './Touchable';
import { Icon } from './Icon';

export const SortFilterButton = ({
	title,
	label = 'Sort by',
	disabled,
	onClick,
}) => (
	<Touchable className="sort-filter" onClick={onClick} disabled={disabled} interactive>
		<div>
			<span className="sort-filter-label">{label} </span>
			<span className="sort-filter-value">{title}</span>
		</div>
		<Icon icon="swap_vert" size={18}/>
	</Touchable>
);