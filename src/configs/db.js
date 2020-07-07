import { connect } from 'mongoose';

export const connectDB = async () => {
	const { MONGO_URI } = process.env || {};

	const conn = await connect(MONGO_URI, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
		useUnifiedTopology: true
	});

	console.log(`MongoDB Connected ${conn.connection.host}`.brightGreen.underline.bold);
};
