import { VStack, ZStack } from '../Stack.js';
import { Fab } from '../Fab.js';

export const FabLayout = ({FabComponent, icon = 'add', href, onClick, children}) => {
	const renderFab = () => {
		if (href || onClick) return <Fab icon={icon} href={href} onClick={onClick}/>;
	};

	return (
		<ZStack frame>
			{children}
			<VStack className="fab-container" align="trailing" justify="trailing" passthrough>
				{FabComponent}
				{renderFab()}
			</VStack>
		</ZStack>
	);
};