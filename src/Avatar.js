import React from 'react';
import { c } from './util/index.js';

export const Avatar = ({imageId, className, variant, getUrl}) => {
	if (!imageId) return <div draggable={false} className={c('avatar', className)}/>;
	return (
		<img
			draggable={false}
			className={c('avatar', className)}
			src={getUrl(imageId, variant)}
		/>
	);
};

Avatar.defaultProps = {
	variant: 'normal',
	getUrl: () => null,
};