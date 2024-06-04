const sequelize = require("sequelize");
const responseFormatter = require("../helpers/responseFormatter");
const { fruit } = require("../models");

class FruitController {
  static getListfruit = async (req, res) => {
    try {
      const fruits = await fruit.findAll();

      return res
        .status(200)
        .json(
          responseFormatter.success(fruits, "Data buah ditemukan", res.statusCode)
        );
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };

  static createFruit = async (req, res) => {
    try {
      const {
        fruit_name
      } = req.body;

      const fruitIsExist = await fruit.findOne({
        where: sequelize.where(
          sequelize.fn("lower", sequelize.col("fruit_name")),
          sequelize.fn('lower', fruit_name)
        )
      })

      if(fruitIsExist){
        return res
          .status(409)
          .json(
            responseFormatter.error(null, "Data buah sudah terdaftar", res.statusCode)
          );
      }

      const fruits = await fruit.create({
        fruit_name
      });

      return res
        .status(200)
        .json(
          responseFormatter.success(fruits, "Data buah berhasil ditambahkan", res.statusCode)
        );
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };

  static updateFruit = async (req, res) => {
    try {
      const { id } = req.params;
      const {
        fruit_name
      } = req.body;

      const fruitIsExist = await fruit.findByPk(id)
      if (!fruitIsExist) {
        return res
          .status(404)
          .json(
            responseFormatter.error(null, "Data buah tidak detemukan", res.statusCode)
          );
      }

      const fruitAlreadyRegistered = await fruit.findOne({
        where: sequelize.where(
          sequelize.fn("lower", sequelize.col("fruit_name")),
          sequelize.fn('lower', fruit_name)
        )
      })
      
      if(fruitAlreadyRegistered && fruitAlreadyRegistered.fruit_id !== Number(id)){
        return res
          .status(409)
          .json(
            responseFormatter.error(null, "Data buah sudah terdaftar", res.statusCode)
          );
      }

      await fruit.update({
        fruit_name
      },{
        where:{
          fruit_id: id
        }
      });

      const retrivied = await fruit.findByPk(id)

      return res
        .status(200)
        .json(
          responseFormatter.success(retrivied, "Data buah berhasil diperbaharui", res.statusCode)
        );
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };

  static deleteFruit = async (req, res) => {
    try {
      const { id } = req.params;

      const fruitIsExist = await fruit.findByPk(id)
      if (!fruitIsExist) {
        return res
          .status(404)
          .json(
            responseFormatter.error(null, "Data buah tidak ditemukan", res.statusCode)
          );
      }

      await fruit.destroy({
        where:{
          fruit_id: id
        }
      });

      return res
        .status(200)
        .json(
          responseFormatter.success(fruitIsExist, "Data buah berhasil di hapus", res.statusCode)
        );
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };
}

module.exports = FruitController;