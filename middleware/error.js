// Utils
import ErrorResponse from '../utils/ErrorResponse';

export const errorHandler = (err, req, res, next) => {
	console.log(err.stack.red);
	let error = { ...err };
	error.message = err.message;
	const { name, value } = error;

	// mongoose bad obj id
	if (name === 'CastError') {
		const message = `Resource not found with id of ${value}`;
		error = new ErrorResponse(message, 404);
	}

	res.status(error.statusCode || 500).json({
		success: false,
		data: null,
		error: error.message || 'Internal Server Error'
	});
};
