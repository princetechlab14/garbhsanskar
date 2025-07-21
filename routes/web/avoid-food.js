const express = require("express");
const router = express.Router();
const avoidFoodController = require("../../controller/avoidFoodController");

router.get("/", avoidFoodController.getIndex);
router.get("/list", avoidFoodController.getData);
router.get("/create", avoidFoodController.create);
router.post("/store", avoidFoodController.store);
router.post("/delete/:id", avoidFoodController.deleteRecord);
router.get("/:id/edit", avoidFoodController.edit);
router.post("/:id/update", avoidFoodController.update);
router.post("/changestatus/:id", avoidFoodController.changeStatus);

module.exports = router;