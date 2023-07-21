import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { navigation } from 'poon-router';
import { usePanGestures } from './util/gestures';
import { useAnimatedValue } from './util/animated';
import { ScrollView } from './ScrollView';
import { ScreenHeader } from './ScreenHeader';
import { TextInput } from './TextInput';

export const Window = forwardRef(({
	children,
	title,
	search,
	onChangeSearch,
	searchLoading,
	hasScrollView = true,
	headerRight,
	onClose,
	isVisible,
}, ref) => {
	const shadeEl = useRef();
	const el = useRef();
	const pan = useAnimatedValue(0);

	const close = () => {
		console.log('close window');
		if (onClose) {
			pan.spring(0).then(onClose);
		} else {
			navigation.goBack(1);
		}
	};

	useImperativeHandle(ref, () => ({
		close,
	}));

	const {height} = usePanGestures(el, {
		onMove: e => {
			pan.setValue(height - Math.max(0, e.d.y));
		},
		onUp: e => {
			if (e.flick.y === 1 || e.d.y > (e.height / 2)) {
				close();
			} else {
				pan.spring(e.height);
			}
		},
	});

	useEffect(() => {
		if (!height) return;

		if (isVisible || onClose) { // onClose is here because the window is in a modal if there is an onClose
			pan.spring(height);
		} else {
			pan.spring(0);
		}
	}, [isVisible, height]);

	useEffect(() => {
		const cards = document.querySelectorAll('.card');
		return pan.on(value => {
			const percent = (value / height);
			if (el.current) el.current.style.transform = `translateY(-${value}px)`;
			if (shadeEl.current) {
				shadeEl.current.style.display = value ? 'block' : 'none';
				shadeEl.current.style.opacity = (value / height) * .8;
			}
			[...cards].forEach(el => {
				el.style.transform = `scale(${1 - (.04 * percent)})`;
			});
		});
	}, [height]);

	return (
		<div className="layer">
			<div className="shade" ref={shadeEl}/>
			<div className="window" ref={el}>
				<div className="window-content">
					<ScreenHeader
						title={title}
						presentation="modal"
						onClose={close}
						SearchComponent={onChangeSearch ? (
							<div className="header-search">
								<TextInput
									placeholder="Search"
									type="search"
									value={search}
									onChangeText={onChangeSearch}
									loading={searchLoading}
								/>
							</div>
						) : null}
						headerRight={headerRight}
					/>
					{hasScrollView ? (
						<ScrollView className="card-body" children={children}/>
					) : (
						<div className="card-body" children={children}/>
					)}
				</div>
			</div>
		</div>
	);
});
