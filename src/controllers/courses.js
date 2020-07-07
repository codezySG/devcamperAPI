// Models
import Course from '../models/Course';
import Bootcamp from '../models/Bootcamp';

// Selectors
import { getId, getBody, getParams, getQuery, getUser } from '../selectors/request';

// Middleware
// functions that (have access to req, res cycle)
import { asyncHandler } from '../middleware/async';

// Utils
import ErrorResponse from '../utils/ErrorResponse';

// get all courses or get courses belonging to bootcamp id
// GET /api/v1/bootcamps/:bootcampId/courses
export const getCourses = asyncHandler(async (req, res, next) => {
	const params = getParams(req);
	const { bootcampId } = params;

	if (bootcampId) {
		const courses = await Course.find({ bootcamp: bootcampId });
		return res.status(200).json({
			success: true,
			count: courses.length,
			data: courses
		});
	} else {
		// can also populate by just providing string as arg of 'bootcamp' whole bootcamp = populated
		res.status(200).json(res.advancedResults);
	}
});

// get a single course by id
export const getCourse = asyncHandler(async (req, res, next) => {
	const params = getParams(req);
	const { id } = params;

	const course = await Course.findById(id).populate({
		path:'bootcamp',
		select: 'name description'
	});

	if (!course) {
		return next(new ErrorResponse(`No course with the id of ${bootcampId}`), 404);
	}

	res.status(200).json({ success: true, data: course });
});

// add a course
// POST /api/v1/bootcamps/:bootcampId/courses
// PRIVATE: only logged in user should be able to do this
export const addCourse = asyncHandler(async (req, res, next) => {
	const params = getParams(req);
	const { bootcampId } = params;
	const { id: userId, role: userRole } = getUser(req);

	req.body.bootcamp = bootcampId;
	req.body.user = userId;

	const bootcamp = await Bootcamp.findById(bootcampId);

	if (!bootcamp) {
		return next(new ErrorResponse(`No bootcamp with the id of ${bootcampId}`), 404);
	}

	const { user: bootcampsUserId } = bootcamp;

	// Make sure user is the rightful owner of the bootcamp that the course is being added to (or theyre an admin)
	if (bootcampsUserId.toString() !== userId && userRole !== 'admin') {
		return next(new ErrorResponse(`User ${userId} is not authorized to add a course to bootcamp ${bootcampId}`, 401));
	}

	const course = await Course.create(req.body);
	res.status(200).json({ success: true, data: course });
});

// update a course
// PUT /api/v1/bootcamps/courses/:id
// PRIVATE: only logged in user should be able to do this
export const updateCourse = asyncHandler(async (req, res, next) => {
	const params = getParams(req);
	const body = getBody(req);
	const { id } = params;

	let course = await Course.findById(id);

	if (!course) {
		return next(new ErrorResponse(`No course found with the id of ${id}`), 404);
	}

	const { user: courseUserId } = course;
	const { id: userId, role: userRole } = getUser(req);

	// Make sure user is the rightful owner of the bootcamp that the course is being added to (or theyre an admin)
	if (courseUserId.toString() !== userId && userRole !== 'admin') {
		return next(new ErrorResponse(`User ${userId} is not authorized to update a course to bootcamp ${id}`, 401));
	}

	course = await Course.findByIdAndUpdate(id, body, {
		new: true,
		runValidators: true
	});

	res.status(200).json({ success: true, data: course });
});

// delete a course
// delete /api/v1/bootcamps/courses/:id
// PRIVATE: only logged in user should be able to do this
export const deleteCourse = asyncHandler(async (req, res, next) => {
	const params = getParams(req);
	const { id } = params;

	const course = await Course.findById(id);

	if (!course) {
		return next(new ErrorResponse(`No course found with the id of ${id}`), 404);
	}

	const { user: courseUserId } = course;
	const { id: userId, role: userRole } = getUser(req);

	// Make sure user is the rightful owner of the bootcamp that the course is being added to (or theyre an admin)
	if (courseUserId.toString() !== userId && userRole !== 'admin') {
		return next(new ErrorResponse(`User ${userId} is not authorized to delete a course to bootcamp ${id}`, 401));
	}

	await course.remove();

	res.status(200).json({ success: true, data: null });
});
