import { useMemo } from 'react';
import { easeOutCubic } from './';

export class AnimatedValue {
	constructor(initialValue, id) {
		this.id = id;
		this.listeners = [];
		this.value = initialValue;
		this.oldValue = initialValue;
	}

	setValue = (value, remainingTime = 0) => {
		if (isNaN(value)) return console.warn('Cant animate NaN');
		if (remainingTime === 0) { // Stop animations and set the checkpoint
			delete this.id;
			this.oldValue = value;
		}
		this.value = value;
		this.listeners.forEach(fn => fn(value, remainingTime));
	};

	forceRender = () => {
		this.listeners.forEach(fn => fn(this.value));
	};

	spring = (finalValue, duration = AnimatedValue.defaultAnimationDuration) => new Promise(resolve => {
		if (finalValue === this.value) return resolve(); // cancel unnecessary animation

		const t0 = this.id = performance.now(); // a unique id for this animation lifecycle
		const oldValue = this.value;
		const animate = (t) => {
			if (t0 !== this.id) return;

			const elapsed = Math.max(0, t - t0);
			const remainingTime = Math.max(0, duration - elapsed);
			if (elapsed >= duration) {
				this.setValue(finalValue, remainingTime);
				resolve();
			} else {
				const d = (finalValue - oldValue) * easeOutCubic(elapsed / duration);
				this.setValue(oldValue + d, remainingTime);
				requestAnimationFrame(animate);
			}
		};
		animate(t0);
	});

	on = (fn) => {
		this.listeners.push(fn);
		return () => this.listeners = this.listeners.filter(i => i !== fn);
	};

	end = () => {
		delete this.id;
	};
}

AnimatedValue.defaultAnimationDuration = 300;

export const useAnimatedValue = (initialValue) => useMemo(() => {
	return new AnimatedValue(initialValue);
}, []);