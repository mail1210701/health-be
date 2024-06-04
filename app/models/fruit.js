'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class fruit extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.hasMany(models.disease_restriction, {
        foreignKey: {
          name: "fruit_id"
        },
      })

      this.hasMany(models.drink_detail, {
        foreignKey: {
          name: "fruit_id"
        },
      })
    }
  }
  fruit.init({
    fruit_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    fruit_name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'fruit',
  });

  fruit.removeAttribute("id");

  return fruit;
};