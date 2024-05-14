import React, { forwardRef } from 'react';
import { c } from './util/index.js';

export const Layer = forwardRef(({isActive = true, className, children}, ref) => (
	<div
		className={c('layer', className, !isActive && 'layer-inactive')}
		children={children}
		ref={ref}
	/>
));