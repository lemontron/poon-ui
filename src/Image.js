import React from 'react';
import { c } from './util';

export const Image = ({ar = 1, imageId, getUrl, url, alt, className, children, base64Png, onError}) => {
	if (imageId) url = getUrl(imageId);

	const renderImg = () => {
		if (url) return (
			<img
				src={url}
				className="img-real"
				alt={alt}
				draggable={false}
				onError={() => onError(imageId)}
			/>
		);
		if (base64Png) return <img src={`data:image/png;base64,${base64Png}`}/>;
		return <div className="img-real" alt={alt} draggable={false}/>;
	};

	return (
		<div className={c('img', className)} style={{aspectRatio: ar}}>
			{renderImg()}
			{children ? <div className="img-inside">{children}</div> : null}
		</div>
	);
};