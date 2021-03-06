const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const slug = require("slugs");

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: "Please endter a store name"
    },
    slug: String,
    description: {
      type: String,
      trim: true
    },
    tags: [String],
    created: {
      type: Date,
      default: Date.now
    },
    location: {
      type: {
        type: String,
        default: "Point"
      },
      coordinates: [
        {
          type: Number,
          required: "You must supply coordinates!"
        }
      ],
      address: {
        type: String,
        required: "You must supply an address"
      }
    },
    photo: String,
    author: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: "You must supply an author"
    }
  },
  //Following neccessay if you want to attach your virtual field data with query results
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

//Define indexes for title and name
storeSchema.index({
  name: "text",
  description: "text"
});

storeSchema.index({
  location: "2dsphere"
});
storeSchema.pre("save", async function(next) {
  if (!this.isModified("name")) {
    next(); // skip it
    return; // stop this function from running
  }
  this.slug = slug(this.name);
  //find whether other stores in db have same slug such as toast ,toast-1, toast-2
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, "i");
  //we can not use Store as schema since Store is not yet instantiate. insted we can use this.constructor
  const storesWithSameSlug = await this.constructor.find({
    slug: slugRegEx
  });
  if (storesWithSameSlug.length) {
    this.slug = `${this.slug}-${storesWithSameSlug.length + 1}`;
  }
  next();
});
//Add a static method to the Store Schema
storeSchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
  ]);
};
storeSchema.statics.getTopRatedStores = function() {
  return this.aggregate([
    //Lookup stores and populate their reviews
    {
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "store",
        as: "reviews"
      }
    },
    //Filter stores that have more than 1 reviews
    { $match: { "reviews.1": { $exists: true } } },
    //Add the average reviews field
    {
      $addFields: {
        averageRating: { $avg: "$reviews.rating" }
      }
    },
    //sort the results by new field 'averageRating',highest review first
    { $sort: { averageRating: -1 } },
    //Limit the  total results to 10
    { $limit: 10 }
  ]);
};
//add virtual populate for reviews
//Find reviews where the store _id = reviews model store property
storeSchema.virtual("reviews", {
  ref: "Reviews", //what model to link
  localField: "_id", // which field in Store model to match
  foreignField: "store" //which field on the Reviews model
});
//following function  called hook to auto populate reviews info whenever query the Store Schema by 'find' or 'findOne'
function autopopulate(next) {
  this.populate("reviews");
  next();
}
storeSchema.pre("find", autopopulate);
storeSchema.pre("findOne", autopopulate);

module.exports = mongoose.model("Store", storeSchema);
