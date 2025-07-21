const express = require("express");
const router = express.Router();
const pregnanciesController = require("../../controller/pregnanciesController");
const { upload } = require("../../services/fileupload");

router.get("/", pregnanciesController.getIndex);
router.get("/list", pregnanciesController.getData);
router.get("/create", pregnanciesController.create);
router.post("/store", upload.single('image'), pregnanciesController.store);
router.post("/delete/:id", pregnanciesController.deleteRecord);
router.get("/:id/edit", pregnanciesController.edit);
router.post("/:id/update", upload.single('image'), pregnanciesController.update);
router.post("/changestatus/:id", pregnanciesController.changeStatus);

module.exports = router;