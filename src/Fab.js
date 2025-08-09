import { Fragment } from 'react';
import { Touchable } from './Touchable';
import { c } from './util';
import { Icon } from './Icon';
import { ActivityIndicator } from './ActivityIndicator';

export const Fab = ({icon, title, loading, disabled, active, href, onPress}) => (
	<Touchable
		className={c('fab', !title && 'round')}
		loading={loading}
		disabled={disabled}
		active={active}
		onClick={onPress}
		href={href}
	>
		{loading ? <ActivityIndicator color="#000"/> : (
			<Fragment>
				<Icon icon={icon}/>
				{title && <div className="fab-title">{title}</div>}
			</Fragment>
		)}
	</Touchable>
);