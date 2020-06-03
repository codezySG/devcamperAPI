// middleware functions (have access to req, res cycle)
import Bootcamp from '../models/Bootcamp';

// Selectors
import { getId, getBody } from '../selectors/request';

// Middleware
import { asyncHandler } from '../middleware/async';

// Utils
import ErrorResponse from '../utils/ErrorResponse';

export const getBootcamps = asyncHandler(async (req, res, next) => {
	const bootcamps = await Bootcamp.find();
	res.status(200).json({success: true, count: bootcamps.length, data: bootcamps});
});

export const getBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(getId(req));

	if (!bootcamp) {
		return next(new ErrorResponse(`Bootcamp not found with id of ${getId(req)}`, 404));
	}

	res.status(200).json({success: true, data: bootcamp});
});

export const createBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.create(req.body);
	res.status(201).json({success: true, data: bootcamp});
});

export const updateBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findByIdAndUpdate(getId(req), getBody(req), {
		new: true,
		runValidators: true
	});

	if (!bootcamp) {
		return next(new ErrorResponse(`Bootcamp not found with id of ${getId(req)}`, 404));
	}

	res.status(200).json({success: true, data: bootcamp});
});

export const deleteBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findByIdAndDelete(getId(req));

	if (!bootcamp) {
		return next(new ErrorResponse(`Bootcamp not found with id of ${getId(req)}`, 404));
	}

	res.status(200).json({success: true, data: null});
});
