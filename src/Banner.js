import { Touchable } from './Touchable';
import { Icon } from './Icon';

export const Banner = ({icon, title, onClick, href, onClose}) => (
	<Touchable className="banner" onClick={onClick} href={href}>
		<div className="banner-body">
			{icon ? <Icon icon={icon}/> : null}
			{title}
		</div>
		{onClose ? <Touchable children={<Icon icon="close"/>}/> : null}
	</Touchable>
);