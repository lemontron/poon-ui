import { c } from './util';
import { Touchable } from './Touchable';
import { Icon } from './Icon';
// import PropTypes from 'prop-types';

const stackProps = (appearance, {
	justify,
	frame,
	align,
	spacing,
	className,
	passthrough,
	padding,
	safePadding,
	distributed,
	...props
}) => {
	return {
		'className': c(
			'stack',
			appearance,
			frame && 'frame',
			justify && `justify-${justify}`,
			align && `align-${align}`,
			passthrough && 'passthrough',
			padding && 'padding',
			spacing && 'spacing',
			safePadding && 'safe',
			distributed && 'distributed',
			className,
		),
		...props,
	};
};

export const VStack = (props) => (<div {...stackProps('v', props)}/>);
export const HStack = (props) => (<div {...stackProps('h', props)}/>);
export const ZStack = (props) => (<div {...stackProps('z', props)}/>);

export const FabStack = ({children}) => (
	<VStack align="trailing" justify="trailing" safePadding passthrough spacing="small" padding children={children}/>
);

export const Spacer = () => (<div className="spacer"/>);

export const Row = ({
	title,
	detail,
	subtitle,
	inactive,
	className,
	icon,
	LeftComponent,
	RightComponent,
	onPressMore,
	padding,
	children,
}) => {
	const renderLeftIcon = () => {
		if (typeof icon === 'string') return <Icon icon={icon}/>;
		if (typeof icon === 'object') return icon;
		return null;
	};

	return (
		<div className={c('row', padding && 'padding', inactive && 'inactive', className)}>
			{LeftComponent}
			<div className="row-left">
				{renderLeftIcon()}
			</div>
			<div className="row-body">
				{title ? (
					<div className="row-header">
						<div className="row-title">
							<span>{title}</span>
							{detail ? <span className="meta">{detail}</span> : null}
						</div>
						{subtitle ? <div className="row-subtitle">{subtitle}</div> : null}
					</div>
				) : null}
				{children}
			</div>
			{RightComponent}
			{onPressMore ? (
				<Touchable
					onClick={onPressMore}
					children={<Icon icon="more_vert"/>}
				/>
			) : null}
		</div>
	);
};

// VStack.propTypes = PropTypes.shape({
// 	appearance: PropTypes.oneOf(['v', 'h', 'z', 'c']),
// 	className: PropTypes.string,
// 	spacing: PropTypes.oneOfString(['none', 'small', 'medium', 'large']),
// 	interactive: PropTypes.bool,
// });