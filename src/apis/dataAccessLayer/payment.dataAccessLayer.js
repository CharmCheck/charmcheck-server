const { Payment } = require('../schemas/payment.schemas');
const { Review } = require('../schemas/review.schemas');
const { generateResponse } = require('../../utils/responseGenerator.utils');
const { pushToTailOfList } = require('../../databases/redis.databases');
const { logError } = require('../../utils/errorLogger.utils');

const paymentDal = () => {
	return {
		async paymentCheckout(paymentObject, lemonsqueezySignature) {
			try {
				// TODO : Add lemonsqueezy signature verification
				// if (!lemonsqueezySignature) {
				// 	throw new Error('No lemonsqueezy signature');
				// }

				// const secret = process.env.LEMONSQUEEZY_X_SIGNATURE_HEADER;
				// const hmac = crypto.createHmac('sha256', secret);
				// const digest = Buffer.from(
				// 	hmac.update(req.rawBody).digest('hex'),
				// 	'utf8'
				// );
				// const signature = Buffer.from(lemonsqueezySignature, 'utf8');

				// if (!crypto.timingSafeEqual(digest, signature)) {
				// 	throw new Error('Invalid lemonsqueezy signature.');
				// }

				if (
					!paymentObject ||
					!paymentObject.meta ||
					!paymentObject.meta.event_name ||
					paymentObject.meta.event_name !== 'order_created' ||
					!paymentObject.data ||
					!paymentObject.data.attributes ||
					!paymentObject.data.attributes.status ||
					paymentObject.data.attributes.status !== 'paid'
				) {
					throw new Error('Invalid payment object');
				}

				if (
					!paymentObject.meta.custom_data ||
					!paymentObject.meta.custom_data.reviewId
				) {
					throw new Error(
						'Invalid payment object. Review id not found. Reach out to user at:' +
							paymentObject.data.attributes.user_email
					);
				}

				const reviewId = paymentObject.meta.custom_data.reviewId;

				const reviewCount = await Review.countDocuments({
					_id: reviewId,
				});

				if (reviewCount !== 1) {
					throw new Error(
						'Invalid payment object. Review not found in DB. Reach out to user at:' +
							paymentObject.data.attributes.user_email
					);
				}

				const orderId = paymentObject.data.id;
				const billingEmail = paymentObject.data.attributes.user_email;
				const otherData = paymentObject;

				await pushToTailOfList(
					process.env.REDIS_KEY_MESSAGE_LIST,
					JSON.stringify({
						reviewId,
						orderId,
					})
				);

				const savedPaymentResponse = await Payment.create({
					review: reviewId,
					orderId,
					billingEmail,
					otherData,
				});

				if (!savedPaymentResponse) {
					throw new Error('Error in saving payment response');
				}

				const response = generateResponse(
					false,
					'Payment registered successfully.',
					null,
					'PAYMENT_REGISTERED_SUCCESSFULLY',
					201
				);

				return response;
			} catch (err) {
				logError(
					'ERROR_IN_PAYMENT_CHECKOUT_DAL',
					err,
					'ERROR_IN_PAYMENT_CHECKOUT_DAL',
					{
						paymentObject,
						lemonsqueezySignature,
					}
				);

				throw err;
			}
		},
	};
};

module.exports = { paymentDal };
