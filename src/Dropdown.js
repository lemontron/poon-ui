import React, { useEffect, useState } from 'react';
import { c } from './util';

export const Dropdown = ({position, button, content}) => {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (!visible) return;
		const dismiss = (e) => {
			const insideDropdown = e.composedPath().some(el => {
				return el.classList && el.classList.contains('dropdown-content');
			});
			// if (debug) console.log('Debug', insideDropdown ? 'Inside' : 'Outside');
			if (!insideDropdown) setVisible(false);
		};
		setTimeout(() => {
			window.addEventListener('click', dismiss, {passive: false});
		}, 0);
		return () => window.removeEventListener('click', dismiss);
	}, [visible]);

	return (
		<span className="dropdown">
			<div
				children={button}
				className="dropdown-button"
				onClick={() => {
					console.log('show');
					setVisible(true);
				}}
			/>
			<div
				className={c('dropdown-content', position || 'top-right', visible ? 'visible' : 'hidden')}
				children={content}
			/>
		</span>
	);
};