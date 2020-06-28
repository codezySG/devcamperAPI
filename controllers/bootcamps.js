import { parse } from 'path';

// Models
import Bootcamp from '../models/Bootcamp';

// Selectors
import { getId, getBody, getParams, getQuery, getFile } from '../selectors/request';

// Middleware
// functions that (have access to req, res cycle)
import { asyncHandler } from '../middleware/async';

// Utils
import ErrorResponse from '../utils/ErrorResponse';
import geocoder from '../utils/geocoder';

const EARTH_RADIUS = 3963;
const DEFAULT_PAGE_NUM = 1;
const DEFAULT_LIMIT_NUM = 1;

// queries appended that are supported but should not be considered as fields in schema
const fieldExclusionList = ['select', 'sort', 'limit', 'page'];

export const getBootcamps = asyncHandler(async (req, res, next) => {
	const reqQuery = { ...getQuery(req) };
	fieldExclusionList.forEach((param) => {
		delete reqQuery[param];
	});

	// create query as string and use regex to match and replace gt/gte/lt/lte/in with $ in front
	const queryStr = JSON.stringify(reqQuery).replace(/\b(gt|gte|lt|lte|in)/g, match => `$${match}`);
	// populate courses is used to enable reverse querying...bootcamp res will then have array of courses
	let query = Bootcamp.find(JSON.parse(queryStr)).populate('courses'); // can pass in obj to limit fields just like done in courses model for the bootcamp link

	// handle any appendable queries
	const {
		select: selectQuery,
		sort: sortQuery,
		page: pageQuery,
		limit: limitQuery
	} = getQuery(req);

	// if select field was in the og query
	if (selectQuery) {
		const fieldsArr = selectQuery.split(',').join(' ');
		query = query.select(fieldsArr);
	}

	// sort
	if (sortQuery) {
		const sortBy = sortQuery.split(',').join(' ');
		query = query.sort(sortBy);
	} else { // default sorting by date
		query = query.sort('-createdAt');
	}

	// pagination
	const page = parseInt(pageQuery, 10) || DEFAULT_PAGE_NUM;
	const limit = parseInt(limitQuery, 10) || DEFAULT_LIMIT_NUM;
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;

	const total = await Bootcamp.countDocuments();

	query = query.skip(startIndex).limit(limit);

	const bootcamps = await query;
	const pagination = {
		next: (
			endIndex < total ? {
				page: page + 1,
				limit
			} : null
		),
		prev: (
			startIndex > 0 ? {
				page: page - 1,
				limit
			} : null
		)
	};

	res.status(200).json({
		success: true,
		count: bootcamps.length,
		pagination,
		data: bootcamps
	});
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
	/*
		previously used findByIdAndDelete..but with the newly added middleware
		to delete courses affiliated with the bootcamp to delete..needed to
		change to a function that will trigger the pre delete middleware
		changed to find first, then call remove
	*/
	const bootcamp = await Bootcamp.findById(getId(req));

	if (!bootcamp) {
		return next(new ErrorResponse(`Bootcamp not found with id of ${getId(req)}`, 404));
	}

	// triggers pre middleware to ensure proper recursive deletion
	bootcamp.remove();

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

// Upload photo for bootcamp (Put request) /bootcamp/:id/photo (private)
export const uploadBootcampPhoto = asyncHandler(async (req, res, next) => {
	const bootcampId = getId(req);
	const bootcamp = await Bootcamp.findById(bootcampId);

	if (!bootcamp) {
		return next(new ErrorResponse(`Bootcamp not found with id of ${getId(req)}`, 404));
	}

	const file = getFile(req);
	if (!file) {
		return next(new ErrorResponse(`Please upload a file`, 400));
	}

	// validation: make sure image is a photo
	const { mimetype, size, name: fileName, mv } = file;
	if (!mimetype.startsWith('image')) {
		return next(new ErrorResponse(`Please upload an image file`, 400));
	}

	const { MAX_FILE_UPLOAD, FILE_UPLOAD_PATH } = process.env || {};
	// check file size
	if (size > MAX_FILE_UPLOAD) {
		return next(new ErrorResponse(`Please upload an image less than ${MAX_FILE_UPLOAD}`, 400));
	}

	// create custom filename
	file.name = `photo_${bootcampId}${parse(fileName).ext}`;
	mv(`${FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
		if (err) {
			console.error(err);
			return next(new ErrorResponse(`Problem with file upload`, 500));
		}

		await Bootcamp.findByIdAndUpdate(bootcampId, { photo: file.name });
		res.status(200).json({ success: true, data: file.name });
	});
});
