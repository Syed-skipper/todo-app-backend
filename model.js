const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
});

const TodoSchema = new mongoose.Schema({
  title: String,
  description: String,
  due_date: Date,
  completed: { type: Boolean, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const GroupSchema = new mongoose.Schema({
  name: String,
  invite_code: String,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = {
  User: mongoose.model("User", UserSchema),
  Todo: mongoose.model("Todo", TodoSchema),
  Group: mongoose.model("Group", GroupSchema),
};
