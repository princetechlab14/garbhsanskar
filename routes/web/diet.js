const express = require("express");
const router = express.Router();
const dietController = require("../../controller/dietController");

router.get("/", dietController.getIndex);
router.get("/list", dietController.getData);
router.get("/create", dietController.create);
router.post("/store", dietController.store);
router.post("/delete/:id", dietController.deleteRecord);
router.get("/:id/edit", dietController.edit);
router.post("/:id/update", dietController.update);
router.post("/changestatus/:id", dietController.changeStatus);

module.exports = router;
