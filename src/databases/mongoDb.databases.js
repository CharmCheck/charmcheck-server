const mongoose = require('mongoose');

const { MONGO_URI } = process.env;

const connectMongoDB = async () => {
	try {
		await mongoose.connect(MONGO_URI);

		console.log('MongoDB connected');
	} catch (err) {
		throw err;
	}
};

module.exports = {
	connectMongoDB,
};
