import React from 'react';

export const TextInput = ({value, type, placeholder, onChange}) => (
	<input
		placeholder={placeholder}
		className="text"
		type={type}
		value={value}
		onChange={e => {
			e.stopPropagation();
			onChange(e.target.value);
		}}
	/>
);