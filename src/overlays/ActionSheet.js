import React from 'react';
import { createBus, useBus } from 'poon-router/util.js';
import { AnimatedValue } from '../util/animated.js';
import { TouchableRow } from '../TouchableRow.js';
import { BottomSheet } from '../BottomSheet.js';

const bus = createBus(null);
const pan = new AnimatedValue(0);

export const showActionSheet = (title, options, callback) => bus.update({title, options, callback});
export const hideActionSheet = () => bus.update(null);

export const ActionSheet = () => {
	const sheet = useBus(bus);

	const renderOption = (option, i) => {
		if (option.hidden) return null;
		const clickOption = async (e) => {
			await pan.spring(0);
			hideActionSheet();
			setTimeout(() => {
				if (option.onClick) option.onClick();
				if (sheet.callback) sheet.callback(option.value);
			}, 0);
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
			onClose={hideActionSheet}
			showShade
		>
			<div className="action-sheet-title">{sheet.title}</div>
			{sheet.options.map(renderOption)}
		</BottomSheet>
	);
};