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

exports.getStores = async (req, res) => {
  //Find all stores from the db
  const stores = await Store.find();
  res.render("stores", { title: "stores", stores: stores });
};
