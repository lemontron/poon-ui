import React, { useRef, useEffect } from 'react';
import { createBus, useBus, randomId } from 'poon-router/util.js';
import { useGesture } from './util/gesture.js';
import { useAnimatedValue } from './util/animated.js';
import { toPercent } from './util/index.js';
import { Touchable } from './Touchable.js';
import { Icon } from './Icon.js';

const state = createBus([]);

const Notification = ({
	title,
	body,
	onDismiss = () => null,
}) => {
	const el = useRef();
	const pan = useAnimatedValue(0);

	useGesture(el, {
		onCapture(e) {
			return (e.direction === 'x');
		},
		onMove(e) {
			pan.setValue(e.distance / e.size);
		},
		onUp(e) {
			if (e.flick) {
				pan.spring(-e.flick);
			} else {
				pan.spring(0);
			}
		},
	}, []);

	const dismiss = () => {
		pan.spring(1).then(onDismiss);
	};

	useEffect(() => {
		return pan.on(val => {
			el.current.style.opacity = (1 - Math.abs(val));
			el.current.style.transform = `translateX(${toPercent(val)})`;
		});
	}, []);

	return (
		<div className="notification" ref={el}>
			<div>
				<div className="notification-title">{title}</div>
				<div className="notification-body">{body}</div>
			</div>
			<Touchable onClick={dismiss}>
				<Icon icon="close"/>
			</Touchable>
		</div>
	);
};

export const Notifications = () => {
	const notifications = useBus(state);

	if (notifications.length === 0) return null;
	return (
		<div className="layer notifications-container">
			{notifications.map(data => <Notification {...data}/>)}
		</div>
	);
};

export const showNotification = (data) => {
	state.update([...state.state, {key: randomId(), ...data}]);
};