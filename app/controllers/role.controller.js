const sequelize = require("sequelize");
const responseFormatter = require("../helpers/responseFormatter");
const { role } = require("../models");

class RoleController {
  static getListRole = async (req, res) => {
    try {
      const roleData = await role.findAll();

      return res
        .status(200)
        .json(
          responseFormatter.success(roleData, "Data peran ditemukan", res.statusCode)
        );
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };

  static createRole = async (req, res) => {
    try {
      const {
        role_name
      } = req.body;

      const roleIsExist = await role.findOne({
        where: sequelize.where(
          sequelize.fn("lower", sequelize.col("role_name")),
          sequelize.fn('lower', role_name)
        )
      })

      if(roleIsExist){
        return res
          .status(409)
          .json(
            responseFormatter.error(null, "Data peran sudah terdaftar", res.statusCode)
          );
      }

      const roleData = await role.create({
        role_name
      });

      return res
        .status(200)
        .json(
          responseFormatter.success(roleData, "Data peran berhasil ditambahkan", res.statusCode)
        );
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };

  static updateRole = async (req, res) => {
    try {
      const { id } = req.params;
      const {
        role_name
      } = req.body;

      const roleIsExist = await role.findByPk(id)
      if (!roleIsExist) {
        return res
          .status(404)
          .json(
            responseFormatter.error(null, "Data role tidak detemukan", res.statusCode)
          );
      }

      const roleAlreadyRegistered = await role.findOne({
        where: sequelize.where(
          sequelize.fn("lower", sequelize.col("role_name")),
          sequelize.fn('lower', role_name)
        )
      })
      
      if(roleAlreadyRegistered && roleAlreadyRegistered.role_id !== Number(id)){
        return res
          .status(409)
          .json(
            responseFormatter.error(null, "Data peran sudah terdaftar", res.statusCode)
          );
      }

      await role.update({
        role_name
      },{
        where:{
          role_id: id
        }
      });

      const retrivied = await role.findByPk(id)

      return res
        .status(200)
        .json(
          responseFormatter.success(retrivied, "Data peran berhasil diperbaharui", res.statusCode)
        );
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };

  static deleteRole = async (req, res) => {
    try {
      const { id } = req.params;

      const roleIsExist = await role.findByPk(id)
      if (!roleIsExist) {
        return res
          .status(404)
          .json(
            responseFormatter.error(null, "Data peran tidak ditemukan", res.statusCode)
          );
      }

      await role.destroy({
        where:{
          role_id: id
        }
      });

      return res
        .status(200)
        .json(
          responseFormatter.success(roleIsExist, "Data peran berhasil di hapus", res.statusCode)
        );
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };
}

module.exports = RoleController;