import { Fragment } from 'react';
import { useVirtualKeyboard } from './util/viewport';
import { Modal } from './overlays/Modal';
import { ActionSheet } from './overlays/ActionSheet';
import { Alert } from './overlays/Alert';
import { Toast } from './overlays/Toast';
import { Notifications } from './overlays/Notifications';
import { GlobalLoading } from './overlays/GlobalLoading';

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
