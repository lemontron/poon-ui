import React from 'react';
import { Icon } from './Icon';
import { Touchable } from './Touchable';

export const DashboardIcon = ({title, icon, href}) => (
	<Touchable href={href} className="springboard-icon">
		<div className="icon-frame"><Icon icon={icon}/></div>
		<div>{title}</div>
	</Touchable>
);