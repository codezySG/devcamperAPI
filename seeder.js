import fs from 'fs';
import { connect } from 'mongoose';
import colors from 'colors';
import dotenv from 'dotenv';
import Bootcamp from './models/Bootcamp.js';

dotenv.config({path: './configs/config.env'});

const { MONGO_URI } = process.env || {};

connect(MONGO_URI, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useFindAndModify: false,
	useUnifiedTopology: true
});

const bootcamps = JSON.parse(
	fs.readFileSync(`${__dirname}/devcamper_project_resources/_data/bootcamps.json`, 'utf-8')
);

const importData = async () => {
	try {
		await Bootcamp.create(bootcamps);
		console.log('Data Imported...'.green.inverse);
		process.exit();
	} catch (err) {
		console.error(err);
	}
};

const deleteData = async () => {
	try {
		await Bootcamp.deleteMany();
		console.log('Data Deleted...'.red.inverse);
		process.exit();
	} catch (err) {
		console.error(err);
	}
};

// ES6 used throughout project, needs to be transpiled to ES5..to run use `npx babel-node --presets @babel/preset-env seeder.js --i`
if (process.argv[2] === '--i') {
	importData();
} else if (process.argv[2] === '--d') {
	deleteData();
}
