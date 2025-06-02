import React from 'react';
import { c } from './util/index.js';

export const Layer = ({isActive = true, className, children, ref}) => (
	<div
		className={c('layer', className, !isActive && 'layer-inactive')}
		children={children}
		ref={ref}
	/>
);