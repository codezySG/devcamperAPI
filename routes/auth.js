import { Router } from 'express';
const router = Router();

import {
	registerUser,
	login,
	getMe,
	forgotPassword,
	resetPassword
} from '../controllers/auth';

// Middleware
import { protect } from '../middleware/'

// add middleware functions for appropriate routes
router.route('/register').post(registerUser); // the post req gets routed from bootcamps route
router.route('/login').post(login);
router.route('/me').get(protect, getMe);
router.route('/forgotpassword').post(forgotPassword);
router.route('/resetpassword/:resettoken').put(resetPassword);

export default router;
