import { useEffect, useState } from 'react';
import { DENIED, GRANTED, PermissionDef } from './util.js';
import { StoredValue } from './storage.js';

export class Bus {
	constructor(initState) {
		this.state = initState;
		this.listeners = [];
	}

	update = val => {
		if (this.state === val) return;
		this.state = val;
		this.listeners.forEach(fn => fn(val));
	};

	on = cb => {
		this.listeners.push(cb);
		return () => this.listeners = this.listeners.filter(fn => fn !== cb);
	};
}

export const createBus = initState => new Bus(initState);

export const useBus = bus => {
	const [val, setVal] = useState(bus.state);
	useEffect(() => bus.on(setVal), [bus]);
	return val;
};

const lastLocation = new StoredValue('lastLocation');

const locationState = createBus(lastLocation.get());

const transformLocation = e => ({
	'type': 'Point',
	'coordinates': [e.coords.longitude, e.coords.latitude],
	'properties': {
		'altitude': e.coords.altitude,
		'accuracy': e.coords.accuracy,
		'heading': e.coords.heading,
		'date': new Date(e.timestamp),
	},
});

export const gpsLocation = new PermissionDef('GPS_LOCATION', {
	async checkAsync() {
		try {
			const status = await navigator.permissions.query({'name': 'geolocation'});
			return status.state === 'granted' ? GRANTED : DENIED;
		} catch (e) {
			console.warn('Permission check failed:', e);
			return DENIED;
		}
	},
	askAsync: () => new Promise(resolve => {
		navigator.geolocation.getCurrentPosition(
			() => resolve(GRANTED),
			() => resolve(DENIED),
		);
	}),
});

let isWatching = false;
const watchLocation = () => {
	if (isWatching) return;

	isWatching = true;
	navigator.geolocation.watchPosition(e => {
		const loc = transformLocation(e);
		lastLocation.set(loc);
		locationState.update(loc);
	}, error => {
		isWatching = false;
		console.log(error.message);
	}, {
		'maximumAge': 0,
		'enableHighAccuracy': true,
	});
};

export const useLocation = () => {
	useEffect(watchLocation, []);
	return useBus(locationState);
};
