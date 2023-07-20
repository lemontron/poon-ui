import React from 'react';
import { Touchable } from './Touchable.js';

export const Pill = ({title, color, onClick}) => (
	<Touchable className="pill" onClick={onClick} style={{backgroundColor: color}}>{title}</Touchable>
);