export class StoredValue {
	constructor(key) {
		this.key = key;
	}

	get() {
		try {
			const value = localStorage.getItem(this.key);
			return value ? JSON.parse(value) : null;
		} catch (error) {
			return null;
		}
	}

	set(value) {
		localStorage.setItem(this.key, JSON.stringify(value));
	}
}
