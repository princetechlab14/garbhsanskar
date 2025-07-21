const express = require("express");
const router = express.Router();
const pregWeekDetailsController = require("../../controller/pregWeekDetailsController");

router.get("/", pregWeekDetailsController.getIndex);
router.get("/list", pregWeekDetailsController.getData);
router.get("/create", pregWeekDetailsController.create);
router.post("/store", pregWeekDetailsController.store);
router.post("/delete/:id", pregWeekDetailsController.deleteRecord);
router.get("/:id/edit", pregWeekDetailsController.edit);
router.post("/:id/update", pregWeekDetailsController.update);
router.post("/changestatus/:id", pregWeekDetailsController.changeStatus);

module.exports = router;
