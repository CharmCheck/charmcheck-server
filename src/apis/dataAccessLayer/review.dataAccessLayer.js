const { Review } = require('../schemas/review.schemas');
const { Image } = require('../schemas/image.schemas');
const {
	generateAlphaNumericString,
} = require('../../utils/randomStringGenerator.utils');
const { generateResponse } = require('../../utils/responseGenerator.utils');

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

				if (imageIds.length > 7) {
					throw new Error('Maximum 7 images can be selected');
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
				throw err;
			}
		},
	};
};

module.exports = { reviewDal };
