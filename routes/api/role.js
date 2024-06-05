const router = require("express").Router();

const { authJWT } = require("../../app/middlewares");
const RoleController = require("../../app/controllers/role.controller");

router.get("/", authJWT, RoleController.getListRole);
router.post("/", authJWT, RoleController.createRole);
router.put("/:id", authJWT, RoleController.updateRole);
router.delete("/:id", authJWT, RoleController.deleteRole);

module.exports = router;