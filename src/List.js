import { Children, Fragment } from 'react';
import { c } from './util';

const defaultKeyExtractor = (item) => {
	if (typeof item === 'string') return item;
	if (typeof item === 'object') return item._id;
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
	children,
	showSeparators = true,
	safePadding = false,
	inset = false,
	showCountFooter = false,
}) => {
	const renderList = () => {
		if (loading || !items) return null;
		if (ListEmptyComponent && items.length === 0) return ListEmptyComponent;
		return items.map((item, i) => (
			<Fragment key={keyExtractor(item)}>
				{renderItem(item, i)}
				{(showSeparators && i < items.length - 1) && <hr/>}
			</Fragment>
		));
	};

	const renderChild = (child, i) => (
		<Fragment key={i}>
			{child}
			{i < children.length - 1 && <hr/>}
		</Fragment>
	);

	return (
		<div className={c('list', className, safePadding && 'safe-padding', inset && 'list-inset')}>
			{title ? (
				<Fragment>
					<div className="list-title">{title}</div>
					<hr/>
				</Fragment>
			) : null}
			{HeaderComponent}
			{(items.length || children) ? (
				<div className="list-body">
					{renderList()}
					{Children.map(children, renderChild)}
					{showCountFooter ? (
						<div className="list-footer">{items.length} items</div>
					) : null}
				</div>
			) : ListEmptyComponent}
		</div>
	);
};