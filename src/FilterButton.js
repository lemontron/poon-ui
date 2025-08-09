import { Touchable } from './Touchable';
import { Icon } from './Icon';
import { CheckBox } from './CheckBox';

export const FilterButton = ({
	title,
	LeftComponent,
	caret = true,
	checked,
	disabled,
	active,
	href,
	onPress,
}) => (
	<Touchable className="filter-button" onClick={onPress} active={active} interactive href={href} disabled={disabled}>
		{LeftComponent}
		{title ? <div className="filter-button-title">{title}</div> : null}
		{caret ? (
			<Icon className="filter-button-caret" icon="expand_more"/>
		) : (
			<CheckBox active={checked}/>
		)}
	</Touchable>
);