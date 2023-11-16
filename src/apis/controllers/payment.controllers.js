const { generateResponse } = require('../../utils/responseGenerator.utils');
const { logError } = require('../../utils/errorLogger.utils');
const { paymentDal } = require('../dataAccessLayer/payment.dataAccessLayer');

const paymentCheckoutController = async (req, res, next) => {
	try {
		const paymentCheckoutResponse = await paymentDal().paymentCheckout(
			req.body,
			req.headers['X-Signature']
		);

		return res
			.status(paymentCheckoutResponse.responseStatusCode)
			.json(paymentCheckoutResponse);
	} catch (err) {
		const response = generateResponse(
			true,
			'Error while processing payment',
			null,
			'ERROR_PROCESSING_PAYMENT',
			500
		);

		logError(response.responseId, err, response.responseStringCode, req.body);

		return res.status(response.responseStatusCode).json(response);
	}
};

module.exports = {
	paymentCheckoutController,
};
