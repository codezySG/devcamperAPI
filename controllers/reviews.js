// Models
import Review from '../models/Review';
import Bootcamp from '../models/Bootcamp';

// Selectors
import { getParams } from '../selectors/request';

// Middleware
// functions that (have access to req, res cycle)
import { asyncHandler } from '../middleware/async';

// Utils
import ErrorResponse from '../utils/ErrorResponse';

// v1/reviews -- Public -- GET
export const getReviews = asyncHandler(async (req, res, next) => {
	const params = getParams(req);
	const { bootcampId } = params;

	if (bootcampId) {
		const reviews = await Review.find({ bootcamp: bootcampId });
		return res.status(200).json({
			success: true,
			count: reviews.length,
			data: reviews
		});
	} else {
		res.status(200).json(res.advancedResults);
	}
});

// v1/bootcamps/reviews/:id -- Public -- GET
export const getReview = asyncHandler(async (req, res, next) => {
	const { id: reviewId } = getParams(req);
	const review = await Review.findById(reviewId).populate({
		path: 'bootcamp',
		select: 'name description'
	});

	if (!review) {
		return next(new ErrorResponse(`No review found with id of ${reviewId}`, 404));
	}

	res.status(200).json({ success: true, data: review });
});
