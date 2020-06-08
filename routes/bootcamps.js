import { Router } from 'express';
const router = Router();

import {
	getBootcamps,
	getBootcamp,
	createBootcamp,
	updateBootcamp,
	deleteBootcamp,
	getBootcampsInRadius
} from '../controllers/bootcamps';

// include other resource routers
import coursesRouter from './courses';

// re-routes the query to the coursesRouter
router.use('/:bootcampId/courses', coursesRouter);

// add middleware functions for appropriate routes
router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);
router.route('/').get(getBootcamps).post(createBootcamp);
router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp);

export default router;
