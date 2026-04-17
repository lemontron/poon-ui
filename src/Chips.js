import { useState } from 'react';
import { Tag } from './Tag';
import { showAlert } from './overlays/Alert.js';

export const Chips = ({
	chips = [],
	onChangeChips = () => null,
	placeholder,
}) => {
	const [value, setValue] = useState('');

	const submitChip = () => {
		const nextChip = value.trim();
		if (!nextChip) return;
		onChangeChips([...chips, nextChip]);
		setValue('');
	};

	const onKeyDown = (event) => {
		if (event.key !== 'Enter') return;
		event.preventDefault();
		submitChip();
	};

	const deleteChip = async (chip) => {
		const ok = await showAlert({
			'title': `Are you sure you want to remove ${chip}?`,
		}, [
			{value: false, name: 'Cancel'},
			{value: true, name: 'Remove', destructive: true},
		]);
		if (ok) onChangeChips(chips.filter(r => r !== chip));
	};

	return (
		<div className="chips-input">
			{chips.map((chip, i) => (
				<Tag key={`${chip}-${i}`} tag={chip} onDelete={deleteChip}/>
			))}
			<div className="chips-entry">
				<input
					className="chips-entry-input"
					type="text"
					value={value}
					placeholder={placeholder}
					onChange={(event) => setValue(event.target.value)}
					onKeyDown={onKeyDown}
				/>
			</div>
		</div>
	);
};
