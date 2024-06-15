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
      this.belongsTo(models.drink, {
        foreignKey: {
          name: "drink_id"
        },
      })
    }
  }
  favorite_drink.init({
    favorite_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    user_id: DataTypes.INTEGER,
    drink_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'favorite_drink',
  });

  favorite_drink.removeAttribute("id");
  
  return favorite_drink;
};