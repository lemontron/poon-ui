import React, { Fragment } from 'react';
import { Touchable } from './Touchable';
import { Icon } from './Icon';

const closeImage = {'card': 'os:back', 'modal': 'os:close', 'reveal': 'close'};

export const ScreenHeader = ({
	title,
	subtitle,
	presentation = 'card',
	onClose,
	headerRight,
	SearchComponent,
}) => {
	const pressBack = (e) => {
		e.stopPropagation();
		e.preventDefault();
		onClose();
	};

	const closeIcon = closeImage[presentation];
	return (
		<Fragment>
			<div className="header">
				<div className="header-spacer">
					{closeIcon && (
						<Touchable
							className="header-close"
							onClick={pressBack}
							children={<Icon icon={closeIcon}/>}
						/>
					)}
				</div>
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