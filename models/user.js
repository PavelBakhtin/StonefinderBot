const { Schema, models, model } = require("mongoose");

const UserSchema = new Schema({
	telegramId: {
		type: Number,
		required: true,
	},
	favs: { type: [String], default: [] },
});

const User = models.User || model("User", UserSchema);
module.exports = User;
