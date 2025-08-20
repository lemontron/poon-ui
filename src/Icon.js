import { useRef, useImperativeHandle } from 'react';
import { c } from './util';

const iOS = /iPad|iPhone|iPod/.test(navigator.platform);
const iconMap = {
	'os:back': iOS ? 'arrow_back_ios' : 'arrow_back',
	'os:share': iOS ? 'ios_share' : 'share',
	'os:close': iOS ? 'keyboard_arrow_down' : 'close',
};

export const Icon = ({icon, className, color, title, size, onClick, ref}) => {
	const iconRef = useRef();

	useImperativeHandle(ref, () => ({
		triggerWiggle: () => {
			if (iconRef.current) iconRef.current.animate([
				{transform: 'rotate(0deg) scale(1)'},
				{transform: 'rotate(-10deg) scale(1.2)'},
				{transform: 'rotate(10deg) scale(1.3)'},
				{transform: 'rotate(-10deg) scale(1.2)'},
				{transform: 'rotate(0deg) scale(1)'},
			], {duration: 500, easing: 'ease-in-out'});
		},
	}), []);

	return (
		<i className={c('material-icons', className)}
		   style={{color, fontSize: size}}
		   title={title}
		   onClick={onClick}
		   children={iconMap[icon] || icon}
		   ref={iconRef}
		/>
	);
};