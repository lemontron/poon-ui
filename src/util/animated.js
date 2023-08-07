import { useMemo } from 'react';
import { easeOutCubic } from './index.js';

export class AnimatedValue {
    constructor(initialValue) {
        this.listeners = [];
        this.value = initialValue;
        this.oldValue = initialValue;
    }

    setValue = (value, end = true) => {
        if (end) { // Stop animations and set the checkpoint
            delete this.id;
            this.oldValue = value;
        }
        this.value = value;
        this.listeners.forEach(fn => fn(value));
    };

    spring = (finalValue, duration = AnimatedValue.defaultAnimationDuration) => new Promise(resolve => {
        if (finalValue === this.value) return; // cancel unnecessary animation

        const t0 = this.id = performance.now(); // a unique id for this animation lifecycle
        const oldValue = this.value;
        const animate = (t) => {
            if (t0 !== this.id) return;

            const elapsed = Math.max(0, t - t0); // time hack
            if (elapsed >= duration) {
                this.setValue(finalValue, true);
                resolve();
            } else {
                const d = (finalValue - oldValue) * easeOutCubic(elapsed / duration);
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

    stop = () => {
        delete this.id;
    };
}

AnimatedValue.defaultAnimationDuration = 300;

export const useAnimatedValue = (initialValue) => useMemo(() => {
    return new AnimatedValue(initialValue);
}, []);