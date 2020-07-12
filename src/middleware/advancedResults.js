// Selectors
import { getQuery} from '../selectors/request';

// queries appended that are supported but should not be considered as fields in schema
const fieldExclusionList = ['select', 'sort', 'limit', 'page'];

const DEFAULT_PAGE_NUM = 1;
const DEFAULT_LIMIT_NUM = 25;

export const advancedResults = (model, populate) => async (req, res, next) => {
	const reqQuery = { ...getQuery(req) };
	fieldExclusionList.forEach((param) => {
		delete reqQuery[param];
	});

	// create query as string and use regex to match and replace gt/gte/lt/lte/in with $ in front
	const queryStr = JSON.stringify(reqQuery).replace(/\b(gt|gte|lt|lte|in)/g, match => `$${match}`);
	let query = model.find(JSON.parse(queryStr)); // can pass in obj to limit fields just like done in courses model for the bootcamp link

	// handle any appendable queries
	const {
		select: selectQuery,
		sort: sortQuery,
		page: pageQuery,
		limit: limitQuery
	} = getQuery(req);

	// if select field was in the og query
	if (selectQuery) {
		const fieldsArr = selectQuery.split(',').join(' ');
		query = query.select(fieldsArr);
	}

	// sort
	if (sortQuery) {
		const sortBy = sortQuery.split(',').join(' ');
		query = query.sort(sortBy);
	} else { // default sorting by date
		query = query.sort('-createdAt');
	}

	// pagination
	const page = parseInt(pageQuery, 10) || DEFAULT_PAGE_NUM;
	const limit = parseInt(limitQuery, 10) || DEFAULT_LIMIT_NUM;
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;

	const total = await model.countDocuments();

	query = query.skip(startIndex).limit(limit);

	// populate is used to enable reverse querying...ex: bootcamp res to have array of courses
	if (populate) {
		query = query.populate(populate);
	}

	const results = await query;
	const pagination = {
		next: (
			endIndex < total ? {
				page: page + 1,
				limit
			} : null
		),
		prev: (
			startIndex > 0 ? {
				page: page - 1,
				limit
			} : null
		)
	};

	res.advancedResults = {
		success: true,
		count: results.length,
		pagination,
		data: results
	};

	next && next();
}