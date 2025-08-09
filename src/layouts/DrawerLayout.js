import { useRef, useEffect } from 'react';
import { useAnimatedValue } from '../util/animated';
import { Pan } from '../Pan';
import { createClamp } from '../util';

const width = 200; // Width of the drawer

export const DrawerLayout = ({
	DrawerComponent,
	children,
	showDrawer,
	onShowDrawer = () => null,
}) => {
	const drawerRef = useRef(null);
	const viewportRef = useRef(null);
	const pan = useAnimatedValue(0);
	const clamp = createClamp(0, 1);

	useEffect(() => {
		pan.spring(showDrawer ? 1 : 0);
		return pan.on(value => {
			drawerRef.current.style.transform = `translateX(${value * width}px)`;
			viewportRef.current.style.opacity = 1 - (value / 2);
		});
	}, [showDrawer]);

	return (
		<div className="drawer-container">
			<Pan
				direction="x"
				className="drawer-menu"
				ref={drawerRef}
				children={DrawerComponent}
				onCapture={e => {
					return (e.direction === 'x');
				}}
				onMove={e => {
					pan.setValue(clamp((width + e.distance) / width));
				}}
				onUp={e => {
					const isVisible = (e.flick !== 1);
					pan.spring(isVisible ? 1 : 0).then(() => {
						onShowDrawer(isVisible);
					});
				}}
				onClick={() => {
					onShowDrawer(false);
				}}
			/>
			<div
				className="drawer-viewport"
				ref={viewportRef}
				children={children}
				style={{pointerEvents: showDrawer ? 'none' : 'auto'}}
			/>
		</div>
	);
};