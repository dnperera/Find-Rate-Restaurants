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
//following function or called hook to auto populate author info whenever query the reviews
function autoPopulate(next) {
  this.populate("author");
  next();
}
//so anytime user query for one review or all reviews, it will auto populate
reviewSchema.pre("find", autoPopulate);
reviewSchema.pre("findOne", autoPopulate);

module.exports = mongoose.model("Reviews", reviewSchema);
