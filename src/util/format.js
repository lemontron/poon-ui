export function relativeDate(date, word = 'ago') {
	if (!date || date.getTime() === 0) return 'never';
	const ms = (Date.now() - date.getTime());

	if (ms < 0) {
		const seconds = Math.abs(ms / 1000);
		if (seconds < 60) return `in ${Math.round(seconds)}s`;

		const minutes = (seconds / 60);
		if (minutes < 60) return `in ${Math.round(minutes)}m`;

		const hours = (minutes / 60);
		if (hours < 24) return `in ${Math.round(hours)}h`;

		const days = (hours / 24);
		if (days < 7) return `in ${Math.round(days)}d`;

		const weeks = (days / 7);
		if (weeks < 16) return `in ${Math.round(weeks)}w`;

		const months = (days / 30);
		if (months < 12) return `in ${Math.round(months)}mo`;

		const years = (months / 12);
		return `in ${Math.round(years)}yr`;
	} else {
		const seconds = (ms / 1000);
		if (seconds < 60) return 'just now';

		const minutes = (seconds / 60);
		if (minutes < 60) return `${Math.round(minutes)}m ${word}`;

		const hours = (minutes / 60);
		if (hours < 24) return `${Math.round(hours)}h ${word}`;

		const days = (hours / 24);
		if (days < 7) return `${Math.round(days)}d ${word}`;

		const weeks = (days / 7);
		if (weeks < 16) return `${Math.round(weeks)}w ${word}`;

		const months = (days / 30);
		if (months < 12) return `${Math.round(months)}mo ${word}`;

		const years = (months / 12);
		return `${Math.round(years)}yr ${word}`;
	}
}
