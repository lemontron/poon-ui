import { CheckBox } from './CheckBox';
import { Touchable } from './Touchable';

export const Toggle = ({onChange, active, disabled}) => (
	<Touchable
		className="toggle"
		onClick={() => onChange(!active)}
		disabled={disabled}
		children={<CheckBox active={active}/>}
	/>
);