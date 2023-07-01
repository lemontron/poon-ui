import React from 'react';

export const Select = ({options, value, onChangeValue}) => (
	<select onChange={e => onChangeValue(e.target.value)} value={value}>
		{Object.keys(options).map(key => (
			<option key={key} value={key} children={options[key]}/>
		))}
	</select>
);