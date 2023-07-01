import React from 'react';
import { createBus, useBus, randomId } from '@poon/router/util.js';
import { c } from './util';
import { Touchable } from './Touchable';
import { ScrollView } from './ScrollView';

const alertsStore = createBus([]);

const dismissAlert = (callback, val) => {
	alertsStore.update(alertsStore.state.map(a => { // Hide alert
		if (a.callback === callback) a.visible = false;
		return a;
	}));
	setTimeout(() => { // Remove alert
		alertsStore.update(alertsStore.state.filter(a => a.callback !== callback));
		callback(val);
	}, 200);
};

const SingleAlert = ({key, title, message, options, visible, callback}) => {
	const renderButton = (option, i) => {
		const pressButton = () => {
			if (option.onPress) option.onPress();
			dismissAlert(callback, option._id || option.value);
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
		<div key={key} className="alert-container">
			<div key={key} className={c('alert', visible && 'visible')} onClick={e => e.stopPropagation()}>
				<div className="alert-top">
					<div className="alert-title">{title}</div>
					<div className="alert-message">{message}</div>
				</div>
				{options.length ? (
					<ScrollView
						className={c('alert-buttons', options.length <= 2 && 'alert-buttons-horizontal')}
						children={options.map(renderButton)}
					/>
				) : null}
			</div>
		</div>
	);
};

export const Alert = () => {
	const alerts = useBus(alertsStore);
	const visible = alerts.some(a => a.visible);

	const dismissOne = () => {
		const last = alertsStore.state.filter(alert => alert.visible).pop();
		dismissAlert(last.callback);
	};

	if (alerts.length === 0) return null;
	return (
		<div
			className={c('layer alert-backdrop', visible && 'visible')}
			onClick={dismissOne}
			children={alerts.map(SingleAlert)}
		/>
	);
};

export const showAlert = (title, message, options = [{name: 'Close'}]) => new Promise(resolve => {
	alertsStore.update([...alertsStore.state, {
		'key': randomId(),
		title,
		message,
		options,
		'callback': resolve,
		'visible': true,
	}]);
});