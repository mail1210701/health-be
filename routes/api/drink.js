const router = require("express").Router();

const { authJWT } = require("../../app/middlewares");
const DrinkController = require("../../app/controllers/drink.controller");

router.get("/", authJWT, DrinkController.getListDrink);
router.post("/", authJWT, DrinkController.createDrink);
// router.put("/:id", DrinkController.updateFruit);
router.delete("/:id", authJWT, DrinkController.deleteDrink);

module.exports = router;