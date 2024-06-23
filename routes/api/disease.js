const router = require("express").Router();

const { authJWT } = require("../../app/middlewares");
const DiseaseController = require("../../app/controllers/disease.controller");

router.get("/", authJWT, DiseaseController.getListDisease);
router.get("/:id", authJWT, DiseaseController.findDisease);
router.post("/", authJWT, DiseaseController.createDisease);
router.put("/:id", authJWT, DiseaseController.updateDisease);
router.delete("/:id", authJWT, DiseaseController.deleteDisease);

module.exports = router;