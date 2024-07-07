'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class fruit_nutrition extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.fruit, {
        foreignKey: {
          name: "fruit_id"
        },
      })

      this.belongsTo(models.nutrition, {
        foreignKey: {
          name: "nutrition_id"
        },
      })
    }
  }
  fruit_nutrition.init({
    fruit_nutrition_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    fruit_id: DataTypes.INTEGER,
    nutrition_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'fruit_nutrition',
    tableName: 'fruit_nutritions'
  });
  return fruit_nutrition;
};