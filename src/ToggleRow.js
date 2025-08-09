import { Icon } from './Icon';
import { CheckBox } from './CheckBox';
import { Touchable } from './Touchable';

export const ToggleRow = ({title, onChange, active}) => (
	<Touchable className="toggle-row" onClick={() => onChange(!active)}>
		<CheckBox active={active}/>
		<div>{title}</div>
	</Touchable>
);