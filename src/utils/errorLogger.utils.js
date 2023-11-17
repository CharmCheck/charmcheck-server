const { Sentry } = require('../config/sentry.config');

const logError = (errorId, err, errorStringCode, data) => {
	if (process.env.NODE_ENV === 'development')
		console.log({
			errorId,
			err,
			errorStringCode,
			data,
		});

	Sentry.captureException(err, {
		extra: {
			errorId,
			errorStringCode,
			data,
		},
	});
};

module.exports = { logError };
