const mongoose = require("mongoose");
const Store = mongoose.model("Store");
const multer = require("multer");
const jimp = require("jimp");
const uuid = require("uuid");

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next) {
    const isPhoto = file.mimetype.startsWith("image/");
    if (isPhoto) {
      next(null, true);
    } else {
      next("message:Invalid file type !.", false);
    }
  }
};

exports.upload = multer(multerOptions).single("photo");

exports.resize = async (req, res, next) => {
  //check if there is no new file to resize
  if (!req.file) {
    next(); // skip to the next middleware
    return;
  }
  const fileExt = req.file.mimetype.split("/")[1];
  //add the photo propery to request.body object for saving . create unique file name using uuid
  req.body.photo = `${uuid.v4()}.${fileExt}`;

  //Now resize the file using jimp

  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO); //Resize the photo to 800px
  await photo.write(`./public/uploads/${req.body.photo}`); //finally write the resize photo to the uploads folder in public/uploads
  //once photo is saved to file system ,go to next method
  next();
};
exports.addStore = (req, res) => {
  res.render("editStore", { title: "Add a new store" });
};

exports.createStore = async (req, res) => {
  //add current logged in user's id to the incoming req as author
  req.body.author = req.user._id;
  const store = await new Store(req.body).save();
  req.flash("success", `Successfully new store ${store.name} was created`);
  res.redirect(`/stores/${store.slug}`);
};

exports.getStores = async (req, res) => {
  //Find all stores from the db
  const stores = await Store.find();
  res.render("stores", { title: "stores", stores: stores });
};

const confirmOwner = (store, user) => {
  if (store.author.equals(user._id)) {
    return true;
  }
  return false;
};
exports.editStore = async (req, res) => {
  //1) find the store for the given id
  const store = await Store.findOne({ _id: req.params.id });

  //2) to do - check user is authorised to edit store
  if (!confirmOwner(store, req.user)) {
    req.flash("error", "You are not authroised to edit the store!");
    res.redirect("back");
  } else {
    //3)render edit store form
    res.render("editStore", { title: `Edit ${store.name}`, store });
  }
};
exports.updateStore = async (req, res) => {
  //set the location data to be a Point type
  req.body.location.type = "Point";
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

exports.findStoreBySlug = async (req, res, next) => {
  const store = await Store.findOne({ slug: req.params.slug }).populate(
    "author"
  );
  if (!store) {
    // next();
    // return;
    return next();
  }
  res.render("store", { store, title: store.name });
};

exports.getStoresByTag = async (req, res) => {
  const tag = req.params.tag;
  const tagQuery = tag || { $exists: true };
  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.find({ tags: tagQuery });
  //if there are multiple promises that does not depend on each other , you can execute all at once
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
  res.render("tag", { tags, stores, title: "Tags", tag });
};
