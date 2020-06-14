import { Router } from 'express';

// mergeParams enables re routing from other routers by merging url params
const router = Router({ mergeParams: true });

import {
	getCourses,
	getCourse,
	addCourse
} from '../controllers/courses';

// add middleware functions for appropriate routes
router.route('/').get(getCourses).post(addCourse); // the post req gets routed from bootcamps route
router.route('/:id').get(getCourse);

export default router;
