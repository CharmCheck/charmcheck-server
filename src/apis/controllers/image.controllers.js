const { generateResponse } = require('../../utils/responseGenerator.utils');
const { imageDal } = require('../dataAccessLayer/image.dataAccessLayer');
const { logError } = require('../../utils/errorLogger.utils');

const uploadImageController = async (req, res, next) => {
	try {
		const { base64EncodedImage } = req.body;

		const imageUploadResponse = await imageDal().uploadImage(
			base64EncodedImage
		);

		return res
			.status(imageUploadResponse.responseStatusCode)
			.json(imageUploadResponse);
	} catch (err) {
		const response = generateResponse(
			true,
			'Error while uploading image',
			null,
			'ERROR_UPLOADING_IMAGE',
			500
		);

		logError(response.responseId, err, response.responseStringCode, req.body);

		return res.status(response.responseStatusCode).json(response);
	}
};

module.exports = {
	uploadImageController,
};
