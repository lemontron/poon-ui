import { CheckBox, Radio } from './CheckBox';
import { Touchable } from './Touchable';

export const Toggle = ({onChange, radio, active, disabled}) => (
	<Touchable
		className="toggle"
		onClick={() => onChange(!active)}
		disabled={disabled}
		children={radio ? <Radio active={active}/> : <CheckBox radio={radio} active={active}/>}
	/>
);