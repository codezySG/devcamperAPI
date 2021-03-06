import { parse } from 'path';

// Models
import Bootcamp from '../models/Bootcamp';

// Selectors
import {
	getId,
	getBody,
	getParams,
	getFile,
	getUser,
	getRole
} from '../selectors/request';

// Middleware
// functions that (have access to req, res cycle)
import { asyncHandler, advancedResults } from '../middleware/';

// Utils
import ErrorResponse from '../utils/ErrorResponse';
import geocoder from '../utils/geocoder';

const EARTH_RADIUS = 3963;

export const getBootcamps = asyncHandler(async (req, res, next) => {
	res.status(200).json(res.advancedResults);
});

export const getBootcamp = asyncHandler(async (req, res, next) => {
	const bootcamp = await Bootcamp.findById(getId(req));

	if (!bootcamp) {
		return next(new ErrorResponse(`Bootcamp not found with id of ${getId(req)}`, 404));
	}

	res.status(200).json({success: true, data: bootcamp});
});

export const createBootcamp = asyncHandler(async (req, res, next) => {
	const { id: userId } = getUser(req);

	// Add user to req.body
	req.body.user = req.user.id;

	// Check for existing published bootcamp
	const publishedBootcamp = await Bootcamp.findOne({ user: userId });

	// If the user is not an admin they can only add one bootcamp
	if (publishedBootcamp && getRole(req) !== 'admin') {
		return next(new ErrorResponse(`User with ${userId} has already published a bootcamp`, 400));
	}

	// Publisher/admin can only create one bootcamp
	const bootcamp = await Bootcamp.create(req.body);
	res.status(201).json({success: true, data: bootcamp});
});

export const updateBootcamp = asyncHandler(async (req, res, next) => {
	const bootcampRequestId = getId(req);
	let bootcamp = await Bootcamp.findById(bootcampRequestId);

	if (!bootcamp) {
		return next(new ErrorResponse(`Bootcamp not found with id of ${getId(req)}`, 404));
	}

	const { user: bootcampsUserId } = bootcamp;
	const { id: userId, role: userRole } = getUser(req);

	// Make sure user is the rightful owner of the bootcamp that is being updated (or theyre an admin)
	if (bootcampsUserId.toString() !== userId && userRole !== 'admin') {
		return next(new ErrorResponse(`User ${userId} is not authorized to update this bootcamp`, 401));
	}

	bootcamp = await Bootcamp.findByIdAndUpdate(bootcampRequestId, getBody(req), {
		new: true,
		runValidators: true
	});

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

	const { user: bootcampsUserId } = bootcamp;
	const { id: userId, role: userRole } = getUser(req);

	// Make sure user is the rightful owner of the bootcamp that is being deleted (or theyre an admin)
	if (bootcampsUserId.toString() !== userId && userRole !== 'admin') {
		return next(new ErrorResponse(`User ${userId} is not authorized to delete this bootcamp`, 401));
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

	const { user: bootcampsUserId } = bootcamp;
	const { id: userId, role: userRole } = getUser(req);

	// Make sure user is the rightful owner of the bootcamp that is being updated (or theyre an admin)
	if (bootcampsUserId.toString() !== userId && userRole !== 'admin') {
		return next(new ErrorResponse(`User ${userId} is not authorized to update this bootcamp`, 401));
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
