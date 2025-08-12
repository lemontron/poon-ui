import { createBus, useBus } from 'poon-router';
import { ActivityIndicator } from '../ActivityIndicator';

const taskBus = createBus([]);

export const GlobalLoading = () => {
	const tasks = useBus(taskBus);

	if (tasks.length === 0) return null;

	return (
		<div className="global-loading">
			<ActivityIndicator/>
			<div>{tasks[0]}</div>
		</div>
	);
};

export const globalLoading = (id, op) => {
	if (op) {
		taskBus.update([...taskBus.state, id]);
	} else {
		taskBus.update(taskBus.state.filter(r => r !== id));
	}
};