import { Children, Fragment } from 'react';
import { c } from './util';
import { Loading } from './Suspense.js';
import { ListReorderContext, useReorder } from './useReorder.js';

const defaultKeyExtractor = (item) => {
	if (typeof item === 'string') return item;
	return item._id;
};

export const List = ({
	title,
	items = [],
	keyExtractor = defaultKeyExtractor,
	renderItem,
	loading,
	className,
	ListEmptyComponent,
	HeaderComponent,
	HeaderRightComponent,
	children,
	showSeparators = true,
	safePadding = false,
	well = false,
	showCountFooter = false,
	spacing,
	onReorder,
}) => {
	const {draggingKey, dropTarget, getReorderProps} = useReorder({items, keyExtractor, onReorder});

	if (loading) return <Loading/>;

	const hasContent = (items.length > 0 || Children.count(children) > 0);
	if (ListEmptyComponent && !hasContent) return ListEmptyComponent;

	const renderChild = (child, i) => (
		<Fragment key={i}>
			{child}
			{showSeparators && (i < children.length - 1 ? <hr/> : null)}
		</Fragment>
	);

	return (
		<div className={c('list', className, safePadding && 'safe-padding', well && 'well')}>
			{title ? (
				<div className="list-header">
					<div className="list-title">{title}</div>
					{HeaderRightComponent}
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
				{Children.map(children, renderChild)}
				{showCountFooter ? (
					<div className="list-footer">{items.length} items</div>
				) : null}
			</div>
		</div>
	);
};
