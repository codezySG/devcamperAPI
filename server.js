import express from 'express';
import dotenv from 'dotenv';

dotenv.config({path: './configs/config.env'});

const app = express();

const { PORT=5000, NODE_ENV } = process.env || {};

app.listen(PORT, console.log(`Server running in ${NODE_ENV} on port ${PORT}`));
