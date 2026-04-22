import { useEffect } from 'react';
import { Banner } from './Banner.js';
import { usePermission, pushNotifications, GRANTED, PENDING, DENIED } from './permissions.js';

export const PushNotificationsBanner = ({
	onEnable,
	autoEnable = false,
	pendingTitle = 'Push notification registering...',
	deniedTitle = 'Push notifications disabled!',
	icon = 'notifications',
}) => {
	const status = usePermission(pushNotifications);

	useEffect(() => {
		if (status === PENDING && autoEnable && onEnable) onEnable();
	}, [status, autoEnable, onEnable]);

	if (status === GRANTED) return null;

	if (status === PENDING) {
		if (autoEnable) return null;
		return <Banner icon={icon} title={pendingTitle}/>;
	}

	if (status === DENIED) {
		return <Banner icon={icon} title={deniedTitle} onClick={onEnable}/>;
	}

	return null;
};
