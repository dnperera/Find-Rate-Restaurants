const mongoose = require("mongoose");
const md5 = require("md5");
const validator = require("validator");
const mongodbErrorHandler = require("mongoose-mongodb-errors");
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const userSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, "Invalid Email Address!"],
    required: "Please enter an valid email address"
  },
  name: {
    type: String,
    required: "Please enter the name",
    trim: true
  }
});
//create virutal feild in mongoose user model for avatar
userSchema.virtual("gravatar").get(function() {
  const hash = md5(this.email); // Avatar use md5 algorithm
  return `https://gravatar.com/avatar/${hash}?s=200`;
});
userSchema.plugin(passportLocalMongoose, { usernameField: "email" });
userSchema.plugin(mongodbErrorHandler);
module.exports = mongoose.model("User", userSchema);
