require("dotenv").config();
const mongoose = require("mongoose");
let isConnected = false;
const connectToDb = async () => {
	mongoose.set("strictQuery", true);

	if (isConnected) {
		return;
	}
	try {
		await mongoose.connect(process.env.MONGODB_URI, {
			dbName: "StoneFinderDB",
			useNewUrlPArser: true,
			useUnifiedTopology: true,
		});
		isConnected = true;
		console.log("MongDb connected");
	} catch (error) {}
};
module.exports = { connectToDb };
