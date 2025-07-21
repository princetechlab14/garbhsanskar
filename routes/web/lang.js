const express = require('express');
const router = express.Router();
const langController = require("../../controller/langController");
const { upload } = require("../../services/fileupload");

router.get("/", langController.getIndex);
router.get("/list", langController.getData);
router.get("/create", langController.create);
router.post("/store", upload.single('image'), langController.store);
router.post("/delete/:id", langController.deleteRecord);
router.get("/:id/edit", langController.edit);
router.post("/:id/update", upload.single('image'), langController.update);
router.post("/changestatus/:id", langController.changeStatus);

module.exports = router;