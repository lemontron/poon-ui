import { Touchable } from '../Touchable';

export const TabNavigation = ({
	children,
	isVisible,
	animateIn = true,
}) => {
	return (
		<div className="tab-container">

			<div className="bottom-tabs">
				<Touchable>Hey</Touchable>
			</div>
		</div>
	);
};
