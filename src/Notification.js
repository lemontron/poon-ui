import React from 'react';
import { createBus, useBus } from 'poon-router/util.js';

export const notificationsState = createBus([]);

const renderModal = (modal) => <div key={modal.id} className="layer" children={modal.children}/>;

export const Notifications = () => useBus(notificationsState).map(renderModal);

export const showNotification = (opts) => {
	notificationsState.update([...notificationsState.state, {
		'id': Math.random(),
		'opts': opts,
	}]);
};

export const hideNotification = () => {
	notificationsState.update([]);
};