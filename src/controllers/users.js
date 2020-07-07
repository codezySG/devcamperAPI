// Models
import User from '../models/User';

// Selectors
import { getParams, getBody } from '../selectors/request';

// Middleware
// functions that (have access to req, res cycle)
import { asyncHandler } from '../middleware/';

// Utils
import ErrorResponse from '../utils/ErrorResponse';

import { createHash } from 'crypto';

// v1/users -- PRIVATE/ADMIN -- GET
export const getUsers  = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedResults);
});

// v1/users/:id -- PRIVATE/ADMIN -- GET
export const getUser  = asyncHandler(async (req, res, next) => {
	const { id: userId } = getParams(req);
	const user = await User.findById(userId);

	res.status(200).json({ success: true, data: user });
});

// v1/users -- PRIVATE/ADMIN -- POST
export const createUser  = asyncHandler(async (req, res, next) => {
	const user = await User.create(getBody(req));

	res.status(201).json({ success: true, data: user });
});

// v1/users/:id -- PRIVATE/ADMIN -- PUT
export const updateUser  = asyncHandler(async (req, res, next) => {
	const { id: userId } = getParams(req);
	const user = await User.findByIdAndUpdate(userId, getBody(req), {
		new: true,
		runValidators: true
	});

	res.status(200).json({ success: true, data: user });
});

// v1/users/:id -- PRIVATE/ADMIN -- DELETE
export const deleteUser  = asyncHandler(async (req, res, next) => {
	const { id: userId } = getParams(req);
	await User.findByIdAndDelete(userId);

	res.status(200).json({ success: true, data: null });
});
