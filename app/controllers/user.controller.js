const sequelize = require("sequelize");
const responseFormatter = require("../helpers/responseFormatter");
const getUser = require("../helpers/getUser");
const { user, role, history_disease, disease, allergy, fruit, fruit_nutrition, nutrition, favorite_drink, drink, drink_detail, recommendation_history } =  require("../models");

class UserController {
  static countUser = async (req, res) => {
    try {
      const totalUser = await user.count();

      return res
        .status(200)
        .json(
          responseFormatter.error(totalUser, "Informasi jumlah data pengguna ditemukan", res.statusCode)
        );
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };

  static getProfile = async (req, res) => {
    try {
      const userJWT = await getUser(req, res)

      const userData = await user.findOne({
        include: [
          {
            model: role,
            attributes:{
              exclude: ["createdAt", "updatedAt"]
            },
          },
          {
            model: history_disease,
            attributes:{
              exclude: ["createdAt", "updatedAt", "disease_id", "user_id"]
            },
            include: [
              {
                model: disease,
                attributes:{
                  exclude: ["createdAt", "updatedAt"]
                },
              }
            ]
          },
          {
            model: allergy,
            attributes: {
              exclude: ["createdAt", "updatedAt", "user_id", "fruit_id"]
            },
            include: [
              {
                model: fruit,
                attributes:{
                  exclude: ["createdAt", "updatedAt", "user_id"]
                },
              }
            ]
          }
        ],
        attributes: {
          exclude: ["password", "is_active", "role_id"]
        },
        where: {
          user_id: userJWT.user_id
        }
      })

      if(!userData) {
        return res
          .status(404)
          .json(
            responseFormatter.error(null, "Data pengguna tidak detemukan", res.statusCode)
          );
      }

      return res
        .status(200)
        .json(
          responseFormatter.success(
            userData,
            "Data pengguna berhasil ditampilkan",
            res.statusCode
          )
        );
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }

  static updateProfile =  async (req, res) => {
    try {
      const { name } = req.body
      const userData = await getUser(req, res)

      await user.update({
        name
      }, {
        where: {
          user_id: userData.user_id
        }
      })

      const response = await user.findOne({
        include: [
          {
            model: role,
            attributes:{
              exclude: ["createdAt", "updatedAt"]
            },
          },
          {
            model: history_disease,
            attributes:{
              exclude: ["createdAt", "updatedAt", "disease_id", "user_id"]
            },
            include: [
              {
                model: disease,
                attributes:{
                  exclude: ["createdAt", "updatedAt"]
                },
              }
            ]
          },
          {
            model: allergy,
            attributes: {
              exclude: ["createdAt", "updatedAt", "user_id", "fruit_id"]
            },
            include: [
              {
                model: fruit,
                attributes:{
                  exclude: ["createdAt", "updatedAt", "user_id"]
                },
              }
            ]
          }
        ],
        attributes: {
          exclude: ["password", "is_active", "role_id"]
        },
        where: {
          user_id: userData.user_id
        }
      })

      return res
        .status(200)
        .json(
          responseFormatter.success(
            response,
            "Data pengguna berhasil diubah",
            res.statusCode
          )
        );
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }

  static getHistoryRecomendation = async (req, res) => {
    try {
      const userData = await getUser(req, res)

      const rawHistoryRecomendations = await recommendation_history.findAll({
        include: [
          {
            model: drink,
            attributes: ["drink_id", "drink_name"],
            include: [
              {
                model: drink_detail,
                attributes: ["drink_detail_id"],
                include: [
                  {
                    model: fruit,
                    attributes: ["fruit_id", "fruit_name"],
                    include: [
                      {
                        model: fruit_nutrition,
                        attributes: ["fruit_nutrition_id"],
                        include: [
                          {
                            model: nutrition,
                            attributes: [
                              [sequelize.col('nutrition_id'), 'id'],
                              [sequelize.col('nutrition_name'), 'name']
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ],
        attributes: {
          exclude: ["drink_id", "user_id"],
          include: [
            [sequelize.fn('DATE', sequelize.col('recommendation_history.createdAt')), 'createdAtDate'] // Group by date part of createdAt
          ]
        }
      },{
        order: [["recommendation_history.createdAt", "ASC"]],
        where: {
          user_id: userData.user_id
        }
      })

      const groupedRecommendations = rawHistoryRecomendations.reduce((acc, item) => {
        const date = item.get('createdAt');
        if (!acc[date]) {
          acc[date] = {
            createdAt: item.createdAt,
            fruit_name: item.fruit_name,
            drinks: []
          };
        }
        
        const drinkData = {
          drink: {
            drink_id: item.drink.drink_id,
            drink_name: item.drink.drink_name,
            ingredients: [{
              fruit_id: item.drink.drink_details[0].fruit.fruit_id,
              fruit_name: item.drink.drink_details[0].fruit.fruit_name,
              nutritions: item.drink.drink_details[0].fruit.fruit_nutritions.map(fn => ({
                nutrition_id: fn.nutrition.get("id"),
                nutrition_name: fn.nutrition.get("name")
              }))
            }]
          }
        };
      
        acc[date].drinks.push(drinkData);
        return acc;
      }, {});

      return res
          .status(200)
          .json(
            responseFormatter.success(
              Object.values(groupedRecommendations),
              "Data riwayat rekomendasi berhasil ditemukan",
              res.statusCode
            )
          );
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }

  static getFavoriteDrink = async (req, res) => {
    try {
      const userData = await getUser(req, res)

      const favoriteDrink = await favorite_drink.findAll({
        include: [
          {
            model: drink,
            attributes: ["drink_id", "drink_name", "description"],
            include: [
              {
                model: drink_detail,
                attributes: ["drink_detail_id"],
                include: [
                  {
                    model: fruit,
                    attributes: ["fruit_id", "fruit_name"],
                    include: [
                      {
                        model: fruit_nutrition,
                        attributes: ["fruit_nutrition_id"],
                        include: [
                          {
                            model: nutrition,
                            attributes: [
                              [sequelize.col('nutrition_id'), 'id'],
                              [sequelize.col('nutrition_name'), 'name']
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ],
        attributes: {
          exclude: ["drink_id", "user_id"]
        }
      },{
        where: {
          user_id: userData.user_id
        }
      })

      const response = favoriteDrink.map(fav => ({
        favorite_id: fav.favorite_id,
        createdAt: fav.createdAt,
        updatedAt: fav.updatedAt,
        drink: {
          drink_id: fav.drink.drink_id,
          drink_name: fav.drink.drink_name,
          description: fav.drink.description,
          ingredients: fav.drink.drink_details.map(detail => ({
            fruit_id: detail.fruit.fruit_id,
            fruit_name: detail.fruit.fruit_name,
            nutritions: detail.fruit.fruit_nutritions.map(fn => ({
              nutrition_id: fn.nutrition.get("id"),
              nutrition_name: fn.nutrition.get("name"),
            }))
          })),
        }
      }));
      

      return res
          .status(200)
          .json(
            responseFormatter.success(
              response,
              "Data minuman favorit berhasil ditemukan",
              res.statusCode
            )
          );

    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  } 

  static diseaseUser = async (req, res) => {
    try {
      const diseases = req.body;
      const userData = await getUser(req, res)

      const historyExist =  await checkHistoryDisease(userData)
      if(historyExist) {
        history_disease.destroy({
          where:{
            user_id: userData.user_id
          }
        })
      }

      const mapDiseaseUser = diseases.map(
        (disease_id) => ({
          disease_id,
          user_id: userData.user_id,
        })
      );

      const retriviedHistoryDisease = await history_disease.bulkCreate(mapDiseaseUser);
      if(retriviedHistoryDisease) {
        const response = await history_disease.findAll({
          where: {
            user_id: userData.user_id
          },
          include: [
            {
              model: disease,
              attributes: {
                exclude: ["createdAt", "updatedAt"]
              } 
            }
          ],
          attributes: ["history_disease_id"]
        })

        return res
          .status(200)
          .json(
            responseFormatter.success(
              response,
              "Data riwayat penyakit berhasil diubah",
              res.statusCode
            )
          );
      }

      throw new Error();

    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };

  static allergyUser = async (req, res) => {
    try {
      const allergies = req.body;
      const userData = await getUser(req, res)
      
      const allergyExist =  await checkAllergy(userData)
      if(allergyExist) {
        allergy.destroy({
          where:{
            user_id: userData.user_id
          }
        })
      }

      const mapAllergyUser = allergies.map(
        (fruit_id) => ({
          fruit_id,
          user_id: userData.user_id,
        })
      );

      const retriviedAllergy = await allergy.bulkCreate(mapAllergyUser);
      
      if(retriviedAllergy) {
        const response = await allergy.findAll({
          where: {
            user_id: userData.user_id
          },
          include: [
            {
              model: fruit,
              attributes: {
                exclude: ["createdAt", "updatedAt"]
              } 
            }
          ],
          attributes: ["allergy_id"]
        })

        return res
          .status(200)
          .json(
            responseFormatter.success(
              response,
              "Data alergi berhasil diubah",
              res.statusCode
            )
          );
      }

      throw new Error()

    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  }
}

async function checkHistoryDisease(userData) {
  return new Promise(async (resolve) => {
    try {
      const findExistingHistoryDisease = await history_disease.findOne({
        where: {
          user_id: userData.user_id
        }
      });

      if (findExistingHistoryDisease) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      resolve(false);
    }
  });
}

async function checkAllergy(userData) {
  return new Promise(async (resolve) => {
    try {
      const findExistingAllergy = await allergy.findOne({
        where: {
          user_id: userData.user_id
        }
      });

      if (findExistingAllergy) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      resolve(false);
    }
  });
}
module.exports = UserController
