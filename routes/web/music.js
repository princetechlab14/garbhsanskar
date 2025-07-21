const express = require("express");
const router = express.Router();
const musicController = require("../../controller/musicController");
const { upload } = require("../../services/fileupload");

router.get("/", musicController.getIndex);
router.get("/list", musicController.getData);
router.get("/create", musicController.create);
router.post("/store", upload.fields([{ name: "image", maxCount: 1 }, { name: "music", maxCount: 1 }]), musicController.store);
router.post("/delete/:id", musicController.deleteRecord);
router.get("/:id/edit", musicController.edit);
router.post("/:id/update", upload.fields([{ name: "image", maxCount: 1 }, { name: "music", maxCount: 1 }]), musicController.update);
router.post("/changestatus/:id", musicController.changeStatus);

module.exports = router;