const { Router } = require('express');

const {
	initiateReviewController,
	getPublicReviewDetailsController,
} = require('../controllers/review.controllers');

const router = Router();

router.post('/initiate', initiateReviewController);
router.get(
	'/public-review-details/:reviewPublicId',
	getPublicReviewDetailsController
);

module.exports = router;
