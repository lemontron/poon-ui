import React, { Fragment } from 'react';
import { Modal } from './Modal.js';
import { ActionSheet } from './ActionSheet.js';
import { Alert } from './Alert.js';
import { Toast } from './Toast.js';
import { Notifications } from './Notifications.js';

export const PoonOverlays = () => (
	<Fragment>
		<Notifications/>
		<Modal/>
		<ActionSheet/>
		<Alert/>
		<Toast/>
	</Fragment>
);
