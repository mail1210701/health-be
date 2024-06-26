const router = require("express").Router();

const { authJWT } = require("../../app/middlewares");
const DrinkController = require("../../app/controllers/drink.controller");

router.get("/", authJWT, DrinkController.getListDrink);
router.get("/count", authJWT, DrinkController.countDrink);
router.get("/:id", authJWT, DrinkController.findDrink);
router.post("/", authJWT, DrinkController.createDrink);
router.post("/action", authJWT, DrinkController.favoriteDrink);
router.put("/:id", DrinkController.updateDrink);
router.delete("/:id", authJWT, DrinkController.deleteDrink);

module.exports = router;