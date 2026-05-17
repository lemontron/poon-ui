import { Icon } from './Icon';
import { c } from './util';

export const CheckBox = ({active, undetermined}) => (
	<div className={c('toggle-check', active && 'active', undetermined && 'undetermined')}>
		<Icon icon={undetermined ? 'horizontal_rule' : active ? 'check' : null}/>
	</div>
);

export const Radio = ({active}) => (
	<Icon icon={active ? 'radio_button_checked' : 'radio_button_unchecked'}/>
);