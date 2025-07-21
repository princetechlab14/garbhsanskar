const express = require("express");
const router = express.Router();
const vedicGeetsController = require("../../controller/vedicGeetsController");

router.get("/", vedicGeetsController.getIndex);
router.get("/list", vedicGeetsController.getData);
router.get("/create", vedicGeetsController.create);
router.post("/store", vedicGeetsController.store);
router.post("/delete/:id", vedicGeetsController.deleteRecord);
router.get("/:id/edit", vedicGeetsController.edit);
router.post("/:id/update", vedicGeetsController.update);
router.post("/changestatus/:id", vedicGeetsController.changeStatus);

module.exports = router;