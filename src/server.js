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
import helmet from 'helmet';
import xss from 'xss-clean';
import hpp from 'hpp';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

dotenv.config({path: './configs/config.env'});

// Connect to DB
connectDB();

const app = express();

const { PORT=5000, NODE_ENV, RATE_LIMIT_IN_MINS, RATE_LIMIT_MAX_REQUEST_AMOUNT } = process.env || {};

// Body parser
app.use(json());

// ------------------- API SECURITY  -------------------
// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent cross site scripting
app.use(xss());

// Overarching rate limit for API
app.use(rateLimit({
	windowMs: RATE_LIMIT_IN_MINS * 60 * 1000,
	max: RATE_LIMIT_MAX_REQUEST_AMOUNT
}));

app.use(hpp());

// Permit other domains to access the API
// THIS API IS INTENDED TO BE PUBLIC. IF PRIVATE DO NOT ENABLE CORS
app.use(cors());

app.use(cookieParser());

// ------------------- API SECURITY  -------------------

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
