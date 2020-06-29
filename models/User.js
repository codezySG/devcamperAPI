import { Schema, model } from 'mongoose';

import { genSalt, hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';

const UserSchema = new Schema({
	name: {
		type: String,
		required: [true, 'Please add a name']
	},
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email'
      ]
    },
    role: {
    	type: String,
    	enum: ['user', 'publisher'],
    	default: 'user'
    },
    password: {
    	type: String,
    	required: [true, 'Please add a password'],
    	minlength: 6,
    	select: false // when user obtained through API it wont return the password
    },
	resetPasswordToken: String,
	resetPasswordExpire: Date,
	createdAt: {
		type: Date,
		default: Date.now
	}
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
	const salt = await genSalt(10);
	this.password = await hash(this.password, salt);

	next && next();
});

// Sign JWT and return
// called on actual user so have access to id (not static)
UserSchema.methods.getSignedJwtToken = function () {
	const { JWT_SECRET, JWT_EXPIRE } = process.env || {}; 
	return sign({ id: this._id }, JWT_SECRET, {
		expiresIn: JWT_EXPIRE
	});
};

export default model('User', UserSchema);
