import React from 'react';
import { c } from './util/index.js';

export const Avatar = ({
	imageId,
	className,
	variant = 'normal',
	getUrl = val => val,
	name,
}) => {
	if (!imageId) return <div draggable={false} className={c('avatar', className)} title={name}/>;
	return (
		<img
			draggable={false}
			className={c('avatar', className)}
			src={imageId && getUrl(imageId, variant)}
			title={name}
		/>
	);
};