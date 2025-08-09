import { Touchable } from './Touchable';

export const Pill = ({title, color, onClick}) => (
	<Touchable className="pill" onClick={onClick} style={{backgroundColor: color}}>{title}</Touchable>
);