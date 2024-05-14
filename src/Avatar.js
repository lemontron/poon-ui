import React from 'react';
import { c } from './util/index.js';

export const Avatar = ({imageId, className, variant, getUrl, name}) => {
	if (!imageId) return <div draggable={false} className={c('avatar', className)} title={name}/>;
	return (
		<img
			draggable={false}
			className={c('avatar', className)}
			src={getUrl(imageId, variant)}
			title={name}
		/>
	);
};

Avatar.defaultProps = {
	variant: 'normal',
	getUrl: val => val,
};