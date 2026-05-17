import { Children, Fragment, isValidElement } from 'react';
import { c } from './util';
import { Loading } from './Suspense.js';
import { ListReorderContext, useReorder } from './useReorder.js';

const defaultKeyExtractor = (item) => {
	if (typeof item === 'string') return item;
	return item._id;
};

const getListChildren = (children) => Children.toArray(children).flatMap(child => {
	if (isValidElement(child) && child.type === Fragment) return Children.toArray(child.props.children);
	return child;
}).filter(Boolean);

export const List = ({
	title,
	items = [],
	keyExtractor = defaultKeyExtractor,
	renderItem,
	loading,
	className,
	ListEmptyComponent,
	HeaderComponent,
	children,
	showSeparators = true,
	safePadding = false,
	well = false,
	showCountFooter = false,
	spacing,
	grid = false,
	onReorder,
	TitleRightComponent,
}) => {
	const {draggingKey, dropTarget, getReorderProps} = useReorder({items, keyExtractor, onReorder});

	if (loading) return <Loading/>;

	const renderedChildren = getListChildren(children);
	const hasContent = (items.length > 0 || renderedChildren.length > 0);
	if (ListEmptyComponent && !hasContent) return ListEmptyComponent;

	const renderChild = (child, i) => (
		<Fragment key={i}>
			{child}
			{showSeparators && (i < renderedChildren.length - 1 ? <hr/> : null)}
		</Fragment>
	);

	return (
		<div className={c('list', className, safePadding && 'safe-padding', well && 'well', grid && 'grid')}>
			{title ? (
				<div className="list-header">
					<div className="list-title">{title}</div>
					<div className="list-title">{TitleRightComponent}</div>
				</div>
			) : null}
			{HeaderComponent}
			<div className={c('list-body', spacing && 'spacing')}>
				{items.map((item, i) => {
					const key = keyExtractor(item);
					const position = dropTarget?.index === i ? dropTarget.position : null;
					return (
						<Fragment key={key}>
							<ListReorderContext.Provider
								value={onReorder ? {
									onReorder: getReorderProps(key),
									dragging: draggingKey === key,
									index: i,
									position,
								} : null}
								children={renderItem(item, i)}
							/>
							{showSeparators && (i < items.length - 1 ? <hr/> : null)}
						</Fragment>
					);
				})}
				{renderedChildren.map(renderChild)}
				{showCountFooter ? (
					<div className="list-footer">{items.length} items</div>
				) : null}
			</div>
		</div>
	);
};
