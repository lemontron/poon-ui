import { c } from './util';
import { Touchable } from './Touchable';
import { Icon } from './Icon';

export const HeaderButton = ({icon, title, badge, ...props}) => (
	<Touchable
		className={c('header-button center', title === 'Cancel' && 'header-cancel')}
		{...props}
	>
		{icon ? <Icon icon={icon}/> : null}
		{title ? <span>{title}</span> : null}
		{badge ? <span className="badge">{badge}</span> : null}
	</Touchable>
);