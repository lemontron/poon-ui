import React from 'react';
import { HStack, VStack } from './Stack.js';

export const PageTitle = ({LeftComponent, title, subtitle}) => {
	return (
		<HStack spacing align="center" className="page-title">
			{LeftComponent}
			<VStack>
				<h1>{title}</h1>
				{subtitle ? (<h2>{subtitle}</h2>) : null}
			</VStack>
		</HStack>
	);
};
