const mongoose = require('mongoose');

const { Schema } = mongoose;

const paymentSchema = new Schema(
	{
		review: {
			type: Schema.Types.ObjectId,
			ref: 'Review',
			required: true,
			unique: true,
		},
		orderId: {
			type: String,
			required: true,
			unique: true,
		},
		billingEmail: {
			type: String,
			required: true,
		},
		otherData: {
			type: Object,
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = { Payment };
