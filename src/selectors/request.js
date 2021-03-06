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

export const getHeaders = (request = {}) => {
	return request.headers || {};
}

export const getCookies = (request = {}) => {
	return request.cookies || {};
}

export const getUser = (request = {}) => {
	return request.user || {};
}

export const getRole = (request = {}) => {
	return request.role || {};
}

export const getProtocol = (request = {}) => {
	return request.protocol;
}

export const getHost = (request = {}) => {
	return request.get('host');
}