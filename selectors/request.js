export const getId = (request = {}) => {
	return getParams(request).id;
}

export const getParams = (request = {}) => {
	return request.params || {};
}

export const getBody = (request = {}) => {
	return request.body || {};
}

export const getQuery = (request = {}) => {
	return request.query || {};
}

export const getFiles = (request = {}) => {
	return request.files || {};
}

export const getFile = (request = {}) => {
	return getFiles(request).file;
}