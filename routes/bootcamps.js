import { Router } from 'express';
const router = Router();

import {
	getBootcamps,
	getBootcamp,
	createBootcamp,
	updateBootcamp,
	deleteBootcamp,
	getBootcampsInRadius,
	uploadBootcampPhoto
} from '../controllers/bootcamps';

// include other resource routers
import coursesRouter from './courses';

// Middleware
import { advancedResults, protect } from '../middleware/'

// Models
import Bootcamp from '../models/Bootcamp';

// re-routes the query to the coursesRouter
router.use('/:bootcampId/courses', coursesRouter);

// add middleware functions for appropriate routes
router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);
router.route('/').get(advancedResults(Bootcamp, 'courses'), getBootcamps).post(protect, createBootcamp);
router.route('/:id').get(getBootcamp).put(protect, updateBootcamp).delete(protect, deleteBootcamp);
router.route('/:id/photo').put(protect, uploadBootcampPhoto);

export default router;
