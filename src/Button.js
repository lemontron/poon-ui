import React, { Fragment } from 'react';
import { Icon } from './Icon';
import { Spinner } from './Spinner';
import { Touchable } from './Touchable';

export const Button = ({
	className,
	title,
	onClick,
	onDown,
	icon,
	href,
	tabIndex,
	color,
	textColor,
	disabled,
	width,
	download,
	iconImageUrl,
	loading,
	submit,
	pop,
}) => {
	const classes = ['btn'];
	if (className) classes.push(className);
	if (disabled) classes.push('disabled');

	const style = {background: color, width, color: textColor};

	const renderInner = () => {
		if (loading) return <Spinner/>;
		return (
			<Fragment>
				{iconImageUrl ? <img src={iconImageUrl} alt={title}/> : null}
				{icon ? <Icon icon={icon}/> : null}
				{title ? <span>{title}</span> : null}
			</Fragment>
		);
	};

	if (href) return (
		<a
			onClick={e => {
				if (download) e.stopPropagation();
			}}
			href={href}
			target={(href && pop) ? '_blank' : null}
			className={classes.join(' ')}
			tabIndex={tabIndex} style={style}
			children={renderInner()}
		/>
	);

	return (
		<Touchable
			type={submit ? 'submit' : 'button'}
			className={classes.join(' ')}
			onClick={onClick}
			onTouchStart={onDown}
			tabIndex={tabIndex}
			style={style}
			children={renderInner()}
		/>
	);
};