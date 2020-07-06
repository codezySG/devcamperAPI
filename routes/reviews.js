import { Router } from 'express';
const router = Router({ mergeParams: true });

import {
	getReviews,
	getReview,
	addReview
} from '../controllers/reviews';

// Middleware
import { protect, advancedResults, authorize } from '../middleware/';

// Models
import Review from '../models/Review';

// add middleware functions for appropriate routes
router.route('/')
	.get(advancedResults(Review, {
		path: 'bootcamp',
		select: 'name description'
	}), getReviews)
	.post(protect, authorize('user', 'admin'), addReview);

router.route('/:id').get(getReview);

export default router;
