const router = require("express").Router();

const { authJWT } = require("../../app/middlewares");
const UserController = require("../../app/controllers/user.controller");

router.get("/", authJWT, UserController.getProfile);
router.get("/count", authJWT, UserController.countUser);
router.get("/favorite", authJWT, UserController.getFavoriteDrink);
router.get("/history", authJWT, UserController.getHistoryRecomendation);
router.post("/disease", authJWT, UserController.diseaseUser);
router.post("/allergy", authJWT, UserController.allergyUser);
router.put("/profile", authJWT, UserController.updateProfile);
// router.put("/:id", authJWT, FruitController.updateFruit);
// router.delete("/:id", authJWT, FruitController.deleteFruit);

module.exports = router;