const router = require("express").Router();

const { authJWT } = require("../../app/middlewares");
const DiseaseController = require("../../app/controllers/disease.controller");

router.get("/", authJWT, DiseaseController.getListDisease);
router.post("/", authJWT, DiseaseController.createDisease);
router.put("/:id", authJWT, DiseaseController.updateDisease);

module.exports = router;