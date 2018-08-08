const mongoose = require("mongoose");
const User = mongoose.model("User");
const promisify = require("es6-promisify");
exports.loginForm = (req, res) => {
  res.render("login", { title: "Login Form" });
};

exports.registerForm = (req, res) => {
  res.render("register");
};

exports.validateRegister = (req, res, next) => {
  req.sanitizeBody("name");
  req.checkBody("name", "You must enter the name!.").notEmpty();
  req.checkBody("email", "You must enter the email address!.").notEmpty();
  req.sanitizeBody("email").normalizeEmail({
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false
  });
  req.checkBody("password", "You must enter the password!.").notEmpty();
  req
    .checkBody("password-confirm", "Confirm password should be entered!")
    .notEmpty();
  req
    .checkBody(
      "password-confirm",
      "Confirm password does not match with the password"
    )
    .equals(req.body.password);

  const errors = req.validationErrors();
  if (errors) {
    req.flash("error", errors.map(err => err.msg));
    res.render("register", {
      title: "Register User",
      body: req.body,
      flashes: req.flash()
    });
    return; //stop the func from running
  }
  next(); //if there is no validation error continue to next step
};

exports.register = async (req, res, next) => {
  const user = new User({
    email: req.body.email,
    name: req.body.name
  });
  // User.register(user,req.body.password,function(err,user){

  // }) // this is without promisify
  const registerWithPromise = promisify(User.register, User);
  await registerWithPromise(user, req.body.password);
  next();
};

exports.account = (req, res) => {
  res.render("account", { title: "Edit Your Account" });
};
