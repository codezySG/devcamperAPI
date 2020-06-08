import express, { json } from 'express';
import dotenv from 'dotenv';
import { bootcamps, courses } from './routes/';
import { logger, errorHandler } from './middleware/';
import { connectDB } from './configs/db';
import colors from 'colors';

dotenv.config({path: './configs/config.env'});

// Connect to DB
connectDB();

const app = express();

// Body parser
app.use(json());

const { PORT=5000, NODE_ENV } = process.env || {};

if (NODE_ENV === 'development') {
	app.use(logger);
}

app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);

app.use(errorHandler);

const server = app.listen(PORT, console.log(`Server running in ${NODE_ENV} on port ${PORT}`.blue.bold));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
	console.log(`Error: ${err.message}.red`);

	// Close server & exit process
	server.close(() => {
		process.exit(1);
	});
});
