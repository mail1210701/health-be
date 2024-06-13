const router = require("express").Router();

const { authJWT } = require("../../app/middlewares");
const PredictController = require("../../app/controllers/predict.controller");

router.get("/", authJWT, PredictController.getDrinkSuggestion);

module.exports = router;