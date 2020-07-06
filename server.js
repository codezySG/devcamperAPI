import { join } from 'path';
import express, { json } from 'express';
import dotenv from 'dotenv';
import { bootcamps, courses, auth, users, reviews } from './routes/';
import { connectDB } from './configs/db';
import colors from 'colors';
import fileUpload from 'express-fileupload';

// middleware
import { logger, errorHandler } from './middleware/';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';

dotenv.config({path: './configs/config.env'});

// Connect to DB
connectDB();

const app = express();

// Body parser
app.use(json());
app.use(mongoSanitize());
app.use(cookieParser());

const { PORT=5000, NODE_ENV } = process.env || {};

if (NODE_ENV === 'development') {
	app.use(logger);
}

app.use(fileUpload());

// set static folder
app.use(express.static(join(__dirname, 'public')));

// routers
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);
app.use('/api/v1/users', users);
app.use('/api/v1/reviews', reviews);

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
