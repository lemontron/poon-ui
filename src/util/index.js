export const c = (...rest) => rest.filter(Boolean).join(' ');

export const toPercent = val => `${val * 100}%`;