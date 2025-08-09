import { Icon } from './Icon';
import { c } from './util';

export const Placeholder = ({className, icon, title, message, children}) => (
	<div className={c('placeholder', className)}>
		{icon ? <Icon icon={icon}/> : null}
		{title ? <div className="placeholder-title">{title}</div> : null}
		{message ? <div className="placeholder-message">{message}</div> : null}
		{children}
	</div>
);