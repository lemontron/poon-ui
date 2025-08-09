import { c } from './util';

export const Avatar = ({
	imageId,
	className,
	variant = 'normal',
	getUrl = val => val,
	name,
	statusColor,
}) => {
	return (
		<div className={c('avatar', className)} title={name}>
			{imageId ? (
				<img
					draggable={false}
					src={imageId && getUrl(imageId, variant)}
					alt={name}
				/>
			) : null}
			{statusColor ? (
				<div className="avatar-status-icon" style={{backgroundColor: statusColor}}/>
			) : null}
		</div>
	);
};