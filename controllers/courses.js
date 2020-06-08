// Models
import Course from '../models/Course';

// Selectors
import { getId, getBody, getParams, getQuery } from '../selectors/request';

// Middleware
// functions that (have access to req, res cycle)
import { asyncHandler } from '../middleware/async';

// Utils
import ErrorResponse from '../utils/ErrorResponse';

// get all courses or get courses belonging to bootcamp id
export const getCourses = asyncHandler(async (req, res, next) => {
	const params = getParams(req);
	const { bootcampId } = params;

	let query;
	if (bootcampId) {
		query = Course.find({ bootcamp: bootcampId });
	} else {
		// can also populate by just providing string as arg of 'bootcamp' whole bootcamp = populated
		query = Course.find().populate({path: 'bootcamp', select: 'name description'});
	}

	const courses = await query;

	res.status(200).json({ success: true, count: courses.length, data: courses });
});
