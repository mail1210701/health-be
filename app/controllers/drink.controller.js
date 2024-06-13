const responseFormatter = require("../helpers/responseFormatter");
const { drink, drink_detail, fruit, disease_restriction, disease, Sequelize } = require("../models");

class FruitController {
  static getListDrink = async (req, res) => {
    try {
      // const { keyword } = req.query
      const fruits = await drink.findAll({
        include: [
          {
            model: drink_detail,
            attributes:{
              exclude: ["createdAt", "updatedAt"]
            },
            include: [
              {
                model: fruit,
                attributes:{
                  exclude: ["createdAt", "updatedAt"]
                }
              }
            ]
          },
          {
            model: disease_restriction,
            attributes: {
              exclude: ["createdAt", "updatedAt"]
            }
          }
        ],
        // where: {
        //   drink_name: {
        //     [Sequelize.Op.iLike]: `%${keyword}%`
        //   }
        // }
      });

      const response = fruits.map(drink => ({
        drink_id: drink.drink_id,
        drink_name: drink.drink_name,
        descriotion: drink.description,
        ingredients: drink.drink_details.map(fruitItem => ({
          fruit_id: fruitItem?.fruit?.fruit_id,
          fruit_name: fruitItem?.fruit?.fruit_name
        }))
      }))

      return res
        .status(200)
        .json(
          responseFormatter.success(response, "Data minuman ditemukan", res.statusCode)
        );
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };

  // static findDrink = async (req, res) => {
  //   try {
  //     const fruits = await drink.findAll({
  //       include: {
  //         model: drink_detail,
  //         attributes:{
  //           exclude: ["createdAt", "updatedAt"]
  //         },
  //         include: {
  //           model: fruit,
  //           attributes: {
  //             exclude: ["createdAt", "updatedAt"]
  //           }
  //         }
  //       }
  //     });

  //     const response = fruits.map(drink => ({
  //       drink_id: drink.drink_id,
  //       drink_name: drink.drink_name,
  //       descriotion: drink.description,
  //       drink_materials: drink.drink_details.map(fruitItem => ({
  //         fruit_id: fruitItem?.fruit?.fruit_id,
  //         fruit_name: fruitItem?.fruit?.fruit_name
  //       }))
  //     }))

  //     return res
  //       .status(200)
  //       .json(
  //         responseFormatter.success(response, "fruit found", res.statusCode)
  //       );
  //   } catch (error) {
  //     return res
  //       .status(500)
  //       .json(responseFormatter.error(null, error.message, res.statusCode));
  //   }
  // };

  static createDrink = async (req, res) => {
    try {
      const {
        drink_name,
        description,
        fruits
      } = req.body;

      const retriviedDrink = await drink.create({
        drink_name,
        description
      });

      let retriviedDrinkDetail;
      if(retriviedDrink) {
        const mapFruits = fruits.map(({ fruit_id }) => ({
          fruit_id,
          drink_id: retriviedDrink.drink_id
        }));

        retriviedDrinkDetail = await drink_detail.bulkCreate(mapFruits)
      }

      if(retriviedDrinkDetail) {
        const retrivied = await drink.findAll({
        include: {
          model: drink_detail,
          attributes:{
            exclude: ["createdAt", "updatedAt"]
          },
          include: {
            model: fruit,
            attributes: {
              exclude: ["createdAt", "updatedAt"]
            }
          }
        },
        where: {
          drink_id: retriviedDrink.drink_id
        }
      });

      const response = retrivied.map(drink => ({
        drink_id: drink.drink_id,
        drink_name: drink.drink_name,
        descriotion: drink.description,
        drink_materials: drink.drink_details.map(fruitItem => ({
          fruit_id: fruitItem.fruit?.fruit_id,
          fruit_name: fruitItem.fruit?.fruit_name
        }))
      }))
  
      return res
        .status(200)
        .json(
          responseFormatter.success(response, "Data minuman berhasil ditambahkan", res.statusCode)
        );
      }
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };

  static deleteDrink = async (req, res) => {
    try {
      const { id } = req.params;

      const drinkIsExist = await drink.findByPk(id)
      if (!drinkIsExist) {
        return res
          .status(404)
          .json(
            responseFormatter.error(null, "Data minuman tidak ditemukan", res.statusCode)
          );
      }

      const retrivied = await drink.findAll({
        include: {
          model: drink_detail,
          attributes:{
            exclude: ["createdAt", "updatedAt"]
          },
          include: {
            model: fruit,
            attributes: {
              exclude: ["createdAt", "updatedAt"]
            }
          }
        },
        where: {
          drink_id: id
        }
      });

      const response = retrivied.map(drink => ({
        drink_id: drink.drink_id,
        drink_name: drink.drink_name,
        descriotion: drink.description,
        drink_materials: drink.drink_details.map(fruitItem => ({
          fruit_id: fruitItem.fruit?.fruit_id,
          fruit_name: fruitItem.fruit?.fruit_name
        }))
      }))

      await drink.destroy({
        where: {
          drink_id: id
        }
      })

      return res
        .status(200)
        .json(
          responseFormatter.success(response, "Data minuman berhasil dihapus", res.statusCode)
        );
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };
}

module.exports = FruitController;