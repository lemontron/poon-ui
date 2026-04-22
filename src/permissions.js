import { useEffect, useState } from 'react';
import { PENDING, GRANTED, DENIED } from './permissions/util.js';
import { pushNotifications } from './permissions/push-notifications.js';
import { gpsLocation, useLocation } from './permissions/location.js';

export const usePermission = def => {
	const [status, setStatus] = useState(def.status);
	useEffect(() => {
		def.checkAsync();
		return def.on(setStatus);
	}, [def]);
	return status;
};

export { PENDING, GRANTED, DENIED, pushNotifications, gpsLocation, useLocation };
