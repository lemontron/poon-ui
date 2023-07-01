import React from 'react';
import { createBus, useBus } from 'focus-router/util.js';

export const modalState = createBus([]);

const renderModal = (modal) => <div key={modal.id} className="absolute" children={modal.children}/>;

export const Modal = () => useBus(modalState).map(renderModal);

export const showModal = (children) => modalState.update([...modalState.state, {
	'id': Math.random(),
	'children': children,
}]);

export const hideModal = () => {
	modalState.update([]);
};