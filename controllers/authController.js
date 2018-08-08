const passport = require("passport");

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
