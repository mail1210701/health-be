'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class favorite_drink extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  favorite_drink.init({
    user_id: DataTypes.INTEGER,
    drink_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'favorite_drink',
  });

  favorite_drink.removeAttribute("id");
  
  return favorite_drink;
};