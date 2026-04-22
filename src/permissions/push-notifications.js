import { DENIED, GRANTED, PermissionDef } from './util.js';

export const pushNotifications = new PermissionDef('PUSH_NOTIFICATIONS', {
	async checkAsync() {
		const registration = await navigator.serviceWorker.ready;
		const sub = await registration.pushManager.getSubscription();
		return sub ? GRANTED : DENIED;
	},
	async askAsync(opts) {
		if (!opts) throw new Error('Missing options for askAsync. Provide the following setup options {userVisibleOnly, applicationServerKey}');
		const result = await Notification.requestPermission();
		if (result === 'denied') return DENIED;

		const registration = await navigator.serviceWorker.ready;
		const sub = await registration.pushManager.getSubscription();
		if (sub) return GRANTED;

		await registration.pushManager.subscribe(opts);
		return GRANTED;
	},
	async getConfigAsync() {
		const registration = await navigator.serviceWorker.ready;
		const sub = await registration.pushManager.getSubscription();
		if (sub) return JSON.parse(JSON.stringify(sub));
	},
});
