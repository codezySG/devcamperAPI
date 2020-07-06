import { Router } from 'express';
const router = Router();

import {
	getUsers,
	getUser,
	updateUser,
	createUser,
	deleteUser
} from '../controllers/users';

// Middleware
import { protect, advancedResults, authorize } from '../middleware/';

// Models
import User from '../models/User';

router.use(protect); // every route now for user willl utilize the protect middleware
router.use(authorize('admin'));

// add middleware functions for appropriate routes
router.route('/')
	.get(advancedResults(User), getUsers)
	.post(createUser);

router.route('/:id')
	.get(getUser)
	.put(updateUser)
	.delete(deleteUser);

export default router;
