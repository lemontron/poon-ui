import React, { Fragment } from 'react';
import { c } from './util/index.js';
import { Icon } from './Icon';
import { Touchable } from './Touchable';
import { ActivityIndicator } from './ActivityIndicator.js';

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
}) => {
	const cn = c('btn', className, disabled && 'disabled', fullWidth && 'full-width', color && `btn-${color}`);

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
			className={cn}
			onClick={e => {
				if (download) e.stopPropagation();
				if (onClick) onClick(e);
			}}
			href={href}
			onTouchStart={onDown}
			tabIndex={tabIndex}
			children={renderInner()}
		/>
	);
};