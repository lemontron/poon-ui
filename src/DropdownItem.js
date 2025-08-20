import { TouchableRow } from './TouchableRow';

export const DropdownItem = ({title, icon, target, onClick, href, disabled, children, active}) => (
	<TouchableRow
		className="dropdown-item"
		onClick={onClick}
		disabled={disabled}
		active={active}
		target={target}
		children={children}
		href={href}
		icon={icon}
		title={title}
	/>
);