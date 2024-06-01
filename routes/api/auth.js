const router = require("express").Router();

const { authValidator } = require("../../app/requests");
// const { authJWT } = require("../../app/middlewares");
const errorValidationHandler = require("../../app/helpers/errorValidationHandler"); 

const AuthController = require("../../app/controllers/auth.controller");

router.post("/login", authValidator.loginValidator, errorValidationHandler, AuthController.login);

router.post("/register", errorValidationHandler, AuthController.register);

router.post("/activation", errorValidationHandler, AuthController.activation);

router.post("/forgot-password", AuthController.requestForgotPassword);

router.patch("/reset-password", AuthController.resetPassword);

module.exports = router;