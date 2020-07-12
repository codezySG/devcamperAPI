import { Schema, model } from 'mongoose';

import { genSalt, hash, compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';

import { randomBytes, createHash } from 'crypto';

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
    	enum: ['user', 'publisher', 'admin'],
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
	if (!this.isModified('password')) {
		next && next();
	}

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

// Match user entered password to hashed password in db
UserSchema.methods.matchPassword = async function (enteredPassword) {
	return await compare(enteredPassword, this.password);
}

UserSchema.methods.getResetPasswordToken = function () {
	// Generate token
	const resetToken = randomBytes(20).toString('hex');

	// Hash token and set to resetPasswordToken field
	this.resetPasswordToken = createHash('sha256').update(resetToken).digest('hex');

	// Set the expire
	this.resetPasswordExpire = Date.now() + 10 * 60 * 10000;

	return resetToken;
}

export default model('User', UserSchema);
