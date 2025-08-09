import { Icon } from './Icon';
import { TouchableRow } from './TouchableRow';

export const RadioButton = ({active, icon, title, elaboration, subtitle, value, disabled, onClick, children}) => (
	<TouchableRow
		onClick={() => {
			onClick(value);
		}}
		disabled={disabled}
		className="radio-btn"
		active={active}
	>
		<div className="radio-top">
			<div className="dot">
				<div className="dot-inside"/>
			</div>
			{icon && <Icon icon={icon}/>}
			<div className="radio-title">{title}</div>
		</div>
		{children && <div className="radio-subtitle">{children}</div>}
		{subtitle && <div className="radio-subtitle">{subtitle}</div>}
		{active && elaboration && <div className="radio-subtitle" children={elaboration}/>}
	</TouchableRow>
);