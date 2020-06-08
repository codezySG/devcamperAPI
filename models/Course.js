import { Schema, model } from 'mongoose';

const CourseSchema = new Schema({
	title: {
		type: String,
		trim: true,
		required: [true, "Please add a course title"]
	},
	description: {
		type: String,
		required: [true, "Please add a course description"]
	},
	weeks: {
		type: String,
		required: [true, "Please add number of weeks"]
	},
	tuition: {
		type: Number,
		required: [true, "Please add a tuition cost"]
	},
	minimumSkill: {
		type: String,
		required: [true, "Please add a minumum skill"],
		enum: ['beginner', 'intermediate', 'advanced']
	},
	scholarshipAvailable: {
		type: Boolean,
		default: false
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	bootcamp: {
		type: Schema.ObjectId,
		ref: 'Bootcamp', // model name that is then exported
		required: true
	}
});

export default model('Course', CourseSchema);
