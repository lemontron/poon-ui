import { useMemo } from 'react';
import { clone, easeOutCubic, sameObject } from './index.js';

export class Animation {
    constructor(initialValue) {
        this.listeners = [];
        this.values = initialValue;
        this.initialValues = clone(initialValue);
    }

    set = (values, end = true) => {
        Object.assign(this.values, values);
        if (end) this.end();
        this.listeners.forEach(fn => fn(this.values));
    };

    spring = (finalValues, duration = Animation.defaultDuration) => new Promise(resolve => {
        if (sameObject(finalValues, this.values)) return; // cancel unnecessary animation

        const t0 = this.id = performance.now(); // a unique id for this animation lifecycle
        const oldValues = clone(this.values);
        const animate = (t) => {
            if (t0 !== this.id) return;

            const elapsed = Math.max(0, t - t0); // time hack
            if (elapsed >= duration) {
                this.set(finalValues, true);
                resolve();
            } else {
                const intermediateValues = Object.keys(finalValues).reduce((acc, key) => {
                    acc[key] = oldValues[key] + ((finalValues[key] - oldValues[key]) * easeOutCubic(elapsed / duration));
                    // console.log(key, oldValues[key], acc[key]);
                    return acc;
                }, {});

                this.set(intermediateValues, false);
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

    end = () => {
        delete this.id;
        this.initialValues = clone(this.values);
    };
}

Animation.defaultDuration = 300;

export const useAnimation = (initialValue) => useMemo(() => {
    return new Animation(initialValue);
}, []);