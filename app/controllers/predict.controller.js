const sequelize = require("sequelize");
const responseFormatter = require("../helpers/responseFormatter");
const { user, history_disease, allergy, fruit, drink, drink_detail, disease, disease_restriction } = require("../models");
const getUser = require("../helpers/getUser");

class PredictController {
  static getDrinkSuggestion = async (req, res) => {
    const {
      fruit_name,
    } = req.body
    try {
      const userJWT = await getUser(req, res)

      // const validateFruitName = await fruit.findAll({
      //   where: {
      //     fruit_name: {
      //       [sequelize.Op.iLike]: fruit_name
      //     }
      //   }
      // });

      // if(validateFruitName.length > 0) {

      // }else{
        // return res
        //   .status(404)
        //   .json(
        //     responseFormatter.success(null, "Data rekomendasi minuman tidak ditemukan", res.statusCode)
        //   );
      // }
      // console.log(fruits);
      // const validateFruitName = fruits.some(fruit => fruit.fruit_name.toLowerCase() === fruit_name.toLowerCase())
      // console.log(fruits);

      // get user information
      const userData = await user.findByPk(userJWT.user_id, {
        attributes: ["user_id", "name"],
        include: [
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
        ]
      });

      // Extract user disease information
      const userDiseases = userData.history_diseases.map(diseaseItem => diseaseItem.disease.disease_id)
      // Extract user allergy information
      const userAllergies = userData.allergies.map(allergyItem => allergyItem.fruit.fruit_id)

      // Identify restricted drinks based on diseases
      let restrictedDrink = await disease_restriction.findAll({
        where: { 
          disease_id: { 
            [sequelize.Op.in]: userDiseases 
          } 
        }
      })
      restrictedDrink = restrictedDrink.map(restriction => restriction.drink_id);

      // console.log(JSON.stringify(restrictedDrink, undefined, 2));

      // Find the fruit ID based on the fruit name
      let fruits = await fruit.findAll({
        where: {
          fruit_name: {
            [sequelize.Op.iLike]: `%${fruit_name}%`
          }
        }
      });
      fruits = fruits.map(fruit => fruit.fruit_id)

      // console.log(JSON.stringify(fruits, undefined, 2));

      // Find all drinks that include the specified fruit
      const drinkDetails = await drink_detail.findAll({
        where: {
          fruit_id: {
            [sequelize.Op.in]: fruits
          }
        }
      });
      const drinkIds = drinkDetails.map(drink => drink.drink_id);

      // console.log(JSON.stringify(drinkDetails, undefined, 2));

      const drinks = await drink.findAll({
        where: {
          drink_id: {
            [sequelize.Op.in]: drinkIds
          }
        }
      });

      // console.log(JSON.stringify(drinks, undefined, 2));

      // Filter drinks that are safe (not restricted and do not contain allergens)
      const safeDrinks = drinks.filter(drink => {
        const drinkFruits = drinkDetails
          .filter(detail => detail.drink_id === drink.drink_id)
          .map(detail => detail.fruit_id);

        // console.log(JSON.stringify(drinkFruits, undefined, 2));

          const containsAllergens = drinkFruits.some(fruitId => userAllergies.includes(fruitId));
          const isRestricted = restrictedDrink.includes(drink.drink_id);

        return !containsAllergens && !isRestricted;
      });

      // console.log(JSON.stringify(safeDrinkIds, undefined, 2));
      
      // const safeDrinks = await drink.findAll({
      //   where: {
      //     drink_id: {
      //       [sequelize.Op.in]: safeDrinkIds
      //     }
      //   }
      // });

      
      // let restrictedDrink = await disease_restriction.findAll()
      // restrictedDrink = restrictedDrink.filter(restriction => userDiseases.includes(restriction.disease_id)).map(restriction => restriction.drink_id)
      
      // Filter possible drinks that are not restricted and don't contain allergy
      // let safeDrinks = await drink.findAll()
      // const drink_detail_information = await drink_detail.findAll()
      // safeDrinks = safeDrinks.filter((drink) => {
      //   const drinkFruit = drink_detail_information.filter(detail => detail.drink_id === drink.drink_id).map(detail => detail.fruit_id);

      //   const containsAllergy = drinkFruit.some(fruitId => userAllergies.includes(fruitId));
      //   const isRestricted = restrictedDrink.includes(drink.drink_id);

      //   return !containsAllergy && !isRestricted;
      // })

      const drinkSuggestions = await drink.findAll({
        where: {
          drink_id: {
            [sequelize.Op.in]: safeDrinks.map(drink => drink.drink_id)
          }
        },
        attributes: {
          exclude: ["createdAt", "updatedAt"]
        }
      });

      if(drinkSuggestions.length === 0) {
        return res
          .status(404)
          .json(
            responseFormatter.error(null, "Data rekomendasi minuman tidak ditemukan", res.statusCode)
          );
      }

      return res
        .status(200)
        .json(
          responseFormatter.success(drinkSuggestions, "Data rekomendasi minuman berhasil ditemukan", res.statusCode)
        );
    } catch (error) {
      return res
        .status(500)
        .json(responseFormatter.error(null, error.message, res.statusCode));
    }
  };

}

module.exports = PredictController;