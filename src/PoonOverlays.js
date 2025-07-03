import React, { Fragment } from 'react';
import { useVirtualKeyboard } from './util/viewport.js';
import { Modal } from './overlays/Modal.js';
import { ActionSheet } from './overlays/ActionSheet.js';
import { Alert } from './overlays/Alert.js';
import { Toast } from './overlays/Toast.js';
import { Notifications } from './overlays/Notifications.js';
import { GlobalLoading } from './overlays/GlobalLoading.js';

export const PoonOverlays = () => {
	useVirtualKeyboard();
	return (
		<Fragment>
			<Notifications/>
			<Modal/>
			<ActionSheet/>
			<Alert/>
			<Toast/>
			<GlobalLoading/>
		</Fragment>
	);
};
