import { VStack } from './Stack';
import { ActivityIndicator } from './ActivityIndicator';

export const Loading = () => (
	<VStack align="center" justify="center" frame>
		<ActivityIndicator/>
	</VStack>
);