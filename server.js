import express from 'express';
import dotenv from 'dotenv';
import { bootcamps } from './routes/';
import { logger } from './middleware/logger';
import { connectDB } from './configs/db';
import colors from 'colors';

dotenv.config({path: './configs/config.env'});

// Connect to DB
connectDB();

const app = express();

const { PORT=5000, NODE_ENV } = process.env || {};

if (NODE_ENV === 'development') {
	app.use(logger);
}

app.use('/api/v1/bootcamps', bootcamps);

const server = app.listen(PORT, console.log(`Server running in ${NODE_ENV} on port ${PORT}`.blue.bold));


// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
	console.log(`Error: ${err.message}.red`);

	// Close server & exit process
	server.close(() => {
		process.exit(1);
	});
});
