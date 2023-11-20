const mongoose = require('mongoose');

const { Schema } = mongoose;

const reviewSchema = new Schema(
	{
		reviewPublicId: {
			type: String,
			required: true,
			trim: true,
			unique: true,
			index: true,
		},
		userEmail: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
		},
		images: [
			{
				type: Schema.Types.ObjectId,
				ref: 'Image',
			},
		],
		reviewDetails: {
			type: String,
			default: null,
		},
		payment: {
			type: Schema.Types.ObjectId,
			ref: 'Payment',
			default: null,
		},
	},
	{
		timestamps: true,
	}
);

const Review = mongoose.model('Review', reviewSchema);

module.exports = { Review };
