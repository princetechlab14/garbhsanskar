const express = require("express");
const router = express.Router();
const creativeWorkController = require("../../controller/creativeWorkController");

router.get("/", creativeWorkController.getIndex);
router.get("/list", creativeWorkController.getData);
router.get("/create", creativeWorkController.create);
router.post("/store", creativeWorkController.store);
router.post("/delete/:id", creativeWorkController.deleteRecord);
router.get("/:id/edit", creativeWorkController.edit);
router.post("/:id/update", creativeWorkController.update);
router.post("/changestatus/:id", creativeWorkController.changeStatus);

module.exports = router;
