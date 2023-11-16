const mongoose = require('mongoose');

const { Schema } = mongoose;

const paymentSchema = new Schema(
	{},
	{
		timestamps: true,
	}
);

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = { Payment };
