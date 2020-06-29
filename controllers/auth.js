// Models
import User from '../models/User';

// Selectors
import { getId, getBody, getParams, getFile } from '../selectors/request';

// Middleware
// functions that (have access to req, res cycle)
import { asyncHandler } from '../middleware/';

// Utils
import ErrorResponse from '../utils/ErrorResponse';

// v1/auth/register -- Public -- POST
export const registerUser = asyncHandler(async (req, res, next) => {
	const { name, email, password, role } = getBody(req);

	// note: model already has validation
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

// v1/auth/login -- Public -- POST
export const login = asyncHandler(async (req, res, next) => {
	const { email, password } = getBody(req);

	// validate email & password
	if (!email || !password) {
		return next(new ErrorResponse(`Please provide an email and password`, 400));
	}

	// check for the user
	// bc we excluded password from the model, we need to include it for consideration here
	const user = await User.findOne({ email }).select('+password');

	if (!user) {
		// 401 = unauthorized err code
		return next(new ErrorResponse(`Invalid credentials`, 401));
	}

	// check if password matches to db pass
	const isMatch = await user.matchPassword(password);
	if (!isMatch) {
		// 401 = unauthorized err code
		return next(new ErrorResponse(`Invalid credentials`, 401));
	}


	// Create token
	const token = user.getSignedJwtToken();
	res.status(200).json({ success: true, token });
});
