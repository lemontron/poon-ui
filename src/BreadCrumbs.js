import { Fragment } from 'react';
import { Touchable } from './Touchable';
import { Icon } from './Icon';
import { ScrollView } from './ScrollView';

export const BreadCrumbs = ({path, onClickPath}) => {
	const slugs = path.split('/').filter(Boolean);

	const renderSlug = (slug, i) => (
		<Fragment key={slug + '_' + i}>
			<Touchable onClick={() => onClickPath('/' + slugs.slice(0, i + 1).join('/'))} children={slug}/>
			{i < slugs.length - 1 ? <span> / </span> : null}
		</Fragment>
	);

	return (
		<ScrollView horizontal className="breadcrumbs">
			<Icon icon="home" onClick={() => onClickPath('/')}/>
			<span> / </span>
			{slugs.map(renderSlug)}
		</ScrollView>
	);
};