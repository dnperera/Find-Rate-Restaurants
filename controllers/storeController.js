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

exports.editStore = async (req, res) => {
  //1) find the store for the given id
  const store = await Store.findOne({ _id: req.params.id });

  //2) to do - check user is authorised to edit store
  //3)render edit store form
  res.render("editStore", { title: `Edit ${store.name}`, store });
};
exports.updateStore = async (req, res) => {
  //1) find the store for the given id and update
  const updatedStore = await Store.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    {
      new: true, //Return the updated store instead of old
      runValidators: true
    }
  ).exec();
  req.flash(
    "success",
    `Successfully updated <strong>${updatedStore.name}</strong>.
  <a href="/stores/${updatedStore.slug}">View Store </a>`
  );
  res.redirect(`/stores/${updatedStore._id}/edit`);
};
