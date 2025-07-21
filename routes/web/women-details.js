const express = require("express");
const router = express.Router();
const womenDetailsController = require("../../controller/womenDetailsController");

router.get("/", womenDetailsController.getIndex);
router.get("/list", womenDetailsController.getData);
router.get("/create", womenDetailsController.create);
router.post("/store", womenDetailsController.store);
router.post("/delete/:id", womenDetailsController.deleteRecord);
router.get("/:id/edit", womenDetailsController.edit);
router.post("/:id/update", womenDetailsController.update);
router.post("/changestatus/:id", womenDetailsController.changeStatus);

module.exports = router;