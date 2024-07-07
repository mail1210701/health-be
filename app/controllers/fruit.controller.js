const sequelize = require("sequelize");
const responseFormatter = require("../helpers/responseFormatter");
const { fruit, fruit_nutrition, nutrition, drink_detail } = require("../models");

class FruitController {
  static countFruit = async (req, res) => {
    try {
      const totalFruit = await fruit.count();

      return res
        .status(200)
        .json(
          responseFormatter.error(totalFruit, "Informasi jumlah data buah ditemukan", res.statusCode)
        );
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };
  
  static getListfruit = async (req, res) => {
    try {
      const { keyword } = req.query
      const fruits = await fruit.findAll({
        include: [
          {
            model: fruit_nutrition,
            attributes: {
              exclude: ["createdAt", "updatedAt"]
            },
            include: [
              {
                model: nutrition,
                attributes: {
                  exclude: ["createdAt", "updatedAt"]
                },
              }
            ]
          }
        ],
        where: sequelize.where(
          sequelize.fn('LOWER', sequelize.col('fruit_name')),
          keyword.toLowerCase()
        )
      });

      const response = fruits.map(fruit => {
        return {
          fruit_id: fruit.fruit_id,
          fruit_name: fruit.fruit_name,
          createdAt: fruit.createdAt,
          updatedAt: fruit.updatedAt,
          fruit_nutritions: fruit.fruit_nutritions.map(fn => ({
            nutrition_id: fn.nutrition.nutrition_id,
            nutrition_name: fn.nutrition.nutrition_name
          }))
        }
      })

      return res
        .status(200)
        .json(
          responseFormatter.success(response, "Data buah ditemukan", res.statusCode)
        );
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };

  static findFruit = async (req, res) => {
    try {
      const { id } = req.params
      const fruitIsExist = await fruit.findByPk(id, {
        include: [
          {
            model: fruit_nutrition,
            attributes: {
              exclude: ["createdAt", "updatedAt"]
            },
            include: [
              {
                model: nutrition,
                attributes: {
                  exclude: ["createdAt", "updatedAt"]
                },
              }
            ]
          }
        ]
      })

      let response
      if(!fruitIsExist) {
        return res
          .status(404)
          .json(
            responseFormatter.error(null, "Data buah tidak ditemukan", res.statusCode)
          );
      }else{
        response = {
          fruit_id: fruitIsExist.fruit_id,
          fruit_name: fruitIsExist.fruit_name,
          createdAt: fruitIsExist.createdAt,
          updatedAt: fruitIsExist.updatedAt,
          fruit_nutritions: fruitIsExist.fruit_nutritions.map(fn => ({
            nutrition_id: fn.nutrition.nutrition_id,
            nutrition_name: fn.nutrition.nutrition_name
          }))
        }
      }

      return res
        .status(200)
        .json(
          responseFormatter.success(response, "data buah ditemukan", res.statusCode)
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
        fruit_name,
        nutritions
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

      const retrievedFruit = await fruit.create({
        fruit_name
      });

      let retriviedFruitNutrition;
      if(retrievedFruit) {
        const mapNutrition = nutritions.map(({ nutrition_id }) => ({
          nutrition_id,
          fruit_id: retrievedFruit.fruit_id
        }));

        retriviedFruitNutrition = await fruit_nutrition.bulkCreate(mapNutrition)
      }
      
      if(retriviedFruitNutrition) {
        const fruitResponse = await fruit.findByPk(retrievedFruit.fruit_id, {
          include: [
            {
              model: fruit_nutrition,
              attributes: {
                exclude: ["createdAt", "updatedAt"]
              },
              include: [
                {
                  model: nutrition,
                  attributes: {
                    exclude: ["createdAt", "updatedAt"]
                  },
                }
              ]
            }
          ]
        })

        const formatedFruitResponse = {
          fruit_id: fruitResponse.fruit_id,
          fruit_name: fruitResponse.fruit_name,
          createdAt: fruitResponse.createdAt,
          updatedAt: fruitResponse.updatedAt,
          fruit_nutritions: fruitResponse.fruit_nutritions.map(fn => ({
            nutrition_id: fn.nutrition.nutrition_id,
            nutrition_name: fn.nutrition.nutrition_name
          }))
        }

        return res
        .status(200)
        .json(
          responseFormatter.success(formatedFruitResponse, "Data buah berhasil ditambahkan", res.statusCode)
        );
      }

      throw new Error;
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
        fruit_name,
        nutritions
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
      
      const retrievedFruit = await fruit.update({
        fruit_name
      },{
        where:{
          fruit_id: id
        }
      });

      let retriviedNutrition
      if(retrievedFruit) {
        const existingNutrition = await fruit_nutrition.findAll({
          where: { fruit_id: id }
        });

        const existingNutritionIds = existingNutrition.map(nutrition => nutrition.fruit_nutrition_id);
        const incomingNutritionIds = nutritions.map(({ fruit_nutrition_id }) => fruit_nutrition_id).filter(Boolean);

        // Delete nutrition not included in the request
        const nutritionToDelete = existingNutritionIds.filter(id => !incomingNutritionIds.includes(id));
        await fruit_nutrition.destroy({ where: { fruit_nutrition_id: nutritionToDelete } });

        retriviedNutrition = await Promise.all(nutritions.map(async (nutrition) => {
          if (nutrition.fruit_nutrition_id) {
            // Update existing nutrition
            await fruit_nutrition.update(
              {
                nutrition_id: nutrition.nutrition_id,
                fruit_id: id 
              }, { 
                where: { 
                  fruit_nutrition_id: nutrition.fruit_nutrition_id
                } 
              });
          } else {
            // Create new nutrition
            await fruit_nutrition.create({
              nutrition_id: nutrition.nutrition_id,
              fruit_id: id 
            });
          }
        }))
      }

      if(retriviedNutrition) {
        const fruitResponse = await fruit.findByPk(id, {
          include: [
            {
              model: fruit_nutrition,
              attributes: {
                exclude: ["createdAt", "updatedAt"]
              },
              include: [
                {
                  model: nutrition,
                  attributes: {
                    exclude: ["createdAt", "updatedAt"]
                  },
                }
              ]
            }
          ]
        })

        const formatedFruitResponse = {
          fruit_id: fruitResponse.fruit_id,
          fruit_name: fruitResponse.fruit_name,
          createdAt: fruitResponse.createdAt,
          updatedAt: fruitResponse.updatedAt,
          fruit_nutritions: fruitResponse.fruit_nutritions.map(fn => ({
            nutrition_id: fn.nutrition.nutrition_id,
            nutrition_name: fn.nutrition.nutrition_name
          }))
        }

        return res
        .status(200)
        .json(
          responseFormatter.success(formatedFruitResponse, "Data buah berhasil ditambahkan", res.statusCode)
        );
      }

      throw new Error

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

      const fruitIsUsed = await drink_detail.findOne({
        where: {
          fruit_id: id
        }
      });
  
      if (fruitIsUsed) {
        return res
          .status(400)
          .json(
            responseFormatter.error(null, "Data buah tidak dapat dihapus karena sudah digunakan didalam data minuman", res.statusCode)
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