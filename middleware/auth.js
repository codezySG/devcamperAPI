import { verify } from 'jsonwebtoken';
import { asyncHandler } from './';
import ErrorResponse from '../utils/ErrorResponse';
import User from '../models/User';

// Selectors
import { getHeaders, getCookies } from '../selectors/request';

// Middleware to enable protection of certain routes (requires Bearer token/cookie)
export const protect = asyncHandler(async (req, res, next) => {
	let token;
	const { authorization } = getHeaders(req);
	const { cookies = {} } = getCookies(req);

	const { token: cookiesToken } = cookies;
	if (authorization && authorization.startsWith('Bearer')) {
		token = authorization.split(' ')[1];
	}
	// else if (cookiesToken) {
	// 	token = cookiesToken;
	// }

	// Make sure token exists
	if (!token) {
		return next(new ErrorResponse('Unauthorized access for this route', 401));
	}

	const { JWT_SECRET } = process.env || {};
	// Token verification
	try {
		const decoded = verify(token, JWT_SECRET);
		const { id: decodedUserId } = decoded;

		req.user = await User.findById(decodedUserId);

		next && next();
	} catch (err) {
		return next(new ErrorResponse('Unauthorized access for this route', 401));
	}
});
