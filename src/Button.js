import { Fragment } from 'react';
import { c } from './util';
import { Icon } from './Icon';
import { Touchable } from './Touchable';
import { ActivityIndicator } from './ActivityIndicator';

export const Button = ({
	className,
	title,
	onClick,
	onDown,
	icon,
	href,
	tabIndex,
	color,
	disabled,
	download,
	iconImageUrl,
	loading,
	submit,
	fullWidth,
	target,
}) => {
	const renderInner = () => {
		if (loading) return <ActivityIndicator/>;
		return (
			<Fragment>
				{iconImageUrl ? <img src={iconImageUrl} alt={title}/> : null}
				{icon ? <Icon icon={icon}/> : null}
				{title ? <span>{title}</span> : null}
			</Fragment>
		);
	};

	return (
		<Touchable
			type={submit ? 'submit' : 'button'}
			className={c('btn', className, (disabled || loading) && 'disabled', fullWidth && 'full-width', color && `btn-${color}`)}
			onClick={e => {
				if (download) e.stopPropagation();
				if (onClick) onClick(e);
			}}
			href={href}
			onTouchStart={onDown}
			tabIndex={tabIndex}
			children={renderInner()}
			target={target}
		/>
	);
};