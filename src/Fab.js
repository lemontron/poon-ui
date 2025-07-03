import React, { Fragment } from 'react';
import { Touchable } from './Touchable.js';
import { c } from './util/index.js';
import { Icon } from './Icon.js';
import { ActivityIndicator } from './ActivityIndicator.js';

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