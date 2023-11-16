const rateLimit = require('express-rate-limit');
const { generateResponse } = require('../utils/responseGenerator.utils');

const rateLimiter = rateLimit({
	windowMs: 5 * 60 * 1000, // 5 minutes
	max: 30,
	standardHeaders: false, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	message: generateResponse(
		true,
		'Rate limit reached. Please try again later!',
		null,
		'RATE_LIMIT',
		429
	),
});

module.exports = {
	rateLimiter,
};
