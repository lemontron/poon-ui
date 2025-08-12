import { Children } from 'react';
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

export const Row = ({title, subtitle, className, LeftComponent, onPressMore, children}) => {
	return (
		<HStack align="center" spacing className={c('row', className)}>
			{LeftComponent}
			<div className="row-right">
				{title ? <div className="row-title">{title}</div> : null}
				{subtitle ? <div className="row-subtitle">{subtitle}</div> : null}
				{children}
			</div>
			{onPressMore ? (
				<Touchable onClick={onPressMore}><Icon icon="more_vert"/></Touchable>
			) : null}
		</HStack>
	);
};

// VStack.propTypes = PropTypes.shape({
// 	appearance: PropTypes.oneOf(['v', 'h', 'z', 'c']),
// 	className: PropTypes.string,
// 	spacing: PropTypes.oneOfString(['none', 'small', 'medium', 'large']),
// 	interactive: PropTypes.bool,
// });