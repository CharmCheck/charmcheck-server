const sizeOf = require('image-size');
const fs = require('fs');
const path = require('path');

const { generateResponse } = require('./responseGenerator.utils');

const getImageInfo = (base64String) => {
	try {
		const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '');
		const imageBuffer = Buffer.from(base64Data, 'base64');

		const tempFileName = 'temp' + Math.floor(Math.random() * 1000000000);

		const tempFilePath = path.join(__dirname, tempFileName);
		fs.writeFileSync(tempFilePath, imageBuffer);

		const dimensions = sizeOf(tempFilePath);
		const imageSizeInfo = {
			width: dimensions.width,
			height: dimensions.height,
			type: dimensions.type,
			sizeInBytes: imageBuffer.length,
		};

		// Remove the temporary file
		fs.unlinkSync(tempFilePath);

		const response = generateResponse(
			false,
			'Image info fetched successfully',
			imageSizeInfo,
			'IMAGE_INFO_FETCHED_SUCCESSFULLY',
			200
		);

		return response;
	} catch (error) {
		throw error;
	}
};

module.exports = {
	getImageInfo,
};
