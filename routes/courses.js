import { Router } from 'express';

// mergeParams enables re routing from other routers by merging url params
const router = Router({ mergeParams: true });

import {
	getCourses
} from '../controllers/courses';

// add middleware functions for appropriate routes
router.route('/').get(getCourses);

export default router;
