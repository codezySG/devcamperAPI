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
const fieldExclusionList = ['select', 'sort'];

export const getBootcamps = asyncHandler(async (req, res, next) => {
	const reqQuery = { ...getQuery(req) };
	fieldExclusionList.forEach((param) => {
		delete reqQuery[param];
	});

	// create query as string and use regex to match and replace gt/gte/lt/lte/in with $ in front
	const queryStr = JSON.stringify(reqQuery).replace(/\b(gt|gte|lt|lte|in)/g, match => `$${match}`);
	let query = Bootcamp.find(JSON.parse(queryStr));
	// if select field was in the og query
	const selectQuery = getQuery(req).select;
	if (selectQuery) {
		const fieldsArr = selectQuery.split(',').join(' ');
		query = query.select(fieldsArr);
	}

	// Sort
	const sortQuery = reqQuery.sort;
	if (sortQuery) {
		const sortBy = sortQuery.split(',').join(' ');
		query = query.sort(sortBy);
	} else { // default sorting by date
		query = query.sort('-createdAt');
	}

	const bootcamps = await query;
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
