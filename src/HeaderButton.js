import { c } from './util';
import { Touchable } from './Touchable';
import { Icon } from './Icon';

export const HeaderButton = ({icon, title, badge, loading, disabled, onClick, active, href}) => (
	<Touchable
		className={c('header-button center', title === 'Cancel' && 'header-cancel')}
		onClick={onClick}
		loading={loading}
		disabled={disabled}
		active={active}
		href={href}
	>
		{icon ? <Icon icon={icon}/> : null}
		{title ? <span>{title}</span> : null}
		{badge ? <span className="badge">{badge}</span> : null}
	</Touchable>
);