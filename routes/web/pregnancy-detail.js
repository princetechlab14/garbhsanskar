const express = require("express");
const router = express.Router();
const pregnancyDetailsController = require("../../controller/pregnancyDetailsController");
const { upload } = require("../../services/fileupload");

router.get("/", pregnancyDetailsController.getIndex);
router.get("/list", pregnancyDetailsController.getData);
router.get("/create", pregnancyDetailsController.create);
router.post("/store", upload.single('image'), pregnancyDetailsController.store);
router.post("/delete/:id", pregnancyDetailsController.deleteRecord);
router.get("/:id/edit", pregnancyDetailsController.edit);
router.post("/:id/update", upload.single('image'), pregnancyDetailsController.update);
router.post("/changestatus/:id", pregnancyDetailsController.changeStatus);

module.exports = router;
