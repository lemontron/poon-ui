import React from 'react';
import { Icon } from './Icon';

export const CornerDialog = ({title, children, isVisible, onClose}) => {
	if (!isVisible) return null;
	return (
		<div className="corner-dialog">
			<div className="corner-dialog-title">
				{title}
				<Icon icon="close" onClick={onClose}/>
			</div>
			{children}
		</div>
	);
};