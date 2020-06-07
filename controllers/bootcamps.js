// Models
import Bootcamp from '../models/Bootcamp';

// Selectors
import { getId, getBody, getParams, getQuery } from '../selectors/request';

// Middleware
// functions that (have access to req, res cycle)
import { asyncHandler } from '../middleware/async';

// Utils
import ErrorResponse from '../utils/ErrorResponse';
import geocoder from '../utils/geocoder';

const EARTH_RADIUS = 3963;

export const getBootcamps = asyncHandler(async (req, res, next) => {
	const queryStr = JSON.stringify(getQuery(req)).replace(/\b(gt|gte|lt|lte|in)/g, match => `$${match}`);
	Bootcamp.find(JSON.parse(queryStr));

	const bootcamps = await Bootcamp.find(JSON.parse(queryStr));
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

// @route		GET /api/v1/bootcamps/radius/:zipcode/:distance
export const getBootcampsInRadius = asyncHandler(async (req, res, next) => {
	const { zipcode, distance } = getParams(req);

	// Get lat/lon from geocoder
	const location = await geocoder.geocode(zipcode);
	const [ locationObj = {} ] = location;

	const { longitude, latitude } = locationObj;

	// calc dist using radians
	// divide dist by radius of earth
	const radius = distance / EARTH_RADIUS;

	const bootcamps = await Bootcamp.find({
		location: {
			$geoWithin: {
				$centerSphere: [ [ longitude, latitude ], radius ]
			}
		}
	});

	res.status(200).json({success:true, count: bootcamps.length, data: bootcamps});
});
