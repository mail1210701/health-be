'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class drink_detail extends Model {
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
        }
      })

      this.belongsTo(models.fruit, {
        foreignKey: {
          name: "fruit_id"
        },
      })
    }
  }
  drink_detail.init({
    drink_detail_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    fruit_id: DataTypes.INTEGER,
    drink_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'drink_detail',
  });

  drink_detail.removeAttribute("id");

  return drink_detail;
};