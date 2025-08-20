import { useEffect, useState } from 'react';
import { c } from './util';
import { decodeBuffer } from './util/decode';

const useBuffer = (buffer) => {
	const [blob, setBlob] = useState(null);
	useEffect(() => {
		const url = decodeBuffer(buffer);
		setBlob(url);
		return () => URL.revokeObjectURL(url);
	}, [buffer]);
	if (!buffer) return null;
	return blob;
};

export const Image = ({
	imageId,
	getUrl,
	url,
	alt,
	ar = 1,
	className,
	base64Png,
	buffer,
	onError = () => null,
	fit = 'cover',
	children,
}) => {
	const blobUrl = useBuffer(buffer);

	const getSrc = () => {
		if (imageId) return getUrl(imageId);
		if (blobUrl) return blobUrl;
		if (url) return url;
		if (base64Png) return `data:image/png;base64,${base64Png}`;
	};

	const renderImg = () => {
		const url = getSrc();
		if (!url) return <div className="img-real" draggable={false}/>;
		return (
			<img
				src={url}
				className="img-real"
				alt={alt}
				draggable={false}
				onError={() => onError(imageId)}
			/>
		);
	};

	return (
		<div className={c('img', fit, className)} style={{aspectRatio: ar}}>
			{renderImg()}
			{children ? <div className="img-inside">{children}</div> : null}
		</div>
	);
};