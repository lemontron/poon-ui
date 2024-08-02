import React from 'react';
import { CStack } from './Stack.js';
import { ActivityIndicator } from './ActivityIndicator.js';

export const Loading = () => (
	<CStack>
		<ActivityIndicator/>
	</CStack>
);