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
  validateRegister,
  register,
  account,
  updateAccount
} = require("../controllers/userController");

const { login, logout, isLoggedIn } = require("../controllers/authController");

const { catchErrors } = require("../handlers/errorHandlers");
// Do work here
router.get("/", catchErrors(getStores));
router.get("/stores", catchErrors(getStores));
router.get("/stores/:id/edit", catchErrors(editStore));
router.get("/stores/:slug", catchErrors(findStoreBySlug));

router.get("/add", isLoggedIn, addStore);
router.post("/add", upload, catchErrors(resize), catchErrors(createStore));
router.post("/add/:id", upload, catchErrors(resize), catchErrors(updateStore));

router.get("/tags", catchErrors(getStoresByTag));
router.get("/tags/:tag", catchErrors(getStoresByTag));

router.get("/login", loginForm);
router.post("/login", login);
router.get("/register", registerForm);
//1) Validate the user registration data
//2) Save the user data
//3) need to log the use in
router.post("/register", validateRegister, catchErrors(register), login);
router.get("/logout", logout);

router.get("/account", isLoggedIn, account);
router.post("/account", catchErrors(updateAccount));
module.exports = router;
