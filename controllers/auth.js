// Models
import User from '../models/User';

// Selectors
import {
	getId,
	getBody,
	getParams,
	getFile,
	getUser,
	getProtocol,
	getHost
} from '../selectors/request';

// Middleware
// functions that (have access to req, res cycle)
import { asyncHandler } from '../middleware/';

// Utils
import sendEmail from '../utils/sendEmail';
import ErrorResponse from '../utils/ErrorResponse';

import { createHash } from 'crypto';

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
	sendTokenResponse(user, 200, res);
});

// v1/auth/me -- Public -- GET
export const getMe  = asyncHandler(async (req, res, next) => {
	const { id: protectedUserId } = getUser(req);
	const user = await User.findById(protectedUserId);

	res.status(200).json({ success: true, data: user });
});

// v1/auth/resetpassword/:resetToken -- Public -- PUT
export const resetPassword  = asyncHandler(async (req, res, next) => {
	// Get hashed token
	const { resettoken } = getParams(req);

	const resetPasswordToken = createHash('sha256').update(resettoken).digest('hex');

	const user = await User.findOne({
		resetPasswordToken,
		resetPasswordExpire: { $gt: Date.now() }
	});

	if (!user) {
		return next(new ErrorResponse(`Invalid token`, 400));
	}

	const { password } = getBody(req);
	// Set the new password
	user.password = password; // Middleware will encrypt our password
	user.resetPasswordToken = undefined;
	user.resetPasswordExpire = undefined;

	await user.save();

	// Create token
	sendTokenResponse(user, 200, res);
});

// v1/auth/forgotpassword -- Public -- POST
export const forgotPassword  = asyncHandler(async (req, res, next) => {
	const { email: userEmail } = getBody(req);
	const user = await User.findOne({ email: userEmail });

	if (!user) {
		return next(new ErrorResponse(`There is no user with that email`, 404));
	}

	// Get reset token
	const resetToken = user.getResetPasswordToken();

	await user.save({ validateBeforeSave: false });

	// Create reset url
	const resetUrl = `${getProtocol(req)}://${getHost(req)}/api/v1/auth/resetpassword/${resetToken}`;
	const message = `You are receiving this email because you (or someone else) has requested a reset of your password. Please make a PUT request to: \n\n ${resetUrl}`;
	
	const { email } = user;
	try {
		await sendEmail({
			email,
			subject: 'Password reset token',
			message
		});

		res.status(200).json({ success: true, data: 'Email sent' });
	} catch(err) {
		// clear fields from db that were added if something went wrong here
		console.log(err);
		user.resetPasswordToken = undefined;
		user.resetPasswordExpire = undefined;

		await user.save({ validateBeforeSave: false });

		// 500 server error
		return next && next(new ErrorResponse(`Email could not be sent`, 500));
	}
	res.status(200).json({ success: true, data: user });
});

// Get token from model, create cookie & send res
const sendTokenResponse = (user = {}, statusCode, res = {}) => {
	// create token
	const token = user.getSignedJwtToken();

	const { JWT_COOKIE_EXPIRE, NODE_ENV } = process.env || {};

	let options = {
		expires: new Date(Date.now() + JWT_COOKIE_EXPIRE * 24 * 60 * 1000),
		httpOnly: true
	};

	// HTTPS cookie enabled only
	if (NODE_ENV === 'production') {
		options.secure = true;
	}

	res.status(statusCode).cookie('token', token, options).json({ success: true, token });
};
