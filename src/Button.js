import { Fragment } from 'react';
import { c } from './util';
import { Icon } from './Icon';
import { Touchable } from './Touchable';
import { ActivityIndicator } from './ActivityIndicator';

/**
 * @typedef {object} ButtonProps
 * @property {string} [className]
 * @property {import('react').ReactNode} [title]
 * @property {(event: any) => void} [onClick]
 * @property {(event: any) => void} [onDown]
 * @property {string} [icon]
 * @property {string} [href]
 * @property {number} [tabIndex]
 * @property {string} [color]
 * @property {boolean} [disabled]
 * @property {boolean} [download]
 * @property {string} [iconImageUrl]
 * @property {boolean} [loading]
 * @property {boolean} [submit]
 * @property {boolean} [fullWidth]
 * @property {string} [target]
 */

/** @param {ButtonProps} props */
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
	active,
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
			className={c('btn', className, (disabled || loading) && 'disabled', fullWidth && 'full-width', active && 'active', color && `btn-${color}`)}
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
