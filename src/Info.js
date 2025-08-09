import { Icon } from './Icon';

export const Info = ({icon = 'announcement', title, children}) => (
	<div className="info">
		{icon ? <Icon icon={icon}/> : null}
		<div>
			{title ? <div className="info-title">{title}</div> : null}
			{children ? <div className="info-message">{children}</div> : null}
		</div>
	</div>
);