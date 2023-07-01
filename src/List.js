import React, { Fragment, Children } from 'react';
import { c } from './util';

export const List = ({
	title,
	items = [],
	keyExtractor = r => r._id,
	renderItem,
	loading,
	className,
	ListEmptyComponent,
	children,
}) => {
	const renderList = () => {
		if (loading || !items) return null;
		if (ListEmptyComponent && items.length === 0) return ListEmptyComponent;
		return items.map((item, i) => (
			<Fragment key={keyExtractor(item)}>
				{renderItem(item, i)}
				{i < items.length - 1 && <hr/>}
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
		<div className={c('list', className)}>
			{title ? (
				<Fragment>
					<div className="list-title">{title}</div>
					<hr/>
				</Fragment>
			) : null}
			{(items.length || children) ? (
				<div className="list-body">
					{renderList()}
					{Children.map(children, renderChild)}
				</div>
			) : ListEmptyComponent}
		</div>
	);
};