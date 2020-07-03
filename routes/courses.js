import { Router } from 'express';

// mergeParams enables re routing from other routers by merging url params
const router = Router({ mergeParams: true });

import {
	getCourses,
	getCourse,
	addCourse,
	updateCourse,
	deleteCourse
} from '../controllers/courses';

// Models
import Course from '../models/Course';

// Middleware
import { advancedResults, protect } from '../middleware/';

// add middleware functions for appropriate routes
router.route('/').get(advancedResults(Course, {path: 'bootcamp', select: 'name description'}), getCourses).post(protect, addCourse); // the post req gets routed from bootcamps route
router.route('/:id').get(getCourse).put(protect, updateCourse).delete(protect, deleteCourse);

export default router;
