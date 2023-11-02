const { Schema, models, model } = require("mongoose");

const PostSchema = new Schema({
	creator: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},
	authorId: { type: Number, requires: [true] },
	name: { type: String, requires: [true] },
	info: {
		type: String,
		requires: [true],
	},
	date: {
		type: String,
		requires: [true],
	},
	type: {
		type: String,
		requires: [true],
	},
});
const Post = models.Post || model("Post", PostSchema);
module.exports = Post;
