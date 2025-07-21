const express = require("express");
const router = express.Router();
const exerciseController = require("../../controller/exerciseController");
const { upload } = require("../../services/fileupload");

router.get("/", exerciseController.getIndex);
router.get("/list", exerciseController.getData);
router.get("/create", exerciseController.create);
router.post("/store", upload.single('image'), exerciseController.store);
router.post("/delete/:id", exerciseController.deleteRecord);
router.get("/:id/edit", exerciseController.edit);
router.post("/:id/update", upload.single('image'), exerciseController.update);
router.post("/changestatus/:id", exerciseController.changeStatus);

module.exports = router;
