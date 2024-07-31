import React from 'react';
import { Touchable } from './Touchable.js';
import { Icon } from './Icon.js';

export const Banner = ({icon, title, onClick, href, onClose}) => (
	<Touchable className="banner" onClick={onClick} href={href}>
		<div className="banner-body">
			{icon ? <Icon icon={icon}/> : null}
			{title}
		</div>
		{onClose ? <Touchable children={<Icon icon="close"/>}/> : null}
	</Touchable>
);