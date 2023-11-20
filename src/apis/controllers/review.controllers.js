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

const getPublicReviewDetailsController = async (req, res, next) => {
	try {
		const { reviewPublicId } = req.body;

		const publicReviewDetailsResponse =
			await reviewDal().getReviewDetailsFromReviewPublicId(reviewPublicId);

		if (publicReviewDetailsResponse.data) {
			publicReviewDetailsResponse.data = {
				imageUrls: publicReviewDetailsResponse.data.images.map((i) => {
					return (
						process.env.AWS_S3_FILE_URL_PREFIX +
						i.imagePublicId +
						'.' +
						i.imageType
					);
				}),
				reviewDetails: publicReviewDetailsResponse.data.reviewDetails,
			};

			return res
				.status(publicReviewDetailsResponse.responseStatusCode)
				.json(publicReviewDetailsResponse);
		} else {
			const response = generateResponse(
				true,
				"Can't find a review with this link",
				null,
				'REVIEW_WITH_LINK_NOT_FOUND',
				404
			);

			res.status(404).json(response);
		}
	} catch (err) {
		const response = generateResponse(
			true,
			'Error while getting review',
			null,
			'ERROR_GETTING_REVIEW_CONTROLLER',
			500
		);

		logError(response.responseId, err, response.responseStringCode, req.body);

		return res.status(response.responseStatusCode).json(response);
	}
};

module.exports = {
	initiateReviewController,
	getPublicReviewDetailsController,
};
