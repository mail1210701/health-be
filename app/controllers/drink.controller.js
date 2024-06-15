const getUser = require("../helpers/getUser");
const responseFormatter = require("../helpers/responseFormatter");
const { drink, drink_detail, fruit, disease_restriction, favorite_drink } = require("../models");

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
        description: drink.description,
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

  static findDrink = async (req, res) => {
    try {
      const { id } = req.params
      const drinkIsExist = await drink.findByPk(id, {
        include: [
          {
            model: drink_detail,
            include: [
              {
                model: fruit
              }
            ]
          }
        ]
      })

      if(!drinkIsExist) {
        return res
          .status(404)
          .json(
            responseFormatter.error(null, "Data minuman tidak ditemukan", res.statusCode)
          );
      }

      const response = {
        drink_id: drinkIsExist.drink_id,
        drink_name: drinkIsExist.drink_name,
        description: drinkIsExist.description,
        ingredients: drinkIsExist.drink_details.map(fruitItem => ({
          fruit_id: fruitItem?.fruit?.fruit_id,
          fruit_name: fruitItem?.fruit?.fruit_name
        }))
      }

      return res
        .status(200)
        .json(
          responseFormatter.success(response, "data minuman ditemukan", res.statusCode)
        );
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };

  static createDrink = async (req, res) => {
    try {
      const {
        drink_name,
        description,
        ingredients
      } = req.body;

      const retriviedDrink = await drink.create({
        drink_name,
        description
      });

      let retriviedDrinkDetail;
      if(retriviedDrink) {
        const mapFruits = ingredients.map(({ fruit_id }) => ({
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
        ingredients: drink.drink_details.map(fruitItem => ({
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
        ingredients: drink.drink_details.map(fruitItem => ({
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

  static favoriteDrink = async (req, res) => {
    try {
      const { drink_id } = req.body
      const { type } = req.query
      const userData = await getUser(req, res)

      const drinkIsExist = await drink.findByPk(drink_id)
      if(!drinkIsExist) {
        return res
          .status(404)
          .json(
            responseFormatter.error(null, "Data minuman tidak ditemukan", res.statusCode)
          );
      }

      if(type === "like") {
        const favoriteDrinkIsExist = await favorite_drink.findOne({
          where: {
            drink_id
          }
        })

        if(favoriteDrinkIsExist) {
          return res
            .status(400)
            .json(
              responseFormatter.error(null, "Data minuman favorit sudah tersedia", res.statusCode)
            );
        }

        const createFavoriteDrink = await favorite_drink.create({
          user_id: userData.user_id,
          drink_id
        })

        if(createFavoriteDrink) {
          let response = await favorite_drink.findOne({
            include : [
              {
                model: drink,
                attributes : {
                  exclude: ["createdAt", "updatedAt"]
                }
              }
            ]
          },{
            where: {
              favorite_id: createFavoriteDrink.favorite_id
            }
          })

          response  = {
            drink_id: response.drink.drink_id,
            drink_name: response.drink.drink_name,
            description: response.drink.description
          }

          return res
            .status(200)
            .json(
              responseFormatter.success(response, "Data minuman favorit berhasil ditambahkan", res.statusCode)
            );
        }
      }

      if(type === "unlike") {
        const favoriteDrinkIsExist = await favorite_drink.findOne({
          where: {
            drink_id
          }
        })

        if(!favoriteDrinkIsExist) {
          return res
            .status(400)
            .json(
              responseFormatter.error(null, "Data minuman favorit tidak ditemukan", res.statusCode)
            );
        }

        const createFavoriteDrink = await favorite_drink.destroy({
          where: {
            drink_id
          }
        })

        if(createFavoriteDrink) {
          return res
            .status(201)
            .json(
              responseFormatter.success(createFavoriteDrink, "Data minuman favorit berhasil dihapus", res.statusCode)
            );
        }
      }

      throw new Error("Tipe aksi tidak tersedia");

    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }
}

module.exports = FruitController;