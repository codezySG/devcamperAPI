import { Router } from 'express';
const router = Router();

router.get('/', (req, res) => {
	res.status(200).json({success: true, msg: "receive bootcamps"});
});

router.post('/', (req, res) => {
	res.status(200).json({success: true, msg: `create new bootcamp`});
});

router.get('/:id', (req, res) => {
	res.status(200).json({success: true, msg: `show bootcamp ${req.params.id}`});
});

router.put('/:id', (req, res) => {
	res.status(200).json({success: true, msg: `update bootcamp ${req.params.id}`});
});

router.delete('/:id', (req, res) => {
	res.status(200).json({success: true, msg: `delete bootcamp ${req.params.id}`});
});

export default router;