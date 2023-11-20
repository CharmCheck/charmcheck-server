const { Review } = require('../schemas/review.schemas');
const { Payment } = require('../schemas/payment.schemas');
const { Image } = require('../schemas/image.schemas');
const {
	generateAlphaNumericString,
} = require('../../utils/randomStringGenerator.utils');
const { generateResponse } = require('../../utils/responseGenerator.utils');
const { logError } = require('../../utils/errorLogger.utils');

const reviewDal = () => {
	return {
		async initiateReview(userEmail, imageIds) {
			try {
				if (!userEmail || !imageIds) {
					throw new Error('Missing required parameters');
				}

				// regex for email validation
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

				if (!emailRegex.test(userEmail)) {
					throw new Error('Invalid email');
				}

				if (!Array.isArray(imageIds)) {
					throw new Error('Invalid imageIds type');
				}

				if (imageIds.length === 0) {
					throw new Error('No images selected');
				}

				if (
					imageIds.length > Number(process.env.MAX_IMAGES_ALLOWED_PER_REVIEW)
				) {
					throw new Error(
						`Maximum ${process.env.MAX_IMAGES_ALLOWED_PER_REVIEW} images can be selected`
					);
				}

				// check if all image ids are unique
				const uniqueImageIds = new Set(imageIds);
				if (uniqueImageIds.size !== imageIds.length) {
					throw new Error('Duplicate image ids');
				}

				// check if all the image ids are present in the Image table of mongo
				const imageCount = await Image.countDocuments({
					_id: { $in: imageIds },
				});

				if (imageCount !== imageIds.length) {
					throw new Error('Invalid image ids. Some images do not exist in db');
				}

				const reviewPublicId = (await generateAlphaNumericString(15)).data;

				const reviewSaveResponse = await Review.create({
					reviewPublicId,
					userEmail,
					images: imageIds,
				});

				if (!reviewSaveResponse) {
					throw new Error('Error while saving review');
				}

				const response = generateResponse(
					false,
					'Review initiated successfully',
					{
						reviewId: reviewSaveResponse.id,
					},
					'REVIEW_INITIATED_SUCCESSFULLY',
					200
				);

				return response;
			} catch (err) {
				logError(
					'ERROR_IN_INITIALIZE_REVIEW_DAL',
					err,
					'ERROR_IN_INITIALIZE_REVIEW_DAL',
					{
						userEmail,
						imageIds,
					}
				);

				throw err;
			}
		},
		async addPaymentIdInReview(reviewId) {
			try {
				if (!reviewId) {
					throw new Error('Missing required parameters');
				}

				// get paymentId from payment table for this review
				const paymentId = await Payment.findOne({
					review: reviewId,
				}).select('_id');

				if (!paymentId) {
					throw new Error('No payment found for this review');
				}

				// update review table with paymentId
				const reviewUpdateResponse = await Review.findByIdAndUpdate(
					reviewId,
					{
						payment: paymentId,
					},
					{
						new: true,
					}
				).populate('images');

				if (!reviewUpdateResponse) {
					throw new Error('Error while updating review');
				}

				const response = generateResponse(
					false,
					'Review updated successfully',
					reviewUpdateResponse,
					'REVIEW_UPDATED_SUCCESSFULLY',
					200
				);

				return response;
			} catch (err) {
				logError(
					'ERROR_IN_ADD_PAYMENT_ID_IN_REVIEW_DAL',
					err,
					'ERROR_IN_ADD_PAYMENT_ID_IN_REVIEW_DAL',
					{ reviewId }
				);

				throw err;
			}
		},
		async getReviewDetails(reviewId) {
			try {
				if (!reviewId) {
					throw new Error('Missing required parameters');
				}

				const reviewDetails = await Review.findById(reviewId).populate(
					'images'
				);

				// can be null if no review found
				const response = generateResponse(
					false,
					'Review details fetched successfully',
					reviewDetails,
					'REVIEW_DETAILS_FETCHED_SUCCESSFULLY',
					200
				);

				return response;
			} catch (err) {
				logError(
					'ERROR_FETCHING_REVIEW_DETAILS',
					err,
					'ERROR_FETCHING_REVIEW_DETAILS',
					{
						reviewId,
					}
				);

				throw err;
			}
		},
		async saveAiReview(reviewId, aiReview) {
			try {
				const updatedReview = await Review.findByIdAndUpdate(
					reviewId,
					{
						reviewDetails: aiReview,
					},
					{
						new: true,
					}
				);

				if (!updatedReview) {
					throw new Error('Error while updating review');
				}

				const response = generateResponse(
					false,
					'Review updated successfully',
					updatedReview,
					'REVIEW_UPDATED_SUCCESSFULLY',
					200
				);

				return response;
			} catch (err) {
				logError('ERROR_SAVING_AI_REVIEW', err, 'ERROR_SAVING_AI_REVIEW', {
					reviewId,
					aiReview,
				});

				throw err;
			}
		},
	};
};

module.exports = { reviewDal };
