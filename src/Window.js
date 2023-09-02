import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { navigation } from 'poon-router';
import { useAnimatedValue } from './util/animated';
import { useGesture } from './util/gesture';
import { ScreenHeader } from './ScreenHeader';
import { TextInput } from './TextInput';

export const Window = forwardRef(({
	children,
	title,
	search,
	onChangeSearch,
	searchLoading,
	headerRight,
	onClose,
	isVisible,
	presentation = 'modal',
}, ref) => {
	const shadeEl = useRef();
	const el = useRef();
	const pan = useAnimatedValue(0);

	const close = () => {
		if (onClose) {
			pan.spring(0).then(onClose);
		} else {
			navigation.goBack(1);
		}
	};

	useImperativeHandle(ref, () => ({
		close,
	}));

	const {height} = useGesture(el, {
		onCapture: e => {
			return (e.direction === 'y' && e.distance > 0);
		},
		onMove: e => {
			pan.setValue(height - Math.max(0, e.distance));
		},
		onUp: e => {
			if (e.flick === -1) return close();
			pan.spring(e.size);
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
				shadeEl.current.style.opacity = (value / height);
			}
			[...cards].forEach(el => {
				el.parentElement.style.transform = `scale(${1 - (.04 * percent)})`;
			});
		});
	}, [height]);

	return (
		<div className="layer">
			<div className={`shade shade-${presentation}`} ref={shadeEl}/>
			<div className={`window window-${presentation}`} ref={el}>
				{presentation === 'modal' ? (
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
				) : null}
				<div className="card-body" children={children}/>
			</div>
		</div>
	);
});
