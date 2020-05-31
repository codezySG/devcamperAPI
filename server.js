import express from 'express';
import dotenv from 'dotenv';
import { bootcamps } from './routes/';
import { logger } from './middleware/logger';

dotenv.config({path: './configs/config.env'});

const app = express();

const { PORT=5000, NODE_ENV } = process.env || {};

if (NODE_ENV === 'development') {
	app.use(logger);
}

app.use('/api/v1/bootcamps', bootcamps);

app.listen(PORT, console.log(`Server running in ${NODE_ENV} on port ${PORT}`));
