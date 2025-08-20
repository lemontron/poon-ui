import { Touchable } from './Touchable';
import { Icon } from './Icon';
import { c } from './util';
import { Row } from './Stack';

export const TouchableRow = ({href, onClick, target, disabled, caret, active, ...props}) => (
	<Touchable
		className={c('touchable-highlight touchable-row', disabled && 'disabled', caret && 'caret')}
		onClick={onClick}
		href={href}
		target={target}
		active={active}
	>
		<Row {...props}/>
		{caret ? <Icon icon="chevron_right"/> : null}
	</Touchable>
);