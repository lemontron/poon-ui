import { createElement, useState } from 'react';
import { Icon } from './Icon';
import { Touchable } from './Touchable';
import { ActivityIndicator } from './ActivityIndicator';
import { c } from './util';

const autoCompleteMap = {'code': 'one-time-code'};
const typeMap = {'phone': 'tel', 'code': 'tel'};

const applyTitleCase = (value) => {
	if (!value) return '';
	return value.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

export const TextInput = ({
	placeholder,
	value = '',
	icon,
	type = 'text',
	dnt,
	disabled,
	rows = 0,
	className,
	onFocus,
	onClick,
	maxLength,
	id,
	onChangeText = () => null,
	autoFocus,
	loading,
	RightComponent,
	countryCode,
	lowerCase,
	min,
	max,
	onPressCountry,
	countries,
	titleCase,
	ref,
}) => {
	const [_value, _setValue] = useState(value); // internal value

	const renderInput = () => {
		let tagName = (type === 'textarea' || rows) ? 'textarea' : 'input';

		const changeText = (e) => {
			let value = e.target.value;
			_setValue(value);

			if (type === 'phone') {
				value = value.replace(/[^0-9]/g, '');
			} else {
				if (titleCase) value = applyTitleCase(value);
				if (lowerCase) value = value.toLowerCase();
				if (maxLength) value = value.slice(0, maxLength);
				if (type === 'username') value = value.replace(/\s/g, '');
			}
			onChangeText(value);
		};

		const renderValue = (value) => {
			if (type === 'phone' && countryCode) {
				const country = countries.find(r => r.code === countryCode);
				const chars = value.split('');
				return country.example.split('').map(char => {
					if (chars.length) return (char === 'X') ? chars.shift() : char;
				}).filter(Boolean).join('');
			}
			return value;
		};

		return createElement(tagName, {
			'type': typeMap[type] || type,
			'autoComplete': autoCompleteMap[type],
			'maxLength': maxLength,
			'className': c('text', disabled && 'disabled', dnt && 'fs-hide', className),
			'readOnly': disabled,
			'onChange': changeText,
			'value': renderValue(value),
			'autoCapitalize': lowerCase && 'none',
			placeholder,
			rows,
			onFocus,
			onClick,
			id,
			autoFocus,
			ref,
			min,
			max,
		});
	};

	const renderIcon = () => {
		if (icon) return <Icon className="text-input-icon" icon={icon}/>;
		if (type === 'username') return <span className="text-input-icon">@</span>;
		if (type === 'search') return <Icon className="text-input-icon" icon="search"/>;
	};

	const renderClearButton = () => {
		if (type !== 'search') return null;
		if (value) return (
			<Touchable onClick={() => onChangeText('')}>
				<Icon icon="cancel" className="text-input-clear"/>
			</Touchable>
		);
	};

	const renderSpinner = () => {
		if (!loading) return null;
		return <div className="text-input-spinner"><ActivityIndicator size={18}/></div>;
	};

	const renderCountryButton = () => {
		const country = countries ? countries.find(r => r.code === countryCode) : null;

		if (!country) return null; // fix me??

		return (
			<Touchable className="text-input-country" onClick={onPressCountry}>
				<span className="emoji">{country.flag}</span>
				{country.prefix}
			</Touchable>
		);
	};

	return (
		<div className="text-input">
			{type === 'phone' && renderCountryButton()}
			{renderIcon()}
			{renderInput()}
			{RightComponent}
			{renderSpinner()}
			{renderClearButton()}
		</div>
	);
};