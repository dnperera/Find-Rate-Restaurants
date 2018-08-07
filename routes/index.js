const express = require("express");
const router = express.Router();
const {
  addStore,
  createStore,
  getStores,
  editStore,
  updateStore,
  upload,
  resize,
  findStoreBySlug,
  getStoresByTag
} = require("../controllers/storeController");
const {
  loginForm,
  registerForm,
  validateRegister
} = require("../controllers/userController");
const { catchErrors } = require("../handlers/errorHandlers");
// Do work here
router.get("/", catchErrors(getStores));
router.get("/stores", catchErrors(getStores));
router.get("/stores/:id/edit", catchErrors(editStore));
router.get("/stores/:slug", catchErrors(findStoreBySlug));

router.get("/add", addStore);
router.post("/add", upload, catchErrors(resize), catchErrors(createStore));
router.post("/add/:id", upload, catchErrors(resize), catchErrors(updateStore));

router.get("/tags", catchErrors(getStoresByTag));
router.get("/tags/:tag", catchErrors(getStoresByTag));

router.get("/login", loginForm);
router.get("/register", validateRegister);

module.exports = router;
