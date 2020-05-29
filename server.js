import express from 'express';
import dotenv from 'dotenv';
import { bootcamps } from './routes/';

dotenv.config({path: './configs/config.env'});

const app = express();
app.use('/api/v1/bootcamps', bootcamps);

const { PORT=5000, NODE_ENV } = process.env || {};

app.listen(PORT, console.log(`Server running in ${NODE_ENV} on port ${PORT}`));
