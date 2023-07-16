import React from 'react';
import { Icon } from './Icon';
import { Touchable } from './Touchable';
import { setRevealOrigin } from './Reveal.js';

const setOrigin = (e) => {
	const rect = e.currentTarget.getBoundingClientRect();
	setRevealOrigin(
		(rect.left + rect.right) / 2,
		(rect.top + rect.bottom) / 2,
	);
};

export const DashboardIcon = ({title, icon, href}) => (
	<Touchable href={href} className="springboard-icon" onClick={setOrigin}>
		<div className="icon-frame"><Icon icon={icon}/></div>
		<div className="springboard-icon-name">{title}</div>
	</Touchable>
);