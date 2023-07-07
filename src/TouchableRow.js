import React from 'react';
import { Touchable } from './Touchable';
import { Icon } from './Icon';
import { c } from './util';
import { CheckBox } from './CheckBox.js';

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
}) => (
	<Touchable className={c('touchable-row', disabled && 'disabled')} onClick={onClick} href={href} target={target}>
		<div className="touchable-row-left">
			{typeof leftIcon === 'string' ? (
				<div className="touchable-row-icon"><Icon icon={leftIcon}/></div>
			) : null}
			{typeof leftIcon === 'object' ? (
				<div className="touchable-row-icon">{leftIcon}</div>
			) : null}
			<div className="touchable-row-content">
				{title ? <div className="touchable-row-title" children={title}/> : null}
				{meta ? <div className="meta" children={meta}/> : null}
				{children}
			</div>
		</div>
		{RightComponent}
		{onPressMore ? (
			<Touchable onClick={onPressMore}><Icon icon="more_vert"/></Touchable>
		) : null}
		{caret ? <Icon icon="chevron_right"/> : null}
	</Touchable>
);