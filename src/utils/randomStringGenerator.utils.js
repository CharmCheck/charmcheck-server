const { generateResponse } = require('./responseGenerator.utils');

const generateAlphaNumericString = async (length) => {
	const { customAlphabet } = await import('nanoid');
	const nanoid = customAlphabet(
		'1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
		length
	);

	const response = generateResponse(
		false,
		'Successfully generated aphanumeric string',
		nanoid(),
		'GENERATED_ALPHANUMERIC_STRING',
		200
	);

	return response;
};

const generateNumericOTP = async (length) => {
	const { customAlphabet } = await import('nanoid');
	const nanoid = customAlphabet('0123456789', length);

	const response = generateResponse(
		false,
		'Successfully generated numeric OTP',
		nanoid(),
		'GENERATED_NUMERIC_OTP',
		200
	);

	return response;
};

module.exports = {
	generateAlphaNumericString,
	generateNumericOTP,
};
