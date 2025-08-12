import { c } from './util';
import { decodeBuffer, simpleHash } from './util/decode';

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
	if (imageId) url = getUrl(imageId);
	if (buffer) url = decodeBuffer(buffer);

	const renderImg = () => {
		if (url) return (
			<img
				key={simpleHash(url)}
				src={url}
				className="img-real"
				alt={alt}
				draggable={false}
				onError={() => onError(imageId)}
			/>
		);
		if (base64Png) return <img src={`data:image/png;base64,${base64Png}`}/>;
		return <div className="img-real" draggable={false}/>;
	};

	return (
		<div className={c('img', fit, className)} style={{aspectRatio: ar}}>
			{renderImg()}
			{children ? <div className="img-inside">{children}</div> : null}
		</div>
	);
};