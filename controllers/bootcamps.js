// middleware functions

export const getBootcamps = (req, res, next) => {
	res.status(200).json({success: true, msg: "receive bootcamps"});
}

export const getBootcamp = (req, res, next) => {
	res.status(200).json({success: true, msg: `show bootcamp ${req.params.id}`});
}

export const createBootcamp = (req, res, next) => {
	res.status(200).json({success: true, msg: `create new bootcamp`});
}

export const updateBootcamp = (req, res, next) => {
	res.status(200).json({success: true, msg: `update bootcamp ${req.params.id}`});
}

export const deleteBootcamp = (req, res, next) => {
	res.status(200).json({success: true, msg: `delete bootcamp ${req.params.id}`});
}
