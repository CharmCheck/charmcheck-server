const { s3 } = require('../config/aws.config');
const { generateResponse } = require('./responseGenerator.utils');

const getObjectFromS3AsBase64 = (bucket, key) => {
	return new Promise((resolve, reject) => {
		s3.getObject(
			{
				Bucket: bucket,
				Key: key,
			},
			(err, data) => {
				if (err) {
					reject(err); // Reject the Promise with the error
				} else {
					const base64Data = data.Body.toString('base64');
					const response = generateResponse(
						false,
						'Successfully got image file',
						base64Data,
						'SUCCESS_GETTING_IMAGE_FILE',
						200
					);
					resolve(response); // Resolve the Promise with the response
				}
			}
		);
	});
};

const uploadObjectToS3AsBase64 = (bucket, key, base64) => {
	return new Promise((resolve, reject) => {
		s3.upload(
			{
				Bucket: bucket,
				Key: key,
				Body: base64,
			},
			(err, data) => {
				if (err) {
					reject(err); // Reject the Promise with the error
				} else {
					const response = generateResponse(
						false,
						'Successfully uploaded image file',
						data.Location,
						'SUCCESS_UPLOADING_IMAGE_FILE',
						200
					);
					resolve(response); // Resolve the Promise with the response
				}
			}
		);
	});
};

module.exports = {
	getObjectFromS3AsBase64,
	uploadObjectToS3AsBase64,
};
