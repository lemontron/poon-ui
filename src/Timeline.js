import { Icon } from './Icon';
import { c } from './util';
import { Touchable } from './Touchable';

const TimelineItem = ({title, isComplete, onSkip, renderDetails, isActive}) => {
	const getIcon = () => {
		if (isComplete) return 'check';
		if (isActive) return 'circle';
	};

	const isDisabled = (!isComplete && !isActive);
	return (
		<div className={c('timeline-item', isDisabled && 'disabled', isActive && 'active')}>
			<div className="timeline-item-left">
				<div className="timeline-item-line top"/>
				<div className="timeline-item-icon">
					<Icon icon={getIcon()}/>
				</div>
				<div className="timeline-item-line"/>
			</div>
			<div className="timeline-item-right">
				<div className="timeline-item-title">
					<label>{title}</label>
					{(isActive && onSkip) ? (
						<Touchable children="Skip" onClick={onSkip}/>
					) : null}
				</div>
				{(isActive && !isComplete) ? (
					<div className="timeline-item-details">{renderDetails()}</div>
				) : null}
			</div>
		</div>
	);
};

export const Timeline = ({items}) => {
	const firstActionableStep = items.find(item => !item.isComplete);
	return (
		<div
			className="timeline"
			children={items.map(item => (
				<TimelineItem
					key={item._id}
					{...item}
					isActive={item === firstActionableStep}
				/>
			))}
		/>
	);
};