import React, { useRef, useEffect } from 'react';
import { createBus, useBus, randomId } from 'poon-router/util.js';
import { useAnimatedValue } from '../util/animated.js';
import { toPercent } from '../util/index.js';
import { Touchable } from '../Touchable.js';
import { Icon } from '../Icon.js';
import { Pan } from '../Pan.js';
import { Layer } from '../Layer.js';

const state = createBus([]);

const Notification = ({
	title,
	body,
	icon,
	onDismiss = () => null,
}) => {
	const el = useRef();
	const pan = useAnimatedValue(0);

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
		<Pan
			ref={el}
			className="notification"
			onCapture={(e) => {
				return (e.direction === 'x');
			}}
			onMove={(e) => {
				pan.setValue(e.distance / e.size);
			}}
			onUp={(e) => {
				if (e.flick) {
					pan.spring(-e.flick);
				} else {
					pan.spring(0);
				}
			}}
		>
			{icon ? <Icon icon={icon} className="notification-icon"/> : null}
			<div className="notification-middle">
				<div className="notification-title">{title}</div>
				<div className="notification-body">{body}</div>
			</div>
			<Touchable
				onClick={dismiss}
				className="notification-close"
				children={<Icon icon="close"/>}
			/>
		</Pan>
	);
};

export const Notifications = () => {
	const notifications = useBus(state);

	if (notifications.length === 0) return null;
	return (
		<Layer
			isActive={notifications.length > 0}
			className="poon-notifications"
			children={notifications.map(data => <Notification {...data}/>)}
		/>
	);
};

export const showNotification = (data) => {
	state.update([...state.state, {key: randomId(), ...data}]);
};