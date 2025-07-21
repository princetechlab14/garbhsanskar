const express = require("express");
const router = express.Router();
const workCategoryController = require("../../controller/workCategoryController");

router.get("/", workCategoryController.getIndex);
router.get("/list", workCategoryController.getData);
router.get("/create", workCategoryController.create);
router.post("/store", workCategoryController.store);
router.post("/delete/:id", workCategoryController.deleteRecord);
router.get("/:id/edit", workCategoryController.edit);
router.post("/:id/update", workCategoryController.update);
router.post("/changestatus/:id", workCategoryController.changeStatus);

module.exports = router;