import React from 'react';
import { createBus, useBus } from 'poon-router/util.js';
import { AnimatedValue } from './util/animated';
import { TouchableRow } from './TouchableRow';
import { BottomSheet } from './BottomSheet';

const bus = createBus(null);
const pan = new AnimatedValue(0);

export const ActionSheet = () => {
	const sheet = useBus(bus);

	const renderOption = (option, i) => {
		if (option.hidden) return null;
		const clickOption = (e) => {
			if (option.onClick) option.onClick();
			if (sheet.callback) sheet.callback(option.value);
			pan.spring(0).then(() => bus.update(0));
		};
		return (
			<TouchableRow
				key={i}
				title={option.name}
				leftIcon={option.icon}
				onClick={clickOption}
				disabled={option.disabled}
				target={option.target}
				href={option.href}
			/>
		);
	};

	if (!sheet) return null;

	return (
		<BottomSheet
			pan={pan}
			visible
			onClose={() => bus.update(null)}
			showShade
		>
			<div className="action-sheet-title">{sheet.title}</div>
			{sheet.options.map(renderOption)}
		</BottomSheet>
	);
};

export const showActionSheet = (title, options, callback) => bus.update({title, options, callback});