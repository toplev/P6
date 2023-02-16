const express = require("express");
const auth = require("../middleware/auth");

const router = express.Router();

const multer = require("../middleware/multer-config");

const sauceCtrl = require("../controllers/sauce");

router.post("/", auth, multer, sauceCtrl.createSauce);

router.put("/:id", auth, multer, sauceCtrl.modifySauce);

router.delete("/:id", auth, sauceCtrl.deleteSauce);

router.get("/:id", auth, sauceCtrl.getOneSauce);

router.get("/", auth, sauceCtrl.getAllSauce);

router.post("/:id/like", auth, sauceCtrl.like);

module.exports = router;
