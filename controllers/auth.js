// Models
import User from '../models/User';

// Selectors
import { getId, getBody, getParams, getFile } from '../selectors/request';

// Middleware
// functions that (have access to req, res cycle)
import { asyncHandler } from '../middleware/';

// Utils
import ErrorResponse from '../utils/ErrorResponse';

// v1/auth/register -- Public
export const registerUser = asyncHandler(async (req, res, next) => {
	const { name, email, password, role } = getBody(req);

	const user = await User.create({
		name,
		email,
		password,
		role
	});

	// Create token
	const token = user.getSignedJwtToken();

	res.status(200).json({ success: true, token });
});
