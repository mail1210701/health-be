const router = require("express").Router();

const { authJWT } = require("../../app/middlewares");
const NutritionController = require("../../app/controllers/nutrition.controller");

router.get("/", authJWT, NutritionController.getListNutrition);;
router.get("/:id", authJWT, NutritionController.findNutrition);
router.post("/", authJWT, NutritionController.createNutrisi);
router.put("/:id", authJWT, NutritionController.updateNutrition);
router.delete("/:id", authJWT, NutritionController.deleteNutrition);

module.exports = router;