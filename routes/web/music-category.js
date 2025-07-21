const express = require("express");
const router = express.Router();
const musicCategoryController = require("../../controller/musicCategoryController");

router.get("/", musicCategoryController.getIndex);
router.get("/list", musicCategoryController.getData);
router.get("/create", musicCategoryController.create);
router.post("/store", musicCategoryController.store);
router.post("/delete/:id", musicCategoryController.deleteRecord);
router.get("/:id/edit", musicCategoryController.edit);
router.post("/:id/update", musicCategoryController.update);
router.post("/changestatus/:id", musicCategoryController.changeStatus);

module.exports = router;