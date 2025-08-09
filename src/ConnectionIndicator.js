import { ActivityIndicator } from './ActivityIndicator';

export const ConnectionIndicator = ({status}) => {
	if (status === 'connected') return null;
	return (
		<div className="connection-indicator">
			<div className="bubble">
				<ActivityIndicator/>
				{status}
			</div>
		</div>
	);
};