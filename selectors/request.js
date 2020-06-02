export const getId = (request = {}) => {
	return getParams(request).id;
}

export const getParams = (request = {}) => {
	return request.params || {};
}

export const getBody = (request = {}) => {
	return request.body || {};
}