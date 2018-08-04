const mongoose = require("mongoose");
const Store = mongoose.model("Store");
exports.homepage = (req, res) => {
  res.render("index");
};
exports.addStore = (req, res) => {
  res.render("editStore", { title: "Add a new store" });
};

exports.createStore = async (req, res) => {
  const store = await new Store(req.body).save();
  req.flash("success", `Successfully new store ${store.name} was created`);
  res.redirect(`/store/${store.slug}`);
};
