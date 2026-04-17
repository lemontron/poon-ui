import { useState } from 'react';
import { Button } from './Button.js';
import { c } from './util';

const toDateInputValue = (date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

const parseDateInputValue = (value) => {
	if (!value) return new Date();
	const [year, month, day] = value.split('-').map(Number);
	if (!year || !month || !day) return new Date();
	return new Date(year, month - 1, day);
};

const sameDay = (a, b) => (
	a.getFullYear() === b.getFullYear() &&
	a.getMonth() === b.getMonth() &&
	a.getDate() === b.getDate()
);

export const DateInput = ({
	value = '',
	onChangeText = () => null,
}) => {
	const selectedDate = parseDateInputValue(value);
	const [visibleMonth, setVisibleMonth] = useState(
		new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
	);

	const monthLabel = visibleMonth.toLocaleDateString(undefined, {
		'month': 'long',
		'year': 'numeric',
	});

	const firstDay = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
	const startOffset = firstDay.getDay();
	const cells = Array.from({length: 42}, (_, index) => (
		new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), index - startOffset + 1)
	));

	const changeMonth = (offset) => {
		setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1));
	};

	return (
		<div className="date-input">
			<div className="date-input-top">
				<Button
					icon="chevron_left"
					onClick={() => changeMonth(-1)}
				/>
				<div className="date-input-title">{monthLabel}</div>
				<Button
					icon="chevron_right"
					onClick={() => changeMonth(1)}
				/>
			</div>
			<div className="date-input-grid">
				{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((label, i) => (
					<div key={label + i} className="meta date-input-weekday">{label}</div>
				))}
				{cells.map(date => {
					const isCurrentMonth = date.getMonth() === visibleMonth.getMonth();
					const isSelected = sameDay(date, selectedDate);

					return (
						<Button
							key={toDateInputValue(date)}
							active={isSelected}
							className="date-input-day"
							onClick={() => {
								setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
								onChangeText(toDateInputValue(date));
							}}
							title={date.getDate()}
							muted={!isCurrentMonth}
						/>
					);
				})}
			</div>
		</div>
	);
};
