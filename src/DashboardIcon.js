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

const generateBgGradient = (color) => {
	if (!color) return;
	return `linear-gradient(rgba(255,255,255,10%), transparent), ${color}`;
};

export const DashboardIcon = ({title, icon, href, color}) => (
	<Touchable href={href} className="springboard-icon" onClick={setOrigin}>
		<div
			className="icon-frame"
			style={{background: generateBgGradient(color)}}
			children={<Icon icon={icon}/>}
		/>
		<div className="springboard-icon-name">{title}</div>
	</Touchable>
);