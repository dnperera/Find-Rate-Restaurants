const mongoose = require("mongoose");
const Reviews = mongoose.model("Reviews");

exports.addReviews = async (req, res) => {
  req.body.author = req.user._id;
  req.body.store = req.params.id;
  const newReview = new Reviews(req.body);
  await newReview.save();
  req.flash("success", "Review saved!");
  res.redirect("back");
};
