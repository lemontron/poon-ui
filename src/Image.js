import React from 'react';
import { c } from './util';

export const Image = ({ar, url, alt, className, children, base64Png}) => {
	const renderImg = () => {
		if (url) return <img src={url} className="img-real" alt={alt} draggable={false}/>;
		if (base64Png) return <img src={`data:image/png;base64,${base64Png}`}/>;
		return <div className="img-real" alt={alt} draggable={false}/>;
	};

	return (
		<div className={c('img', className)}>
			<div style={{paddingTop: ((ar || 1) * 100) + '%'}}/>
			{renderImg()}
			{children ? <div className="img-inside">{children}</div> : null}
		</div>
	);
};