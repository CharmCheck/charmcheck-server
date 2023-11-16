const { Payment } = require('../schemas/payment.schemas');
const { Review } = require('../schemas/review.schemas');
const { generateResponse } = require('../../utils/responseGenerator.utils');

const paymentDal = () => {
	return {
		async paymentCheckout(paymentObject) {
			try {
				// TODO: Send email to myself for any failure in this function
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

				const savedPaymentResponse = await Payment.create({
					review: reviewId,
					orderId,
					billingEmail,
					otherData,
				});

				if (!savedPaymentResponse) {
					throw new Error('Error in saving payment response');
				}

				// save payment response
				// update review status to paid
				// generate review
				// update review
				// send email to user
				const response = generateResponse(
					false,
					'Payment registered successfully.',
					null,
					'PAYMENT_REGISTERED_SUCCESSFULLY',
					201
				);

				return response;
			} catch (err) {
				throw err;
			}
		},
	};
};
