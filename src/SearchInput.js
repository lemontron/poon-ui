import React from 'react';
import { Icon } from './Icon';
import { ProgressIndicator } from './ProgressIndicator.js';

export const SearchInput = ({value, placeholder, onChange, loading}) => (
	<div className="search">
		<Icon icon="search"/>
		<input
			placeholder={placeholder}
			type="search"
			value={value}
			onChange={e => {
				e.stopPropagation();
				onChange(e.target.value);
			}}
		/>
		<Icon
			icon="close"
			onClick={() => onChange('')}
			size={16}
		/>
		{loading ? <ProgressIndicator/> : null}
	</div>
);