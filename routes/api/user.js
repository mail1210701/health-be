const router = require("express").Router();

const { authJWT } = require("../../app/middlewares");
const UserController = require("../../app/controllers/user.controller");

// router.get("/", authJWT, FruitController.getListfruit);
router.post("/disease", authJWT, UserController.diseaseUser);
router.post("/allergy", authJWT, UserController.allergyUser);
// router.put("/:id", authJWT, FruitController.updateFruit);
// router.delete("/:id", authJWT, FruitController.deleteFruit);

module.exports = router;