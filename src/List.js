import { Children, Fragment } from 'react';
import { c } from './util';
import { Loading } from './Suspense.js';

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
	well = false,
	showCountFooter = false,
}) => {
	if (loading) return <Loading/>;

	const hasContent = items.length > 0 || Children.count(children) > 0;
	if (ListEmptyComponent && !hasContent) return ListEmptyComponent;

	const renderList = () => {
		return items.map((item, i) => (
			<Fragment key={keyExtractor(item)}>
				{renderItem(item, i)}
				{showSeparators && (i < items.length - 1 ? <hr/> : null)}
			</Fragment>
		));
	};

	const renderChild = (child, i) => (
		<Fragment key={i}>
			{child}
			{showSeparators && (i < children.length - 1 ? <hr/> : null)}
		</Fragment>
	);

	return (
		<div className={c('list', className, safePadding && 'safe-padding', well && 'well')}>
			{title ? (
				<Fragment>
					<div className="list-title">{title}</div>
					<hr/>
				</Fragment>
			) : null}
			{HeaderComponent}
			<div className="list-body">
				{renderList()}
				{Children.map(children, renderChild)}
				{showCountFooter ? (
					<div className="list-footer">{items.length} items</div>
				) : null}
			</div>
		</div>
	);
};