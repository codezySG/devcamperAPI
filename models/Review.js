import { Schema, model } from 'mongoose';

const ReviewSchema = new Schema({
	title: {
		type: String,
		trim: true,
		required: [true, "Please add a title for the review"],
		maxlength: 100
	},
	text: {
		type: String,
		required: [true, "Please add some text for the review"]
	},
	rating: {
		type: Number,
		required: [true, "Please add a rating between 1 and 10 for the review"],
		min: 1,
		max: 10
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	bootcamp: {
		type: Schema.ObjectId,
		ref: 'Bootcamp', // model name that is then exported
		required: true
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User', // model name that is then exported
		required: true
	}
});

// Prevent user from submitting more than one review per one bootcamp
ReviewSchema.index({ bootcamp: 1, user: 1 }, { unique: true })

export default model('Review', ReviewSchema);
