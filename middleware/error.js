// Utils
import ErrorResponse from '../utils/ErrorResponse';

export const errorHandler = (err, req, res, next) => {
	console.log(err.stack.red);
	let error = { ...err };
	error.message = err.message;
	const { name, value, code, kind } = error;

	// mongoose bad obj id
	if (name === 'CastError' || kind === 'ObjectId') {
		const message = `Resource not found with id of ${value}`;
		error = new ErrorResponse(message, 404);
	} else if (code === 11000) { // mongoose duplicate key
		const message = 'Duplicate field value entered';
		error = new ErrorResponse(message, 400); // bad client request
	} else if (name === 'ValidationError') { // validation error
		const message = Object.values(err.errors).map(({message}) => {message});
		error = new ErrorResponse(message, 400); // bad client request
	}

	res.status(error.statusCode || 500).json({
		success: false,
		data: null,
		error: error.message || 'Internal Server Error'
	});
};
