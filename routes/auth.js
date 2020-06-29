import { Router } from 'express';
const router = Router();

import {
	registerUser
} from '../controllers/auth';

// add middleware functions for appropriate routes
router.route('/register').post(registerUser); // the post req gets routed from bootcamps route

export default router;
