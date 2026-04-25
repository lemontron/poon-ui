import { createContext, useState } from 'react';

export const ListReorderContext = createContext(null);

export const useReorder = ({items, keyExtractor, onReorder}) => {
	const [draggingKey, setDraggingKey] = useState(null);
	const [dropTarget, setDropTarget] = useState(null);

	const getPointerTarget = (x, y) => {
		const el = document.elementFromPoint(x, y)?.closest('.touchable-row[data-index]');
		if (!el) return null;

		const rect = el.getBoundingClientRect();
		const index = Number(el.dataset.index);
		const position = y > rect.top + rect.height / 2 ? 'after' : 'before';
		if (position !== 'after' || index === items.length - 1) return {index, position};

		return {index: index + 1, position: 'before'};
	};

	const reorderItem = async (draggedKey, insertIndex) => {
		const fromIndex = items.findIndex(item => keyExtractor(item) === draggedKey);

		setDraggingKey(null);
		setDropTarget(null);
		if (fromIndex < 0 || fromIndex === insertIndex || fromIndex + 1 === insertIndex) return;

		const nextItems = [...items];
		const [item] = nextItems.splice(fromIndex, 1);
		nextItems.splice(insertIndex > fromIndex ? insertIndex - 1 : insertIndex, 0, item);
		await onReorder(nextItems.map((item, index) => ({
			key: keyExtractor(item),
			index,
		})));
	};

	const startPointerDrag = (e, key) => {
		e.preventDefault();
		e.stopPropagation();
		e.currentTarget.setPointerCapture(e.pointerId);
		setDraggingKey(key);
	};

	const movePointerDrag = (e) => {
		if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;

		e.preventDefault();
		e.stopPropagation();
		setDropTarget(getPointerTarget(e.clientX, e.clientY));
	};

	const endPointerDrag = (e, key) => {
		if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;

		e.preventDefault();
		e.stopPropagation();
		e.currentTarget.releasePointerCapture(e.pointerId);

		const target = getPointerTarget(e.clientX, e.clientY);
		if (!target) {
			setDraggingKey(null);
			setDropTarget(null);
			return;
		}
		reorderItem(key, target.position === 'after' ? target.index + 1 : target.index);
	};

	const cancelPointerDrag = (e) => {
		if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
		setDraggingKey(null);
		setDropTarget(null);
	};

	const getReorderProps = key => onReorder ? {
		onTouchStart: e => e.stopPropagation(),
		onTouchMove: e => e.stopPropagation(),
		onTouchEnd: e => e.stopPropagation(),
		onPointerDown: e => startPointerDrag(e, key),
		onPointerMove: movePointerDrag,
		onPointerUp: e => endPointerDrag(e, key),
		onPointerCancel: cancelPointerDrag,
	} : null;

	return {draggingKey, dropTarget, getReorderProps};
};
