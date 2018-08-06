const express = require("express");
const router = express.Router();
const {
  addStore,
  createStore,
  getStores,
  editStore,
  updateStore,
  upload,
  resize
} = require("../controllers/storeController");
const { catchErrors } = require("../handlers/errorHandlers");
// Do work here
router.get("/", catchErrors(getStores));
router.get("/stores", catchErrors(getStores));
router.get("/stores/:id/edit", catchErrors(editStore));
router.get("/add", addStore);
router.post("/add", upload, catchErrors(resize), catchErrors(createStore));
router.post("/add/:id", upload, catchErrors(resize), catchErrors(updateStore));

module.exports = router;
