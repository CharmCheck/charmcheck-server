const generateResponse = (
	isError,
	message,
	data,
	responseStringCode,
	responseStatusCode
) => {
	return {
		isError,
		message,
		data,
		responseStringCode,
		responseStatusCode,
		responseId: Math.floor(Math.random() * 1000000000),
	};
};

module.exports = { generateResponse };
