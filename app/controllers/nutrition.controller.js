const sequelize = require("sequelize");
const responseFormatter = require("../helpers/responseFormatter");
const { nutrition, drink_detail } = require("../models");

class NutritionController {  
  static getListNutrition = async (req, res) => {
    try {
      const nutritions = await nutrition.findAll();

      return res
        .status(200)
        .json(
          responseFormatter.success(nutritions, "Data nutrisi ditemukan", res.statusCode)
        );
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };

  static findNutrition = async (req, res) => {
    try {
      const { id } = req.params
      const nutritionIsExist = await nutrition.findByPk(id)

      if(!nutritionIsExist) {
        return res
          .status(404)
          .json(
            responseFormatter.error(null, "Data nutrisi tidak ditemukan", res.statusCode)
          );
      }

      return res
        .status(200)
        .json(
          responseFormatter.success(nutritionIsExist, "data nutrisi ditemukan", res.statusCode)
        );
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };

  static createNutrisi = async (req, res) => {
    try {
      const {
        nutrition_name
      } = req.body;

      const nutritionIsExist = await nutrition.findOne({
        where: sequelize.where(
          sequelize.fn("lower", sequelize.col("nutrition_name")),
          sequelize.fn('lower', nutrition_name)
        )
      })

      if(nutritionIsExist){
        return res
          .status(409)
          .json(
            responseFormatter.error(null, "Data nutrisi sudah terdaftar", res.statusCode)
          );
      }

      const nutritions = await nutrition.create({
        nutrition_name
      });

      return res
        .status(200)
        .json(
          responseFormatter.success(nutritions, "Data nutrisi berhasil ditambahkan", res.statusCode)
        );
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };

  static updateNutrition = async (req, res) => {
    try {
      const { id } = req.params;
      const {
        nutrition_name
      } = req.body;

      const nutritionIsExist = await nutrition.findByPk(id)
      if (!nutritionIsExist) {
        return res
          .status(404)
          .json(
            responseFormatter.error(null, "Data nutrisi tidak detemukan", res.statusCode)
          );
      }

      const nutritionAlreadyRegistered = await nutrition.findOne({
        where: sequelize.where(
          sequelize.fn("lower", sequelize.col("nutrition_name")),
          sequelize.fn('lower', nutrition_name)
        )
      })
      
      if(nutritionAlreadyRegistered && nutritionAlreadyRegistered.nutrition_id !== Number(id)){
        return res
          .status(409)
          .json(
            responseFormatter.error(null, "Data nutrisi sudah terdaftar", res.statusCode)
          );
      }

      await nutrition.update({
        nutrition_name
      },{
        where:{
          nutrition_id: id
        }
      });

      const retrivied = await nutrition.findByPk(id)

      return res
        .status(200)
        .json(
          responseFormatter.success(retrivied, "Data nutrisi berhasil diperbaharui", res.statusCode)
        );
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };

  static deleteNutrition = async (req, res) => {
    try {
      const { id } = req.params;

      const nutritionIsExist = await nutrition.findByPk(id)
      if (!nutritionIsExist) {
        return res
          .status(404)
          .json(
            responseFormatter.error(null, "Data nutrisi tidak ditemukan", res.statusCode)
          );
      }

      const nutritionIsUsed = await drink_detail.findOne({
        where: {
          nutrition_id: id
        }
      });
  
      if (nutritionIsUsed) {
        return res
          .status(400)
          .json(
            responseFormatter.error(null, "Data nutrisi tidak dapat dihapus karena sudah digunakan didalam data minuman", res.statusCode)
          );
      }

      await nutrition.destroy({
        where:{
          nutrition_id: id
        }
      });

      return res
        .status(200)
        .json(
          responseFormatter.success(nutritionIsExist, "Data nutrisi berhasil di hapus", res.statusCode)
        );
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };
}

module.exports = NutritionController;