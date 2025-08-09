import { createBus, useBus } from 'poon-router';
import { AnimatedValue } from '../util/animated';
import { TouchableRow } from '../TouchableRow';
import { BottomSheet } from '../BottomSheet';

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
			setTimeout(async () => {
				if (option.onClick) await option.onClick();
				if (sheet.callback) sheet.callback(option.value);
			}, 10);
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