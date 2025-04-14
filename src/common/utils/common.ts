export function createQuery(params: { [key: string]: string | number }) {
	const queryParams: string[] = [];
	Object.keys(params).forEach((key) => {
		const value = params[key];
		if (value) {
			queryParams.push(`${key}=${value}`);
		}
	});
	return queryParams.join('&');
}
