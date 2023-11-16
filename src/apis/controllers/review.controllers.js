const { generateResponse } = require('../../utils/responseGenerator.utils');
const { logError } = require('../../utils/errorLogger.utils');
const { reviewDal } = require('../dataAccessLayer/review.dataAccessLayer');

const initiateReviewController = async (req, res, next) => {
	try {
		const { userEmail, imageIds } = req.body;

		const initiateReviewResponse = await reviewDal().initiateReview(
			userEmail,
			imageIds
		);

		return res
			.status(initiateReviewResponse.responseStatusCode)
			.json(initiateReviewResponse);
	} catch (err) {
		const response = generateResponse(
			true,
			'Error while initiating review',
			null,
			'ERROR_INITIATING_REVIEW',
			500
		);

		logError(response.responseId, err, response.responseStringCode, req.body);

		return res.status(response.responseStatusCode).json(response);
	}
};

module.exports = {
	initiateReviewController,
};
