import React, { useEffect, useRef } from 'react';
import { navigation } from '@poon/router';
import { useAnimatedValue } from './util/animated';
import { ScreenHeader } from './ScreenHeader';
import { ScrollView } from './ScrollView';

export const FullScreen = ({
	title,
	children,
	footer,
	headerRight,
	SearchComponent,
}) => {
	const el = useRef();
	const pan = useAnimatedValue(0);

	const close = () => {
		pan.spring(0).then(() => navigation.goBack());
	};

	useEffect(() => {
		pan.spring(1);
		return pan.on(value => {
			el.current.style.opacity = value;
		});
	}, []);

	return (
		<div className="fullscreen" ref={el}>
			<ScreenHeader
				title={title}
				presentation="full"
				onClose={close}
				headerRight={headerRight}
				SearchComponent={SearchComponent}
			/>
			<ScrollView className="card-body">{children}</ScrollView>
			{footer}
		</div>
	);
};