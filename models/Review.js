const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const reviewSchema = new mongoose.Schema({
  created: {
    type: Date,
    default: Date.now
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: "You must supply an author"
  },
  store: {
    type: mongoose.Schema.ObjectId,
    ref: "Store",
    required: "You must provide the store"
  },
  text: {
    type: String,
    required: "You need to enter review description!"
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
});
module.exports = mongoose.model("Reviews", reviewSchema);
