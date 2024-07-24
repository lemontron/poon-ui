import React, { Fragment } from 'react';
import { Touchable } from './Touchable';
import { Icon } from './Icon';

const closeImage = {'card': 'os:back', 'modal': 'os:close', 'reveal': 'apps'};

export const ScreenHeader = ({
	title,
	subtitle,
	presentation = 'card',
	onClose,
	headerRight,
	headerLeft,
	SearchComponent,
}) => {
	const pressBack = (e) => {
		e.stopPropagation();
		e.preventDefault();
		onClose();
	};

	const renderHeaderLeft = () => {
		if (headerLeft) return headerLeft; // Prefer custom headerLeft

		const closeIcon = closeImage[presentation];
		if (closeIcon) return (
			<Touchable
				className="header-close"
				onClick={pressBack}
				children={<Icon icon={closeIcon}/>}
			/>
		);
	};

	return (
		<Fragment>
			<div className="header">
				<div className="header-spacer" children={renderHeaderLeft()}/>
				<div className="header-middle">
					<div className="header-title">{title}</div>
					{subtitle ? <div className="header-subtitle">{subtitle}</div> : null}
				</div>
				<div className="header-spacer">{headerRight}</div>
			</div>
			{SearchComponent}
		</Fragment>
	);
};