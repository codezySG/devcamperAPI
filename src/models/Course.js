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
	},
	user: {
		type: Schema.ObjectId,
		ref: 'User', // model name that is then exported
		required: true
	}
});

// Static method to get average of course tuitions
CourseSchema.statics.getAverageCost = async function (bootcampId) {
	// brackets indicate pipeline...in bracket are the steps to take
	const averegedCost = await this.aggregate([
		{
			$match: {bootcamp: bootcampId}
		},
		{
			$group: {
				_id: '$bootcamp',
				averageCost: { $avg: '$tuition' }
			}
		}
	]);


	const [ averageObj = {} ] = averegedCost;
	const { averageCost } = averageObj;

	try {
		await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
			averageCost: Math.ceil(averageCost / 10) * 10
		});
	} catch (err) {
		console.error(err);
	}
};

// Call getAverageCost after save
CourseSchema.post('save', function () {
	this.constructor.getAverageCost(this.bootcamp);
});

// Call getAverageCost before remove (if course is removed need to recalc avg cost)
CourseSchema.pre('remove', function () {
	this.constructor.getAverageCost(this.bootcamp);
});

export default model('Course', CourseSchema);
