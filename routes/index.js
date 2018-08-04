const express = require("express");
const router = express.Router();
const {
  homepage,
  addStore,
  createStore
} = require("../controllers/storeController");
const { catchErrors } = require("../handlers/errorHandlers");
// Do work here
router.get("/", homepage);
router.get("/add", addStore);
router.post("/add", catchErrors(createStore));

module.exports = router;
