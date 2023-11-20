const sgMail = require('@sendgrid/mail');

const { emailTypes } = require('./constants');
const { logError } = require('./errorLogger.utils');
const { generateResponse } = require('./responseGenerator.utils');

const templates = {
	generalErrorEmail_to_self: (errorCode) => ({
		to: process.env.SELF_EMAIL,
		from: process.env.FROM_EMAIL,
		subject: 'CharmCheck General Error',
		text: 'CharmCheck General Error',
		html: `Hi!
		<br/>
		<br/>
		There's a general error in your application.
		<br />
		<br />
		Error Code: ${errorCode}
		<br/>
		<br/>
		Regards
		<br/>
		Team CharmCheck
		<br/>
		<a href="https://CharmCheck.xyz">charmcheck.xyz</a>
	`,
	}),
	incompleteReviewEmail_to_self: (reviewId) => ({
		to: process.env.SELF_EMAIL,
		from: process.env.FROM_EMAIL,
		subject: 'CharmCheck Incomplete Review Error',
		text: 'CharmCheck Incomplete Review Error',
		html: `Hi!
		<br/>
		<br/>
		There's an incomplete review error in your application.
		<br />
		<br />
		Review Id: ${reviewId}
		<br/>
		<br/>
		Regards
		<br/>
		Team CharmCheck
		<br/>
		<a href="https://CharmCheck.xyz">charmcheck.xyz</a>
	`,
	}),
	paymentErrorEmail_to_self: (orderId) => ({
		to: process.env.SELF_EMAIL,
		from: process.env.FROM_EMAIL,
		subject: 'CharmCheck Payment Error',
		text: 'CharmCheck Payment Error',
		html: `Hi!
		<br/>
		<br/>
		There's an Payment Error in your application.
		<br />
		<br />
		Order Id: ${orderId}
		<br/>
		<br/>
		Regards
		<br/>
		Team CharmCheck
		<br/>
		<a href="https://CharmCheck.xyz">charmcheck.xyz</a>
	`,
	}),
	reviewGenerationErrorEmail_to_self: (reviewId, orderId) => ({
		to: process.env.SELF_EMAIL,
		from: process.env.FROM_EMAIL,
		subject: 'CharmCheck Review Generation Error',
		text: 'CharmCheck Review Generation Error',
		html: `Hi!
		<br/>
		<br/>
		There's an Review Generation Error in your application.
		<br />
		<br />
		Review Id: ${reviewId}
		<br />
		Order Id: ${orderId}
		<br/>
		<br/>
		Regards
		<br/>
		Team CharmCheck
		<br/>
		<a href="https://CharmCheck.xyz">charmcheck.xyz</a>
	`,
	}),
	reviewGenerationSuccessEmail_to_user: (userEmail, reviewPublicId) => ({
		to: userEmail,
		from: process.env.FROM_EMAIL,
		subject: 'CharmCheck - Review of your dating profile',
		text: 'CharmCheck - Review of your dating profile',
		html: `Hi!
		<br/>
		<br/>
		Thanks for using CharmCheck. Your profile has been reviewed.
		<br />
		<br />
		You can check the review by click on this link: <a href="${
			process.env.REVIEW_PAGE_FRONTEND_PREFIX + reviewPublicId
		}">Review</a>
		<br />
		If the above link doesn't work, copy the following link and paste it on your browser: ${
			process.env.REVIEW_PAGE_FRONTEND_PREFIX + reviewPublicId
		}
		<br/>
		<br/>
		For any issues you can reply to this email. 
		<br/>
		<br/>
		Regards
		<br/>
		Team CharmCheck
		<br/>
		<a href="https://CharmCheck.xyz">charmcheck.xyz</a>
	`,
	}),
};

let isApiKeySet = false;

const sendEmail = async (emailType, data) => {
	try {
		console.log(emailType);
		// set api key only once for the entire app lifecycle
		if (!isApiKeySet) {
			sgMail.setApiKey(process.env.SENDGRID_API_KEY);
			isApiKeySet = true;
		}

		let sendgridResponse = null;

		switch (emailType) {
			case emailTypes.generalErrorEmail_to_self:
				sendgridResponse = await sgMail.send(
					templates.generalErrorEmail_to_self(data.errorCode)
				);
				break;
			case emailTypes.incompleteReviewEmail_to_self:
				sendgridResponse = await sgMail.send(
					templates.incompleteReviewEmail_to_self(data.reviewId)
				);
				break;
			case emailTypes.paymentErrorEmail_to_self:
				sendgridResponse = await sgMail.send(
					templates.paymentErrorEmail_to_self(data.orderId) // using order id because there can be a missing reviewId in payment object or can be an error saving the payment error so can be missing paymentId.
				);
				break;
			case emailTypes.reviewGenerationErrorEmail_to_self:
				sendgridResponse = await sgMail.send(
					templates.reviewGenerationErrorEmail_to_self(
						data.reviewId,
						data.orderId
					)
				);
				break;
			case emailTypes.reviewGenerationSuccessEmail_to_user:
				sendgridResponse = await sgMail.send(
					templates.reviewGenerationSuccessEmail_to_user(
						data.userEmail,
						data.reviewPublicId
					)
				);
				break;
			default:
				throw new Error('Invalid email type');
		}

		if (
			!sendgridResponse ||
			!sendgridResponse[0] ||
			!sendgridResponse[0].statusCode ||
			sendgridResponse[0].statusCode !== 202
		) {
			throw new Error('Error sending email');
		}

		const response = generateResponse(
			false,
			'Email sent successfully',
			null,
			'EMAIL_SENT_SUCCESSFULLY',
			200
		);

		return response;
	} catch (err) {
		logError('SendEmailError', err, 'SendEmailError', { emailType, data });

		throw err;
	}
};

module.exports = { sendEmail };
