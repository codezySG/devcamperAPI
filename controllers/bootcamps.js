// middleware functions (have access to req, res cycle)
import Bootcamp from '../models/Bootcamp';

// Selectors
import { getId, getBody } from '../selectors/request';

// Utils
import ErrorResponse from '../utils/ErrorResponse';

export const getBootcamps = async (req, res, next) => {
	try {
		const bootcamps = await Bootcamp.find();
		res.status(200).json({success: true, count: bootcamps.length, data: bootcamps});
	} catch(err) {
		next && next(err);
	}
}

export const getBootcamp = async (req, res, next) => {
	try {
		const bootcamp = await Bootcamp.findById(getId(req));

		if (!bootcamp) {
			return next(new ErrorResponse(`Bootcamp not found with id of ${getId(req)}`, 404));
		}

		res.status(200).json({success: true, data: bootcamp});
	} catch(err) {
		next && next(err);
	}
}

export const createBootcamp = async (req, res, next) => {
	try {
		const bootcamp = await Bootcamp.create(req.body);
		res.status(201).json({success: true, data: bootcamp});
	} catch(err) {
		next && next(err);
	}
}

export const updateBootcamp = async (req, res, next) => {
	try {
		const bootcamp = await Bootcamp.findByIdAndUpdate(getId(req), getBody(req), {
			new: true,
			runValidators: true
		});

		if (!bootcamp) {
			return next(new ErrorResponse(`Bootcamp not found with id of ${getId(req)}`, 404));
		}

		res.status(200).json({success: true, data: bootcamp});
	} catch (err) {
		next && next(err);
	}
}

export const deleteBootcamp = async (req, res, next) => {
	try {
		const bootcamp = await Bootcamp.findByIdAndDelete(getId(req));

		if (!bootcamp) {
			return next(new ErrorResponse(`Bootcamp not found with id of ${getId(req)}`, 404));
		}

		res.status(200).json({success: true, data: null});
	} catch (err) {
		next && next(err);
	}
}
