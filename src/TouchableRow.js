import React from 'react';
import { Touchable } from './Touchable';
import { Icon } from './Icon';
import { c } from './util';

export const TouchableRow = ({
	title,
	meta,
	leftIcon,
	href,
	onClick,
	onPressMore,
	target,
	children,
	caret,
	disabled,
	RightComponent,
	className,
	active,
}) => {
	const renderLeftIcon = () => {
		if (typeof leftIcon === 'string') return (
			<Icon icon={leftIcon}/>
		);
		if (typeof leftIcon === 'object') return (
			<div className="touchable-row-left">{leftIcon}</div>
		);

		return null;
	};
	return (
		<Touchable
			className={c('touchable-highlight touchable-row', disabled && 'disabled', className)}
			onClick={onClick}
			href={href}
			target={target}
			active={active}
		>
			{renderLeftIcon()}
			<div className="touchable-row-content">
				<div className="touchable-row-header">
					{title ? <div className="touchable-row-title" children={title}/> : null}
					{meta ? <div className="meta" children={meta}/> : null}
				</div>
				{children}
			</div>
			{RightComponent}
			{onPressMore ? (
				<Touchable onClick={onPressMore}><Icon icon="more_vert"/></Touchable>
			) : null}
			{caret ? <Icon icon="chevron_right"/> : null}
		</Touchable>
	);
};