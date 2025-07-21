const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const { authCheck } = require("../middleware/auth.middleware");

router.route("/register").get(authController.getRegister).post(authController.register);
router.route("/login").get(authController.getLogin).post(authController.login);
router.get("/logout", authController.logout);
router.get("/profile", authCheck, authController.profileGet);
router.post("/profile", authCheck, authController.profileUpdate);

/* GET home page. */
router.get("/", authCheck, async function (req, res, next) {
    try {
        res.render("dashboard", { title: "Dashboard", activePage: "dashboard", auth: req?.auth });
    } catch (error) {
        console.error("Error fetching counts:", error);
        res.status(500).send("Internal Server Error");
    }
});

// routes
router.use("/category", authCheck, require("./web/category"));
router.use("/article", authCheck, require("./web/article"));
router.use("/lang", authCheck, require("./web/lang"));
router.use("/contact-us", authCheck, require("./web/contactUs"));
router.use("/avoid-food", authCheck, require("./web/avoid-food"));
router.use("/work-category", authCheck, require("./web/work-category"));
router.use("/creative-work", authCheck, require("./web/creative-work"));
router.use("/diet", authCheck, require("./web/diet"));
router.use("/exercise", authCheck, require("./web/exercise"));
router.use("/music-category", authCheck, require("./web/music-category"));
router.use("/music", authCheck, require("./web/music"));
router.use("/pregnancies", authCheck, require("./web/pregnancies"));
router.use("/pregnancy-detail", authCheck, require("./web/pregnancy-detail"));
router.use("/preg-week-details", authCheck, require("./web/preg-week-details"));
router.use("/vedic-geets", authCheck, require("./web/vedic-geets"));
router.use("/women-details", authCheck, require("./web/women-details"));
module.exports = router;
