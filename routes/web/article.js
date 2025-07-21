const express = require("express");
const router = express.Router();
const articleController = require("../../controller/articleController");
const { upload } = require("../../services/fileupload");

router.get("/", articleController.getIndex);
router.get("/list", articleController.getData);
router.get("/create", articleController.create);
router.post("/store", upload.single('image'), articleController.store);
router.post("/delete/:id", articleController.deleteRecord);
router.get("/:id/edit", articleController.edit);
router.post("/:id/update", upload.single('image'), articleController.update);
router.post("/changestatus/:id", articleController.changeStatus);

module.exports = router;
