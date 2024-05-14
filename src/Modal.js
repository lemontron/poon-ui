import React from 'react';
import { createBus, useBus } from 'poon-router/util.js';
import { Layer } from './Layer.js';

export const modalState = createBus([]);

const renderModal = (modal) => <Layer key={modal.id} children={modal.children}/>;

export const Modal = () => useBus(modalState).map(renderModal);

export const showModal = (children) => modalState.update([...modalState.state, {
	'id': Math.random(),
	'children': children,
}]);

export const hideModal = () => {
	modalState.update([]);
};