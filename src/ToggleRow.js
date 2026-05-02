import { CheckBox } from './CheckBox';
import { Touchable } from './Touchable';

export const ToggleRow = ({title, onChange, active, disabled}) => (
	<Touchable className="toggle-row" onClick={() => onChange(!active)} disabled={disabled}>
		<CheckBox active={active}/>
		<div>{title}</div>
	</Touchable>
);