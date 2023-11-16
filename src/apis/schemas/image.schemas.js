const mongoose = require('mongoose');

const { Schema } = mongoose;

const imageSchema = new Schema(
	{
		imagePublicId: {
			type: String,
			required: true,
			trim: true,
			unique: true,
			index: true,
		},
		imageWidth: {
			type: Number,
			required: true,
		},
		imageHeight: {
			type: Number,
			required: true,
		},
		imageSizeInBytes: {
			type: Number,
			required: true,
		},
		imageType: {
			type: String,
			enum: ['jpg', 'png', 'jpeg'],
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

const Image = mongoose.model('Image', imageSchema);

module.exports = { Image };
