import { Fragment } from 'react';
import { Touchable } from './Touchable';
import { Icon } from './Icon';
import { ScrollView } from './ScrollView';

const generateCrumbsFromPath = (root, path) => {
	const parts = path.split('/').filter(Boolean);
	return parts.map((str, i) => {
		return {
			'name': str,
			'href': [root, ...parts.slice(0, i + 1)].join('/'),
		};
	});

};

export const BreadCrumbs = ({root = '/', path, crumbs}) => {
	crumbs = crumbs || generateCrumbsFromPath(root, path);
	const renderCrumb = (crumb, i) => (
		<Fragment key={crumb.name + '_' + i}>
			<Touchable href={crumb.href} children={crumb.name}/>
			{i < crumbs.length - 1 ? <span> / </span> : null}
		</Fragment>
	);

	return (
		<ScrollView horizontal className="breadcrumbs">
			<Touchable
				href={root}
				children={<Icon icon="home"/>}
			/>
			<span> / </span>
			{crumbs.map(renderCrumb)}
		</ScrollView>
	);
};