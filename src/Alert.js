import React from 'react';
import { createBus, useBus, randomId } from '@poon/router/util.js';
import { c } from './util';
import { Touchable } from './Touchable';
import { ScrollView } from './ScrollView';

const alertsStore = createBus([]);

const dismissAlert = (alert, val) => {
	// Hide alert
	alertsStore.update(alertsStore.state.map(a => {
		if (a === alert) a.visible = false;
		return a;
	}));

	// Remove alert when animation completes
	setTimeout(() => {
		alert.callback(val);
		alertsStore.update(alertsStore.state.filter(a => a !== alert));
	}, 200);
};

const SingleAlert = ({alert, isLast}) => {
	const renderButton = (option, i) => {
		const pressButton = () => {
			if (option.onPress) option.onPress();
			dismissAlert(alert, option._id || option.value);
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
		<div className={c('alert-container', isLast && alert.visible && alert.className)}>
			<div
				className={c('alert', isLast && alert.visible && 'visible')}
				onClick={e => e.stopPropagation()}
			>
				<div className="alert-top">
					{alert.title ? <div className="alert-title">{alert.title}</div> : null}
					{alert.message ? <div className="alert-message">{alert.message}</div> : null}
				</div>
				{alert.options.length ? (
					<ScrollView
						className={c('alert-buttons', alert.options.length <= 2 && 'alert-buttons-horizontal')}
						children={alert.options.map(renderButton)}
					/>
				) : null}
			</div>
		</div>
	);
};

export const Alert = () => {
	const alerts = useBus(alertsStore);
	const last = alerts.filter(alert => alert.visible).pop();

	if (alerts.length === 0) return null;
	return (
		<div
			className={c('layer alert-backdrop', alerts.some(a => a.visible) && 'visible')}
			onClick={() => dismissAlert(last)}
			children={alerts.map(alert => (
				<SingleAlert key={alert.key} alert={alert} isLast={last === alert}/>
			))}
		/>
	);
};

export const showAlert = (alert, options = [{name: 'Close'}]) => new Promise(resolve => {
	alertsStore.update([...alertsStore.state, {
		'key': randomId(),
		'callback': resolve,
		'visible': true,
		'options': options,
		...alert,
	}]);
});