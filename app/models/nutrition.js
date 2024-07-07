'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class nutrition extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.fruit_nutrition, {
        foreignKey: {
          name: "nutrition_id"
        },
      })

      this.hasMany(models.disease_restriction, {
        foreignKey: {
          name: "nutrition_id"
        },
      })
    }
  }
  nutrition.init({
    nutrition_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    nutrition_name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'nutrition',
    tableName: "nutritions"
  });

  nutrition.removeAttribute("id");

  return nutrition;
};