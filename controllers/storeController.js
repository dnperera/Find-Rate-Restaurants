const mongoose = require("mongoose");
const Store = mongoose.model("Store");
const User = mongoose.model("User");
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
  //if the user in home page assume page is 1
  const currentpage = req.params.page || 1;
  const limit = 4; // display stores limit per page
  const skip = currentpage * limit - limit;
  //Find all stores from the db
  const storesPromise = Store.find()
    .skip(skip)
    .limit(limit)
    .sort({ created: "desc" });
  const countPromise = Store.count();

  const [stores, count] = await Promise.all([storesPromise, countPromise]);
  const pages = Math.ceil(count / limit);
  if (!stores.length && skip) {
    req.flash(
      "info",
      `You requested page ${currentpage}. But that does not exist .So you will be directed to page ${pages}`
    );
    res.redirect(`/stores/page/${pages}`);
    return;
  }
  res.render("stores", { title: "stores", stores, currentpage, pages, count });
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
    "author reviews"
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

exports.search = async (req, res) => {
  //Find the stores with matching search word
  const stores = await Store.find(
    {
      $text: {
        $search: req.query.q
      }
    },
    {
      score: { $meta: "textScore" }
    }
  )
    //then sort the list by frequency of the search term in the store titlw and description
    .sort({
      score: { $meta: "textScore" }
    })
    //Limit the 5 results
    .limit(5);

  res.json(stores);
};

exports.mapStores = async (req, res) => {
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
  const searchParams = {
    location: {
      $near: {
        $geometry: {
          type: "Point",
          coordinates
        },
        $maxDistance: 10000 //10Km
      }
    }
  };
  const stores = await Store.find(searchParams)
    .select("name photo slug location") // with select you can select fields you want, if you do not want select field -name
    .limit(10);
  res.json(stores);
};

exports.mapPage = (req, res) => {
  res.render("map", { title: "Map" });
};

exports.favouriteStore = async (req, res) => {
  const favourites = req.user.favourite.map(obj => obj.toString());
  //depending on the user selection, need to decide if the store already selected , need to remove  $pull operator, if not add to the db array of favouriteStores $addToSet.
  const operator = favourites.includes(req.params.id) ? "$pull" : "$addToSet";
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { [operator]: { favourite: req.params.id } },
    { new: true }
  );
  res.json(user);
};

exports.favourites = async (req, res) => {
  const stores = await Store.find({
    _id: { $in: req.user.favourite }
  });
  res.render("stores", { title: "Favorite Resturants & Cafe", stores });
};

exports.getTopStores = async (req, res) => {
  const stores = await Store.getTopRatedStores();
  res.render("topStores", { stores, title: "To Stores" });
};
