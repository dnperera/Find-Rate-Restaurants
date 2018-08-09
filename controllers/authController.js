const passport = require("passport");
const mongoose = require("mongoose");
const User = mongoose.model("User");
const crypto = require("crypto");
const promisify = require("es6-promisify");

exports.login = passport.authenticate("local", {
  failureRedirect: "/login",
  failureFlash: "Failed to login!.",
  successRedirect: "/",
  successFlash: "You have successfuly logged in!."
});
exports.logout = (req, res) => {
  req.logout();
  req.flash("success", "You have successfully logout now !.");
  res.redirect("/");
};

exports.isLoggedIn = (req, res, next) => {
  //first check whether user authenticated
  if (req.isAuthenticated()) {
    next();
    return;
  }
  req.flash("error", "You must login first to access !");
  res.redirect("/login");
};

exports.forgotPassword = async (req, res) => {
  //1) check to see whether there is an use exist with the email provided
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    req.flash("error", "No account exist with that email address!.");
    res.redirect("/login");
  }
  //2)set reset token and expire time
  user.resetPasswordToken = crypto.randomBytes(20).toString("hex");
  user.resetPasswordExpires = Date.now() + 3600000; // expires in 1 hr
  await user.save();
  //3)send the email notification with the token
  const resetURL = `http://${req.headers.host}/account/reset/${
    user.resetPasswordToken
  }`;

  req.flash(
    "success",
    `You have been emailed a password reset link. ${resetURL}`
  );
  //4)redirect use to the login page
  res.redirect("/login");
};

exports.reset = async (req, res) => {
  const user = User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  //if the user does not exist
  if (!user) {
    req.flash("error", "Password reset is invalid or has expired!");
    res.redirect("/login");
  }
  //if there is a user .show the reset form.
  res.render("reset", { title: "Reset your password !" });
};

exports.confirmedPasswords = (req, res, next) => {
  if (req.body.password === req.body["password-confirm"]) {
    next();
    return;
  }
  req.flash("error", "Confirmed password does not match with password!.");
  res.redirect("back");
};
exports.updatePassword = async (req, res) => {
  //find user first and check reset time expires
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });

  if (!user) {
    req.flash("error", "Password reset is invalid or has expired!");
    res.redirect("/login");
  }
  //update
  const setPassword = promisify(user.setPassword, user);
  await setPassword(req.body.password);
  //once the user's new password set, need to remove resetToken and resetExpire fields from the db
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  //now save the user
  const updatedUser = await user.save();
  await req.login(updatedUser);
  req.flash("success", "Your password has been reset!.");
  res.redirect("/");
};
