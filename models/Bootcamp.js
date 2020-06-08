import { Schema, model } from 'mongoose';
import slugify from 'slugify';
import geocoder from '../utils/geocoder';

const BootcampSchema = new Schema({
    name: {
      type: String,
      required: [true, 'Please add a name'],
      unique: true,
      trim: true,
      maxlength: [50, 'Name can not be more than 50 characters']
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [500, 'Description can not be more than 500 characters']
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        'Please use a valid URL with HTTP or HTTPS'
      ]
    },
    phone: {
      type: String,
      maxlength: [20, 'Phone number can not be longer than 20 characters']
    },
    email: {
      type: String,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    address: {
      type: String,
      required: [true, 'Please add an address']
    },
    location: {
      // GeoJSON Point https://mongoosejs.com/docs/geojson.html
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: {
        type: [Number],
        index: '2dsphere'
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String
    },
    careers: {
      // Array of strings
      type: [String],
      required: true,
      enum: [
        'Web Development',
        'Mobile Development',
        'UI/UX',
        'Data Science',
        'Business',
        'Other'
      ]
    },
    averageRating: { // will be generated not inserted
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [10, 'Rating must can not be more than 10']
    },
    averageCost: Number,
    photo: {
      type: String,
      default: 'no-photo.jpg'
    },
    housing: {
      type: Boolean,
      default: false
    },
    jobAssistance: {
      type: Boolean,
      default: false
    },
    jobGuarantee: {
      type: Boolean,
      default: false
    },
    acceptGi: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
}, {
  toJSON: { virtuals: true }, // this will enable us to have an array of courses appear in our bootcamp queries (reverse query)
  toObject: { virtuals: true }
});

BootcampSchema.pre('save', function (next) {
	this.slug = slugify(this.name, { lower: true });
	next && next();
});

// Geocode and create location field
BootcampSchema.pre('save', async function (next) {
	const location = await geocoder.geocode(this.address);
	const [ locationObj = {} ] = location;
	const {
		longitude,
		latitude,
		formattedAddress,
		streetName: street,
		city,
		stateCode: state,
		zipcode,
		countryCode: country
	} = locationObj;

	// Geojson obj with type as a point
	this.location = {
		type: 'Point',
		coordinates: [longitude, latitude],
		formattedAddress,
		street,
		city,
		state,
		zipcode,
		country
	};

	// because we have formatted address, we do not need to save the client input address
	this.address = undefined;

	next && next();
});

// cascade delete courses when a bootcamp is deleted
BootcampSchema.pre('remove', async function (next) {
  console.log(`courses being removed from bootcamp ${this._id}`)
  // only delete the course that is connected to the bootcamp that is being deleted
  await this.model('Course').deleteMany({ bootcamp: this._id });
  next && next();
});

// reverse populate with virtual
BootcampSchema.virtual('courses', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'bootcamp', // the mapping in the schema specified to link a course with a bootcamp (in models/Course.js)
  justOne: false // we want an array of all courses for each bootcamp
})

export default model('Bootcamp', BootcampSchema);