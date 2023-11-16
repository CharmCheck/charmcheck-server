const { Image } = require('../schemas/image.schemas');
const { getImageInfo } = require('../../utils/imageDetails.utils');
const { uploadObjectToS3AsBase64 } = require('../../utils/s3Handler.utils');
const {
	generateAlphaNumericString,
} = require('../../utils/randomStringGenerator.utils');
const { generateResponse } = require('../../utils/responseGenerator.utils');

const imageDal = () => {
	return {
		async uploadImage(base64EncodedImage) {
			try {
				if (!base64EncodedImage) {
					throw new Error('No image provided');
				}

				// regex to check if base64 encoded image is valid
				const base64Regex = /^data:image\/(png|jpg|jpeg);base64,/;
				if (!base64Regex.test(base64EncodedImage)) {
					throw new Error('Invalid image');
				}

				const imageInfoResponse = getImageInfo(base64EncodedImage);
				const imageInfo = imageInfoResponse.data;

				const { width, height, type, sizeInBytes } = imageInfo;

				if (type !== 'png' && type !== 'jpg' && type !== 'jpeg') {
					throw new Error('Invalid image type');
				}

				if (sizeInBytes > 1000000) {
					throw new Error('Image size is greater than 1MB');
				}

				const imagePublicId = (await generateAlphaNumericString(10)).data;
				const imageFileName = imagePublicId + '.' + type;

				await uploadObjectToS3AsBase64(
					process.env.AWS_CHARMCHECK_PRIVATE_S3_BUCKET,
					imageFileName,
					base64EncodedImage
				);

				await uploadObjectToS3AsBase64(
					process.env.AWS_CHARMCHECK_PUBLIC_S3_BUCKET,
					imageFileName,
					base64EncodedImage
				);

				const saveImageToDBResponse = await Image.create({
					imagePublicId,
					imageWidth: width,
					imageHeight: height,
					imageSizeInBytes: sizeInBytes,
					imageType: type,
				});

				if (!saveImageToDBResponse) {
					throw new Error('Error while saving image to DB');
				}

				const response = generateResponse(
					false,
					'Image uploaded successfully',
					{
						imagePublicId,
						imageId: saveImageToDBResponse.id,
					},
					'IMAGE_UPLOADED_SUCCESSFULLY',
					201
				);

				return response;
			} catch (err) {
				throw err;
			}
		},
	};
};

module.exports = { imageDal };
