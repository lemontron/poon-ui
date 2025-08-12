import { useRef } from 'react';
import { Icon } from './Icon';
import { Touchable } from './Touchable';
import { setRevealOrigin } from './Reveal';

const generateBgGradient = (color) => {
	if (!color) return;
	return `linear-gradient(rgba(255,255,255,10%), transparent), ${color}`;
};

export const SpringBoardIcon = ({title, icon, href, color}) => {
	const frameRef = useRef(null);

	const setOrigin = (e) => {
		const rect = frameRef.current.getBoundingClientRect();
		setRevealOrigin(rect);
	};

	return (
		<Touchable href={href} className="springboard-icon" onClick={setOrigin}>
			<div
				ref={frameRef}
				className="icon-frame"
				style={{background: generateBgGradient(color)}}
				children={<Icon icon={icon}/>}
			/>
			<div className="springboard-icon-name">{title}</div>
		</Touchable>
	);
};