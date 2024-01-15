import React, { Fragment } from 'react';
import { Modal } from './Modal.js';
import { ActionSheet } from './ActionSheet.js';
import { Alert } from './Alert.js';
import { Toast } from './Toast.js';
import { Notifications } from './Notifications.js';
import { useVirtualKeyboard } from './util/viewport.js';

export const PoonOverlays = () => {
	useVirtualKeyboard();
	return (
		<Fragment>
			<Notifications/>
			<Modal/>
			<ActionSheet/>
			<Alert/>
			<Toast/>
		</Fragment>
	);
};
