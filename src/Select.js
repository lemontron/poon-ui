import React from 'react';
import { c } from './util/index.js';

export const Select = ({options, value, disabled, autoComplete, onChangeValue}) => {
	const renderOptions = () => {
		if (options instanceof Array) return options.map(option => (
			<option key={option.value} value={option.value} children={option.name}/>
		));

		Object.keys(options).map(key => (
			<option key={key} value={key} children={options[key]}/>
		));
	};

	return (
		<select
			className={c('text select', disabled && 'disabled')}
			onChange={e => onChangeValue(e.target.value)}
			value={value}
			disabled={disabled}
			autoComplete={autoComplete}
		>
			{renderOptions()}
		</select>
	);
};