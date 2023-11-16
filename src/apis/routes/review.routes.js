const { Router } = require('express');

const {
	initiateReviewController,
} = require('../controllers/review.controllers');

const router = Router();

router.post('/initiate', initiateReviewController);

module.exports = router;
