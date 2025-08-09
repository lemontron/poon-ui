import { Icon } from './Icon';

export const PullIndicator = ({ref}) => (
	<div className="pull-indicator" ref={ref}>
		<Icon icon="refresh" color="#000"/>
	</div>
);