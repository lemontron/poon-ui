import { useEffect, useState } from 'react';
import { c } from './util';

export const Dropdown = ({position, button, children}) => {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		if (!visible) return;
		const dismiss = (e) => {
			const isInsideContent = e.composedPath().some(el => {
				return el.classList && el.classList.contains('dropdown-content');
			});
			const isInsideChildButton = e.composedPath().some(el => {
				return el.classList && el.classList.contains('dropdown-item');
			});
			// Hide box if click is either: outside the dropdown box or inside a child (<DropdownItem/>)
			if (!isInsideContent || isInsideChildButton) setVisible(false);
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
				onClick={() => setVisible(true)}
			/>
			<div
				className={c('dropdown-content', position || 'top-right', visible ? 'visible' : 'hidden')}
				children={children}
			/>
		</span>
	);
};