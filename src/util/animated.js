import { useMemo } from 'react';

export const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

export const bounce = (num, min, max) => {
	if (num > max) return max + ((max + num) / 50);
	if (num < min) return min - ((min - num) / 50);
	return num;
};

export const easeOutCubic = (t) => (--t) * t * t + 1;

export class AnimatedValue {
	constructor(initialValue) {
		this.listeners = [];
		this.value = initialValue;
		this.checkpoint = initialValue;
	}

	setValue = (value, stopAnimations = true) => {
		if (stopAnimations) delete this.id;
		this.value = value;
		this.listeners.forEach(fn => fn(value));
	};

	spring = (finalValue, duration = 300) => new Promise(resolve => {
		if (finalValue === this.value) return; // cancel unnecessary animation

		const t0 = this.id = performance.now(); // a unique id for this animation lifecycle
		const oldValue = this.value;
		const animate = (t) => {
			if (t0 !== this.id) return;

			const elapsed = Math.max(0, t - t0); // time hack
			if (elapsed >= duration) {
				this.setValue(finalValue);
				resolve();
			} else {
				const d = (finalValue - oldValue) * easeOutCubic(elapsed / duration);
				// if (this.name === 'sidebar') console.log('delta:', d, 'elapsed:', elapsed, 'duration:', duration, 'ease:', ease);
				this.setValue(oldValue + d, false);
				requestAnimationFrame(animate);
			}
		};
		animate(t0);
	});

	on = (fn) => {
		this.listeners.push(fn);
		return () => this.listeners = this.listeners.filter(i => i !== fn);
	};

	saveCheckpoint = () => {
		this.checkpoint = this.value;
	};
}

export const useAnimatedValue = (initialValue) => useMemo(() => {
	return new AnimatedValue(initialValue);
}, []);