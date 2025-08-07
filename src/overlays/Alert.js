import React, { useState } from 'react';
import { createBus, randomId, useBus } from 'poon-router';
import { c } from '../util';
import { Touchable } from '../Touchable.js';
import { ScrollView } from '../ScrollView.js';
import { Button } from '../Button.js';
import { TextInput } from '../TextInput.js';

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
	}, 300);
};

const SingleAlert = ({alert, isLast}) => {
	const [input, setInput] = useState('');

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

	const renderButtons = () => {
		if (!alert.options) return (
			<div className="alert-buttons alert-bottom">
				<Button
					color="white"
					fullWidth
					title="Close"
					onClick={() => dismissAlert(alert, input)}
				/>
			</div>
		);
		if (alert.options.length <= 2) return (
			<div className="alert-buttons horizontal">
				{alert.options.map(renderButton)}
			</div>
		);
		return (
			<ScrollView
				className="alert-buttons"
				children={alert.options.map(renderButton)}
			/>
		);
	};

	return (
		<div className={c('alert-container', isLast && alert.visible && alert.className)}>
			<div
				className={c('alert', isLast && alert.visible && 'visible')}
				onClick={e => e.stopPropagation()}
			>
				{/*{alert.debug ? (*/}
				{/*	<Touchable*/}
				{/*		className="material-icons"*/}
				{/*		onClick={() => navigator.clipboard.writeText(alert.debug)}*/}
				{/*		children="copy"*/}
				{/*	/>*/}
				{/*) : null}*/}
				<div className="alert-top">
					{alert.title ? <div className="alert-title">{alert.title}</div> : null}
					{alert.message ? <div className="alert-message">{alert.message}</div> : null}
					{alert.input ? (
						<TextInput
							className="alert-input"
							value={input}
							onChangeText={setInput}
						/>
					) : null}
				</div>
				{renderButtons()}
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

export const showAlert = (alert, options) => new Promise(resolve => {
	alertsStore.update([...alertsStore.state, {
		'key': randomId(),
		'callback': resolve,
		'visible': true,
		'options': options,
		...alert,
	}]);
});