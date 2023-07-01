import React from 'react';
import { createBus, useBus } from 'focus-router/util.js';
import { c } from './util';
import { Touchable } from './Touchable';
import { ScrollView } from './ScrollView';

const alertStore = createBus();

export const Alert = ({}) => {
	const data = useBus(alertStore);

	if (!data) return null;

	const {title, message, options, callback, visible} = data;

	const dismiss = () => {
		callback();
		alertStore.update();
	};

	const renderButtons = () => {
		if (options.length === 0) return null;

		const renderButton = (option, i) => {
			const pressButton = (e) => {
				if (option.onPress) option.onPress();
				callback(option._id || option.value);
				alertStore.update();
			};

			return (
				<Touchable
					key={i}
					className={c('alert-button', option.destructive && 'destructive')}
					onClick={pressButton}
					children={option.name}
					disableMenu
				/>
			);
		};

		return (
			<ScrollView
				className={c('alert-buttons', options.length <= 2 && 'alert-buttons-horizontal')}
				children={options.map(renderButton)}
			/>
		);
	};

	return (
		<div className={c('layer', 'alert-container', visible && 'visible')} onClick={dismiss}>
			<div className="alert" onClick={e => e.stopPropagation()}>
				<div className="alert-top">
					<div className="alert-title">{title}</div>
					<div className="alert-message">{message}</div>
				</div>
				{renderButtons()}
			</div>
		</div>
	);
};

export const showAlert = (title, message, options = [{name: 'Close'}]) => new Promise(resolve => {
	alertStore.update({title, message, options, 'callback': resolve, 'visible': true});
});